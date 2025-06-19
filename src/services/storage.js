/* eslint-disable no-unused-vars */
import Cookies from 'js-cookie';

/**
 * Storage service for cookies, sessionStorage and cache management
 */
class StorageService {
  constructor() {
    this.isProduction = import.meta.env.PROD === 'production';
    this.cookieConfig = {
      secure: this.isProduction,
      sameSite: 'strict',
    };
    this.userCacheKey = 'user_session_cached';
    this.defaultUserTTL = 24 * 60;
  }

  /**
   * Set secure cookie with expiration
   */
  setCookie(name, value, expiresTimestamp = null) {
    const options = { ...this.cookieConfig };
    
    if (expiresTimestamp) {
      options.expires = new Date(expiresTimestamp * 1000);
    }
    
    Cookies.set(name, value, options);
  }

  /**
   * Get cookie value
   */
  getCookie(name) {
    return Cookies.get(name);
  }

  /**
   * Remove cookie
   */
  removeCookie(name) {
    Cookies.remove(name);
  }

  /**
   * Clear all auth cookies
   */
  clearAuthCookies() {
    this.removeCookie('auth_access_token');
    this.removeCookie('auth_refresh_token');
    this.removeCookie('auth_expires');
  }

  /**
   * Set item in sessionStorage with timestamp
   */
  setSessionItem(key, value) {
    const item = {
      value,
      timestamp: Date.now(),
    };
    
    try {
      sessionStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      //console.warn('SessionStorage write failed:', error);
    }
  }

