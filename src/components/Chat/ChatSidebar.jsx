import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Icons } from '../SharedChatComponents/SharedChatComponents';
import { getConversationTitle, getConversationTime, normalizeConversation } from '../../utils/helpers';
import logo_dark from '../../assets/images/logo_dark.png';
import logo_light from '../../assets/images/logo_light.png';

/**
 * Chat sidebar component with conversations list
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether sidebar is open
 * @param {Function} props.onToggle - Toggle sidebar handler
 * @param {Function} props.onNewChat - New chat handler
 * @param {Array} props.conversations - Array of conversations
 * @param {Array} props.pinnedConversations - Array of pinned conversations
 * @param {Array} props.unpinnedConversations - Array of unpinned conversations
 * @param {string} props.activeConversationId - Currently active conversation ID
 * @param {Function} props.onConversationClick - Conversation click handler
 * @param {Function} props.onDeleteConversation - Delete conversation handler
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.isSmallScreen - Small screen state
 * @param {Function} props.translation - Translation function from useTranslation
 * @param {React.ReactElement} props.floatingButton - FloatingChatButton component to render inside sidebar
 * @param {React.Ref} ref - Ref for the sidebar element
 * @returns {JSX.Element} ChatSidebar component
 */
const ChatSidebar = forwardRef(({
  isOpen,
  onToggle,
  onNewChat,
  conversations,
  pinnedConversations,
  unpinnedConversations,
  activeConversationId,
  onConversationClick,
  onDeleteConversation,
  loading,
  translation,
  //floatingButton
}, ref) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  /**
   * Render individual conversation item in sidebar
   * @param {Object} conversation - Conversation object
   * @returns {JSX.Element|null} Conversation item component
   */
  const renderConversationItem = (conversation) => {
    const normalizedConversation = normalizeConversation(conversation);
    if (!normalizedConversation) {
      return null;
    }
    
    const convId = normalizedConversation.conversation_id;
    const isActive = activeConversationId && activeConversationId === convId;
    
    return (
      <div
        key={convId}
        className={`chat-item ${isActive ? 'chat-active' : ''}`}
        onClick={() => onConversationClick(normalizedConversation)}
      >
        <div className="chat-title">
          {getConversationTitle(normalizedConversation)}
          <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>
            {getConversationTime(normalizedConversation)}
          </div>
        </div>
        <div className="chat-options">
          <button
            onClick={(e) => onDeleteConversation(convId, e)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            🗑️
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <aside 
        ref={ref}
        className={`chat-sidebar ${!isOpen ? 'chat-sidebar-collapsed' : 'active'}`}
      >
        <div className="chat-sidebar-header">
          <div className="chat-logo" onClick={() => navigate('/')}>
            <img src={isDarkMode ? logo_dark : logo_light} alt="Logo" className="chat-logo-img" />
          </div>
          <button className="chat-sidebar-toggle" onClick={onToggle}>
            <Icons.ArrowLeft />
          </button>
        </div>
        
        <button className="chat-new-btn" onClick={onNewChat}>
          <Icons.Plus />
          <span>{translation('chat.sidebar.newChat')}</span>
        </button>

        <div className="chat-chats-list">
          {loading && (
            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6, fontSize: '14px' }}>
              
            </div>
          )}
          
          {!loading && (
            <>
              {pinnedConversations.length > 0 && (
                <>
                  <div className="chat-category">{translation('chat.sidebar.pinned')}</div>
                  {pinnedConversations.map(renderConversationItem)}
                </>
              )}
              
              {unpinnedConversations.length > 0 && (
                <>
                  <div className="chat-category">{translation('chat.sidebar.recent')}</div>
                  {unpinnedConversations.map(renderConversationItem)}
                </>
              )}
              
              {conversations.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6, fontSize: '14px' }}>
                </div>
              )}
            </>
          )}
        </div>
        {/* FloatingChatButton for small screens */}
        {/*floatingButton*/}
      </aside>

      {!isOpen && (
        <button className="chat-sidebar-toggle-collapsed" onClick={onToggle}>
          <Icons.ArrowRight />
        </button>
      )}
    </>
  );
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar; 