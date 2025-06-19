import fetchWrapper from './fetchWrapper.js';
import { API_CONFIG, API_ENDPOINTS } from '../utils/constants.js';

/**
 * Authentication API service
 */
class AuthApi {
  /**
   * Send verification code to email (no auth required)
   */
  async sendVerificationCode(email) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.SEND_CODE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Verify code and get authentication tokens (no auth required)
   */
  async verifyCode(email, code) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.VERIFY_CODE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken) {
    return fetchWrapper.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { refresh_token: refreshToken });
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
}

export default new AuthApi();