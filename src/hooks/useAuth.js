import { useState, useEffect, useCallback, useRef } from 'react';
import authApi from '../services/authApi.js';
import storage from '../services/storage.js';
import { API_CONFIG, API_ENDPOINTS } from '../utils/constants.js';

/**
 * Inactivity duration threshold (in milliseconds) used to detect if the user has been "asleep"
 * (e.g., device in sleep mode or tab inactive for a long period).
 * If the user returns after this period, the session validity is rechecked.
 *
 * Updated to 2.5 hours to account for 2-hour token expiration from backend.
 */
const sleepThreshold = 2.5 * 60 * 60 * 1000;

/**
 * Token refresh threshold (in milliseconds) - refresh token if it expires within this window
 * Set to 10 minutes before expiration
 */
const refreshThreshold = 10 * 60 * 1000; // 10 minutes in milliseconds

/**
 * Authentication hook with complete auth flow, token management and sleep detection
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const lastActivityRef = useRef(Date.now());
  

  /**
   * Clear authentication state and storage
   */
  const clearAuthState = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    storage.clearAll();
  }, []);

  /**
   * Set authentication state with user data
   */
  const setAuthState = useCallback((userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    storage.setUserSessionWithTTL(userData);
  }, []);

  /**
   * Hash user ID for security
   */
  const hashUserId = useCallback(async (userId) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

   /**
   * Extract authentication tokens from URL parameters
   * 
   * @returns {Object|null} Token data or null if not found
   */
  const extractTokensFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const userId = params.get('user_id');
    const accessTokenExpires = params.get('access_token_expires');
    const refreshTokenExpires = params.get('refresh_token_expires');

    if (accessToken && refreshToken && userId) {
      window.history.replaceState({}, document.title, window.location.pathname);
      
      return {
        accessToken,
        refreshToken,
        userId,
        accessTokenExpires: parseFloat(accessTokenExpires),
        refreshTokenExpires: parseFloat(refreshTokenExpires)
      };
    }
    return null;
  }, []);

  /**
   * Process authentication tokens from URL and complete login
   * 
   * @param {Object} tokenData - Token data extracted from URL
   * @returns {Promise<boolean>} Success status
   */
  const processUrlTokens = useCallback(async (tokenData) => {
    try {
      storage.setAuthTokens(
        tokenData.accessToken,
        tokenData.refreshToken,
        tokenData.accessTokenExpires,
        tokenData.refreshTokenExpires
      );

      const userInfo = await authApi.getCurrentUser();
      const userHash = await hashUserId(tokenData.userId);

      const userData = {
        id: tokenData.userId,
        username: userInfo.username || userInfo.email?.split('@')[0] || 'User',
        email: userInfo.email,
        average_score: userInfo.average_score || 0,
        total_evaluations: userInfo.total_evaluations || 0,
        course_scores: userInfo.course_scores || {},
        evaluations: userInfo.evaluations || [],
        user_hash: userHash,
        course_progress: userInfo.course_progress || {},
        learning_analytics: userInfo.learning_analytics || null,
        progression_initialized: userInfo.progression_initialized || false,
        created_at: userInfo.created_at,
        last_login: userInfo.last_login,
      };

      setAuthState(userData);
      storage.setUserSessionWithTTL(userData, 24 * 60 * 60 * 1000);
      window.dispatchEvent(new CustomEvent('auth:login', { detail: userData }));
      
      return true;
    } catch (err) {
      console.error('Failed to process URL tokens:', err);
      setError(err.message || 'Authentication failed');
      return false;
    }
  }, [hashUserId, setAuthState]);

  /**
   * Redirect to Azure OAuth login
   * 
   * @returns {void}
   */
  const loginWithAzureRedirect = useCallback(() => {
    window.location.href = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.AZURE_LOGIN}`;
  }, []);

  /**
   * Check if token needs refresh based on expiration time
   */
  const shouldRefreshToken = useCallback(() => {
    const { expires } = storage.getAuthTokens();
    if (!expires) return false;
    
    const now = Date.now() / 1000;
    const expiresIn = expires - now;
    
    return expiresIn <= (refreshThreshold / 1000); // Convert to seconds
  }, []);

  /**
   * Proactively refresh token if needed
   */
  const refreshTokenIfNeeded = useCallback(async () => {
    if (!isAuthenticated || !shouldRefreshToken()) {
      return false;
    }

    try {
      const { refreshToken } = storage.getAuthTokens();
      if (!refreshToken) {
        return false;
      }

      console.log('Proactively refreshing token...');
      const newTokens = await authApi.refreshToken(refreshToken);
      if (newTokens) {
        // Get current token data to preserve refresh token expiration
        const currentTokens = storage.getAuthTokens();
        
        storage.setAuthTokens(
          newTokens.access_token,
          refreshToken, 
          newTokens.access_token_expires,
          currentTokens.expires 
        );
        
        console.log('Token refreshed successfully');
        return true;
      }
    } catch (error) {
      console.warn('Proactive token refresh failed:', error);
      return false;
    }
    
    return false;
  }, [isAuthenticated, shouldRefreshToken]);


  /**
   * Logout user and clear all data
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      try {
        await authApi.logout();
      } catch (logoutError) {
        console.warn('Logout API call failed:', logoutError);
      }
      
      clearAuthState();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  }, [clearAuthState]);

  /**
   * Verify current session validity with cache-first approach
   */
  const verifySession = useCallback(async () => {
    try {
      const { accessToken } = storage.getAuthTokens();
      
      if (!accessToken) {
        return false;
      }
      
      if (!storage.isAuthenticated()) {
        return false;
      }

      const cachedUserData = storage.getUserSessionIfValid();
      
      if (cachedUserData) {
        setAuthState(cachedUserData);
        return true;
      }

      try {
        const userInfo = await authApi.getCurrentUser();
        const existingSession = storage.getUserSession();
        
        const userData = {
          id: userInfo.id,
          username: userInfo.username,
          average_score: userInfo.average_score,
          total_evaluations: userInfo.total_evaluations || 0,
          course_scores: userInfo.course_scores,
          evaluations: userInfo.evaluations || [],
          user_hash: existingSession?.user_hash || await hashUserId(userInfo.id),
          course_progress: userInfo.course_progress || {},
          learning_analytics: userInfo.learning_analytics || null,
          progression_initialized: userInfo.progression_initialized || false,
        };
        
        setAuthState(userData);
        return true;
      } catch (apiError) {
        if (apiError.status === 401) {
          const refreshSuccessful = await refreshTokenIfNeeded();
          if (refreshSuccessful) {
            try {
              const userInfo = await authApi.getCurrentUser();
              const existingSession = storage.getUserSession();
              
              const userData = {
                id: userInfo.id,
                username: userInfo.username,
                average_score: userInfo.average_score,
                total_evaluations: userInfo.total_evaluations || 0,
                course_scores: userInfo.course_scores,
                evaluations: userInfo.evaluations || [],
                user_hash: existingSession?.user_hash || await hashUserId(userInfo.id),
                course_progress: userInfo.course_progress || {},
                learning_analytics: userInfo.learning_analytics || null,
                progression_initialized: userInfo.progression_initialized || false,
              };
              
              setAuthState(userData);
              return true;
            } catch (retryError) {
              console.warn('Retry after token refresh failed:', retryError);
            }
          }
          
          clearAuthState();
          return false;
        }
        
        const fallbackSession = storage.getUserSession();
        if (fallbackSession) {
          setAuthState(fallbackSession);
          return true;
        }
        
        return false;
      }
    } catch (err) {
      console.error('Session verification failed:', err);
      return false;
    }
  }, [setAuthState, clearAuthState, hashUserId, refreshTokenIfNeeded]);

  /**
   * Enhanced sleep detection and wake up handling with intelligent token management
   * Check if we've been away for a significant time (potential sleep)
   * First try to refresh token proactively if needed
   * Then verify session
   * Even for shorter absences, check if token needs refresh
   */
  const handleWakeUp = useCallback(async () => {
    const now = Date.now();
    const timeDiff = now - lastActivityRef.current;
    
    // 
    if (timeDiff > sleepThreshold) {
      console.log('Potential sleep detected, checking session validity...');
      
      if (isAuthenticated) {
        const refreshed = await refreshTokenIfNeeded();
        
        if (refreshed) {
          console.log('Token refreshed proactively after wake up');
        }
        
        const isValid = await verifySession();
        if (!isValid) {
          console.log('Session invalid after wake up, clearing auth state');
          clearAuthState();
          window.dispatchEvent(new CustomEvent('auth:session-expired'));
        } else {
          console.log('Session valid after wake up');
        }
      }
    } else if (isAuthenticated) {
      await refreshTokenIfNeeded();
    }
    
    lastActivityRef.current = now;
  }, [isAuthenticated, verifySession, clearAuthState, refreshTokenIfNeeded]);

  /**
   * Update activity timestamp
   */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  /**
   * Initialize authentication state
   */
  useEffect(() => {
  const initializeAuth = async () => {
    setLoading(true);
    
    try {
      const urlTokens = extractTokensFromUrl();
      
      if (urlTokens) {
        const success = await processUrlTokens(urlTokens);
        if (success) {
          setLoading(false);
          return;
        }
      }

      const { accessToken } = storage.getAuthTokens();
      if (!accessToken) {
        setLoading(false);
        return;
      }
      
      const isValid = await verifySession();
      if (!isValid) {
        clearAuthState();
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [verifySession, clearAuthState]);

   /**
   * Refresh user information from the server
   */
   const refreshUserInfo = useCallback(async () => {
    try {
      const userInfo = await authApi.getCurrentUser();
      const existingSession = storage.getUserSession();
      
      const userData = {
        id: userInfo.id,
        username: userInfo.username,
        average_score: userInfo.average_score,
        total_evaluations: userInfo.total_evaluations || 0,
        course_scores: userInfo.course_scores,
        evaluations: userInfo.evaluations || [],
        user_hash: existingSession?.user_hash || await hashUserId(userInfo.id),
        course_progress: userInfo.course_progress || {},
        learning_analytics: userInfo.learning_analytics || null,
        progression_initialized: userInfo.progression_initialized || false,
      };
      
      setAuthState(userData);
      return userData;
    } catch (error) {
      console.warn('Failed to refresh user info:', error);
      return null;
    }
  }, [setAuthState, hashUserId]);

  /**
   * Get course-specific score for a given course
   * @param {string} courseName - Name of the course
   * @returns {number|null} Course score or null if not found
   */
  const getCourseScore = useCallback((courseName) => {
    if (!user?.course_scores || !courseName) {
      return null;
    }
    const courseData = user.course_scores[courseName];
    return courseData?.average_score || null;
  }, [user?.course_scores]);

  /**
   * Get course progression data for a specific course
   * @param {string} courseName - Name of the course
   * @returns {Object|null} Course progression data or null if not found
   */
  const getCourseProgress = useCallback((courseName) => {
    if (!user?.course_progress || !courseName) {
      return null;
    }
    return user.course_progress[courseName] || null;
  }, [user?.course_progress]);

  /**
   * Get user learning analytics
   * @returns {Object|null} Learning analytics data or null if not available
   */
  const getLearningAnalytics = useCallback(() => {
    return user?.learning_analytics || null;
  }, [user?.learning_analytics]);

  /**
   * Check if user progression is initialized
   * @returns {boolean} True if progression is initialized
   */
  const isProgressionInitialized = useCallback(() => {
    return user?.progression_initialized || false;
  }, [user]);
  
  /**
   * Setup periodic token refresh check and event listeners for sleep detection
   */
  useEffect(() => {
    // Periodic check for token refresh (every 5 minutes)
    const tokenCheckInterval = setInterval(async () => {
      if (isAuthenticated) {
        await refreshTokenIfNeeded();
      }
    }, 5 * 60 * 1000); // 5 minutes

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleWakeUp();
      }
    };

    const handleFocus = () => {
      handleWakeUp();
    };

    const handleAuthLogout = () => {
      clearAuthState();
    };

    const handleUnauthorized = () => {
      clearAuthState();
    };

    const handleRefreshUser = async () => {
      if (isAuthenticated) {
        try {
          const userInfo = await authApi.getCurrentUser();
          const userData = {
            ...user,
            username: userInfo.username,
            average_score: userInfo.average_score,
            total_evaluations: userInfo.total_evaluations || 0,
            course_scores: userInfo.course_scores,
            evaluations: userInfo.evaluations || [],
            course_progress: userInfo.course_progress || {},
            learning_analytics: userInfo.learning_analytics || null,
            progression_initialized: userInfo.progression_initialized || false,
          };
          setAuthState(userData);
        } catch (error) {
          console.warn('Failed to refresh user data:', error);
        }
      }
    };

    // Event listeners for various auth and sleep detection scenarios
    window.addEventListener('auth:logout', handleAuthLogout);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:refresh-user', handleRefreshUser);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    storage.initialize();

    return () => {
      clearInterval(tokenCheckInterval);
      
      window.removeEventListener('auth:logout', handleAuthLogout);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:refresh-user', handleRefreshUser);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleWakeUp, updateActivity, clearAuthState, isAuthenticated, refreshTokenIfNeeded, refreshUserInfo]);

  /**
   * Update placement test progression
   * @param {string} course - Course name
   * @param {number} score - Final score
   */
  // eslint-disable-next-line no-unused-vars
  const updatePlacementTest = useCallback(async (course, score) => {
    try {
      await refreshUserInfo();
    } catch (error) {
      console.warn('Failed to update placement test progression:', error);
    }
  }, [refreshUserInfo]);

  /**
   * Update module progression
   * @param {string} course - Course name
   * @param {string} module - Module name
   * @param {number} score - Final score
   */
  // eslint-disable-next-line no-unused-vars
  const updateModuleProgress = useCallback(async (course, module, score) => {
    try {
      await refreshUserInfo();
    } catch (error) {
      console.warn('Failed to update module progression:', error);
    }
  }, [refreshUserInfo]);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    loginWithAzureRedirect,
    logout,
    verifySession,
    refreshUserInfo,
    getCourseScore,
    getCourseProgress,
    getLearningAnalytics,
    isProgressionInitialized,
    updatePlacementTest,
    updateModuleProgress,
    clearError: () => setError(null),
  };
};

export default useAuth;