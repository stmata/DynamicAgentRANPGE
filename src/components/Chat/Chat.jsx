/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useChat } from '../../hooks/useChat';
import { useChatInterface } from '../../hooks/useChatInterface';
import { getUserInitials } from '../../utils/helpers';
import {
  ChatMessage,
  LoadingMessage,
  ChatInput,
  ProfileDropdown,
  ReferencesDialog
} from '../SharedChatComponents/SharedChatComponents';
import ChatSidebar from './ChatSidebar';
import DeleteConversationDialog from './DeleteConversationDialog';
import './Chat.css';

/**
 * Main chat component with conversation management and real-time messaging.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactElement} props.sidebarFloatingButton - FloatingChatButton component to render inside the sidebar on small screens.
 * @param {(open: boolean) => void} [props.onSidebarToggle] - Optional callback triggered when the sidebar open state changes.
 */
const Chat = ({ sidebarFloatingButton, onSidebarToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, conversationId: null });
  const [hasLoadedInitialConversations, setHasLoadedInitialConversations] = useState(false);
  const [lastLoadedConversationId, setLastLoadedConversationId] = useState(null);

  const { openSettings } = useSettings();
  const { isDarkMode } = useTheme();
  const { user, getUserId, logout } = useAuth();
  const { t } = useTranslation();

  const {
    isSidebarOpen,
    setIsSidebarOpen,
    isSmallScreen,
    isProfileOpen,
    setIsProfileOpen,
    showReferences,
    setShowReferences,
    currentReferences,
    inputMessage,
    setInputMessage,
    textareaRef,
    profileRef,
    chatContentRef,
    sidebarRef,
    toggleSidebar,
    handleReferencesClick
  } = useChatInterface();

  const {
    conversations,
    currentConversation,
    messages,
    loadingConversations,
    loadingMessages,
    sending,
    error,
    conversationsLoaded,
    loadConversation,
    sendMessage,
    createNewConversation,
    deleteConversation,
    getGroupedConversations,
    clearCurrentConversation,
    clearError,
    loadConversations
  } = useChat(getUserId());

  const userInitials = getUserInitials(user?.username || 'User');
  const { pinned, unpinned } = getGroupedConversations();

  const isWelcomePage = location.pathname === '/chat' && !conversationId && messages.length === 0 && !sending;

  /**
   * Notify when sidebar open state changes.
    *
    * @param {boolean} isSidebarOpen
    * @param {(open: boolean) => void} [onSidebarToggle]
    */
    useEffect(() => {
      if (onSidebarToggle) {
        onSidebarToggle(isSidebarOpen);
      }
    }, [isSidebarOpen, onSidebarToggle]);


  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages, chatContentRef]);

  /**
   * Load conversation when URL parameter changes
   */
  useEffect(() => {
    if (conversationId && conversationId !== lastLoadedConversationId && !sending) {
      loadConversation(conversationId);
      setLastLoadedConversationId(conversationId);
    } else if (!conversationId && currentConversation) {
      clearCurrentConversation();
      setLastLoadedConversationId(null);
    }
  }, [conversationId, loadConversation, clearCurrentConversation, currentConversation, lastLoadedConversationId, sending]);

  /**
   * Clear error state on component mount
   */
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  useEffect(() => {
    if (getUserId() && !hasLoadedInitialConversations && !conversationsLoaded) {
      loadConversations();
      setHasLoadedInitialConversations(true);
    }
  }, [getUserId, hasLoadedInitialConversations, conversationsLoaded, loadConversations]);

  /**
   * Send message to current conversation or create new one
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || sending) return;

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    const isFirstMessage = messages.length === 0;

    try {
      let targetConversationId = conversationId || currentConversation?.conversation_id;
      
      if (!targetConversationId) {
        targetConversationId = await createNewConversation();
      }

      const response = await sendMessage(messageToSend, targetConversationId);
      
      if (response.conversation_id && response.conversation_id !== conversationId) {
        setLastLoadedConversationId(response.conversation_id);
        navigate(`/chat/${response.conversation_id}`, { replace: true });
      }
      
      if (isFirstMessage || !conversationsLoaded) {
        await loadConversations(true);
      }
    } catch (error) {
      setInputMessage(messageToSend);
    }
  };

  /**
   * Create new chat conversation and navigate to it
   */
  const createNewChat = () => {
    clearCurrentConversation();
    setLastLoadedConversationId(null);
    navigate('/chat');
    if (isSmallScreen) setIsSidebarOpen(false);
  };

  /**
   * Handle conversation selection from sidebar
   */
  const handleConversationClick = async (conversation) => {
    try {
      if (conversation?.conversation_id) {
        navigate(`/chat/${conversation.conversation_id}`);
        if (isSmallScreen) setIsSidebarOpen(false);
      }
    } catch (error) {
      // Error handled by useChat hook
    }
  };

  /**
   * Open delete confirmation dialog
   */
  const handleDeleteConversation = async (conversationId, event) => {
    event.stopPropagation();
    if (!conversationId) {
      return;
    }
    setDeleteDialog({ open: true, conversationId });
  };

  /**
   * Confirm and execute conversation deletion
   */
  const confirmDeleteConversation = async () => {
    const { conversationId } = deleteDialog;
    setDeleteDialog({ open: false, conversationId: null });
    
    if (!conversationId) return;

    try {
      clearCurrentConversation();
      await deleteConversation(conversationId);
      setLastLoadedConversationId(null);
      navigate('/chat', { replace: true });
    } catch (error) {
      // Error handled by useChat hook
    }
  };

  /**
   * Cancel conversation deletion
   */
  const cancelDeleteConversation = () => {
    setDeleteDialog({ open: false, conversationId: null });
  };

  /**
   * Navigate to home page
   *
  const handleNavigateHome = () => {
    setIsProfileOpen(false);
    navigate('/');
  };*/

  /**
   * Navigate to Dahboard page
   */
  const handleNavigateDashboard = () => {
    setIsProfileOpen(false);
    navigate('/dashboard');
  };

  /**
   * Open settings modal
   */
  const handleOpenSettings = () => {
    setIsProfileOpen(false);
    openSettings();
  };

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Error handled by auth context
    }
  };

  return (
    <div className="chat-container">
      <ChatSidebar
        ref={sidebarRef}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        onNewChat={createNewChat}
        conversations={conversations}
        pinnedConversations={pinned}
        unpinnedConversations={unpinned}
        activeConversationId={conversationId}
        onConversationClick={handleConversationClick}
        onDeleteConversation={handleDeleteConversation}
        loading={loadingConversations}
        isSmallScreen={isSmallScreen}
        translation={t}
        floatingButton={sidebarFloatingButton}
      />

      <main className="chat-main-content">
        <header className="chat-header">
          <ProfileDropdown
            userInitials={userInitials}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            //onNavigateHome={handleNavigateHome}
            onNavigateDasboard={handleNavigateDashboard}
            onOpenSettings={handleOpenSettings}
            onLogout={handleLogout}
            profileRef={profileRef}
          />
        </header>

        <div className="chat-content" ref={chatContentRef}>
          {isWelcomePage ? (
            <div className="chat-greeting">
              <span className="chat-greeting-emoji">👋</span>
              <h1 className="chat-greeting-title">{t('chat.greeting.title')}</h1>
              <p className="chat-greeting-subtitle">{t('chat.greeting.subtitle')}</p>
              <p className="chat-greeting-subtitle">{t('chat.greeting.subtitleK2')}</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={{
                  type: message.role === 'user' ? 'user' : 'bot',
                  content: message.content,
                  references: message.references
                }}
                userInitials={userInitials}
                isDarkMode={isDarkMode}
                onReferencesClick={handleReferencesClick}
              />
            ))
          )}
          {sending && (
            <LoadingMessage userInitials={userInitials} />
          )}
        </div>

        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={handleSendMessage}
          isLoading={sending}
          textareaRef={textareaRef}
        />

        <ReferencesDialog
          showReferences={showReferences}
          setShowReferences={setShowReferences}
          currentReferences={currentReferences}
          isDarkMode={isDarkMode}
        />

        <DeleteConversationDialog
          open={deleteDialog.open}
          onClose={cancelDeleteConversation}
          onConfirm={confirmDeleteConversation}
        />
      </main>
    </div>
  );
};

export default Chat;