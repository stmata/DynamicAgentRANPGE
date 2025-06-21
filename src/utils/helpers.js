/**
 * Helper utilities for hashing, transformations, validations and sleep detection
 */

/**
 * Hash a string using SHA-256
 */
export const hashString = async (input) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash user ID for secure client-side storage
 */
export const hashUserId = async (userId) => {
  return hashString(userId.toString());
};

/**
 * Determines the appropriate course_filter based on the context
 * @param {boolean} isPositioning - Indicates if this is a positioning test
 * @param {string} selectedCourse - Currently selected course
 * @param {string} courseFromParams - Course from the URL parameters
 * @returns {string|null} The course name to use as a filter, or null
 */
export const determineCourseFilter = (isPositioning, selectedCourse, courseFromParams) => {
  if (isPositioning && selectedCourse) {
    return selectedCourse;
  }
  
  if (!isPositioning && (courseFromParams || selectedCourse)) {
    return courseFromParams || selectedCourse;
  }
  
  return null;
};


/**
 * Transform backend courses data to frontend structure (legacy format)
 */
export const transformCoursesData = (backendData) => {
  const coursesMap = {};
  const moduleDetailsMap = {};
  
  if (backendData?.modules) {
    backendData.modules.forEach(moduleData => {
      const { course, module, topics, last_updated, program, level } = moduleData;
      
      if (!coursesMap[course]) {
        coursesMap[course] = {
          modules: [],
          totalModules: 0,
        };
      }
      
      coursesMap[course].modules.push(module);
      coursesMap[course].totalModules += 1;
      
      moduleDetailsMap[module] = {
        course,
        topics: topics || [],
        lastUpdated: last_updated,
        program,
        level,
      };
    });
  }
  
  return {
    courses: coursesMap,
    moduleDetails: moduleDetailsMap,
  };
};

/**
 * Transform user data for safe client storage
 */
export const transformUserData = async (userData) => {
  const userHash = await hashUserId(userData.id);
  
  return {
    id: userData.id,
    username: userData.username,
    averageScore: userData.average_score || 0,
    userHash,
  };
};

/**
 * Validate email format and domain (@skema.edu only)
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@skema\.edu$/;
  return emailRegex.test(email);
};

/**
 * Validate verification code format
 */
export const validateVerificationCode = (code) => {
  return /^[A-Z0-9]{6}$/.test(code);
};

/**
 * Validate evaluation parameters
 */
export const validateEvaluationParams = (type, params) => {
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
};

/**
 * Validate UUID format
 */
export const validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Format timestamp to readable date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate user initials from username for avatar display
 * @param {string} username - User's username
 * @returns {string} User initials (max 2 characters)
 */
export const getUserInitials = (username) => {
  if (!username) return 'User';
  
  if (username.includes(' ')) {
    return username.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  if (username.includes('.')) {
    return username.split('.')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  
  return username.slice(0, 2).toUpperCase();
}; 

/**
 * Format conversation title from first message or timestamp
 * @param {Object} conversation - Conversation object
 * @returns {string} Formatted conversation title
 */
export const getConversationTitle = (conversation) => {
  if (conversation.title) {
    return conversation.title;
  }
  
  if (conversation.messages && conversation.messages.length > 0) {
    const firstUserMessage = conversation.messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 40) + (firstUserMessage.content.length > 40 ? '...' : '');
    }
  }
  
  return `Chat ${new Date(conversation.created_at).toLocaleDateString()}`;
};

/**
 * Format conversation timestamp for display
 * @param {Object} conversation - Conversation object
 * @returns {string} Formatted timestamp
 */
export const getConversationTime = (conversation) => {
  const date = new Date(conversation.updated_at || conversation.created_at);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return 'À l\'instant';
  } else if (diffInHours < 24) {
    return `Il y a ${Math.floor(diffInHours)}h`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    });
  }
};

/**
 * Normalize conversation object to ensure consistent structure
 * @param {Object} conversation - Raw conversation object
 * @returns {Object} Normalized conversation object
 */
export const normalizeConversation = (conversation) => {
  const convId = conversation?.conversation_id || conversation?.id;
  if (!convId) {
    return null;
  }
  
  return {
    ...conversation,
    conversation_id: convId
  };
}; 

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  
  return formatDate(timestamp);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Debounce function calls
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function calls
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Sleep detection utilities
 */
export class SleepDetector {
  constructor(threshold = 5 * 60 * 1000) {
    this.threshold = threshold;
    this.lastActivity = Date.now();
    this.callbacks = [];
  }

  /**
   * Update last activity timestamp
   */
  updateActivity() {
    this.lastActivity = Date.now();
  }

  /**
   * Check if device was sleeping
   */
  checkSleep() {
    const now = Date.now();
    const timeDiff = now - this.lastActivity;
    
    if (timeDiff > this.threshold) {
      this.callbacks.forEach(callback => {
        try {
          callback(timeDiff);
        } catch (error) {
          console.error('Sleep callback error:', error);
        }
      });
    }
    
    this.updateActivity();
  }

