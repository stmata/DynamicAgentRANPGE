import fetchWrapper from './fetchWrapper.js';
import { API_ENDPOINTS } from '../utils/constants.js';

/**
 * Admin API service for courses, modules and topics management
 * Note: Most methods are deprecated in favor of local data transformation
 */
class AdminApi {
  /**
   * Get all courses and modules for a specific program and level
   * This is the ONLY active method - all others are deprecated
   * @param {string} program - Program identifier
   * @param {string} level - Level identifier
   * @returns {Promise<Object>} Raw backend data with modules array
   */
  async getTopicsByProgram(program, level) {
    return fetchWrapper.get(`${API_ENDPOINTS.ADMIN.TOPICS_BY_PROGRAM}/${program}/${level}`);
  }

  /**
   * @deprecated Use local data transformation instead
   * Use useCourses hook with getTopicsForModule(courseName, moduleName)
   * 
   * Get all topics for a specific module and course
   * This method makes redundant API calls when data is already cached locally.
   * The hierarchical cache structure provides instant access to module topics.
   * 
   * Migration guide:
   * - Replace: adminApi.getTopicsByModule(course, module)
   * - With: const { getTopicsForModule } = useCourses(); getTopicsForModule(course, module)
   * 
   * @param {string} course - Course name
   * @param {string} module - Module name
   * @returns {Promise<Object>} Module topics data
   */
  async getTopicsByModule(course, module) {
    console.warn('getTopicsByModule is deprecated. Use useCourses hook getTopicsForModule() instead.');
    return fetchWrapper.get(`${API_ENDPOINTS.ADMIN.TOPICS_BY_MODULE}/${course}/${module}`);
  }

  /**
   * @deprecated Use local data transformation instead
   * Use useCourses hook with getModulesForCourse(courseName)
   * 
   * Get all topics for all modules in a specific course
   * This method makes redundant API calls when data is already cached locally.
   * The hierarchical cache structure provides instant access to course modules.
   * 
   * Migration guide:
   * - Replace: adminApi.getTopicsByCourse(course)
   * - With: const { getModulesForCourse } = useCourses(); getModulesForCourse(course)
   * 
   * @param {string} course - Course name
   * @returns {Promise<Object>} Course topics data
   */
  async getTopicsByCourse(course) {
    console.warn('getTopicsByCourse is deprecated. Use useCourses hook getModulesForCourse() instead.');
    return fetchWrapper.get(`${API_ENDPOINTS.ADMIN.TOPICS_BY_COURSE}/${course}`);
  }

  /**
   * @deprecated Use local data transformation instead
   * Use useCourses hook with getAllCourses()
   * 
   * Get all topics for all modules
   * This method makes redundant API calls when data is already cached locally.
   * The hierarchical cache structure provides instant access to all courses data.
   * 
   * Migration guide:
   * - Replace: adminApi.getAllTopics()
   * - With: const { getAllCourses } = useCourses(); getAllCourses()
   * 
   * @returns {Promise<Object>} All topics data
   */
  async getAllTopics() {
    console.warn('getAllTopics is deprecated. Use useCourses hook getAllCourses() instead.');
    return fetchWrapper.get(API_ENDPOINTS.ADMIN.ALL_TOPICS);
  }

  /**
   * @deprecated Use local data transformation instead
   * Use useCourses hook with getTopicsForModule(courseName, moduleName)
   * 
   * Search topics using POST request
   * This method makes redundant API calls when data is already cached locally.
   * The hierarchical cache structure provides instant search capabilities.
   * 
   * Migration guide:
   * - Replace: adminApi.searchTopics(course, module)
   * - With: const { getTopicsForModule } = useCourses(); getTopicsForModule(course, module)
   * - For search functionality, use helpers: searchTopics(courses, searchTerm)
   * 
   * @param {string} course - Course name
   * @param {string} module - Module name
   * @returns {Promise<Object>} Search results
   */
  async searchTopics(course, module) {
    console.warn('searchTopics is deprecated. Use useCourses hook getTopicsForModule() or helpers searchTopics() instead.');
    return fetchWrapper.post(API_ENDPOINTS.ADMIN.SEARCH_TOPICS, { course, module });
  }
}

export default new AdminApi();