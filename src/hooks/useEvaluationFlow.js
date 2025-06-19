import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useEvaluation } from './useEvaluation';
import { EVALUATION_CONFIG } from '../utils/constants';

const EVALUATION_STATES = {
  WELCOME: 'welcome',
  LOADING_EVALUATION: 'loading_evaluation',
  EVALUATION_ACTIVE: 'evaluation_active',
  LOADING_CORRECTION: 'loading_correction',
  COMPLETED: 'completed'
};

/**
 * Custom hook for managing evaluation flow and state
 * @param {string} moduleId - Module identifier
 * @param {string} courseTitle - Course title
 * @returns {Object} Evaluation state and handlers
 */
export const useEvaluationFlow = (moduleId, courseTitle) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [evaluationState, setEvaluationState] = useState(EVALUATION_STATES.WELCOME);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [currentEvaluationData, setCurrentEvaluationData] = useState(null);
  
  const { getTopicsForModule, user } = useAuth();
  const { 
    generateCaseEvaluation, 
    submitCaseEvaluation,
    loading: evaluationLoading, 
    error: evaluationError 
  } = useEvaluation();

  /**
   * Format evaluation content according to the API structure
   * @param {Object} evaluation - Evaluation data from API
   * @returns {string} Formatted content for display
   */
  const formatEvaluationContent = (evaluation) => {
    const { case: caseData, pedagogical_objectives } = evaluation;
    
    let content = `**${caseData.title}**\n\n`;
    
    content += `**${t('evaluation.case.labels.description')}:**\n${caseData.description}\n\n`;
    
    content += `**${t('evaluation.case.labels.instructions')}:**\n${caseData.instructions}\n\n`;
    
    if (pedagogical_objectives && pedagogical_objectives.length > 0) {
      content += `**${t('evaluation.case.labels.pedagogicalObjectives')}:**\n`;
      pedagogical_objectives.forEach((objective, index) => {
        content += `${index + 1}. ${objective}\n`;
      });
    }
    
    return content;
  };

  /**
   * Determine academic level based on course name
   * @param {string} courseName - Name of the course
   * @returns {string} Academic level
   */
  // eslint-disable-next-line no-unused-vars
  const determineLevelFromCourse = (courseName) => {
     // eslint-disable-next-line no-unused-vars
    const courseMapping = {
      'Marketing': 'Bachelor 2',
      'Economie': 'Bachelor 3',
      'Management': 'Master 1',
      'Strategy': 'Master 2'
    };
    
    //return courseMapping[courseName] || EVALUATION_CONFIG.LEVELS[1];
    return 'Licence 3';
  };

  /**
   * Start the evaluation process by fetching evaluation data from API
   */
  const startEvaluation = async () => {
    if (!moduleId || !courseTitle) {
      console.error('Module ID and Course Title are required');
      return;
    }

    setEvaluationState(EVALUATION_STATES.LOADING_EVALUATION);
    
    try {
      const topics = getTopicsForModule(courseTitle, moduleId);
      
      if (!topics || topics.length === 0) {
        throw new Error('No topics found for this module');
      }

      const level = determineLevelFromCourse(courseTitle);
      
      const evaluation = await generateCaseEvaluation(
        topics, 
        level, 
        courseTitle
      );
      
      // Store the complete evaluation data for later use in correction
      setCurrentEvaluationData({
        case: evaluation.case,
        pedagogical_objectives: evaluation.pedagogicalObjectives,
        expected_elements_of_response: evaluation.expectedElements,
        evaluation_criteria: evaluation.evaluationCriteria,
        topics,
        level,
        course: courseTitle
      });
      
      const evaluationMessage = {
        type: 'bot',
        content: formatEvaluationContent(evaluation)
      };
      
      setMessages([evaluationMessage]);
      setEvaluationState(EVALUATION_STATES.EVALUATION_ACTIVE);
      
    } catch (error) {
      console.error('Error loading evaluation:', error);
      
      const errorMessage = {
        type: 'bot',
        content: `❌ **${t('common.error')}**\n\n${error.message || t('error.unknownError')}\n\n${t('error.evaluationFailed')}`
      };
      
      setMessages([errorMessage]);
      setEvaluationState(EVALUATION_STATES.WELCOME);
    }
  };

  /**
   * Handle submission of evaluation response
   * @param {string} response - User's response to the evaluation
   */
  const submitEvaluationResponse = async (response) => {
    if (!response.trim()) return;

    const userMessage = { type: 'user', content: response };
    setMessages(prev => [...prev, userMessage]);
    setIsInputDisabled(true);
    setEvaluationState(EVALUATION_STATES.LOADING_CORRECTION);

    try {
      if (!currentEvaluationData) {
        throw new Error('No evaluation data available for correction');
      }

      if (!user?.id) {
        throw new Error('User session not found');
      }

      // Submit to API for correction
      const correctionResult = await submitCaseEvaluation(
        currentEvaluationData,
        response,
        currentEvaluationData.course,
        currentEvaluationData.level,
        currentEvaluationData.topics,
        moduleId
      );
      
      // Extract grading data from the response structure
      const gradingData = correctionResult.grading_result;
      
      // Format correction content
      let correctionContent = `**${t('evaluation.case.correction.title')}**\n\n`;
      correctionContent += `**${t('evaluation.case.correction.score')}:** ${gradingData.score}/100\n\n`;
      correctionContent += `**${t('evaluation.case.correction.feedback')}:**\n${gradingData.feedback}\n\n`;
      
      if (gradingData.detailed_analysis) {
        if (gradingData.detailed_analysis.strengths && gradingData.detailed_analysis.strengths.length > 0) {
          correctionContent += `**Points forts:**\n`;
          gradingData.detailed_analysis.strengths.forEach((strength) => {
            correctionContent += `✅ ${strength}\n`;
          });
          correctionContent += `\n`;
        }
        
        if (gradingData.detailed_analysis.improvements && gradingData.detailed_analysis.improvements.length > 0) {
          correctionContent += `**Points d'amélioration:**\n`;
          gradingData.detailed_analysis.improvements.forEach((improvement) => {
            correctionContent += `📈 ${improvement}\n`;
          });
        }
      }
      
      const correctionMessage = {
        type: 'bot',
        content: correctionContent
      };
      
      setMessages(prev => [...prev, correctionMessage]);
      setEvaluationState(EVALUATION_STATES.COMPLETED);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev, 
        { 
          type: 'bot', 
          content: `❌ **${t('common.error')}**\n\n${error.message || t('error.unknownError')}\n\n${t('error.correctionFailed')}` 
        }
      ]);
      setEvaluationState(EVALUATION_STATES.EVALUATION_ACTIVE);
      setIsInputDisabled(false);
    }
  };

  return {
    messages,
    evaluationState,
    isInputDisabled,
    evaluationLoading,
    evaluationError,
    startEvaluation,
    submitEvaluationResponse,
    EVALUATION_STATES
  };
}; 