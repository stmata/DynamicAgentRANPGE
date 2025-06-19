import { useState, useEffect, useCallback, useRef } from 'react';
import adminApi from '../services/adminApi.js';
import storage from '../services/storage.js';
import { DEFAULT_PROGRAM } from '../utils/constants.js';

/**
 * Courses management hook with hierarchical cache, data transformation and selection state
 */
export const useCourses = (isAuthenticated = false) => {
  const [coursesData, setCoursesData] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchPromiseRef = useRef(null);
  const cacheTTL = 240;

  /**
   * Transform backend data to hierarchical frontend structure
   * @param {Object} backendData - Raw data from API
   * @returns {Object} Hierarchical courses structure
   */
  const transformCoursesData = useCallback((backendData) => {
    const transformedCourses = {};
    
    if (backendData?.modules) {
      backendData.modules.forEach(moduleData => {
        const { course, module, topics, last_updated, program, level } = moduleData;
        
        if (!transformedCourses[course]) {
          transformedCourses[course] = {
            totalModules: 0,
            modules: {}
          };
        }
        
        transformedCourses[course].modules[module] = {
          topics: topics || [],
          topicsCount: (topics || []).length,
          lastUpdated: last_updated,
          program,
          level,
        };
        
        transformedCourses[course].totalModules += 1;
      });
    }
    
    return { courses: transformedCourses };
  }, []);

  /**
   * Load courses from cache or API with cache-first approach
   * @param {boolean} forceRefresh - Force API call even if cache exists
   * @returns {Promise<Object>} Transformed courses data
   */
  const loadCourses = useCallback(async (forceRefresh = false) => {
    if (!isAuthenticated) {
      return;
    }

    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    try {
      setError(null);
      
      if (!forceRefresh) {
        const cachedData = storage.getCoursesHierarchical();
        if (cachedData && Object.keys(cachedData.courses || {}).length > 0) {
          setCoursesData(cachedData);
          return cachedData;
        }
      }
      
      setLoading(true);
      
      fetchPromiseRef.current = adminApi.getTopicsByProgram(DEFAULT_PROGRAM.PROGRAM, DEFAULT_PROGRAM.LEVEL);
      const response = await fetchPromiseRef.current;
      
      const transformedData = transformCoursesData(response);
      
      setCoursesData(transformedData);
      storage.setCoursesHierarchical(transformedData, cacheTTL);
      
      window.dispatchEvent(new CustomEvent('courses:loaded', { 
        detail: transformedData 
      }));
      
      return transformedData;
      
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError(err.message || 'Failed to load courses');
      throw err;
    } finally {
      setLoading(false);
      fetchPromiseRef.current = null;
    }
  }, [isAuthenticated, transformCoursesData]);

  /**
   * Refresh courses data
   * @returns {Promise<Object>} Fresh courses data
   */
  const refreshCourses = useCallback(async () => {
    return loadCourses(true);
  }, [loadCourses]);

  /**
   * Get all available courses
   * @returns {Object} All courses with their modules
   */
  const getAllCourses = useCallback(() => {
    return coursesData.courses || {};
  }, [coursesData]);

  /**
   * Get modules for a specific course
   * @param {string} courseName - Name of the course
   * @returns {Object} Modules object or empty object if course not found
   */
  const getModulesForCourse = useCallback((courseName) => {
    const courses = getAllCourses();
    return courses[courseName]?.modules || {};
  }, [getAllCourses]);

  /**
   * Get topics for a specific module in a course
   * @param {string} courseName - Name of the course
   * @param {string} moduleName - Name of the module
   * @returns {Array} Array of topics or empty array if not found
   */
  const getTopicsForModule = useCallback((courseName, moduleName) => {
    const modules = getModulesForCourse(courseName);
    return modules[moduleName]?.topics || [];
  }, [getModulesForCourse]);

  /**
   * Get topics count for a specific module
   * @param {string} courseName - Name of the course
   * @param {string} moduleName - Name of the module
   * @returns {number} Number of topics in the module
   */
  const getTopicsCountForModule = useCallback((courseName, moduleName) => {
    const modules = getModulesForCourse(courseName);
    return modules[moduleName]?.topicsCount || 0;
  }, [getModulesForCourse]);

  /**
   * Check if a course exists
   * @param {string} courseName - Name of the course
   * @returns {boolean} True if course exists
   */
  const courseExists = useCallback((courseName) => {
    const courses = getAllCourses();
    return courseName in courses;
  }, [getAllCourses]);

  /**
   * Check if a module exists in a course
   * @param {string} courseName - Name of the course
   * @param {string} moduleName - Name of the module
   * @returns {boolean} True if module exists in the course
   */
  const moduleExists = useCallback((courseName, moduleName) => {
    const modules = getModulesForCourse(courseName);
    return moduleName in modules;
  }, [getModulesForCourse]);

  /**
   * Select a course and clear module selection
   * @param {string} courseId - Course identifier
   */
  const selectCourse = useCallback((courseId) => {
    setSelectedCourse(courseId);
    setSelectedModule(null);
    setSelectedTopics([]);
    
    storage.setSessionItem('selected_course', courseId);
    storage.removeSessionItem('selected_module');
    storage.removeSessionItem('selected_topics');
    
    window.dispatchEvent(new CustomEvent('courses:course-selected', {
      detail: { courseId }
    }));
  }, []);

  /**
   * Select a module within a course
   * @param {string} moduleId - Module identifier
   */
  const selectModule = useCallback((moduleId) => {
    const courses = getAllCourses();
    let targetCourse = null;
    let moduleData = null;

    Object.keys(courses).forEach(courseName => {
      if (courses[courseName].modules[moduleId]) {
        targetCourse = courseName;
        moduleData = courses[courseName].modules[moduleId];
      }
    });
    
    if (targetCourse && moduleData) {
      if (targetCourse !== selectedCourse) {
        setSelectedCourse(targetCourse);
        storage.setSessionItem('selected_course', targetCourse);
      }
      
      setSelectedModule(moduleId);
      setSelectedTopics(moduleData.topics || []);
      
      storage.setSessionItem('selected_module', moduleId);
      storage.setSessionItem('selected_topics', moduleData.topics || []);
      
      window.dispatchEvent(new CustomEvent('courses:module-selected', {
        detail: { moduleId, courseId: targetCourse }
      }));
    }
  }, [getAllCourses, selectedCourse]);

  /**
   * Update selected topics
   * @param {Array} topics - Array of topic strings
   */
  const updateSelectedTopics = useCallback((topics) => {
    setSelectedTopics(topics);
    storage.setSessionItem('selected_topics', topics);
    
    window.dispatchEvent(new CustomEvent('courses:topics-updated', {
      detail: { topics }
    }));
  }, []);

  /**
   * Clear all selections
   */
  const clearSelections = useCallback(() => {
    setSelectedCourse(null);
    setSelectedModule(null);
    setSelectedTopics([]);
    
    storage.removeSessionItem('selected_course');
    storage.removeSessionItem('selected_module');
    storage.removeSessionItem('selected_topics');
  }, []);

  /**
   * Get available topics for current selection
   * @returns {Array} Array of available topics
   */
  const getAvailableTopics = useCallback(() => {
    if (selectedModule && selectedCourse) {
      return getTopicsForModule(selectedCourse, selectedModule);
    }
    
    if (selectedCourse) {
      const modules = getModulesForCourse(selectedCourse);
      const allTopics = [];
      Object.values(modules).forEach(module => {
        if (module.topics) {
          allTopics.push(...module.topics);
        }
      });
      return [...new Set(allTopics)];
    }
    
    return [];
  }, [selectedCourse, selectedModule, getTopicsForModule, getModulesForCourse]);

  /**
   * Get course statistics
   * @returns {Object} Statistics about courses, modules and topics
   */
  const getCourseStats = useCallback(() => {
    const courses = getAllCourses();
    const totalCourses = Object.keys(courses).length;
    
    let totalModules = 0;
    const allTopics = new Set();
    
    Object.values(courses).forEach(course => {
      totalModules += course.totalModules || 0;
      Object.values(course.modules || {}).forEach(module => {
        if (module.topics) {
          module.topics.forEach(topic => allTopics.add(topic));
        }
      });
    });
    
    return {
      totalCourses,
      totalModules,
      totalTopics: allTopics.size,
    };
  }, [getAllCourses]);

  /**
   * Restore selection state from storage
   */
  // eslint-disable-next-line no-unused-vars
  const restoreSelectionState = useCallback(() => {
    const storedCourse = storage.getSessionItem('selected_course');
    const storedModule = storage.getSessionItem('selected_module');
    const storedTopics = storage.getSessionItem('selected_topics');
    
    if (storedCourse && courseExists(storedCourse)) {
      setSelectedCourse(storedCourse);
    }
    
    if (storedModule && storedCourse && moduleExists(storedCourse, storedModule)) {
      setSelectedModule(storedModule);
      
      if (storedTopics && Array.isArray(storedTopics)) {
        setSelectedTopics(storedTopics);
      }
    }
  }, [courseExists, moduleExists]);

  /**
   * Legacy support: get courses in old format for backward compatibility
   * @returns {Object} Courses in legacy format
   */
  const courses = useCallback(() => {
    const hierarchicalCourses = getAllCourses();
    const legacyCourses = {};
    
    Object.keys(hierarchicalCourses).forEach(courseName => {
      const course = hierarchicalCourses[courseName];
      legacyCourses[courseName] = {
        modules: Object.keys(course.modules || {}),
        totalModules: course.totalModules || 0,
      };
    });
    
    return legacyCourses;
  }, [getAllCourses]);

  /**
   * Legacy support: get module details in old format
   * @returns {Object} Module details in legacy format
   */
  const moduleDetails = useCallback(() => {
    const hierarchicalCourses = getAllCourses();
    const legacyModuleDetails = {};
    
    Object.keys(hierarchicalCourses).forEach(courseName => {
      const course = hierarchicalCourses[courseName];
      Object.keys(course.modules || {}).forEach(moduleName => {
        const module = course.modules[moduleName];
        legacyModuleDetails[moduleName] = {
          course: courseName,
          topics: module.topics || [],
          lastUpdated: module.lastUpdated,
          program: module.program,
          level: module.level,
        };
      });
    });
    
    return legacyModuleDetails;
  }, [getAllCourses]);

  /**
 * Initialize courses when authenticated
 * Fixed: Remove unstable dependencies
 */
  useEffect(() => {
    if (isAuthenticated) {
      loadCourses();
    } else {
      setCoursesData({});
      setSelectedCourse(null);
      setSelectedModule(null);
      setSelectedTopics([]);
    }
  }, [isAuthenticated, loadCourses]);

  /**
 * Restore selection state when courses data is available
 * Fixed: Use coursesData directly instead of getAllCourses
 */
  useEffect(() => {
    const courses = coursesData.courses || {};
  if (Object.keys(courses).length > 0) {
    const storedCourse = storage.getSessionItem('selected_course');
    const storedModule = storage.getSessionItem('selected_module');
    const storedTopics = storage.getSessionItem('selected_topics');
    
    if (storedCourse && courses[storedCourse]) {
      setSelectedCourse(storedCourse);
    }
    
    if (storedModule && storedCourse && courses[storedCourse]?.modules[storedModule]) {
      setSelectedModule(storedModule);
      
      if (storedTopics && Array.isArray(storedTopics)) {
        setSelectedTopics(storedTopics);
      }
    }
  }
  }, [coursesData]);

  /**
   * Setup event listeners for tab synchronization
   * Fixed: Remove unstable dependencies from dependency array
   */
  useEffect(() => {
    const handleCoursesLoaded = (event) => {
      if (event.detail) {
        setCoursesData(event.detail);
      }
    };
  
    const handleCourseSelected = (event) => {
      if (event.detail?.courseId !== selectedCourse) {
        setSelectedCourse(event.detail.courseId);
        setSelectedModule(null);
        setSelectedTopics([]);
      }
    };
  
    const handleModuleSelected = (event) => {
      if (event.detail?.moduleId !== selectedModule) {
        setSelectedModule(event.detail.moduleId);
        setSelectedCourse(event.detail.courseId);
        
        const courses = coursesData.courses || {};
        const topics = courses[event.detail.courseId]?.modules[event.detail.moduleId]?.topics || [];
        setSelectedTopics(topics);
      }
    };

    const handleAuthLogout = () => {
      setCoursesData({});
      setSelectedCourse(null);
      setSelectedModule(null);
      setSelectedTopics([]);
    };

    window.addEventListener('courses:loaded', handleCoursesLoaded);
    window.addEventListener('courses:course-selected', handleCourseSelected);
    window.addEventListener('courses:module-selected', handleModuleSelected);
    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('courses:loaded', handleCoursesLoaded);
      window.removeEventListener('courses:course-selected', handleCourseSelected);
      window.removeEventListener('courses:module-selected', handleModuleSelected);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [selectedCourse, selectedModule, coursesData]);

  return {
    courses: courses(),
    moduleDetails: moduleDetails(),
    coursesData,
    selectedCourse,
    selectedModule,
    selectedTopics,
    loading,
    error,
    loadCourses,
    refreshCourses,
    selectCourse,
    selectModule,
    updateSelectedTopics,
    clearSelections,
    getAvailableTopics,
    getCourseStats,
    getAllCourses,
    getModulesForCourse,
    getTopicsForModule,
    getTopicsCountForModule,
    courseExists,
    moduleExists,
    clearError: () => setError(null),
  };
};

export default useCourses;