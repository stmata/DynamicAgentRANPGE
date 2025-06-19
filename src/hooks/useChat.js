import { useState, useEffect, useCallback, useRef } from 'react';
import chatApi from '../services/chatApi.js';

/**
 * Chat hook for managing conversations and messages with simplified caching approach
 * @param {string} userId - Current authenticated user ID
 * @returns {Object} Chat state and methods
 */
export const useChat = (userId = null) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  
  const sendPromiseRef = useRef(null);

  /**
   * Load user conversations from API with error handling
   * @param {boolean} forceRefresh - Force API call even if data exists
   * @returns {Promise<Array>} Array of conversations
   */
  const loadConversations = useCallback(async (forceRefresh = false) => {
    if (!userId) {
      return;
    }

    if (!forceRefresh && conversationsLoaded) {
      return conversations;
    }

    try {
      setError(null);
      setLoadingConversations(true);
      
      const response = await chatApi.getUserConversations(userId, 50);
      
      let allConversations = [];
      
      if (response.pinned_conversations && Array.isArray(response.pinned_conversations)) {
        allConversations = [...allConversations, ...response.pinned_conversations];
      }
      
      if (response.unpinned_conversations && Array.isArray(response.unpinned_conversations)) {
        allConversations = [...allConversations, ...response.unpinned_conversations];
      }
      
      const validConversations = allConversations.filter(conv => 
        conv && (conv.conversation_id || conv.id)
      );
      
      const normalizedConversations = validConversations.map(conv => ({
        ...conv,
        conversation_id: conv.conversation_id || conv.id
      }));
      
      setConversations(normalizedConversations);
      setConversationsLoaded(true);
      
      return normalizedConversations;
      
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
      throw err;
    } finally {
      setLoadingConversations(false);
    }
  }, [userId, conversationsLoaded, conversations]);

  /**
   * Load specific conversation with messages from API
   * @param {string} conversationId - Conversation ID to load
   * @returns {Promise<Object>} Conversation data with messages
   */
  const loadConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      setCurrentConversation(null);
      setMessages([]);
      return;
    }

    try {
      setError(null);
      setLoadingMessages(true);
      
      const conversation = await chatApi.getConversationWithMessages(conversationId);
      
      setCurrentConversation(conversation);
      setMessages(conversation.messages || []);
      
      return conversation;
      
    } catch (err) {
      setError(err.message || 'Failed to load conversation');
      throw err;
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  /**
   * Send message to conversation with optimistic updates
   * @param {string} message - Message content to send
   * @param {string} conversationId - Target conversation ID (optional)
   * @returns {Promise<Object>} API response with conversation data
   */
  const sendMessage = useCallback(async (message, conversationId = null) => {
    if (!userId || !message.trim()) {
      return;
    }

    if (sendPromiseRef.current) {
      return sendPromiseRef.current;
    }

    const userMessage = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      setError(null);
      setSending(true);
      
      setMessages(prev => [...prev, userMessage]);
      
      sendPromiseRef.current = chatApi.sendMessage(userId, message.trim(), conversationId);
      const response = await sendPromiseRef.current;
      
      if (response.conversation_id) {
        const assistantMessage = {
          id: response.assistant_message_id || `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString(),
          references: response.references || [],
        };
        
        setMessages(prev => {
          const filteredMessages = prev.filter(msg => msg.id !== userMessage.id);
          return [
            ...filteredMessages,
            {
              ...userMessage,
              id: response.user_message_id || userMessage.id,
            },
            assistantMessage,
          ];
        });
        
        setCurrentConversation(prev => ({
          ...prev,
          conversation_id: response.conversation_id,
          updated_at: new Date().toISOString(),
        }));
      }
      
      return response;
      
    } catch (err) {
      setError(err.message || 'Failed to send message');
      
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      throw err;
    } finally {
      setSending(false);
      sendPromiseRef.current = null;
    }
  }, [userId]);

  /**
   * Create new conversation and return its ID
   * @returns {Promise<string>} New conversation ID
   */
  const createNewConversation = useCallback(async () => {
    try {
      const response = await chatApi.generateNewConversationId();
      return response.conversation_id;
    } catch (err) {
      setError(err.message || 'Failed to create new conversation');
      throw err;
    }
  }, []);

  /**
   * Update conversation metadata (title, pin status, etc.)
   * @param {string} conversationId - Conversation ID to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated conversation data
   */
  const updateConversation = useCallback(async (conversationId, updateData) => {
    try {
      setError(null);
      
      const updatedConversation = await chatApi.updateConversation(conversationId, updateData);
      
      if (currentConversation?.conversation_id === conversationId) {
        setCurrentConversation(updatedConversation);
      }
      
      setConversations(prev => 
        prev.map(conv => 
          conv.conversation_id === conversationId 
            ? { ...conv, ...updateData }
            : conv
        )
      );
      
      return updatedConversation;
      
    } catch (err) {
      setError(err.message || 'Failed to update conversation');
      throw err;
    }
  }, [currentConversation]);

  /**
   * Toggle conversation pin status
   * @param {string} conversationId - Conversation ID to toggle pin
   * @returns {Promise<boolean>} New pin status
   */
  const togglePinConversation = useCallback(async (conversationId) => {
    try {
      setError(null);
      
      const response = await chatApi.togglePinConversation(conversationId);
      
      setConversations(prev => 
        prev.map(conv => 
          conv.conversation_id === conversationId 
            ? { ...conv, is_pinned: response.is_pinned }
            : conv
        )
      );
      
      return response.is_pinned;
      
    } catch (err) {
      setError(err.message || 'Failed to toggle pin');
      throw err;
    }
  }, []);

  /**
   * Delete conversation from server and local state
   * @param {string} conversationId - Conversation ID to delete
   * @returns {Promise<void>}
   */
  const deleteConversation = useCallback(async (conversationId) => {
    if (!conversationId) {
      throw new Error('Conversation ID is required');
    }

    try {
      setError(null);

      await chatApi.deleteConversation(conversationId);

      setConversations(prev => 
        prev.filter(conv => conv.conversation_id !== conversationId)
      );

      if (currentConversation?.conversation_id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }

    } catch (err) {
      setError(err.message || 'Failed to delete conversation');
      throw err;
    }
  }, [currentConversation]);

  /**
   * Regenerate last assistant response in conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} New response data
   */
  const regenerateResponse = useCallback(async (conversationId) => {
    if (!userId || !conversationId) {
      return;
    }

    try {
      setError(null);
      setSending(true);
      
      const response = await chatApi.regenerateResponse(conversationId, userId);
      
      const updatedMessages = messages.slice(0, -1);
      updatedMessages.push({
        id: response.assistant_message_id || `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
        references: response.references || [],
      });
      
      setMessages(updatedMessages);
      
      return response;
      
    } catch (err) {
      setError(err.message || 'Failed to regenerate response');
      throw err;
    } finally {
      setSending(false);
    }
  }, [userId, messages]);

  /**
   * Clear current conversation state
   */
  const clearCurrentConversation = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
  }, []);

  /**
   * Get conversations grouped by pin status for sidebar display
   * @returns {Object} Object with pinned and unpinned conversation arrays
   */
  const getGroupedConversations = useCallback(() => {
    const pinned = conversations.filter(conv => conv.is_pinned);
    const unpinned = conversations.filter(conv => !conv.is_pinned);
    
    return { pinned, unpinned };
  }, [conversations]);

  /**
   * Initialize chat data when userId changes
   */
  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      setConversationsLoaded(false);
    }
  }, [userId]);

  /**
   * Setup event listeners for auth state changes
   */
  useEffect(() => {
    const handleAuthLogout = () => {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
      setConversationsLoaded(false);
    };

    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, []);

  return {
    conversations,
    currentConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sending,
    error,
    conversationsLoaded,
    loadConversations,
    loadConversation,
    sendMessage,
    createNewConversation,
    updateConversation,
    togglePinConversation,
    deleteConversation,
    regenerateResponse,
    clearCurrentConversation,
    getGroupedConversations,
    clearError: () => setError(null),
  };
};

export default useChat;