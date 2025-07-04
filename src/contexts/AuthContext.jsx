import { createContext, useContext, useEffect } from 'react';
import useAuthHook from '../hooks/useAuth.js';
import useCourses from '../hooks/useCourses.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuthHook();
  const courses = useCourses(auth.isAuthenticated);

  /**
   * Load courses when user becomes authenticated
   * Simplified to only depend on authentication status, not user data
   */
  useEffect(() => {
    if (auth.isAuthenticated) {
      courses.loadCourses();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, courses.loadCourses]);

  /**
   * Clear course selections on logout
   */
  useEffect(() => {
    const handleLogout = () => {
      courses.clearSelections();
    };

    window.addEventListener('auth:logout', handleLogout);
    
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses.clearSelections]);

  /**
   * Combined loading state for auth and courses
   */
  const isLoading = auth.loading || (auth.isAuthenticated && courses.loading);
  
  /**
   * Application is initialized when auth is loaded and courses are available (if authenticated)
   */
  const isInitialized = !auth.loading && (!auth.isAuthenticated || Object.keys(courses.courses).length > 0);
  
  /**
   * Combined error state from auth and courses
   */
  const currentError = auth.error || courses.error;

  /**
   * Clear all errors from auth and courses
   */
  const clearAllErrors = () => {
    auth.clearError();
    courses.clearError();
  };

  /**
   * Enhanced logout that clears both auth and course data
   */
  const handleLogout = async () => {
    await auth.logout();
    courses.clearSelections();
  };

  /**
   * Get user ID safely from auth state
   */
  const getUserId = () => {
    return auth.user?.id || null;
  };

  /**
   * Get available topics for current selection context
   */
  const getAvailableTopicsForEvaluation = () => {
    return courses.getAvailableTopics();
  };

  /**
   * Get current application context (selected course/module/topics)
   */
  const getCurrentContext = () => {
    return {
      course: courses.selectedCourse,
      module: courses.selectedModule,
      topics: courses.selectedTopics,
      hasSelection: Boolean(courses.selectedCourse || courses.selectedModule),
    };
  };

  /**
   * Get comprehensive application statistics
   */
  const getAppStats = () => {
    const courseStats = courses.getCourseStats();
    
    return {
      user: {
        username: auth.user?.username,
        averageScore: auth.user?.average_score,
      },
      courses: courseStats,
      context: getCurrentContext(),
    };
  };



  /**
   * Enhanced context value with optimized auth and courses integration
   */
  const contextValue = {
    // Core authentication state
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    loading: isLoading,
    initialized: isInitialized,
    error: currentError,
    
    // Authentication methods
    loginWithAzureRedirect: auth.loginWithAzureRedirect,
    logout: handleLogout,
    verifySession: auth.verifySession,
    refreshUserInfo: auth.refreshUserInfo,
    getCourseScore: auth.getCourseScore,
    getCourseProgress: auth.getCourseProgress,
    getLearningAnalytics: auth.getLearningAnalytics,
    isProgressionInitialized: auth.isProgressionInitialized,
    clearError: clearAllErrors,
    getUserId,
    
    // Legacy courses structure
    courses: courses.courses,
    moduleDetails: courses.moduleDetails,
    
    // Current selection state
    selectedCourse: courses.selectedCourse,
    selectedModule: courses.selectedModule,
    selectedTopics: courses.selectedTopics,
    coursesLoading: courses.loading,
    coursesError: courses.error,
    
    // Course management methods
    loadCourses: courses.loadCourses,
    refreshCourses: courses.refreshCourses,
    selectCourse: courses.selectCourse,
    selectModule: courses.selectModule,
    updateSelectedTopics: courses.updateSelectedTopics,
    clearSelections: courses.clearSelections,
    getAvailableTopics: courses.getAvailableTopics,
    getCourseStats: courses.getCourseStats,
    
    // Hierarchical course access methods
    getAllCourses: courses.getAllCourses,
    getModulesForCourse: courses.getModulesForCourse,
    getTopicsForModule: courses.getTopicsForModule,
    getTopicsCountForModule: courses.getTopicsCountForModule,
    courseExists: courses.courseExists,
    moduleExists: courses.moduleExists,
    
    // Enhanced application methods
    getAvailableTopicsForEvaluation,
    getCurrentContext,
    getAppStats,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};


/**
 * Convenient alias for useAuthContext
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export default AuthProvider;