  /**
   * Add callback for sleep detection
   */
  onSleep(callback) {
    this.callbacks.push(callback);
    
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Setup event listeners for activity detection
   */
  start() {
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const updateActivity = () => this.updateActivity();
    const checkSleep = () => this.checkSleep();
    
    activities.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
    
    document.addEventListener('visibilitychange', checkSleep);
    window.addEventListener('focus', checkSleep);
    
    return () => {
      activities.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      
      document.removeEventListener('visibilitychange', checkSleep);
      window.removeEventListener('focus', checkSleep);
    };
  }
}

/**
 * Create a sleep detector instance
 */
export const createSleepDetector = (threshold) => {
  return new SleepDetector(threshold);
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  return Object.keys(obj).length === 0;
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if browser supports required features
 */
export const checkBrowserSupport = () => {
  const features = {
    fetch: typeof fetch !== 'undefined',
    crypto: typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    customEvents: typeof CustomEvent !== 'undefined',
  };
  
  const unsupported = Object.keys(features).filter(key => !features[key]);
  
  return {
    supported: unsupported.length === 0,
    missing: unsupported,
    features,
  };
};

/**
 * Transform backend data to hierarchical courses structure
 * @param {Object} backendData - Raw backend data
 * @returns {Object} Hierarchical courses structure
 */
export const transformCoursesDataHierarchical = (backendData) => {
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
};

/**
 * Validate hierarchical courses data structure
 * @param {Object} coursesData - Hierarchical courses data
 * @returns {boolean} True if structure is valid
 */
export const validateHierarchicalCoursesStructure = (coursesData) => {
  if (!coursesData || typeof coursesData !== 'object') {
    return false;
  }

  if (!coursesData.courses || typeof coursesData.courses !== 'object') {
    return false;
  }

  return Object.values(coursesData.courses).every(course => 
    course && 
    typeof course === 'object' && 
    typeof course.totalModules === 'number' &&
    course.modules &&
    typeof course.modules === 'object' &&
    Object.values(course.modules).every(module =>
      module &&
      typeof module === 'object' &&
      Array.isArray(module.topics) &&
      typeof module.topicsCount === 'number'
    )
  );
};

/**
 * Search courses by name with fuzzy matching
 * @param {Object} courses - Hierarchical courses data
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching course names
 */
export const searchCoursesByName = (courses, searchTerm) => {
  if (!courses || !searchTerm) {
    return Object.keys(courses || {});
  }

  const term = searchTerm.toLowerCase();
  
  return Object.keys(courses).filter(courseName =>
    courseName.toLowerCase().includes(term)
  );
};

/**
 * Search modules by name across all courses
 * @param {Object} courses - Hierarchical courses data
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of {courseName, moduleName, moduleData} objects
 */
export const searchModulesByName = (courses, searchTerm) => {
  if (!courses || !searchTerm) {
    return [];
  }

  const term = searchTerm.toLowerCase();
  const results = [];
  
  Object.keys(courses).forEach(courseName => {
    const course = courses[courseName];
    Object.keys(course.modules || {}).forEach(moduleName => {
      if (moduleName.toLowerCase().includes(term)) {
        results.push({
          courseName,
          moduleName,
          moduleData: course.modules[moduleName]
        });
      }
    });
  });
  
  return results;
};

/**
 * Search topics across courses and modules
 * @param {Object} courses - Hierarchical courses data
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of {courseName, moduleName, topic} objects
 */
export const searchTopics = (courses, searchTerm) => {
  if (!courses || !searchTerm) {
    return [];
  }

  const term = searchTerm.toLowerCase();
  const results = [];
  
  Object.keys(courses).forEach(courseName => {
    const course = courses[courseName];
    Object.keys(course.modules || {}).forEach(moduleName => {
      const module = course.modules[moduleName];
      (module.topics || []).forEach(topic => {
        if (topic.toLowerCase().includes(term)) {
          results.push({
            courseName,
            moduleName,
            topic
          });
        }
      });
    });
  });
  
  return results;
};

/**
 * Get all unique topics across all courses
 * @param {Object} courses - Hierarchical courses data
 * @returns {Array} Array of unique topics
 */
export const getAllUniqueTopics = (courses) => {
  if (!courses) {
    return [];
  }

  const allTopics = new Set();
  
  Object.values(courses).forEach(course => {
    Object.values(course.modules || {}).forEach(module => {
      (module.topics || []).forEach(topic => {
        allTopics.add(topic);
      });
    });
  });
  
  return Array.from(allTopics);
};

/**
 * Get course navigation path for breadcrumbs
 * @param {string} courseName - Course name
 * @param {string} moduleName - Module name (optional)
 * @returns {Array} Navigation path array
 */
export const getCourseNavigationPath = (courseName, moduleName = null) => {
  const path = [
    { type: 'courses', label: 'Courses', path: '/' }
  ];
  
  if (courseName) {
    path.push({
      type: 'course',
      label: courseName,
      path: `/course-modules?course=${encodeURIComponent(courseName)}`
    });
  }
  
  if (moduleName) {
    path.push({
      type: 'module',
      label: moduleName,
      path: `/evaluation?course=${encodeURIComponent(courseName)}&module=${encodeURIComponent(moduleName)}`
    });
  }
  
  return path;
};

/**
 * Validate course and module names from URL parameters
 * @param {Object} courses - Hierarchical courses data
 * @param {string} courseName - Course name from URL
 * @param {string} moduleName - Module name from URL (optional)
 * @returns {Object} Validation result with isValid and errors
 */
export const validateCourseModuleParams = (courses, courseName, moduleName = null) => {
  const result = {
    isValid: true,
    errors: [],
    courseName: null,
    moduleName: null
  };
  
  if (!courses || Object.keys(courses).length === 0) {
    result.isValid = false;
    result.errors.push('No courses data available');
    return result;
  }
  
  if (!courseName) {
    result.isValid = false;
    result.errors.push('Course name is required');
    return result;
  }
  
  if (!courses[courseName]) {
    result.isValid = false;
    result.errors.push(`Course "${courseName}" not found`);
    return result;
  }
  
  result.courseName = courseName;
  
  if (moduleName) {
    const course = courses[courseName];
    if (!course.modules || !course.modules[moduleName]) {
      result.isValid = false;
      result.errors.push(`Module "${moduleName}" not found in course "${courseName}"`);
      return result;
    }
    
    result.moduleName = moduleName;
  }
  
  return result;
};