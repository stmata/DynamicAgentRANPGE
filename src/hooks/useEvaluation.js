import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import evaluationApi from '../services/evaluationApi.js';
import storage from '../services/storage.js';
import { EVALUATION_CONFIG } from '../utils/constants.js';

/**
 * Evaluation hook for managing current assessment
 */
export const useEvaluation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const { i18n } = useTranslation();
  const generatePromiseRef = useRef(null);
  const evaluationCacheKey = 'current_evaluation';


  /**
   * Get current language for evaluation requests
   */
  const getCurrentLanguage = useCallback(() => {
    const currentLang = i18n.language || 'fr';
    const { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } = EVALUATION_CONFIG;
    
    return SUPPORTED_LANGUAGES[currentLang] || DEFAULT_LANGUAGE;
  }, [i18n.language]);

  /**
   * Generate standard evaluation (MCQ or Open questions)
   */
  const generateStandardEvaluation = useCallback(async (evalType, topics, numQuestions, courseFilter = null) => {
    if (!topics || topics.length === 0) {
      throw new Error('Topics are required');
    }

    if (generatePromiseRef.current) {
      return generatePromiseRef.current;
    }

    try {
      setError(null);
      setLoading(true);
      
      generatePromiseRef.current = evaluationApi.generateStandardEvaluation(
        evalType, 
        topics, 
        numQuestions,
        courseFilter
      );
      
      const response = await generatePromiseRef.current;
      
      const evaluation = {
        id: Date.now().toString(),
        type: 'standard',
        evalType,
        topics,
        numQuestions,
        questions: response.questions,
        createdAt: new Date().toISOString(),
      };
      
      setCurrentEvaluation(evaluation);
      storage.setCacheItem(evaluationCacheKey, evaluation, 120);
      
      window.dispatchEvent(new CustomEvent('evaluation:generated', {
        detail: { evaluation }
      }));
      
      return evaluation;
      
    } catch (err) {
      console.error('Failed to generate standard evaluation:', err);
      setError(err.message || 'Failed to generate evaluation');
      throw err;
    } finally {
      setLoading(false);
      generatePromiseRef.current = null;
    }
  }, []);

  /**
   * Generate mixed evaluation (MCQ and Open questions)
   */
  const generateMixedEvaluation = useCallback(async (topics, numQuestions, mcqWeight = 0.5, openWeight = 0.5, isPositioning = false, modulesTopics = null, courseFilter = null) => {
    if (!topics || topics.length === 0) {
      throw new Error('Topics are required');
    }

    if (Math.abs((mcqWeight + openWeight) - 1.0) > 0.001) {
      throw new Error('MCQ and Open weights must sum to 1.0');
    }

    if (isPositioning && !modulesTopics) {
      throw new Error('modulesTopics is required for positioning evaluation');
    }

    if (generatePromiseRef.current) {
      return generatePromiseRef.current;
    }

    try {
      setError(null);
      setLoading(true);

      const language = getCurrentLanguage();

      generatePromiseRef.current = evaluationApi.generateMixedEvaluation(
        topics, 
        numQuestions, 
        mcqWeight, 
        openWeight,
        language,
        isPositioning,
        modulesTopics,
        courseFilter
      );
      
      const response = await generatePromiseRef.current;
      
      const evaluation = {
        id: Date.now().toString(),
        type: 'mixed',
        topics,
        numQuestions,
        mcqWeight,
        openWeight,
        questions: response.questions,
        createdAt: new Date().toISOString(),
      };
      
      setCurrentEvaluation(evaluation);
      storage.setCacheItem(evaluationCacheKey, evaluation, 120);
      
      window.dispatchEvent(new CustomEvent('evaluation:generated', {
        detail: { evaluation }
      }));
      
      return evaluation;
      
    } catch (err) {
      console.error('Failed to generate mixed evaluation:', err);
      setError(err.message || 'Failed to generate mixed evaluation');
      throw err;
    } finally {
      setLoading(false);
      generatePromiseRef.current = null;
    }

  }, [getCurrentLanguage]);

  /**
   * Generate case-based evaluation
   */
  const generateCaseEvaluation = useCallback(async (topics, level, courseContext = null, courseFilter = null) => {
    if (!topics || topics.length === 0) {
      throw new Error('Topics are required');
    }

    if (!level) {
      throw new Error('Level is required');
    }

    if (generatePromiseRef.current) {
      return generatePromiseRef.current;
    }

    try {
      setError(null);
      setLoading(true);
      
      const language = getCurrentLanguage();

      generatePromiseRef.current = evaluationApi.generateCaseEvaluation(
        topics, 
        level, 
        courseContext,
        language,
        courseFilter
      );
      
      const response = await generatePromiseRef.current;
      
      const evaluation = {
        id: Date.now().toString(),
        type: 'case',
        topics,
        level,
        courseContext,
        case: response.case,
        pedagogicalObjectives: response.pedagogical_objectives,
        expectedElements: response.expected_elements_of_response,
        evaluationCriteria: response.evaluation_criteria,
        createdAt: new Date().toISOString(),
      };
      
      setCurrentEvaluation(evaluation);
      storage.setCacheItem(evaluationCacheKey, evaluation, 120);
      
      window.dispatchEvent(new CustomEvent('evaluation:generated', {
        detail: { evaluation }
      }));
      
      return evaluation;
      
    } catch (err) {
      console.error('Failed to generate case evaluation:', err);
      setError(err.message || 'Failed to generate case evaluation');
      throw err;
    } finally {
      setLoading(false);
      generatePromiseRef.current = null;
    }
  }, [getCurrentLanguage]);


  /**
   * Submit evaluation for grading
   * @param {Array<Array<any>>} questions - List of questions (MCQ or Open)
   * @param {Array<string>} responses - User responses to the questions
   * @param {string} course - Course name
   * @param {string} module - Module name
   * @param {Array<string>} topics - List of topics covered
   * @param {string} evaluationType - Type of evaluation (mcq, open, mixed)
   * @returns {Promise<{results: Array<Object>, study_guide: string, final_score: number}>} - Grading results
   */
  const submitEvaluation = useCallback(async (questions, responses, course, module, topics, evaluationType) => {
    if (!questions || questions.length === 0) {
      throw new Error('Questions are required');
    }

    if (!responses || responses.length === 0) {
      throw new Error('Responses are required');
    }

    if (questions.length !== responses.length) {
      throw new Error('Number of questions and responses must match');
    }

    if (!course) {
      throw new Error('Course is required');
    }

    if (!module) {
      throw new Error('Module is required');
    }

    if (!topics || topics.length === 0) {
      throw new Error('Topics are required');
    }

    if (!evaluationType) {
      throw new Error('Evaluation type is required');
    }

    try {
      setError(null);
      setLoading(true);
      
      const language = getCurrentLanguage();
  
      const response = await evaluationApi.submitEvaluation(
        questions,
        responses,
        course,
        module,
        topics,
        evaluationType,
        language
      );

      const gradingResults = response.grading_result;
      // Dispatch event to notify other components about successful submission
      window.dispatchEvent(new CustomEvent('evaluation:submitted', {
        detail: { 
          results: gradingResults,
          timestamp: new Date().toISOString()
        }
      }));

      // Dispatch event to refresh user info
      window.dispatchEvent(new CustomEvent('auth:refresh-user'));
      
      return gradingResults;
      
    } catch (err) {
      console.error('Failed to submit evaluation:', err);
      setError(err.message || 'Failed to submit evaluation for grading');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getCurrentLanguage]);

  /**
   * Submit case evaluation for grading
   * @param {Object} caseData - The original case evaluation data
   * @param {string} userResponse - User's response to the case
   * @param {string} course - Course name
   * @param {string} level - Academic level
   * @param {Array<string>} topics - List of topics covered
   * @param {string} module - Module name
   * @returns {Promise<{score: number, feedback: string, detailed_analysis: Object}>} - Case grading results
   */
  const submitCaseEvaluation = useCallback(async (caseData, userResponse, course, level, topics, module) => {

    if (!caseData) {
      throw new Error('Case data is required');
    }

    if (!userResponse || !userResponse.trim()) {
      throw new Error('User response is required');
    }

    if (!course) {
      throw new Error('Course is required');
    }

    if (!level) {
      throw new Error('Level is required');
    }

    if (!topics || topics.length === 0) {
      throw new Error('Topics are required');
    }

    if (!module) {
      throw new Error('Module is required');
    }

    try {
      setError(null);
      setLoading(true);
      
      const language = getCurrentLanguage();
  
      const gradingResults = await evaluationApi.submitCaseEvaluation(
        caseData,
        userResponse,
        course,
        level,
        topics,
        module,
        language
      );
      
      // Dispatch event to notify other components about successful case submission
      window.dispatchEvent(new CustomEvent('evaluation:case-submitted', {
        detail: { 
          results: gradingResults,
          timestamp: new Date().toISOString()
        }
      }));

      // Dispatch event to refresh user info
      window.dispatchEvent(new CustomEvent('auth:refresh-user'));
      
      return gradingResults;
      
    } catch (err) {
      console.error('Failed to submit case evaluation:', err);
      setError(err.message || 'Failed to submit case evaluation for grading');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getCurrentLanguage]);


  /**
   * Load current evaluation from cache
   */
  const loadCurrentEvaluation = useCallback(() => {
    const cached = storage.getCacheItem(evaluationCacheKey);
    if (cached) {
      setCurrentEvaluation(cached);
      return cached;
    }
    return null;
  }, []);

  /**
   * Clear current evaluation
   */
  const clearCurrentEvaluation = useCallback(() => {
    setCurrentEvaluation(null);
    storage.removeCacheItem(evaluationCacheKey);
    
    window.dispatchEvent(new CustomEvent('evaluation:cleared'));
  }, []);

  /**
   * Validate evaluation parameters
   */
  const validateEvaluationParams = useCallback((type, params) => {
    const { topics, numQuestions, level, mcqWeight, openWeight } = params;
    
    if (!topics || topics.length === 0) {
      return 'Topics are required';
    }
    
    if (type === 'case' && !level) {
      return 'Level is required for case evaluations';
    }
    
    if (type !== 'case' && (!numQuestions || numQuestions < 1)) {
      return 'Number of questions must be at least 1';
    }
    
    if (type === 'mixed') {
      if (mcqWeight < 0 || mcqWeight > 1 || openWeight < 0 || openWeight > 1) {
        return 'Weights must be between 0 and 1';
      }
      
      if (Math.abs((mcqWeight + openWeight) - 1.0) > 0.001) {
        return 'MCQ and Open weights must sum to 1.0';
      }
    }
    
    return null;
  }, []);

  /**
   * Check evaluation service health
   */
  const checkServiceHealth = useCallback(async () => {
    try {
      const response = await evaluationApi.healthCheck();
      return response.status === 'healthy';
    } catch (err) {
      console.error('Health check failed:', err);
      return false;
    }
  }, []);

  return {
    loading,
    error,
    currentEvaluation,
    generateStandardEvaluation,
    generateMixedEvaluation,
    generateCaseEvaluation,
    loadCurrentEvaluation,
    clearCurrentEvaluation,
    validateEvaluationParams,
    checkServiceHealth,
    submitEvaluation,
    submitCaseEvaluation,
    clearError: () => setError(null),
  };
};

export default useEvaluation;