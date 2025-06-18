# app/services/evaluation_service.py

import json
import os
import time
import asyncio
import random
import concurrent.futures
from typing import List, Dict, Any, Tuple
from fastapi import HTTPException

from icecream import ic
import app.state as state
from app.utils import prompt_helpers
from app.config import (
    get_random_llm_client_with_llama_index,
    EVALUATION_BATCH_SIZE,
    MAX_CONCURRENT_EVALUATIONS
)
from app.logs import logger

# Dedicated thread pool for evaluation service
_evaluation_pool = concurrent.futures.ThreadPoolExecutor(max_workers=16)

# ─── Topic Manager Class ─────────────────────────────────

class TopicManager:
    """
    Manages random topic selection without replacement.
    Resets the pool when all topics are exhausted.
    Thread-safe for concurrent requests.
    """
    
    def __init__(self, topics: List[str]):
        self.original_topics = topics.copy()
        self.available_topics = topics.copy()
        random.shuffle(self.available_topics)
    
    def get_next_topic(self) -> str:
        """
        Returns a random topic without replacement.
        Resets and reshuffles when pool is exhausted.
        """
        if not self.available_topics:
            self.available_topics = self.original_topics.copy()
            random.shuffle(self.available_topics)
            logger.info(f"[TopicManager] Reset topic pool, reshuffled {len(self.available_topics)} topics")
        
        topic = random.choice(self.available_topics)
        self.available_topics.remove(topic)
        return topic


class PositioningTopicManager:
    """
    Manages topic selection for positioning evaluations with module distribution.
    Ensures all modules participate before reusing topics from the same module.
    Thread-safe for concurrent requests.
    """
    
    def __init__(self, modules_topics: Dict[str, List[str]]):
        """
        Initialize with topics organized by module.
        
        Args:
            modules_topics: Dict with module names as keys and topic lists as values
            Example: {
                "Fundamentals_of_Marketing_Management": ["topic1", "topic2"],
                "Understand_the_Market": ["topic3", "topic4"]
            }
        """
        self.modules_topics = {}
        self.module_managers = {}
        
        # Initialize topic managers for each module
        # Only add modules with topics
        for module_name, topics in modules_topics.items():
            if topics:  
                self.modules_topics[module_name] = topics.copy()
                self.module_managers[module_name] = TopicManager(topics)
        
        # Track which modules have been used
        self.used_modules = set()
        self.available_modules = list(self.module_managers.keys())
        random.shuffle(self.available_modules)
    
    def get_next_topic(self) -> str:
        """
        Returns a topic ensuring module distribution.
        Prioritizes unused modules, then cycles through all modules.
        """
        if not self.module_managers:
            raise ValueError("No modules with topics available")
        
        # If we have unused modules, use one of them
        if self.available_modules:
            module_name = random.choice(self.available_modules)
            self.available_modules.remove(module_name)
            self.used_modules.add(module_name)
        else:
            # All modules have been used, reset and reshuffle
            self.available_modules = list(self.module_managers.keys())
            random.shuffle(self.available_modules)
            module_name = random.choice(self.available_modules)
            self.available_modules.remove(module_name)
            logger.info(f"[PositioningTopicManager] Reset module pool, reshuffled {len(self.available_modules)} modules")
        
        # Get topic from the selected module
        topic_manager = self.module_managers[module_name]
        topic = topic_manager.get_next_topic()
        
        logger.info(f"[PositioningTopicManager] Selected topic '{topic}' from module '{module_name}'")
        return topic
    
# ─── Utility Functions ───────────────────────────────────

async def fetch_references_for_question(question: str) -> List[str]:
    """
    Fetch raw references for a single question.
    Returns list of "File.pdf:chunk_X" format.
    """
    loop = asyncio.get_running_loop()
    
    def call_agent():
        return state.agent.query(question)
    
    t0 = time.perf_counter()
    result = await loop.run_in_executor(_evaluation_pool, call_agent)
    t1 = time.perf_counter()
    logger.info(f"[fetch_refs] agent.query for '{question[:30]}…' took {t1-t0:.3f}s")
    
    raw_refs = []
    for ns in result.source_nodes:
        node = ns.node
        m = node.metadata or {}
        fname = m.get("file_name", "").split("/")[-1]
        plabel = m.get("page_label", "")
        if fname and plabel:
            raw_refs.append(f"{fname}:{plabel}")
    
    deduped = list(dict.fromkeys(raw_refs))
    logger.info(f"[fetch_refs] found {len(deduped)} refs")
    return deduped


