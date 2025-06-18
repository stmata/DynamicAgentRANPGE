class Prompt:
    """A service to hold predefined prompts for other tasks."""
    
    @staticmethod
    def mqc_gen_prompt(context: str, topic: str, num_questions: int, language: str = "French") -> str:
        """
            Generates a prompt to instruct an AI to create multiple-choice questions based on a given context.

            Args:
                context (str): The text content from which the questions should be generated.
                topic (str): The topic to be used as the focus for the questions.
                num_questions (int): The number of multiple-choice questions to generate.
                language (str): Output language for the questions (default is "French").

            Returns:
                str: A formatted prompt string for the AI to generate multiple-choice questions in French.
        """
        # prompt = f"""
        #             You are an instructional AI. Using *ONLY* the context below, generate {num_questions} multiple-choice questions on "{topic}".

        #             Context:
        #             {context}

        #             For each question:
        #             Instructions:
        #             - All questions and answers must be written in **{language}**.
        #             - For each question, provide exactly 4 plausible answer choices.
        #             - Clearly mark the correct one.
        #             - The **correct answer must always be given as the full text**, not as a label like "c1" or "option B".
        #             - The **references must always be given from the context**.
        #             - Randomize the order of the answer choices for each question so the correct answer does not always appear in the same position.
        #             - Do NOT include any explanation or analysis.
        #             - Do NOT use any external knowledge—stick strictly to the context.
        #             - Format the output strictly as valid JSON.
                    
        #             Format exactly:
        #             {{  
        #             "questions":[  
        #                 [question, c1, c2, c3, c4, correct, references], …
        #             ]
        #             }}
        #             Important:
        #             - Output must be valid JSON.
        #             - Do not return anything else outside the JSON object.
        #        """
        forbidden_phrases = {
            "French": [
                "selon le texte", "d'après le document", "selon le contexte", 
                "selon l'image", "d'après le passage", "selon l'extrait",
                "d'après le texte", "selon le document", "d'après le contexte",
                "selon le passage", "d'après l'extrait", "selon l'image",
                "dans le texte", "dans le document", "dans le contexte"
            ],
            "English": [
                "according to the text", "based on the document", "according to the context",
                "according to the image", "based on the passage", "according to the excerpt",
                "in the text", "in the document", "in the context",
                "as mentioned in", "as stated in", "as described in"
            ],
            "Spanish": [
                "según el texto", "según el documento", "según el contexto",
                "según la imagen", "según el pasaje", "según el extracto",
                "de acuerdo con el texto", "basado en el documento"
            ]
        }

        phrases_to_avoid = forbidden_phrases.get(language, forbidden_phrases["English"])
        phrases_list = ", ".join([f'"{phrase}"' for phrase in phrases_to_avoid])

        prompt = f"""
            You are a **university professor** specializing in pedagogy and assessment. Using ONLY the context provided, generate exactly {num_questions} multiple-choice questions on the topic "{topic}".

            Instructions:
            - All output must be written in **{language}**.
            - **CRITICAL**: DO NOT use phrases like {phrases_list} in the questions.
            - Each question must have exactly 4 answer choices.
            - The correct answer must be the **full answer text**, not a letter or label.
            - The correct answer must be randomly placed among the 4 choices.
            - For each question, also include a **reference** extracted from the context.
            - You MUST return the result as **strictly valid JSON**.
            - DO NOT return any explanations, comments, or introductory text.
            - DO NOT use key-value dictionaries. Instead, format each question as a **list** with 7 items:
            [question, choice1, choice2, choice3, choice4, correct_answer, reference]

            Use the exact format below:
            {{
            "questions": [
                ["question1", "choice1", "choice2", "choice3", "choice4", "correct_answer", "reference"],
                ...
            ]
            }}

            Context:
            \"\"\"
            {context}
            \"\"\"
        """
        
        return prompt
    
    @staticmethod
    def open_gen_prompt(context: str, topic: str, num_questions: int, language: str = "French") -> str:
        """
            Generates a prompt instructing an AI to create open-ended questions from a given context.

            Args:
                context (str): The source text to generate questions from.
                topic (str): The topic on which the questions should focus.
                num_questions (int): Number of open-ended questions to generate.
                language (str): The output language for the questions and answers.

            Returns:
                str: A formatted prompt for generating structured open-ended questions.
        """
        prompt = f"""
            You are a **university professor** specializing in pedagogy and assessment. Based *ONLY* on the context provided below, generate {num_questions} open-ended questions on topic: "{topic}".

            Context:
            {context}

            Instructions:
            - All questions and answers must be written in **{language}**.
            - For each question, provide:
                1. The open-ended question.
                2. A suggested answer (concise but informative).
                3. A reference from the context.
            - Do NOT include any explanation, reasoning, or content outside the context.
            - Do NOT return anything except the JSON structure.

            Expected output format:
            {{
                "questions": [
                    ["Question text", "Suggested answer", "References"],
                    ...
                ]
            }}

            Important:
            - The output must be in **{language}**.
            - The output must be valid JSON and match the exact format above.
            - Do not include any introductory or closing remarks—return only the JSON block.
            """
        
        return prompt

    @staticmethod
    def summary_gen_prompt(text: str) -> str:
        """
        Generates a prompt to instruct an LLM to summarize a given document in English,
        highlighting key concepts and possible questions based on the content.

        Args:
            text (str): The full text to summarize.

        Returns:
            str: A formatted prompt ready to be passed to an LLM.
        """
        text = text[:127999]

        prompt = f"""
            You are an AI assistant tasked with summarizing documents.

            Please provide a concise summary of the following text, using bullet points to highlight:
            1. **Key concepts and main topics** covered in the document  
            2. **Important keywords**  
            3. **All possible questions** that could be answered using the text (open-ended or factual)  
            4. **Relevant use case scenarios** derived from the content that could serve as the basis for practical evaluation (e.g. case studies, applied problem-solving tasks)

            ⚠️ DO NOT include:
            - Technologies
            - Use cases

            🎯 Purpose:
            - This summary will be used to help an AI agent choose the right vector store
            - It will also serve as the foundation to generate evaluation materials, including:
                - Multiple-choice questions
                - Open-ended questions
                - Practical use case evaluations (e.g. "Here is a situation. How would you respond?")

            💡 Language requirement:
            - The summary must be written in **ENGLISH**, regardless of the document's original language.

            Here is the text to summarize:
            {text}
            """
        return prompt

    @staticmethod
    def practical_case_gen_prompt(topics: list[str], level: str, language: str = "French", course_context: str = None) -> str:
        """
        Generates a realistic business case scenario for students, along with pedagogical objectives,
        expected answer elements, and evaluation criteria.

        Args:
            topics (list): List of key topics to include in the case (e.g., ["Consumer Behavior", "Marketing Planning"]).
            level (str): Academic level of the student (e.g., "Bachelor 3", "Master 1").
            language (str): Language of output (default: French).
            course_context (str, optional): Optional supporting content to be used as factual base.

        Returns:
            str: Prompt to be used by the LLM.
        """
        topics_str = ", ".join(topics)
        context_block = f'📚 Course context:\n"""\n{course_context}\n"""\n' if course_context else ""

        return f"""
            You are a **business school professor and instructional designer**.

            🎯 Task:
            Generate a **practical business case study** for students of level **{level}** on the following topics:
            - {topics_str}

            {context_block}

            📌 Instructions:
            You must return EXACTLY this JSON structure, written in **{language}**:

            {{
            "case": {{
                "title": "Short descriptive title",
                "description": "Contextualized scenario requiring application of the listed topics (10-15 lines)",
                "instructions": "What the student must do (e.g., memo, recommendation, diagnosis, SWOT...)"
            }},
            "pedagogical_objectives": [
                "Objective 1 (linked to topic 1)",
                "Objective 2",
                "Objective 3"
            ],
            "expected_elements_of_response": [
                "Element 1 the student should include",
                "Element 2",
                "Element 3"
            ],
            "evaluation_criteria": [
                {{
                "criterion": "Clarity of argument",
                "weight": 30
                }},
                {{
                "criterion": "Use of relevant marketing frameworks",
                "weight": 40
                }},
                {{
                "criterion": "Connection with the scenario and proposed actions",
                "weight": 30
                }}
            ]
            }}

            ⚠️ CRITICAL CONSTRAINTS:
            - Use the topics as core pillars for the case.
            - If course context is provided, base everything strictly on it.
            - Return ONLY valid JSON - no markdown blocks, no explanations, no code fences.
            - Do NOT wrap the response in any additional object (like {{"response": ...}}).
            - The JSON must start with {{ and end with }}.
            - Ensure ALL required fields are present: "case", "pedagogical_objectives", "expected_elements_of_response", "evaluation_criteria".
            - Do NOT nest pedagogical_objectives, expected_elements_of_response, or evaluation_criteria inside the "case" object.
        """

    @staticmethod
    def extract_topics_from_summary(summary: str) -> str:
        """
        Generates a user prompt for a chat-based LLM to extract the most relevant topics
        from a document summary, returning them as a JSON array of strings.

        Args:
            summary (str): The summary text from which to extract topics.

        Returns:
            str: A formatted prompt to extract topics as JSON.
        """
        prompt = f"""
            Given the following markdown document summary, extract the most relevant and high-level topics 
            that describe the main content. Do not include technologies or overly specific terms.

            Summary:

            {summary}

            Your response must be EXACTLY in this format (a valid JSON array):
            ["Topic 1", "Topic 2", "...", "Topic n"]

            Do not include any markdown formatting, backticks, explanations, or additional text.
            Just return the pure JSON array.
        """

        
        return prompt
    
    @staticmethod
    def reset_system_prompt_for_agent() -> str:
        """
        Returns the default system prompt for the AI, instructing it how to format responses and what constraints to follow.

        Returns:
            str: A structured system prompt in English with formatting, explanation, and security instructions.
        """
        return """\
            You are designed to help with a variety of tasks, from answering questions \
                to providing summaries to other types of analyses.

            ## Tools
            You have access to a wide variety of tools. You are responsible for using
            the tools in any sequence you deem appropriate to complete the task at hand.
            This may require breaking the task into subtasks and using different tools
            to complete each subtask.

            You have access to the following tools:
            {tool_desc}

            ## Output Format
            To answer the question, please use the following format.

            ```
            Thought: I need to use a tool to help me answer the question.
            Action: tool name (one of {tool_names}) if using a tool.
            Action Input: the input to the tool, in a JSON format representing the kwargs (e.g. {{"input": "hello world", "num_beams": 5}})
            ```

            Please ALWAYS start with a Thought.

            Please use a valid JSON format for the Action Input. Do NOT do this {{'input': 'hello world', 'num_beams': 5}}.

            If this format is used, the user will respond in the following format:

            ```
            Observation: tool response
            ```

            You should keep repeating the above format until you have enough information
            to answer the question without using any more tools. At that point, you MUST respond
            in the one of the following two formats:

            ```
            Thought: I can answer without using any more tools.
            Answer: [your answer here]
            ```

            ```
            Thought: I cannot answer the question with the provided tools.
            Answer:  I am afraid, but I have noticed that your question is out ot the scope. Perhaps you are not aware of the context .... YOU MUST USE THE LANGUAGE OF THE INPUT QUESTION
            ```

            ## Additional Rules
            - The answer MUST contain a sequence of bullet points that explain how you arrived at the answer. This can include aspects of the previous conversation history.
            - You MUST obey the function signature of each tool. Do NOT pass in no arguments if the function expects arguments.
            - If you cannot answer the question with the provided tools, than PROVIDE A LIST OF TOPICS AVAILABLE FROM THE TOOLS as follow: 'I may be able to assist you with the following topics: list of topics'. ALWAYS REPLY USING THE INPUT LANGUAGE.
            - Your answer MUST BE IN THE LANGUAGE THE QUESTION IS ASKED WHETHER YOU CAN OR NOT ANSWER THE QUESTION. IF THE INPUT QUESTION IS IN FRENCH, YOU MUST RESPOND IN FRENCH.
            - For mathematical formulas, use LaTeX syntax:

                    Use $$ for block formulas.

                    Use $ for inline formulas.

                    Example block:
                    $$
                        E = mc^2
                    $$

                    Example inline: $E = mc^2$
            - For tables and similar structures, use standard Markdown.
                    However, for tables only, return them using HTML format like this:

                    <div> <table> <tr><th>Header 1</th><th>Header 2</th></tr> <tr><td>Data 1</td><td>Data 2</td></tr> </table> </div> Only return the table when it is complete.
                    Always provide clear explanations and examples when helpful.
            - When you provide a formula, explain what each variable stands for.

            ## Current Conversation
            Below is the current conversation consisting of interleaving human and assistant messages.

                    Answer questions clearly and concisely.
                    Always provide clear explanations and examples when helpful.

            """

    @staticmethod
    def conversation_title_prompt(first_message: str) -> str:
        """
        Generates a prompt that instructs an LLM to create a short and relevant conversation title
        based on the first user message, using the same language as the input message.

        Args:
            first_message (str): The first message in the conversation.

        Returns:
            str: A prompt string ready to be used by an LLM.
        """
        return f"""
            Generate a short and relevant title (max 50 characters) for a conversation that starts with this message:

            "{first_message}"

            The title must:
            - Be in the same language as the message above.
            - Be concise, without quotation marks or punctuation at the end.
            - Accurately reflect the main topic of the message.
        """

    @staticmethod
    def conversation_summary_prompt(conversation_text: str) -> str:
        """
        Generates a prompt to summarize a segment of a conversation between a user and an assistant.

        Args:
            conversation_text (str): The content of the conversation segment to summarize.

        Returns:
            str: A prompt string ready to be used by an LLM.
        """
        return f"""
            You are given a segment of a conversation between a user and an assistant.

            Your task is to summarize this segment **concisely** while preserving:
            - The essential information,
            - Any decisions or conclusions made,
            - Important context from the discussion.

            📝 The summary should:
            - Be written in the **same language** as the conversation segment.
            - Be brief and informative.
            - Avoid unnecessary rephrasing or commentary.

            Conversation segment:
            \"\"\"
            {conversation_text}
            \"\"\"

            Concise summary:
        """

    @staticmethod
    def theme_analysis_prompt(text: str, theme_count: int) -> str:
        """
        Generates a prompt to analyze a text and extract its main themes.

        Args:
            text (str): The input text to analyze.
            theme_count (int): The number of main themes to identify.

        Returns:
            str: A formatted prompt for an LLM to extract key themes as structured JSON.
        """
        return f"""
            You are an AI specialized in text analysis.

            Analyze the following text and identify the top {theme_count} main themes.

            For each theme, provide:
            - A short title (1 line max)
            - A brief description
            - A relevance score between 0 and 100

            🧠 Instructions:
            - Use the **same language** as the original text.
            - Focus on the most central ideas in the content.
            - Do not use any external information.

            📦 Format your response as valid JSON, exactly like this:
            [
            {{
                "title": "Theme title",
                "description": "Brief description of the theme",
                "relevance": 85
            }},
            ...
            ]

            Text to analyze:
            \"\"\"
            {text}
            \"\"\"
        """
