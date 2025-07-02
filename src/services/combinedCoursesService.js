//import storage from './storage.js';

/**
 * Combined courses service that merges course data with user progression
 * Uses ONLY data from /api/auth/me - NO additional API calls
 */
class CombinedCoursesService {
  /**
   * Get courses with user progression status
   * @param {string} userId - User ID
   * @param {Object} allCourses - All courses from useCourses hook
   * @param {Object} userCourseProgress - User course progress from auth context
   * @returns {Array} Array of courses with isActive status and progression data
   */
  async getCoursesWithProgression(userId, allCourses = {}, userCourseProgress = {}) {
    try {
      return this.transformCoursesToCards(allCourses, userCourseProgress);
      
    } catch (error) {
      console.error('Error in getCoursesWithProgression:', error);
      return this.transformCoursesToCards(allCourses, {});
    }
  }

  /**
   * Transform courses from cache to course cards with progression data
   * @param {Object} allCourses - Courses from cache (useCourses format)
   * @param {Object} userProgression - User progression data from auth context
   * @returns {Array} Array of course card objects
   */
  transformCoursesToCards(allCourses, userProgression) {
    const courseCards = [];
    
    Object.keys(allCourses).forEach(courseName => {
      const courseData = allCourses[courseName];
      const userCourseProgress = userProgression[courseName] || {};
      
      // Course is active ONLY if placement test attempted
      const placementStatus = userCourseProgress.positionnement_test?.status;
      const isActive = placementStatus && placementStatus !== 'not_attempted';
      
      const courseCard = {
        id: `api_${courseName.toLowerCase().replace(/\s+/g, '_')}`,
        title: {
          en: courseName,
          fr: courseName
        },
        shortDescription: {
          en: `Learn ${courseName} fundamentals and advanced concepts.`,
          fr: `Apprenez les fondamentaux et concepts avancés de ${courseName}.`
        },
        fullDescription: {
          en: `Complete course covering all aspects of ${courseName}. Master the essential skills and knowledge needed in this field.`,
          fr: `Cours complet couvrant tous les aspects de ${courseName}. Maîtrisez les compétences et connaissances essentielles dans ce domaine.`
        },
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop",
        modules: courseData.totalModules || 0,
        isActive: isActive,
        placement_test_status: userCourseProgress.positionnement_test?.status || "not_attempted",
        placement_test_score: userCourseProgress.positionnement_test?.score || null,
        unlocked_modules: userCourseProgress.unlocked_modules || 0,
        completed_modules: userCourseProgress.completed_modules || 0,
        overall_progress: userCourseProgress.overall_progress || 0.0,
        modules_status: userCourseProgress.modules_status || {}
      };
      
      courseCards.push(courseCard);
    });
    
    return courseCards;
  }

  /**
   * Get all courses including both active and inactive ones
   * Used for course selection dialog where all courses should be clickable
   * @param {string} userId - User ID
   * @param {Object} allCourses - All courses from useCourses hook
   * @param {Object} userCourseProgress - User course progress from auth context
   * @returns {Array} Array of all courses regardless of active status
   */
  async getAllCoursesForSelection(userId, allCourses = {}, userCourseProgress = {}) {
    try {
      const coursesWithProgression = await this.getCoursesWithProgression(userId, allCourses, userCourseProgress);
      return coursesWithProgression;
      
    } catch (error) {
      console.error('Error in getAllCoursesForSelection:', error);
      return this.transformCoursesToCards(allCourses, {});
    }
  }
}

export default new CombinedCoursesService(); 