def format_and_merge_refs(raw_refs: List[str]) -> List[str]:
    """
    Format and merge raw references.
    Input:  ["Chap_1_File.pdf:chunk_3","Chap_1_File.pdf:chunk_4"]
    Output: ["Chap 1 File, Page 3, 4"]
    """
    grouped: Dict[str, List[str]] = {}
    for rr in raw_refs:
        filepart, chunkpart = rr.split(":", 1)
        title = os.path.splitext(filepart)[0].replace("_", " ")
        page = chunkpart.split("_")[-1]
        grouped.setdefault(title, []).append(page)
    
    merged = []
    for title, pages in grouped.items():
        unique = sorted(set(pages), key=int)
        merged.append(f"{title}, Page {', '.join(unique)}")
    
    logger.info(f"[format_refs] merged into {len(merged)} entries")
    return merged


def extract_and_parse_json(raw_response: str, context_info: str = "response") -> Dict[str, Any]:
    """
    Extract JSON from LLM response with fallback and parse it.
    
    Args:
        raw_response: Raw response from LLM
        context_info: Context information for error messages
        
    Returns:
        Parsed JSON as dictionary
        
    Raises:
        HTTPException: If JSON parsing fails
    """
    raw = str(raw_response).strip()
    
    # Fallback: extract JSON block if model prepends text
    if not raw.startswith("{"):
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1:
            raw = raw[start:end+1]
            logger.info(f"[parse_llm] fallback JSON slicing applied for {context_info}")
    
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error for '{context_info}': {e}")
        raise HTTPException(
            502,
            f"JSON parse error for '{context_info}': {e}\nRaw:\n{raw[:500]}..."  
        )


def parse_llm_response(raw_response: str, topic: str) -> List[Any]:
    """
    Parse LLM JSON response with fallback extraction.
    Returns the questions list from parsed JSON.
    """
    payload = extract_and_parse_json(raw_response, f"topic '{topic}'")
    
    questions = payload.get("questions")
    if not isinstance(questions, list):
        raise HTTPException(502, f"`questions` missing for '{topic}'")
    
    return questions


async def generate_single_question(topic: str, eval_type: str, context: str, language: str = "French") -> List[Any]:
    """
    Generate a single question for the given topic and type.
    Returns the parsed questions list.
    """
    # Get random LLM client
    llm = get_random_llm_client_with_llama_index(temperature=0.7)
    
    # Build generation prompt
    if eval_type == 'mcq':
        gen_prompt = prompt_helpers.mqc_gen_prompt(context, topic, 1, language)
    else:
        gen_prompt = prompt_helpers.open_gen_prompt(context, topic, 1, language)
    
    # Generate response
    loop = asyncio.get_running_loop()
    
    def do_generation():
        return llm.complete(prompt=gen_prompt)
    
    t0 = time.perf_counter()
    try:
        llm_result = await loop.run_in_executor(_evaluation_pool, do_generation)
    except Exception as e:
        raise HTTPException(500, f"Generation failed for '{topic}': {e}")
    t1 = time.perf_counter()
    
    logger.info(f"[generate_single] LLM generation for '{topic}' took {t1-t0:.3f}s")
    
    # Parse and return questions
    return parse_llm_response(llm_result, topic)


async def get_context_for_topic(topic: str) -> str:
    """
    Fetch relevant context chunks for a topic using vector search.
    Returns concatenated context string.
    """
    loop = asyncio.get_running_loop()
    
    def do_search():
        return state.agent.query(f"Provide relevant context for topic: {topic}")
    
    t0 = time.perf_counter()
    try:
        search_result = await loop.run_in_executor(_evaluation_pool, do_search)
    except Exception as e:
        raise HTTPException(500, f"Context search failed for '{topic}': {e}")
    t1 = time.perf_counter()
    
    logger.info(f"[get_context] vector_search for '{topic}' took {t1-t0:.3f}s")
    
    # Extract top 5 chunks and concatenate
    chunks = [n.node.get_content() for n in search_result.source_nodes[:5]]
    context = "\n\n---\n\n".join(chunks)
    
    return context

async def generate_single_case(topics: List[str], level: str, context: str | None = None, language: str = "French") -> Dict[str, Any]:
    """
    Generate a practical case with pedagogical metadata using selected topics.
    """
    llm = get_random_llm_client_with_llama_index(temperature=0.7)
    prompt = prompt_helpers.practical_case_gen_prompt(
        topics=topics,
        level=level,
        language=language, 
        course_context=context
    )

    loop = asyncio.get_running_loop()

    def do_generation():
        return llm.complete(prompt=prompt)

    try:
        raw_result = await loop.run_in_executor(_evaluation_pool, do_generation)
        print(raw_result)
    except Exception as e:
        raise HTTPException(500, f"[generate_case] LLM generation failed: {e}")
    
    return extract_and_parse_json(str(raw_result), "case generation")


# ─── Batch Processing ────────────────────────────────────

