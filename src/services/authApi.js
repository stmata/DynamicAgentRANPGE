import fetchWrapper from './fetchWrapper.js';
import { API_CONFIG, API_ENDPOINTS } from '../utils/constants.js';

/**
 * Authentication API service
 */
class AuthApi {
  /**
   * Authenticate with Azure AD access token
   * 
   * @async
   * @method azureLogin
   * @param {string} accessToken - Azure AD access token
   * @param {string|null} idToken - Azure AD ID token (optional)
   * @returns {Promise<Object>} Authentication response with internal tokens
   * @throws {Error} HTTP error with status and details
   */
  async azureLogin(accessToken, idToken = null) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.AZURE_LOGIN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        access_token: accessToken,
        id_token: idToken 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Logout user and revoke tokens
   */
  async logout() {
    return fetchWrapper.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  /**
   * Get current authenticated user information
   */
  async getCurrentUser() {
    return fetchWrapper.get(API_ENDPOINTS.AUTH.ME);
  }

  /**
   * Refresh access token using refresh token
   * 
   * @async
   * @method refreshToken
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens response
   * @throws {Error} HTTP error with status and details
   */
  async refreshToken(refreshToken) {
    return fetchWrapper.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refresh_token: refreshToken
    });
  }
}

export default new AuthApi();