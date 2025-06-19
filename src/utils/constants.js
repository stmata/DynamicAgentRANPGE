/**
 * Application constants for URLs, durations, storage keys and configuration
 */

/**
 * API Configuration 

 */
export const API_CONFIG = {
    BASE_URL: window._env_?.VITE_APP_API_URL || import.meta.env.VITE_APP_API_URL,
    BASE_URL_Grader: window._env_?.VITE_APP_GRADER_URL || import.meta.env.VITE_APP_GRADER_URL,
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  };
  
  /**
   * API Endpoints
   */
  export const API_ENDPOINTS = {
    AUTH: {
      SEND_CODE: '/api/auth/send-verification-code',
      VERIFY_CODE: '/api/auth/verify-code',
      REFRESH_TOKEN: '/api/auth/refresh-token',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
    },
    ADMIN: {
      TOPICS_BY_PROGRAM: '/api/admin/topics/by-program',
      TOPICS_BY_MODULE: '/api/admin/topics/by-module',
      TOPICS_BY_COURSE: '/api/admin/topics/by-course',
      ALL_TOPICS: '/api/admin/topics/all',
      SEARCH_TOPICS: '/api/admin/topics/search',
      UPLOAD: '/api/admin/upload',
    },
    EVALUATION: {
      STANDARD: '/api/evaluation/mcq-or-open',
      MIXED: '/api/evaluation/evaluate-mixed',
      CASE: '/api/evaluation/evaluate/case',
      SUBMIT_MCQ_OPEN: '/api/evaluation/submit-and-save',
      SUBMIT_CASE: '/api/evaluation/submit-case-and-save',
      HEALTH: '/api/evaluation/health',
    },
    CHAT: {
      NEW_ID: '/api/conversations/new-id',
      USER_CONVERSATIONS: '/api/users',
      CONVERSATION: '/api/chat',
      SEND_MESSAGE: '/api/chat',
      REGENERATE: '/regenerate',
      PIN: '/pin',
    },
  };
  
  /**
   * Cookie Names
   */
  export const COOKIE_NAMES = {
    ACCESS_TOKEN: 'auth_access_token',
    REFRESH_TOKEN: 'auth_refresh_token',
    EXPIRES: 'auth_expires',
  };
  
  /**
   * Cookie Configuration
   */
  export const COOKIE_CONFIG = {
    SECURE: window._env_?.VITE_APP_BASE_URL?.includes('https') || import.meta.env.NODE_ENV === 'production',
    SAME_SITE: 'strict',
    HTTP_ONLY: false,
  };
  
  /**
   * Session Storage Keys
   */
  export const SESSION_KEYS = {
    USER_SESSION: 'user_session',
    SELECTED_COURSE: 'selected_course',
    SELECTED_MODULE: 'selected_module',
    SELECTED_TOPICS: 'selected_topics',
  };
  
  /**
   * Cache Keys
   */
  export const CACHE_KEYS = {
    COURSES_DATA: 'courses_data',
    CURRENT_EVALUATION: 'current_evaluation',
    CONVERSATIONS_LIST: 'conversations_list',
    CONVERSATION: (id) => `conversation_${id}`,
  };
  
  /**
   * Cache TTL (Time To Live in minutes)
   */
  export const CACHE_TTL = {
    COURSES: 60,
    CONVERSATIONS: 30,
    CONVERSATION: 15,
    EVALUATION: 120,
    USER_SESSION: 480,
  };
  
  /**
   * Token Durations (in minutes)
   */
  export const TOKEN_DURATION = {
    ACCESS_TOKEN: 120,
    REFRESH_TOKEN: 7 * 24 * 60,
  };
  
  /**
   * Sleep Detection Configuration
   */
  export const SLEEP_CONFIG = {
    THRESHOLD: 5 * 60 * 1000,
    CHECK_INTERVAL: 30 * 1000,
  };
  
  /**
   * Validation Rules
   */
  export const VALIDATION = {
    EMAIL_DOMAIN: '@skema.edu',
    VERIFICATION_CODE_LENGTH: 6,
    MIN_QUESTIONS: 1,
    MAX_QUESTIONS: 50,
    MIN_PASSWORD_LENGTH: 8,
  };
  
  /**
   * UI Configuration
   */
  export const UI_CONFIG = {
    DEBOUNCE_DELAY: 300,
    THROTTLE_DELAY: 1000,
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 5000,
  };
  
  /**
   * File Upload Configuration
   */
  export const UPLOAD_CONFIG = {
    MAX_FILE_SIZE: 50 * 1024 * 1024,
    ALLOWED_TYPES: ['.pdf', '.docx', '.mp3', '.wav', '.mp4', '.m4a'],
    CHUNK_SIZE: 1024 * 1024,
  };
  
  /**
   * Evaluation Configuration
   */
  export const EVALUATION_CONFIG = {
    DEFAULT_WEIGHTS: {
      MCQ: 0.5,
      OPEN: 0.5,
    },
    TYPES: {
      STANDARD: 'standard',
      MIXED: 'mixed',
      CASE: 'case',
    },
    QUESTION_TYPES: {
      MCQ: 'mcq',
      OPEN: 'open',
    },
    LEVELS: ['Bachelor 1', 'Bachelor 2', 'Bachelor 3', 'Master 1', 'Master 2'],
    SUPPORTED_LANGUAGES: {
      'fr': 'French',
      'en': 'English',
      'es': 'Spanish',
      'de': 'German',
      'it': 'Italian'
    },
    DEFAULT_LANGUAGE: 'French'
  };
  
  /**
   * Chat Configuration
   */
  export const CHAT_CONFIG = {
    MAX_MESSAGE_LENGTH: 5000,
    MAX_CONVERSATIONS: 100,
    TYPING_TIMEOUT: 3000,
    MESSAGE_BATCH_SIZE: 20,
  };
  
  /**
   * Routes
   */
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    CHAT: '/chat',
    EVALUATION: '/evaluation',
    COURSES: '/courses',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    ERROR: '/error',
  };
  
  /**
   * Local Storage Keys (if needed)
   */
  export const LOCAL_STORAGE_KEYS = {
    THEME: 'app_theme',
    LANGUAGE: 'app_language',
    PREFERENCES: 'user_preferences',
  };
  
  /**
   * Event Names for Custom Events
   */
  export const EVENTS = {
    AUTH_LOGIN: 'auth:login',
    AUTH_LOGOUT: 'auth:logout',
    AUTH_UNAUTHORIZED: 'auth:unauthorized',
    AUTH_SESSION_EXPIRED: 'auth:session-expired',
    COURSES_LOADED: 'courses:loaded',
    COURSES_COURSE_SELECTED: 'courses:course-selected',
    COURSES_MODULE_SELECTED: 'courses:module-selected',
    COURSES_TOPICS_UPDATED: 'courses:topics-updated',
    CHAT_CONVERSATIONS_LOADED: 'chat:conversations-loaded',
    CHAT_CONVERSATION_LOADED: 'chat:conversation-loaded',
    CHAT_MESSAGE_SENT: 'chat:message-sent',
    CHAT_CONVERSATION_UPDATED: 'chat:conversation-updated',
    CHAT_CONVERSATION_DELETED: 'chat:conversation-deleted',
    CHAT_CONVERSATION_PINNED: 'chat:conversation-pinned',
    CHAT_RESPONSE_REGENERATED: 'chat:response-regenerated',
    EVALUATION_GENERATED: 'evaluation:generated',
    EVALUATION_CLEARED: 'evaluation:cleared',
  };
  
  /**
   * HTTP Status Codes
   */
  export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  };
  
  /**
   * Default Program Configuration
   */
  export const DEFAULT_PROGRAM = {
    PROGRAM: 'MM',
    LEVEL: 'M1',
  };
  
  /**
   * Application Metadata
   */
  export const APP_METADATA = {
    NAME: 'SKEMA RAN-PGE Prep App',
    VERSION: '1.0.0',
    DESCRIPTION: 'Bridging Program for French Grandes Écoles Admissions',
  };