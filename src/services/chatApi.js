import fetchWrapper from './fetchWrapper.js';
import { API_ENDPOINTS } from '../utils/constants.js';

/**
 * Chat API service for conversations and messages management
 */
class ChatApi {
  /**
   * Generate new conversation ID
   */
  async generateNewConversationId() {
    return fetchWrapper.post(API_ENDPOINTS.CHAT.NEW_ID);
  }

  /**
   * Get user conversations for sidebar display
   */
  async getUserConversations(userId, limit = 50) {
    return fetchWrapper.get(`${API_ENDPOINTS.CHAT.USER_CONVERSATIONS}/${userId}/conversations?limit=${limit}`);
  }

  /**
   * Get conversation with all messages
   */
  async getConversationWithMessages(conversationId) {
    return fetchWrapper.get(`${API_ENDPOINTS.CHAT.CONVERSATION}/${conversationId}`);
  }

  /**
   * Send message and receive response
   */
  async sendMessage(userId, message, conversationId = null) {
    return fetchWrapper.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, {
      user_id: userId,
      message,
      conversation_id: conversationId,
    });
  }

  /**
   * Update conversation metadata
   */
  async updateConversation(conversationId, updateData) {
    return fetchWrapper.patch(`${API_ENDPOINTS.CHAT.CONVERSATION}/${conversationId}`, updateData);
  }

  /**
   * Toggle conversation pin status
   */
  async togglePinConversation(conversationId) {
    return fetchWrapper.patch(`${API_ENDPOINTS.CHAT.CONVERSATION}/${conversationId}/pin`);
  }

  /**
   * Delete conversation (soft delete)
   */
  async deleteConversation(conversationId) {
    return fetchWrapper.delete(`${API_ENDPOINTS.CHAT.CONVERSATION}/${conversationId}`);
  }

  /**
   * Regenerate last assistant message
   */
  async regenerateResponse(conversationId, userId) {
    return fetchWrapper.post(`${API_ENDPOINTS.CHAT.CONVERSATION}/${conversationId}/regenerate`, {
      user_id: userId,
    });
  }
}

export default new ChatApi();