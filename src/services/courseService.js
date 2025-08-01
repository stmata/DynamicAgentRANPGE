import i18n from "../i18n";
/**
 * Course service for handling course-related operations
 * Note: Most functions are deprecated in favor of local cache data access
 */

/**
 * Transform DB course data to card format with progression status
 * @param {Object} courseData - Course data from API with progression status
 * @returns {Object} Formatted course card object
 */
export const transformApiCourseToCard = (courseData) => {
  return {
    id: `api_${courseData.course_name.toLowerCase().replace(/\s+/g, '_')}`,
    title: {
      en: courseData.course_name,
      fr: courseData.course_name
    },
    shortDescription: {
      en: `Learn ${courseData.course_name} fundamentals and advanced concepts.`,
      fr: `Apprenez les fondamentaux et concepts avancés de ${courseData.course_name}.`,
      "pt-BR": `Aprenda os fundamentos e conceitos avançados de ${courseData.course_name}.`
    },
    fullDescription: {
      en: `Complete course covering all aspects of ${courseData.course_name}. Master the essential skills and knowledge needed in this field.`,
      fr: `Cours complet couvrant tous les aspects de ${courseData.course_name}. Maîtrisez les compétences et connaissances essentielles dans ce domaine.`,
      "pt-BR": `Curso completo cobrindo todos os aspectos de ${courseData.course_name}. Domine as habilidades e conhecimentos essenciais nesta área.`
    },
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop",
    modules: courseData.total_modules || 0,
    isActive: courseData.is_active || false,
    placement_test_status: courseData.placement_test_status || "not_attempted",
    placement_test_score: courseData.placement_test_score || null,
    unlocked_modules: courseData.unlocked_modules || 0,
    completed_modules: courseData.completed_modules || 0,
    overall_progress: courseData.overall_progress || 0.0,
    modules_status: courseData.modules_status || {}
  };
};

/**
 * Create the positioning assessment card
 * @returns {Object} Positioning card object
 */
export const createPositionnementCard = () => {
  return {
    id: 'positionnement',
    title: { en: 'Positionnement', fr: 'Positionnement' },
    shortDescription: { 
      en: 'Assess your current level to get started.',
      fr: 'Évaluez votre niveau pour commencer.',
      'pt-BR': 'Avalie seu nível atual para começar.'
    },
    fullDescription: { 
      en: "This initial assessment helps identify your current skills to tailor the learning path to your needs. It's the first step to ensure personalized and effective progress.",
      fr: "Cette évaluation initiale permet d'identifier vos compétences actuelles afin d'adapter le parcours d'apprentissage à vos besoins. C'est une étape clé pour progresser efficacement.",
      'pt-BR': "Esta avaliação inicial ajuda a identificar suas habilidades atuais para personalizar o caminho de aprendizagem conforme suas necessidades. É o primeiro passo para garantir um progresso eficaz e personalizado."
    },
    isActive: true,
    modules: i18n.t('courseModules.all')
  };
};

/**
 * @deprecated Use AuthContext getAllCourses() instead
 * Legacy function - kept for backward compatibility
 * Use useCourses hook or AuthContext to access courses data locally
 * 
 * Migration guide:
 * - Replace: getAllCourses()
 * - With: const { getAllCourses } = useAuth(); getAllCourses()
 * 
 * @returns {Array} Empty array (data should come from local cache)
 */
export const getAllCourses = async () => {
  console.warn('getAllCourses is deprecated. Use AuthContext getAllCourses() method instead.');
  return [];
};

/**
 * @deprecated Use AuthContext course getters instead
 * Legacy function - kept for backward compatibility
 * Use useCourses hook methods to access module details locally
 * 
 * Migration guide:
 * - Replace: getCourseDetails(courseTitle, userId)
 * - With: const { getModulesForCourse, getTopicsCountForModule } = useAuth();
 *         const modules = getModulesForCourse(courseTitle);
 * 
 * @param {string} courseTitle - Course title
 * @param {string} userId - User ID (unused in new implementation)
 * @returns {Object} Empty object (data should come from local cache)
 */
// eslint-disable-next-line no-unused-vars
export const getCourseDetails = async (courseTitle, userId) => {
  console.warn('getCourseDetails is deprecated. Use AuthContext course getter methods instead.');
  return {};
};

/**
 * @deprecated Use AuthContext getTopicsForModule() instead
 * Legacy function - kept for backward compatibility
 * Use useCourses hook to access module data locally
 * 
 * Migration guide:
 * - Replace: getModuleData(courseId, moduleId)
 * - With: const { getTopicsForModule, getTopicsCountForModule } = useAuth();
 *         const topics = getTopicsForModule(courseId, moduleId);
 * 
 * @param {string} courseId - Course ID
 * @param {string} moduleId - Module ID
 * @returns {Object} Fallback object with default values
 */
// eslint-disable-next-line no-unused-vars
export const getModuleData = async (courseId, moduleId) => {
  console.warn('getModuleData is deprecated. Use AuthContext getTopicsForModule() method instead.');
  return { displayTitle: "Module Not Found", topics: [] };
};