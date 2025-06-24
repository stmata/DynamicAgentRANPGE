"""
Grade evaluation service

This module contains all business logic for grading evaluations including
standard MCQ/Open questions and case-based evaluations.
"""

import os
import json
import time
import asyncio
import concurrent.futures
from typing import List, Dict, Any, Tuple

from fastapi import HTTPException
from llama_index.llms.openai import OpenAI
from icecream import ic

from ..models.grade_models import (
    GradeRequest, GradeResponse, 
    CaseGradeRequest, CaseGradeResponse, DetailedAnalysis
)
from ..utils.azure_client import get_azure_openai_client_with_llama_index


# ThreadPoolExecutor for blocking LLM calls
_pool = concurrent.futures.ThreadPoolExecutor(max_workers=16)


class GradeService:
    """Service class for handling grade evaluation operations"""
    
    @staticmethod
    async def grade_user_answers(req: GradeRequest) -> GradeResponse:
        """
        Grade user answers for standard MCQ and open-ended questions.
        
        - MCQ: direct compare
        - Open: LLM grades 0–10
        Study guide now includes:
          • missed MCQs
          • open Qs graded <10
        
        Args:
            req: GradeRequest containing user answers and questions
            
        Returns:
            GradeResponse with results, study guide and final score
        """
        ic("grade ➤ start")
        results = []
        missed_mcq = []
        missed_open = []   # << NEW: collect open Qs < perfect

        # Loop through each Q + user response
        for idx, (entry, user_ans) in enumerate(zip(req.questions, req.responses)):
            # MCQ entry = length 7
            if len(entry) == 7:
                result = await GradeService._process_mcq_question(
                    entry, user_ans, idx, missed_mcq
                )
                results.append(result)

            # Open‐ended entry = length 3
            elif len(entry) == 3:
                result = await GradeService._process_open_question(
                    entry, user_ans, idx, missed_open, req.language
                )
                results.append(result)
            else:
                # Handle invalid entry format
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid question format at index {idx}. Expected 7 elements for MCQ or 3 elements for open question, got {len(entry)}. Entry: {entry}"
                )

        # Build study guide
        study_guide = await GradeService._build_study_guide(missed_mcq, missed_open, req.language)
        
        # Calculate final score
        final_score = GradeService._calculate_final_score(results)

        ic("grade ➤ end")
        return GradeResponse(results=results, study_guide=study_guide, final_score=final_score)

    @staticmethod
    async def _process_mcq_question(
        entry: List[Any], 
        user_ans: str, 
        idx: int, 
        missed_mcq: List[Dict]
    ) -> Dict[str, Any]:
        """Process a multiple choice question"""
        question, *choices, correct, refs = entry
        is_correct = (user_ans == correct)

        result = {
            "type": "mcq",
            "question": question,
            "correct_answer": correct,
            "user_answer": user_ans,
            "is_correct": is_correct,
            "references": refs
        }

        if not is_correct:
            missed_mcq.append({
                "question": question,
                "correct": correct,
                "references": refs
            })

        ic(f"grade ➤ MCQ idx={idx}, correct={is_correct}")
        return result

    @staticmethod
    async def _process_open_question(
        entry: List[Any], 
        user_ans: str, 
        idx: int, 
        missed_open: List[Dict],
        language: str
    ) -> Dict[str, Any]:
        """Process an open-ended question"""
        question, model_ans, refs = entry

        # Build "professor" prompt
        prompt = f"""
            You are a thoughtful and empathetic university professor reviewing a student's answer to an exam question.
             
            IMPORTANT: You must write your entire response in {language}. This includes all instructions, grading, and feedback. Do not use any other language.

            Check at the end that your response is fully in {language}.

             
            Your task is to:
            1. Assign a numeric grade from 0 (completely incorrect) to 10 (perfect).
            2. Write a short, encouraging and human-sounding feedback message directly to the student.
            Avoid robotic phrases like "The student answer is identical to the model answer".
            Instead, write as if you're speaking to the student, highlighting what they did well, and suggesting improvements if needed.
            3. Elaborate on your grade attribution. For instance, should the grade be 7/10, explain why you assign 7. Which parts of the answer were strong and which not strong enough.
            4. Should an example not be mentionned in a question, it should not be expected in the answer either.
            5. Assign a grade above zero only if the answer is plausible, congruent and has to do with the question. 
             
            Question: {question}
             
            Model Answer: {model_ans}
             
            Student Answer: {user_ans}
             
            Return *only* JSON in this format: {{ "grade": <int>, "feedback": "<string>" }}
        """

        llm = get_azure_openai_client_with_llama_index(temperature=0)
        loop = asyncio.get_running_loop()

        t0 = time.perf_counter()
        resp = await loop.run_in_executor(_pool, lambda: llm.complete(prompt=prompt))
        t1 = time.perf_counter()
        ic(f"grade ➤ OPEN idx={idx} LLM took {t1-t0:.3f}s")

        raw = str(resp).strip()
        if not raw.startswith("{"):
            s, e = raw.find("{"), raw.rfind("}")
            if s != -1 and e != -1:
                raw = raw[s:e+1]
                ic("grade ➤ OPEN fallback JSON")

        try:
            graded = json.loads(raw)
        except Exception as e:
            raise HTTPException(502, f"Open grading JSON parse error idx={idx}: {e}\nRaw:{raw}")

        grade = graded.get("grade")
        feedback = graded.get("feedback")

        result = {
            "type": "open",
            "question": question,
            "model_answer": model_ans,
            "user_answer": user_ans,
            "grade": grade,
            "feedback": feedback,
            "references": refs
        }

        # << NEW: if grade < 10, collect for study guide
        if grade is None or grade < 10:
            missed_open.append({
                "question": question,
                "feedback": feedback,
                "references": refs
            })

        ic(f"grade ➤ OPEN idx={idx}, grade={grade}")
        return result

    @staticmethod
    async def _build_study_guide(missed_mcq: List[Dict], missed_open: List[Dict], language:str) -> str:
        """Build study guide based on missed questions"""
        if not missed_mcq and not missed_open:
            return "🎉 You got all questions—and open responses—perfect! Well done."

        # Build a combined missed section
        guide_lines = []

        if missed_mcq:
            guide_lines.append("## Review these Multiple-Choice Concepts:")
            for m in missed_mcq:
                refs = ", ".join(m["references"])
                guide_lines.append(f"- **{m['question']}** → Correct: {m['correct']} (Refs: {refs})")

        if missed_open:
            guide_lines.append("\n## Improve these Open-Ended Responses:")
            for o in missed_open:
                refs = ", ".join(o["references"])
                guide_lines.append(f"- **{o['question']}** → Feedback: {o['feedback']} (Refs: {refs})")

        combined = "\n".join(guide_lines)
        
        # Prompt LLM to turn bullets into a concise study plan
        llm = get_azure_openai_client_with_llama_index(temperature=0.3)
        prompt = f"""
            You are a thoughtful and supportive university professor reviewing a student's recent exam performance.
            
            Below is a list of questions the student missed or underperformed on:
 
            {combined}
 
            Write a personal and motivating study guide addressed to the student. Your tone should feel warm, constructive, and encouraging.
 
            Guidelines:
            - Your recommendation have to stay in the context and domain or field covered in the questions.
            - Do not repeat the same types of suggestions (e.g., don't always list textbook chapters or suggest rewriting answers).
            - Vary the support: sometimes suggest a strategy, sometimes a resource, sometimes a mindset tip.
            - Write directly to the student in a warm and encouraging tone, like you're giving them constructive feedback in a private message.
            - Address both multiple-choice and open-ended struggles.
            - Offer specific, actionable suggestions for improvement.
            - When appropriate, recommend 1–2 concrete resources (e.g., textbook chapters, course materials, internal tools). Do this naturally, not robotically.
            - Mention that they can use the in-app chat feature to explore concepts more deeply with the documents.
            - Avoid generic conclusions, robotic tone, or naming yourself.
 
            STRICT FORMATTING REQUIREMENTS:
            1. Start with a personalized and motivating introduction paragraph, but do not include any greeting (e.g., "Bonjour") or mention the student's name. The introduction should immediately encourage the student and acknowledge their efforts or progress in a warm and constructive way.
            2. Use exactly these headers, in this order. However, YOU MUST PROVIDE IN THE INPUT LANGUAGE, THAT IS, SHOULD THE TEXT BE IN FRENCH you must say Domaine de concentration instead of Areas to Focus On, Stratégies d'étude recommandées instead of Study Strategies, and Ressources utiles instead of Helpful Resources:
               - '## Areas to Focus On' (main concepts to review)
               - '## Recommended Study Strategies' (specific techniques)
               - '## Helpful Resources' (specific materials)
            3. Under each header, use:
               - '- ' prefix for main bullet points (with exactly one space after the dash)
               - '  - ' prefix for sub-bullet points (with exactly two spaces before the dash)
               - '**bold text**' for emphasizing important concepts or terms
            4. Ensure there's a blank line between paragraphs and sections
            5. DO NOT use numbered lists - only use bullet points
            6. Keep each bullet point concise and focused on a single concept

            IMPORTANT: You must write the ENTIRE response in {language}, including all section titles, bullet points, and content.

            At the end, verify that ALL parts are in {language}.
 
            Return *only* the study guide text, following the above formatting rules.
        """
        
        t2 = time.perf_counter()
        sg = llm.complete(prompt=prompt)
        t3 = time.perf_counter()
        ic(f"grade ➤ study guide LLM took {t3-t2:.3f}s")

        return str(sg).strip()

    @staticmethod
    def _calculate_final_score(results: List[Dict[str, Any]]) -> int:
        """Calculate final score from results"""
        total_points = 0
        earned_points = 0

        for res in results:
            if res["type"] == "mcq":
                total_points += 1
                if res["is_correct"]:
                    earned_points += 1
            elif res["type"] == "open":
                total_points += 10
                grade = res.get("grade", 0)
                earned_points += grade if isinstance(grade, (int, float)) else 0

        # Final score on 100
        return round((earned_points / total_points) * 100) if total_points else 0

    @staticmethod
    async def grade_case_evaluation(req: CaseGradeRequest) -> CaseGradeResponse:
        """
        Grade a case-based evaluation response using LLM with detailed evaluation criteria.
        Returns score, feedback and detailed analysis with strengths and improvements.
        
        Args:
            req: CaseGradeRequest containing case data and user response
            
        Returns:
            CaseGradeResponse with score, feedback and detailed analysis
        """
        ic("grade-case ➤ start")
        
        # Extract case information
        case_data = req.case_data
        case_info = case_data.get("case", {})
        case_title = case_info.get("title", "Case Study")
        case_description = case_info.get("description", "")
        case_instructions = case_info.get("instructions", "")
        
        pedagogical_objectives = case_data.get("pedagogical_objectives", [])
        expected_elements = case_data.get("expected_elements_of_response", [])
        evaluation_criteria = case_data.get("evaluation_criteria", [])
        language = req.language
        
        # Build comprehensive context for LLM
        case_context = f"""
        Case Title: {case_title}
        
        Description: {case_description}
        
        Instructions: {case_instructions}
        
        Course: {req.course}
        Level: {req.level}
        Topics Covered: {', '.join(req.topics)}
        
        Pedagogical Objectives:
        {chr(10).join([f"- {obj}" for obj in pedagogical_objectives]) if pedagogical_objectives else "Not specified"}
        
        Expected Elements of Response:
        {chr(10).join([f"- {elem}" for elem in expected_elements]) if expected_elements else "Not specified"}
        """
        
        # Build criteria section for the prompt
        criteria_text = ""
        if evaluation_criteria:
            criteria_text = "Evaluation Criteria:\n"
            total_weight = sum(c.get("weight", 0) for c in evaluation_criteria)
            for criterion in evaluation_criteria:
                weight = criterion.get("weight", 0)
                criteria_text += f"- {criterion.get('criterion', 'Unknown')}: {weight}% of total grade\n"
        
        # Build comprehensive grading prompt
        prompt = f"""
        You are an experienced university professor grading a case study response. You have specific evaluation criteria and expected elements to assess the student's work.

        CASE CONTEXT:
        {case_context}
        
        {criteria_text}

        STUDENT RESPONSE:
        {req.user_response}

        GRADING INSTRUCTIONS:
        1. Evaluate the response against each criterion if provided, or use these general criteria:
           - Understanding of the case context and key issues
           - Application of relevant theoretical concepts and frameworks
           - Quality of analysis and critical thinking
           - Practical solutions and actionable recommendations
           - Clarity and structure of the response

        2. Check if the response addresses the expected elements listed above
        
        3. Consider the academic level ({req.level}) when setting expectations
        
        4. Assign a score from 0 to 100 based on overall performance
        
        5. Write comprehensive feedback that:
           - Acknowledges what the student did well
           - Explains how they met or didn't meet the evaluation criteria
           - References specific parts of their response
           - Provides constructive guidance for improvement

        6. Identify 3-5 specific strengths in the response
        
        7. Identify 2-4 specific areas for improvement

        IMPORTANT: 
            - Be fair but rigorous. A response that only partially addresses the requirements should not receive a high score, even if well-written.
            - Should the response not be plausible, intelligible, congruent nor have nothing to do with the question or be empty, assign zero as grade and reply with precision that the response does not address the question.

        You must write the ENTIRE response — including all field values and list items — in {language}.

        Before returning the JSON, double-check that ALL content is written correctly in {language}, especially feedback, strengths, and improvements.


        Return *only* JSON in this exact format:
        {{
            "score": <integer from 0-100>,
            "feedback": "<comprehensive feedback paragraph addressing the criteria and expected elements>",
            "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
            "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"]
        }}
        """

        llm = OpenAI(model=os.getenv("AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4o", "gpt-4o"), temperature=0.3)
        loop = asyncio.get_running_loop()

        t0 = time.perf_counter()
        resp = await loop.run_in_executor(_pool, lambda: llm.complete(prompt=prompt))
        t1 = time.perf_counter()
        ic(f"grade-case ➤ LLM took {t1-t0:.3f}s")

        raw = str(resp).strip()
        
        # Extract JSON from response
        if not raw.startswith("{"):
            s, e = raw.find("{"), raw.rfind("}")
            if s != -1 and e != -1:
                raw = raw[s:e+1]
                ic("grade-case ➤ fallback JSON extraction")

        try:
            graded = json.loads(raw)
        except Exception as e:
            raise HTTPException(502, f"Case grading JSON parse error: {e}\nRaw response: {raw}")

        # Extract and validate response components
        score = graded.get("score", 0)
        feedback = graded.get("feedback", "Unable to provide feedback")
        strengths = graded.get("strengths", [])
        improvements = graded.get("improvements", [])
        
        # Ensure score is within valid range
        if not isinstance(score, int) or score < 0 or score > 100:
            score = max(0, min(100, int(score) if isinstance(score, (int, float)) else 50))
        
        # Ensure we have lists for strengths and improvements
        if not isinstance(strengths, list):
            strengths = []
        if not isinstance(improvements, list):
            improvements = []
        
        # Fallback if LLM didn't provide proper lists
        if not strengths:
            strengths = ["Response demonstrates effort and engagement with the case"]
        if not improvements:
            improvements = ["Consider providing more detailed analysis in future responses"]

        ic(f"grade-case ➤ score={score}, strengths_count={len(strengths)}, improvements_count={len(improvements)}")

        return CaseGradeResponse(
            score=score,
            feedback=feedback,
            detailed_analysis=DetailedAnalysis(
                strengths=strengths,
                improvements=improvements
            )
        ) 
