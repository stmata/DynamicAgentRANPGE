/**
 * Formats questions from evaluation API response into UI-friendly format
 * @param {Array} evaluationQuestions - Raw questions from the API
 * @returns {Array} Formatted questions for the UI
 */
export const formatQuestionsFromEvaluation = (evaluationQuestions) => {
  return evaluationQuestions.map((question, index) => {
    if (Array.isArray(question) && question.length > 4) {
      // MCQ format: [question, choice1, choice2, choice3, choice4, correct_answer, references]
      const [title, ...options] = question;
      const correctAnswer = question[question.length - 2]; 
      const references = question[question.length - 1]; 
      
      return {
        id: `mcq-${index}`,
        title,
        type: "mcq",
        options: options.slice(0, 4), 
        rawData: question, 
        correctAnswer,
        attempted: false,
        flagged: false,
        answer: null,
        references: Array.isArray(references) ? references : [],
      };
    } else {
      // Open question format: [question, model_answer, references] 
      const title = Array.isArray(question) ? question[0] : question.question || question;
      const modelAnswer = Array.isArray(question) ? question[1] : question.model_answer || '';
      const references = Array.isArray(question) ? question[2] : question.references || [];
      
      return {
        id: `open-${index}`,
        title,
        type: "open",
        modelAnswer,
        rawData: question, // Store original data for submission
        attempted: false,
        flagged: false,
        answer: "",
        references: Array.isArray(references) ? references : [],
      };
    }
  });
};

/**
 * Prepares submission data from questions and responses
 * @param {Array} questions - Questions array
 * @returns {Object} Formatted submission data
 */
export const prepareSubmissionData = (questions) => {
  const submissionQuestions = [];
  const responses = [];
  
  questions.forEach(question => {
    submissionQuestions.push(question.rawData);
    responses.push(question.answer || '');
  });
  
  return {
    questions: submissionQuestions,
    responses
  };
};

/**
 * Applies submission results to questions for feedback display
 * @param {Array} questions - Questions array
 * @param {Object} results - Submission results from API
 * @param {string} courseTitle - Course title for score storage
 * @param {string} moduleId - Module ID for score storage
 * @param {boolean} isPositionnement - Whether this is a positioning evaluation
 * @returns {Array} Updated questions with feedback
 */
export const applySubmissionResults = (questions, results, courseTitle, moduleId, isPositionnement) => {
  if (!results || !results.results || !Array.isArray(results.results)) {
    return questions;
  }
  const updatedQuestions = [...questions];
  
  results.results.forEach((result, index) => {
    if (index < updatedQuestions.length) {
      updatedQuestions[index].isCorrect = result.is_correct;
      updatedQuestions[index].submissionResult = result;
      
      if (updatedQuestions[index].type === 'mcq') {
        const correctOptionIndex = updatedQuestions[index].options.findIndex(
          option => option === result.correct_answer
        );
        updatedQuestions[index].correctOptionIndex = correctOptionIndex !== -1 ? correctOptionIndex : null;
        
        const userAnswerIndex = updatedQuestions[index].options.findIndex(
          option => option === result.user_answer
        );
        updatedQuestions[index].userAnswerIndex = userAnswerIndex !== -1 ? userAnswerIndex : null;
      } else if (updatedQuestions[index].type === 'open') {
        updatedQuestions[index].grade = result.grade;
        updatedQuestions[index].feedback = result.feedback;
      }
    }
  });
  
  // Save the final score to session storage
  if (results.final_score !== undefined) {
    sessionStorage.setItem('userScore', results.final_score.toString());
    
    // If this is a module evaluation, also store the module score
    if (!isPositionnement) {
      const moduleScores = JSON.parse(sessionStorage.getItem('moduleScores') || '{}');
      moduleScores[`${courseTitle}_${moduleId}`] = results.final_score;
      sessionStorage.setItem('moduleScores', JSON.stringify(moduleScores));
    }
  }
  
  return updatedQuestions;
}; 