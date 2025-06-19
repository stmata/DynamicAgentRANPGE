import Cookies from 'js-cookie';
import { API_CONFIG, API_ENDPOINTS } from '../utils/constants.js';

/**
 * HTTP client wrapper with automatic token management, retry logic and error handling
 */
class FetchWrapper {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  /**
   * Get authorization headers from cookies
   */
  getAuthHeaders() {
    const token = Cookies.get('auth_access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Process failed queue after token refresh
   */
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  /**
   * Check if token is close to expiring (within 5 minutes)
   */
  isTokenExpiringSoon() {
    const expires = Cookies.get('auth_expires');
    if (!expires) return false;
    
    const now = Date.now() / 1000;
    const expiresIn = expires - now;
    
    return expiresIn <= 300; // 5 minutes
  }

  /**
   * Refresh access token using refresh token with improved cookie management
   */
  async refreshToken() {
    const refreshToken = Cookies.get('auth_refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      console.log('Attempting to refresh access token...');
      
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Token refresh failed:', response.status, errorData);
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Token refresh successful');
      
      // Update access token with proper expiration
      Cookies.set('auth_access_token', data.access_token, {
        expires: new Date(data.access_token_expires * 1000),
        secure: import.meta.env.PROD === 'production',
        sameSite: 'strict'
      });

      // Update the expiration timestamp cookie
      Cookies.set('auth_expires', data.access_token_expires, {
        expires: new Date(data.access_token_expires * 1000),
        secure: import.meta.env.PROD === 'production',
        sameSite: 'strict'
      });

      return data.access_token;
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Clear all auth cookies on refresh failure
      Cookies.remove('auth_access_token');
      Cookies.remove('auth_refresh_token');
      Cookies.remove('auth_expires');
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw error;
    }
  }

  /**
   * Handle 401 responses with automatic token refresh and improved retry logic
   */
  async handleUnauthorized(originalRequest) {
    // If we're already refreshing, queue this request
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return this.executeRequest(originalRequest);
      });
    }

    // Check if we have a refresh token
    const refreshToken = Cookies.get('auth_refresh_token');
    if (!refreshToken) {
      console.warn('No refresh token available for retry');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw new Error('No refresh token available');
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshToken();
      this.processQueue(null, newToken);
      
      // Update the original request with new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return this.executeRequest(originalRequest);
    } catch (error) {
      console.error('Token refresh failed during unauthorized handling:', error);
      this.processQueue(error, null);
      
      // Dispatch unauthorized event for app-wide handling
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Execute HTTP request with enhanced retry logic and proactive token refresh
   */
  async executeRequest(config, retryCount = 0) {
    try {
      // Proactively refresh token if it's expiring soon and we're not already refreshing
      if (!this.isRefreshing && this.isTokenExpiringSoon()) {
        console.log('Token expiring soon, proactively refreshing...');
        try {
          const newToken = await this.refreshToken();
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (refreshError) {
          console.warn('Proactive token refresh failed:', refreshError);
          // Continue with original request - let it fail naturally if needed
        }
      }

      const response = await fetch(config.url, {
        method: config.method,
        headers: config.headers,
        body: config.body,
      });

      // Handle 401 Unauthorized - try token refresh
      if (response.status === 401 && retryCount === 0) {
        console.log('401 Unauthorized, attempting token refresh...');
        return this.handleUnauthorized(config);
      }

      // Handle other errors
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        error.response = response;
        
        // Log non-2xx responses for debugging
        if (response.status >= 400) {
          console.warn(`HTTP ${response.status} for ${config.method} ${config.url}`);
        }
        
        throw error;
      }

      // Handle successful responses
      if (response.status === 204) {
        return undefined; // No content
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return response;
    } catch (error) {
      // Retry logic for network errors and server errors
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        console.log(`Retrying request (${retryCount + 1}/${this.maxRetries}) after ${this.retryDelay}ms...`);
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.executeRequest(config, retryCount + 1);
      }

      // Format and throw the error
      throw this.handleError(error);
    }
  }

  /**
   * Check if request should be retried (enhanced logic)
   */
  shouldRetry(error) {
    // Don't retry authentication errors
    if (error.status === 401 || error.status === 403) {
      return false;
    }
    
    // Retry network errors and server errors
    return (
      error.name === 'TypeError' || // Network errors
      (error.status >= 500 && error.status < 600) || // Server errors
      error.status === 429 || // Rate limiting
      error.status === 408 // Request timeout
    );
  }

  /**
   * Delay execution for retry backoff
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle and format errors with enhanced error information
   */
  handleError(error) {
    // Dispatch auth events for specific error codes
    if (error.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    } else if (error.status === 403) {
      window.dispatchEvent(new CustomEvent('auth:forbidden'));
    }

    // Create formatted error with additional context
    const formattedError = new Error(error.message || 'Network request failed');
    formattedError.status = error.status;
    formattedError.originalError = error;
    formattedError.timestamp = new Date().toISOString();
    
    return formattedError;
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    const config = {
      url: `${this.baseURL}${url}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    return this.executeRequest(config);
  }

  /**
   * POST request
   */
  async post(url, data = null, options = {}) {
    const config = {
      url: `${this.baseURL}${url}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : null,
    };

    return this.executeRequest(config);
  }

  /**
   * PUT request
   */
  async put(url, data = null, options = {}) {
    const config = {
      url: `${this.baseURL}${url}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : null,
    };

    return this.executeRequest(config);
  }

  /**
   * PATCH request
   */
  async patch(url, data = null, options = {}) {
    const config = {
      url: `${this.baseURL}${url}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : null,
    };

    return this.executeRequest(config);
  }

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    const config = {
      url: `${this.baseURL}${url}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    return this.executeRequest(config);
  }

  /**
   * Upload file with multipart/form-data
   */
  async upload(url, formData, options = {}) {
    const config = {
      url: `${this.baseURL}${url}`,
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      body: formData,
    };

    return this.executeRequest(config);
  }
}

export default new FetchWrapper();