async def generate_questions_batch(
    topics_and_types: List[Tuple[str, str]], 
    semaphore: asyncio.Semaphore,
    language: str = "French"
) -> List[List[Any]]:
    """
    Generate a batch of questions in parallel with concurrency control.
    Each item in topics_and_types is (topic, eval_type).
    """
    async def generate_with_semaphore(topic: str, eval_type: str):
        async with semaphore:
            # Get context for this topic
            context = await get_context_for_topic(topic)
            # Generate question
            return await generate_single_question(topic, eval_type, context, language)
    
    # Create tasks for the batch
    tasks = [
        generate_with_semaphore(topic, eval_type) 
        for topic, eval_type in topics_and_types
    ]
    
    # Execute batch in parallel
    t0 = time.perf_counter()
    results = await asyncio.gather(*tasks)
    t1 = time.perf_counter()
    
    logger.info(f"[batch] Generated {len(topics_and_types)} questions in {t1-t0:.3f}s")
    return results


# ─── Main Orchestration Functions ────────────────────────

async def orchestrate_standard_evaluation(
    topics: List[str], 
    eval_type: str, 
    num_questions: int,
    language: str = "French"
) -> List[List[Any]]:
    """
    Orchestrate standard evaluation (single type: mcq OR open).
    Returns list of question lists, each with references populated.
    """
    logger.info(f"[orchestrate_standard] Starting {eval_type} evaluation: {num_questions} questions")
    
    # 1) Initialize topic manager
    topic_manager = TopicManager(topics)
    
    # 2) Prepare topic-type pairs for all questions
    topics_and_types = [
        (topic_manager.get_next_topic(), eval_type) 
        for _ in range(num_questions)
    ]
    
    # 3) Create semaphore for concurrency control
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_EVALUATIONS)
    
    # 4) Process questions in batches
    all_question_batches = []
    for i in range(0, len(topics_and_types), EVALUATION_BATCH_SIZE):
        batch = topics_and_types[i:i + EVALUATION_BATCH_SIZE]
        batch_results = await generate_questions_batch(batch, semaphore, language)
        all_question_batches.extend(batch_results)
    
    # 5) Flatten results (each batch_result is a list of questions)
    all_questions = []
    for question_batch in all_question_batches:
        all_questions.extend(question_batch)
    
    logger.info(f"[orchestrate_standard] Generated {len(all_questions)} questions total")
    
    # 6) Fetch and format references for all questions in parallel
    if all_questions:
        await populate_references_parallel(all_questions)
    
    return all_questions


async def orchestrate_mixed_evaluation(
    topics: List[str], 
    num_questions: int,
    mcq_weight: float,
    open_weight: float,
    language: str = "French",
    is_positioning: bool = False,
    modules_topics: Dict[str, List[str]] = None
) -> List[List[Any]]:
    """
    Orchestrate mixed evaluation (both mcq AND open questions).
    Returns shuffled list of mixed question types with references.
    
    Args:
        topics: List of topics (for standard evaluation)
        num_questions: Total number of questions to generate
        mcq_weight: Proportion of MCQ questions (0.0 to 1.0)
        open_weight: Proportion of open questions (0.0 to 1.0)
        language: Language for question generation
        is_positioning: Whether this is a positioning evaluation
        modules_topics: Dict of topics by module (for positioning evaluation)
    """
    logger.info(f"[orchestrate_mixed] Starting mixed evaluation: {num_questions} questions (positioning: {is_positioning})")

    # 1) Calculate distribution
    num_mcq = int(num_questions * mcq_weight)
    num_open = num_questions - num_mcq
    
    logger.info(f"[orchestrate_mixed] Distribution: {num_mcq} MCQ, {num_open} Open")
    
    # 2) Initialize appropriate topic manager
    if is_positioning and modules_topics:
        topic_manager = PositioningTopicManager(modules_topics)
        logger.info(f"[orchestrate_mixed] Using PositioningTopicManager with {len(modules_topics)} modules")
    else:
        topic_manager = TopicManager(topics)
        logger.info(f"[orchestrate_mixed] Using standard TopicManager with {len(topics)} topics")
    
    # 3) Prepare topic-type pairs
    topics_and_types = []
    
    # 4) Add MCQ/OPEN questions
    for _ in range(num_mcq):
        topics_and_types.append((topic_manager.get_next_topic(), 'mcq'))
     
    for _ in range(num_open):
        topics_and_types.append((topic_manager.get_next_topic(), 'open'))
    
    # 5) Shuffle to mix question types
    random.shuffle(topics_and_types)
    
    # 6) Create semaphore for concurrency control
    semaphore = asyncio.Semaphore(MAX_CONCURRENT_EVALUATIONS)
    
    # 7) Process questions in batches
    all_question_batches = []
    for i in range(0, len(topics_and_types), EVALUATION_BATCH_SIZE):
        batch = topics_and_types[i:i + EVALUATION_BATCH_SIZE]
        batch_results = await generate_questions_batch(batch, semaphore, language)
        all_question_batches.extend(batch_results)
    
    # 8) Flatten results
    all_questions = []
    for question_batch in all_question_batches:
        all_questions.extend(question_batch)
    
    logger.info(f"[orchestrate_mixed] Generated {len(all_questions)} mixed questions")
    
    # 9) Fetch and format references for all questions in parallel
    if all_questions:
        await populate_references_parallel(all_questions)
    
    return all_questions