  /**
   * Get item from sessionStorage
   */
  getSessionItem(key) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item).value : null;
    } catch (error) {
      //console.warn('SessionStorage read failed:', error);
      return null;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  removeSessionItem(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      //console.warn('SessionStorage remove failed:', error);
    }
  }

  /**
   * Clear all sessionStorage
   */
  clearSessionStorage() {
    try {
      sessionStorage.clear();
    } catch (error) {
      //console.warn('SessionStorage clear failed:', error);
    }
  }

  /**
   * Set cache item with TTL
   */
  setCacheItem(key, value, ttlMinutes = 30) {
    const expiresAt = Date.now() + (ttlMinutes * 60 * 1000);
    const cacheItem = {
      value,
      expiresAt,
    };
    
    this.setSessionItem(`cache_${key}`, cacheItem);
  }

  /**
   * Get cache item if not expired
   */
  getCacheItem(key) {
    const cacheItem = this.getSessionItem(`cache_${key}`);
    
    if (!cacheItem) {
      return null;
    }
    
    if (Date.now() > cacheItem.expiresAt) {
      this.removeSessionItem(`cache_${key}`);
      return null;
    }
    
    return cacheItem.value;
  }

  /**
   * Remove cache item
   */
  removeCacheItem(key) {
    this.removeSessionItem(`cache_${key}`);
  }

  /**
   * Clear expired cache items
   */
  clearExpiredCache() {
    try {
      const keys = Object.keys(sessionStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          try {
            const item = JSON.parse(sessionStorage.getItem(key));
            if (item.value && item.value.expiresAt && now > item.value.expiresAt) {
              sessionStorage.removeItem(key);
            }

          } catch (error) {
            sessionStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      //console.warn('Cache cleanup failed:', error);
    }
  }

  /**
   * Store auth tokens securely with enhanced validation
   */
  setAuthTokens(accessToken, refreshToken, accessExpires, refreshExpires) {
    try {
      if (!accessToken || !refreshToken) {
        //console.warn('Invalid tokens provided to setAuthTokens');
        return false;
      }

      // Validate expiration timestamps
      if (accessExpires) {
        const expiresDate = new Date(accessExpires * 1000);
        if (expiresDate <= new Date()) {
          //console.warn('Access token already expired');
          return false;
        }
      }

      this.setCookie('auth_access_token', accessToken, accessExpires);
      this.setCookie('auth_refresh_token', refreshToken, refreshExpires);
      this.setCookie('auth_expires', accessExpires);
      
      /*console.log('Auth tokens stored successfully', {
        accessExpires: accessExpires ? new Date(accessExpires * 1000).toISOString() : null,
        refreshExpires: refreshExpires ? new Date(refreshExpires * 1000).toISOString() : null
      });*/
      
      return true;
    } catch (error) {
      //console.error('Failed to store auth tokens:', error);
      return false;
    }
  }

  /**
   * Get auth tokens with additional metadata
   */
  getAuthTokens() {
    const accessToken = this.getCookie('auth_access_token');
    const refreshToken = this.getCookie('auth_refresh_token');
    const expires = this.getCookie('auth_expires');
    
    return {
      accessToken,
      refreshToken,
      expires: expires ? parseFloat(expires) : null,
      hasTokens: !!(accessToken && refreshToken),
      isAccessTokenValid: this.isAccessTokenValid(),
      isRefreshTokenValid: this.isRefreshTokenValid(),
    };
  }

  /**
   * Check if access token is valid and not expired
   */
  isAccessTokenValid() {
    const accessToken = this.getCookie('auth_access_token');
    const expires = this.getCookie('auth_expires');
    
    if (!accessToken) {
      return false;
    }
    
    if (expires) {
      const now = Date.now() / 1000;
      const expiresIn = parseFloat(expires) - now;
      
      // Consider invalid if expires in less than 30 seconds (buffer)
      return expiresIn > 30;
    }
    
    return true;
  }

  /**
   * Check if refresh token exists and is likely valid
   */
  isRefreshTokenValid() {
    const refreshToken = this.getCookie('auth_refresh_token');
    return !!refreshToken;
  }

  /**
   * Check if user is authenticated based on stored tokens with enhanced validation
   */
  isAuthenticated() {
    const { accessToken, expires } = this.getAuthTokens();
    
    if (!accessToken) {
      return false;
    }
    
    // Check token expiration with a small buffer (30 seconds)
    if (expires) {
      const now = Date.now() / 1000;
      const expiresIn = expires - now;
      
      if (expiresIn <= 30) { // 30 second buffer
        //console.log('Access token expired or expiring soon');
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get time until token expiration in seconds
   */
  getTokenExpirationTime() {
    const expires = this.getCookie('auth_expires');
    if (!expires) return null;
    
    const now = Date.now() / 1000;
    const expiresIn = parseFloat(expires) - now;
    
    return Math.max(0, expiresIn);
  }

  /**
   * Check if token needs refresh (expires within specified minutes)
   */
  shouldRefreshToken(minutesThreshold = 10) {
    const expiresIn = this.getTokenExpirationTime();
    if (expiresIn === null) return false;
    
    const thresholdSeconds = minutesThreshold * 60;
    return expiresIn <= thresholdSeconds;
  }

  /**
   * Store user session data with TTL cache
   * @param {Object} user - User data object
   * @param {number} ttlMinutes - Time to live in minutes (default 24h)
   */
  setUserSessionWithTTL(user, ttlMinutes = this.defaultUserTTL) {
    const userData = {
      username: user.username,
      average_score: user.average_score,
      userHash: user.user_hash,
      id: user.id,
      course_scores: user.course_scores,
      evaluations: user.evaluations || [],
      total_evaluations: user.total_evaluations || 0,
      lastCached: Date.now(),
    };

    this.setSessionItem('user_session', userData);
    this.setCacheItem(this.userCacheKey, userData, ttlMinutes);
  }

  /**
   * Get user session data if still valid (within TTL)
   * @returns {Object|null} User data if valid, null if expired or missing
   */
  getUserSessionIfValid() {
    const cachedUser = this.getCacheItem(this.userCacheKey);
    
    if (cachedUser && this.validateUserDataIntegrity(cachedUser)) {
      return cachedUser;
    }

    const sessionUser = this.getSessionItem('user_session');
    if (sessionUser && this.validateUserDataIntegrity(sessionUser)) {
      return sessionUser;
    }

    return null;
  }

  /**
   * Validate user data integrity
   * @param {Object} userData - User data to validate
   * @returns {boolean} True if data is valid
   */
  validateUserDataIntegrity(userData) {
    if (!userData || typeof userData !== 'object') {
      return false;
    }

    const requiredFields = ['id', 'username'];
    const hasRequiredFields = requiredFields.every(field => 
      userData[field] !== undefined && userData[field] !== null
    );

    if (!hasRequiredFields) {
      return false;
    }

    // Validate evaluations field if present
    if (userData.evaluations !== undefined && !Array.isArray(userData.evaluations)) {
      return false;
    }

    // Validate total_evaluations field if present
    if (userData.total_evaluations !== undefined && typeof userData.total_evaluations !== 'number') {
      return false;
    }

    if (userData.lastCached && typeof userData.lastCached === 'number') {
      const maxAge = this.defaultUserTTL * 60 * 1000;
      if (Date.now() - userData.lastCached > maxAge) {
        return false;
      }
    }

    return true;
  }

  /**
   * Store user session data (legacy method for compatibility)
   */
  setUserSession(user) {
    this.setUserSessionWithTTL(user);
  }

  /**
   * Get user session data (legacy method for compatibility)
   */
  getUserSession() {
    return this.getUserSessionIfValid() || this.getSessionItem('user_session');
  }

  /**
   * Clear user session cache
   */
  clearUserSession() {
    this.removeSessionItem('user_session');
    this.removeCacheItem(this.userCacheKey);
  }

  /**
   * Store courses cache (legacy method for backward compatibility)
   */
  setCourses(courses, ttlMinutes = 60) {
    this.setCacheItem('courses_data', courses, ttlMinutes);
  }

  /**
   * Get courses cache (legacy method for backward compatibility)
   */
  getCourses() {
    return this.getCacheItem('courses_data');
  }

  /**
   * Store hierarchical courses cache with enhanced TTL and validation
   * @param {Object} coursesData - Hierarchical courses data
   * @param {number} ttlMinutes - Time to live in minutes (default 4h)
   */
  setCoursesHierarchical(coursesData, ttlMinutes = 240) {
    if (!coursesData || typeof coursesData !== 'object') {
      //console.warn('Invalid courses data provided to cache');
      return;
    }

    const cacheData = {
      ...coursesData,
      lastCached: Date.now(),
      structure: 'hierarchical',
      version: '2.0'
    };

    this.setCacheItem('courses_hierarchical', cacheData, ttlMinutes);
    
    this.setCourses(coursesData, ttlMinutes);
  }

  /**
   * Get hierarchical courses cache if valid
   * @returns {Object|null} Hierarchical courses data or null if invalid/expired
   */
  getCoursesHierarchical() {
    const cachedData = this.getCacheItem('courses_hierarchical');
    
    if (cachedData && this.validateCoursesDataIntegrity(cachedData)) {
      return cachedData;
    }

    const legacyData = this.getCourses();
    if (legacyData && this.migrateLegacyCoursesData(legacyData)) {
      return this.migrateLegacyCoursesData(legacyData);
    }

    return null;
  }

  /**
   * Validate courses data integrity
   * @param {Object} coursesData - Courses data to validate
   * @returns {boolean} True if data is valid
   */
  validateCoursesDataIntegrity(coursesData) {
    if (!coursesData || typeof coursesData !== 'object') {
      return false;
    }

    if (coursesData.structure === 'hierarchical' && coursesData.courses) {
      const { courses } = coursesData;
      
      if (typeof courses !== 'object') {
        return false;
      }

      const isValidStructure = Object.values(courses).every(course => 
        course && 
        typeof course === 'object' && 
        typeof course.totalModules === 'number' &&
        course.modules &&
        typeof course.modules === 'object'
      );

      if (!isValidStructure) {
        return false;
      }
    }

    if (coursesData.lastCached && typeof coursesData.lastCached === 'number') {
      const maxAge = 240 * 60 * 1000;
      if (Date.now() - coursesData.lastCached > maxAge) {
        return false;
      }
    }

    return true;
  }

  /**
   * Migrate legacy courses data to hierarchical structure
   * @param {Object} legacyData - Legacy courses data
   * @returns {Object|null} Migrated hierarchical data or null
   */
  migrateLegacyCoursesData(legacyData) {
    if (!legacyData || !legacyData.courses || !legacyData.moduleDetails) {
      return null;
    }

    try {
      const hierarchicalCourses = {};
      
      Object.keys(legacyData.courses).forEach(courseName => {
        const legacyCourse = legacyData.courses[courseName];
        
        hierarchicalCourses[courseName] = {
          totalModules: legacyCourse.totalModules || 0,
          modules: {}
        };

        if (legacyCourse.modules && Array.isArray(legacyCourse.modules)) {
          legacyCourse.modules.forEach(moduleName => {
            const moduleDetail = legacyData.moduleDetails[moduleName];
            if (moduleDetail) {
              hierarchicalCourses[courseName].modules[moduleName] = {
                topics: moduleDetail.topics || [],
                topicsCount: (moduleDetail.topics || []).length,
                lastUpdated: moduleDetail.lastUpdated,
                program: moduleDetail.program,
                level: moduleDetail.level,
              };
            }
          });
        }
      });

      const migratedData = {
        courses: hierarchicalCourses,
        lastCached: Date.now(),
        structure: 'hierarchical',
        version: '2.0',
        migrated: true
      };

      this.setCoursesHierarchical(migratedData);
      return migratedData;
    } catch (error) {
      //console.warn('Failed to migrate legacy courses data:', error);
      return null;
    }
  }

  /**
   * Clear courses cache (both legacy and hierarchical)
   */
  clearCoursesCache() {
    this.removeCacheItem('courses_data');
    this.removeCacheItem('courses_hierarchical');
  }

  /**
   * Clear all stored data with enhanced logging
   */
  clearAll() {
    //console.log('Clearing all stored authentication and session data');
    
    try {
      this.clearAuthCookies();
      this.clearUserSession();
      this.clearCoursesCache();
      this.clearSessionStorage();
      
      //console.log('All storage data cleared successfully');
    } catch (error) {
      //console.error('Error clearing storage data:', error);
    }
  }

  /**
   * Initialize storage with enhanced cleanup and error handling
   */
  initialize() {
    try {
      //console.log('Initializing storage service...');
      
      // Clean up expired cache items
      this.clearExpiredCache();
      
      // Log current auth state for debugging
      const { hasTokens, isAccessTokenValid, isRefreshTokenValid } = this.getAuthTokens();
      /*console.log('Storage initialization - Auth state:', {
        hasTokens,
        isAccessTokenValid,
        isRefreshTokenValid,
        tokenExpiresIn: this.getTokenExpirationTime()
      });*/
      
      // Setup cleanup on page unload
      const handleBeforeUnload = () => {
        try {
          this.clearExpiredCache();
        } catch (error) {
          //console.warn('Error during cleanup on page unload:', error);
        }
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      // Setup periodic cleanup (every 30 minutes)
      const cleanupInterval = setInterval(() => {
        try {
          this.clearExpiredCache();
        } catch (error) {
          //console.warn('Error during periodic cleanup:', error);
        }
      }, 30 * 60 * 1000); // 30 minutes
      
      // Clear interval when page is unloaded
      window.addEventListener('beforeunload', () => {
        clearInterval(cleanupInterval);
      });
      
      //console.log('Storage service initialized successfully');
    } catch (error) {
      //console.error('Error initializing storage service:', error);
    }
  }

  /**
   * Get detailed storage diagnostics for debugging
   */
  getDiagnostics() {
    const tokenData = this.getAuthTokens();
    const userData = this.getUserSessionIfValid();
    const coursesData = this.getCoursesHierarchical();
    
    return {
      timestamp: new Date().toISOString(),
      tokens: {
        hasAccessToken: !!tokenData.accessToken,
        hasRefreshToken: !!tokenData.refreshToken,
        isAccessTokenValid: tokenData.isAccessTokenValid,
        isRefreshTokenValid: tokenData.isRefreshTokenValid,
        expiresIn: this.getTokenExpirationTime(),
        shouldRefresh: this.shouldRefreshToken(),
      },
      user: {
        hasSession: !!userData,
        isValid: !!this.getUserSessionIfValid(),
        hasEvaluations: !!(userData && userData.evaluations),
        evaluationsCount: userData?.evaluations?.length || 0,
        totalEvaluations: userData?.total_evaluations || 0,
        averageScore: userData?.average_score || 0,
      },
      courses: {
        hasCachedData: !!coursesData,
        isValid: !!coursesData && this.validateCoursesDataIntegrity(coursesData),
      },
      environment: {
        isProduction: this.isProduction,
        cookieConfig: this.cookieConfig,
      }
    };
  }
}

export default new StorageService();