import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEvaluation } from '../../../hooks/useEvaluation';
import { useAuth } from '../../../contexts/AuthContext';
import { determineCourseFilter } from '../../../utils/helpers'; 
import { formatQuestionsFromEvaluation, prepareSubmissionData, applySubmissionResults } from '../utils/questionFormatter';

/**
 * Custom hook for managing quiz state and evaluation logic
 * @param {string} moduleId - Module identifier
 * @param {string} courseTitle - Course title
 * @param {Array} moduleTopics - Topics for the module
 * @param {boolean} isPositionnement - Whether this is a positioning evaluation
 * @returns {Object} Quiz state and functions
 */
export const useQuizState = (moduleId, courseTitle, moduleTopics, isPositionnement) => {
  const { getTopicsForModule, getModulesForCourse, selectedCourse } = useAuth();
  const {
    loading: evaluationLoading,
    error: evaluationError,
    generateMixedEvaluation,
    submitEvaluation: submitEvaluationHook,
    clearError
  } = useEvaluation();

  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResults, setSubmissionResults] = useState(null);
  const [evaluationGenerated, setEvaluationGenerated] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  /**
   * Gets evaluation topics based on type (positioning or module)
   */
  const getEvaluationTopics = () => {
    if (isPositionnement) {
      // If courseTitle is provided (from positioning dialog), use that specific course
      if (courseTitle && courseTitle !== 'positionnement') {
        const modules = getModulesForCourse(courseTitle);
        const allTopics = [];
        const modulesTopics = {};
        
        Object.keys(modules).forEach(moduleName => {
          const moduleTopics = getTopicsForModule(courseTitle, moduleName);
          allTopics.push(...moduleTopics);
          modulesTopics[moduleName] = moduleTopics;
        });
        
        return { allTopics, modulesTopics };
      } else {
        // Default fallback - use Marketing topics for general positioning
        const marketingModules = getModulesForCourse('Marketing');
        const allMarketingTopics = [];
        const modulesTopics = {};
        
        Object.keys(marketingModules).forEach(moduleName => {
          const moduleTopics = getTopicsForModule('Marketing', moduleName);
          allMarketingTopics.push(...moduleTopics);
          modulesTopics[moduleName] = moduleTopics;
        });
        
        return { allTopics: allMarketingTopics, modulesTopics };
      }
    } else {
      return { allTopics: moduleTopics || [], modulesTopics: null };
    }
  };

  /**
   * Fetches evaluation questions from API
   */
  const fetchEvaluationQuestions = async () => {
    if (evaluationGenerated) return;

    const topicsData = getEvaluationTopics();
    const topicsToUse = topicsData.allTopics;
    const modulesTopics = topicsData.modulesTopics;

    if (!topicsToUse || topicsToUse.length === 0) {
      setError('No topics available for evaluation');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      
      if (!sessionId) {
        setSessionId(`${moduleId}_${uuidv4().substring(0, 8)}`);
      }
      
      const numQuestions = isPositionnement ? 15 : 5;
      
      const courseFilter = determineCourseFilter(isPositionnement, selectedCourse, courseTitle);
      
      const evaluation = await generateMixedEvaluation(
        topicsToUse,
        numQuestions,
        0.6,
        0.4,
        isPositionnement,
        modulesTopics,
        courseFilter
      );
      
      if (evaluation && evaluation.questions) {
        const formattedQuestions = formatQuestionsFromEvaluation(evaluation.questions);
        setQuestions(formattedQuestions);
        setEvaluationGenerated(true);
      } else {
        throw new Error('No questions received from evaluation');
      }
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching evaluation questions:', err);
      setError(err.message || 'Failed to load evaluation questions. Please try again.');
      setIsLoading(false);
    }
  };

  /**
   * Saves answer for current question
   * @param {*} value - Answer value
   */
  const saveCurrentAnswer = (value) => {
    if (isSubmitted) return;
    
    const updatedQuestions = [...questions];
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    
    if (currentQuestion.type === 'mcq') {
      currentQuestion.answer = currentQuestion.options[value];
      currentQuestion.answerIndex = value;
      currentQuestion.attempted = true;
    } else {
      currentQuestion.answer = value;
      currentQuestion.attempted = value.trim() !== '';
    }
    
    setQuestions(updatedQuestions);
  };

  /**
   * Toggles flag status for current question
   */
  const toggleFlag = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].flagged = !updatedQuestions[currentQuestionIndex].flagged;
    setQuestions(updatedQuestions);
  };

  /**
   * Submits the quiz evaluation
   */
  const submitQuiz = async () => {
    try {
      setIsLoading(true);
      
      const { questions: submissionQuestions, responses } = prepareSubmissionData(questions);
      const topicsData = getEvaluationTopics();
      const topicsToUse = topicsData.allTopics;
      const evaluationType = 'mixed'; 
      
      const result = await submitEvaluationHook(
        submissionQuestions,
        responses,
        courseTitle,
        moduleId,
        topicsToUse,
        evaluationType
      );
      
      setSubmissionResults(result);
      setIsSubmitted(true);
      setIsLoading(false);
      
      const updatedQuestions = applySubmissionResults(questions, result, courseTitle, moduleId, isPositionnement);
      setQuestions(updatedQuestions);
      
      return result;
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setIsLoading(false);
      throw error;
    }
  };

  /**
   * Navigation functions
   */
  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const updateQuestionUI = (index) => {
    setCurrentQuestionIndex(index);
  };

  /**
   * Resets the view to the first question
   */
  const resetToFirstQuestion = () => {
    setCurrentQuestionIndex(0);
  };

  // Load evaluation on mount
  useEffect(() => {
    if (!evaluationGenerated && (isPositionnement || (moduleTopics && moduleTopics.length > 0))) {
      fetchEvaluationQuestions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, isPositionnement, evaluationGenerated]);

  // Calculate stats
  const attemptedCount = questions.filter(q => q.attempted).length;
  const flaggedCount = questions.filter(q => q.flagged).length;
  const unattemptedCount = questions.length - attemptedCount;
  const progressPercentage = (attemptedCount / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  return {
    // State
    questions,
    currentQuestion,
    currentQuestionIndex,
    isLoading: isLoading || evaluationLoading,
    error: error || evaluationError,
    isSubmitted,
    submissionResults,
    
    // Stats
    attemptedCount,
    flaggedCount,
    unattemptedCount,
    progressPercentage,
    
    // Actions
    saveCurrentAnswer,
    toggleFlag,
    submitQuiz,
    goToPrevQuestion,
    goToNextQuestion,
    updateQuestionUI,
    resetToFirstQuestion,
  };
}; 