async def populate_references_parallel(questions: List[List[Any]]) -> None:
    """
    Populate references for all questions in parallel.
    Modifies questions in-place by updating the last index with formatted references.
    """
    logger.info(f"[populate_refs] Starting reference population for {len(questions)} questions")
    
    # 1) Extract question texts (always at index 0)
    question_texts = [q[0] for q in questions]
    
    # 2) Fetch raw references concurrently
    t0 = time.perf_counter()
    tasks = [fetch_references_for_question(text) for text in question_texts]
    raw_refs_list = await asyncio.gather(*tasks)
    t1 = time.perf_counter()
    
    logger.info(f"[populate_refs] Fetched raw refs for {len(question_texts)} questions in {t1-t0:.3f}s")
    
    # 3) Format and merge references
    t2 = time.perf_counter()
    for question, raw_refs in zip(questions, raw_refs_list):
        formatted_refs = format_and_merge_refs(raw_refs)
        # Update references at last index (stub position)
        question[-1] = formatted_refs
    t3 = time.perf_counter()
    
    logger.info(f"[populate_refs] Formatted all references in {t3-t2:.3f}s")


# ─── Public API Functions ────────────────────────────────

async def evaluate_standard(
    topics: List[str], 
    eval_type: str, 
    num_questions: int,
    language: str = "French"
) -> Dict[str, Any]:
    """
    Public API for standard evaluation (mcq OR open).
    
    Args:
        topics: List of topics for question generation
        eval_type: Either 'mcq' or 'open'
        num_questions: Total number of questions to generate
        
    Returns:
        Dict with 'questions' key containing the generated questions
    """
    # 1) Ensure agent is loaded
    await state.reload_agent_from_json()
    if state.agent is None:
        raise HTTPException(500, "Agent initialization failed")
    
    # 2) Generate questions
    questions = await orchestrate_standard_evaluation(topics, eval_type, num_questions, language)
    
    return {"questions": questions}


async def evaluate_mixed(
    topics: List[str], 
    num_questions: int,
    mcq_weight: float = 0.5,
    open_weight: float = 0.5,
    language: str = "French",
    is_positioning: bool = False,
    modules_topics: Dict[str, List[str]] = None
) -> Dict[str, Any]:
    """
    Public API for mixed evaluation (mcq AND open).
    
    Args:
        topics: List of topics for question generation
        num_questions: Total number of questions to generate
        mcq_weight: Proportion of MCQ questions (0.0 to 1.0)
        open_weight: Proportion of open questions (0.0 to 1.0)
        language: Language for question generation
        is_positioning: Whether this is a positioning evaluation
        modules_topics: Dict of topics by module (for positioning evaluation)
        
    Returns:
        Dict with 'questions' key containing the mixed questions
    """
    # 1) Validate weights
    if not (0 <= mcq_weight <= 1 and 0 <= open_weight <= 1):
        raise HTTPException(400, "Weights must be between 0 and 1")
    
    if abs((mcq_weight + open_weight) - 1.0) > 0.001:
        raise HTTPException(400, "MCQ and Open weights must sum to 1.0")
    
    # 2) Validate positioning parameters
    if is_positioning and not modules_topics:
        raise HTTPException(400, "modules_topics is required for positioning evaluation")

    # 3) Ensure agent is loaded
    await state.reload_agent_from_json()
    if state.agent is None:
        raise HTTPException(500, "Agent initialization failed")

    # 4) Generate mixed questions
    questions = await orchestrate_mixed_evaluation(
        topics, 
        num_questions, 
        mcq_weight, 
        open_weight, 
        language,
        is_positioning,
        modules_topics
    )
    
    return {"questions": questions}

async def evaluate_case(
    topics: List[str], 
    level: str,
    course_context: str | None = None,
    language: str = "French"
) -> Dict[str, Any]:
    """
    Generate a single practical case for a list of topics.
    """
    await state.reload_agent_from_json()
    if state.agent is None:
        raise HTTPException(500, "Agent initialization failed")

    return await generate_single_case(topics, level, context=course_context, language=language)
