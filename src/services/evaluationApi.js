import fetchWrapper from './fetchWrapper.js';
import { API_ENDPOINTS, API_CONFIG } from '../utils/constants.js';

/**
 * Evaluation API service for different types of assessments
 */
class EvaluationApi {
  /**
   * Generate standard evaluation (MCQ or Open questions)
   */
  async generateStandardEvaluation(evalType, topics, numQuestions, courseFilter = null) {
    return fetchWrapper.post(API_ENDPOINTS.EVALUATION.STANDARD, {
      eval_type: evalType,
      topics,
      num_questions: numQuestions,
      course_filter: courseFilter
    });
  }

  /**
   * Generate mixed evaluation (both MCQ and Open questions)
   */
  async generateMixedEvaluation(topics, numQuestions, mcqWeight, openWeight, language = 'French', isPositioning = false, modulesTopics = null, courseFilter = null) {
    const payload = {
      topics,
      num_questions: numQuestions,
      mcq_weight: mcqWeight,
      open_weight: openWeight,
      language,
      course_filter: courseFilter
    };
  
    if (isPositioning) {
      payload.is_positioning = true;
      payload.modules_topics = modulesTopics;
    }
    return fetchWrapper.post(API_ENDPOINTS.EVALUATION.MIXED, payload);
  }

  /**
   * Generate practical business case evaluation
   */
  async generateCaseEvaluation(topics, level, courseContext = null, language = 'French', courseFilter = null) {
    return fetchWrapper.post(API_ENDPOINTS.EVALUATION.CASE, {
      topics,
      level,
      course_context: courseContext,
      language,
      course_filter: courseFilter
    });
  }

 /**
   * Submit evaluation for grading and save score
   * @param {Array<Array<any>>} questions - List of questions (MCQ or Open)
   * @param {Array<string>} responses - User responses to the questions
   * @param {string} course - Course name
   * @param {string} module - Module name
   * @param {Array<string>} topics - List of topics covered
   * @param {string} evaluationType - Type of evaluation (mcq, open, mixed)
   * @returns {Promise<{grading_result: Object, score_saved: boolean, final_score: number, user_updated: boolean}>} - Complete response with grading results
   */
async submitEvaluation(questions, responses, course, module, topics, evaluationType, language = 'French') {
  return fetchWrapper.post(API_ENDPOINTS.EVALUATION.SUBMIT_MCQ_OPEN, {
    questions: questions,
    responses: responses,
    topics: topics,
    course: course,
    module: module,
    evaluation_type: evaluationType,
    language: language
  });
}

  /**
   * Submit case evaluation for grading and save score
   * @param {Object} caseData - The original case evaluation data
   * @param {string} userResponse - User's response to the case
   * @param {string} course - Course name
   * @param {string} level - Academic level
   * @param {Array<string>} topics - List of topics covered
   * @param {string} module - Module name
   * @returns {Promise<{score: number, feedback: string, detailed_analysis: Object}>} - Case grading results
   */
  async submitCaseEvaluation(caseData, userResponse, course, level, topics, module, language = 'French') {
    return fetchWrapper.post(API_ENDPOINTS.EVALUATION.SUBMIT_CASE, {
      case_data: caseData,
      user_response: userResponse,
      course: course,
      level: level,
      topics: topics,
      module: module,
      language: language
    });
  }

  /**
   * Health check for evaluation service
   */
  async healthCheck() {
    return fetchWrapper.get(API_ENDPOINTS.EVALUATION.HEALTH);
  }
}

export default new EvaluationApi();