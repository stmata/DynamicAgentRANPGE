/**
 * Course service for handling course-related operations
 * Note: Most functions are deprecated in favor of local cache data access
 */

/**
 * Get static disabled courses for display purposes
 * These courses are shown as "coming soon" while not available in the database
 * @returns {Array} List of static course objects
 */
export const getStaticCourses = () => {
  return [
    {
      id: 1,
      title: {
        fr: "Géopolitique",
        en: "Geopolitics"
      },
      shortDescription: {
        fr: "Analysez les relations internationales à travers le prisme géographique.",
        en: "Analyze international relations through a geographical lens."
      },
      fullDescription: {
        fr: "La géopolitique étudie l'influence des facteurs géographiques sur les relations internationales et le pouvoir politique. Ce cours explore l'impact des ressources naturelles, des localisations stratégiques et des dynamiques démographiques sur les conflits, les alliances et les décisions politiques mondiales.",
        en: "Geopolitics examines the influence of geographic factors on international relations and political power. It explores how geographical considerations affect political decisions, conflicts, and alliances. Students will learn about the strategic importance of locations, natural resources, and demographic trends in shaping global politics."
      },
      image: "https://images.unsplash.com/photo-1536305030015-84c1f1b6dd57?w=600&h=300&fit=crop",
      modules: 9,
      isActive: false
    },
    {
      id: 2,
      title: {
        fr: "Statistiques & Mathématiques",
        en: "Stats & Maths"
      },
      shortDescription: {
        fr: "Appliquez les outils mathématiques aux problèmes concrets.",
        en: "Apply mathematical tools to real-world problems."
      },
      fullDescription: {
        fr: "Ce cours traite de l'application des techniques statistiques et mathématiques pour résoudre des problèmes concrets. Il couvre les probabilités, l'analyse de données, les statistiques inférentielles et la modélisation mathématique. Les étudiants apprendront à interpréter les données et à faire des prédictions basées sur des modèles rigoureux.",
        en: "This course focuses on the application of statistical and mathematical techniques to solve real-world problems. It covers probability, data analysis, inferential statistics, and mathematical modeling. Students will learn to collect, analyze, and interpret data, as well as apply mathematical methods to analyze trends and make predictions."
      },
      image: "https://images.unsplash.com/photo-1535909339361-9dc3d0b9f4d5?w=600&h=300&fit=crop",
      modules: 13,
      isActive: false
    }
  ];
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
      fr: 'Évaluez votre niveau pour commencer.'
    },
    fullDescription: { 
      en: "This initial assessment helps identify your current skills to tailor the learning path to your needs. It's the first step to ensure personalized and effective progress.",
      fr: "Cette évaluation initiale permet d'identifier vos compétences actuelles afin d'adapter le parcours d'apprentissage à vos besoins. C'est une étape clé pour progresser efficacement."
    },
    isActive: true,
    modules: "Tous les"
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