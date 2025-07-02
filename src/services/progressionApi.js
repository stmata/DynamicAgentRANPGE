import fetchWrapper from './fetchWrapper.js';

/**
 * Progression API service for managing course progression data retrieval
 * Integrates with backend users endpoints for progression data
 */
class ProgressionApi {
  /**
   * Get all courses with user progression status
   * @returns {Promise<Object>} Object with courses and activation status
   */
  async getCoursesWithProgress() {
    return fetchWrapper.get('/users/courses-with-progress');
  }

  /**
   * Get only user progression data without course information
   * @returns {Promise<Object>} User progression data
   */
  async getProgressionOnly() {
    return fetchWrapper.get('/users/progression-only');
  }
}

export default new ProgressionApi(); 