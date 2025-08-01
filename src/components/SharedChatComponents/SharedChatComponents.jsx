/* eslint-disable react-refresh/only-export-components */
// SharedChatComponents.jsx - Composants partagés
import React from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  List, ListItem, ListItemText, Divider, Typography, Box
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTranslation } from 'react-i18next';
import SkemaAI from '../../assets/images/lesard.png';

// Icons partagés
export const Icons = {
  Plus: () => <span className="chat-icon">+</span>,
  Send: () => <span className="chat-icon">➤</span>,
  Mic: () => <span className="chat-icon">🎤</span>,
  ArrowLeft: () => <span className="chat-icon">←</span>,
  ArrowRight: () => <span className="chat-icon">→</span>,
  Options: () => <span className="chat-icon">⋯</span>,
  User: () => <span className="chat-icon">👤</span>,
  Settings: () => <span className="chat-icon">⚙️</span>,
  Logout: () => <span className="chat-icon">🚪</span>,
  ChevronDown: () => <span className="chat-icon">▼</span>,
  Delete: () => <span className="chat-icon">🗑️</span>,
  Download: () => <span className="chat-icon">⤓</span>,
  Rename: () => <span className="chat-icon">✎</span>,
  Pin: () => <span className="chat-icon">📌</span>,
  Close: () => <span className="chat-icon">✕</span>,
  Home: () => <span className="chat-icon">🏠</span>,
  Dashboard: () => <span className="chat-icon">📊</span>
};

// Composant pour le contenu des messages avec markdown
export const MessageContent = ({ content, isDarkMode }) => {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      remarkPlugins={[remarkMath]}
      components={{
        // eslint-disable-next-line no-unused-vars
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={isDarkMode ? vscDarkPlus : vs}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

// Composant pour les messages individuels
export const ChatMessage = ({ message, userInitials, isDarkMode, onReferencesClick }) => {
  const { t } = useTranslation();

  return (
    <div className={`chat-message ${message.type}`}>
      {message.type === 'bot' ? (
        <div className="chat-avatar bot">
          <img src={SkemaAI} alt="SkemaAI" className="chat-bot-avatar" />
        </div>
      ) : (
        <div className="chat-avatar user">{userInitials}</div>
      )}
      <div className="chat-message-bubble">
        <MessageContent content={message.content} isDarkMode={isDarkMode} />
        {message.references && message.references.length > 0 && (
          <button 
            className="chat-references-btn"
            onClick={() => onReferencesClick(message.references)}
          >
            {t('chat.viewReferences')}
          </button>
        )}
      </div>
    </div>
  );
};

// Composant pour l'état de chargement
// eslint-disable-next-line no-unused-vars
export const LoadingMessage = ({ userInitials, loadingText = "" }) => {
  return (
    <div className="chat-message bot">
      <div className="chat-avatar bot">
        <img src={SkemaAI} alt="SkemaAI" className="chat-bot-avatar" />
      </div>
      <div className="chat-message-bubble">
        {loadingText} <CircularProgress size="15px" color='red'/>
      </div>
    </div>
  );
};

// Composant pour l'input de chat
export const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  onSendMessage, 
  isLoading, 
  textareaRef,
  placeholder
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="chat-input-container">
      <div className="chat-textarea-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input-textarea"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={placeholder || t('chat.sendMessage')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          rows={1}
        />
        <button 
          className="chat-input-btn chat-send-btn" 
          onClick={onSendMessage}
          disabled={isLoading}
        >
          <Icons.Send />
        </button>
      </div>
    </div>
  );
};

// Composant pour le dropdown de profil
export const ProfileDropdown = ({ 
    userInitials, 
    isProfileOpen, 
    setIsProfileOpen, 
    onNavigateHome,
    onNavigateDasboard, 
    onOpenSettings, 
    onLogout, 
    profileRef 
  }) => {
    const { t } = useTranslation();

    // Gestion du clic en dehors pour fermer le dropdown
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (profileRef.current && !profileRef.current.contains(event.target)) {
          setIsProfileOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [profileRef, setIsProfileOpen]);
  
    return (
      <div className="chat-profile-dropdown" ref={profileRef}>
        <button className="chat-profile-btn" onClick={() => setIsProfileOpen(!isProfileOpen)}>
          {userInitials}
          <div className="chat-profile-arrow">
            <Icons.ChevronDown />
          </div>
        </button>
        
        {isProfileOpen && (
          <div className="chat-profile-menu">
           <div className="chat-menu-item" onClick={onNavigateHome}>
              <Icons.Home />
              <span>{t('common.home')}</span>
            </div>
           <div className="chat-menu-item" onClick={onNavigateDasboard}>
              <Icons.Dashboard />
              <span>{t('navbar.dashboard')}</span>
            </div>
            <div className="chat-menu-item" onClick={onOpenSettings}>
              <Icons.Settings />
              <span>{t('navbar.settings')}</span>
            </div>
            <div className="chat-menu-item" onClick={onLogout}>
              <Icons.Logout />
              <span>{t('navbar.logout')}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

// Composant pour la dialog des références
export const ReferencesDialog = ({ 
  showReferences, 
  setShowReferences, 
  currentReferences, 
  isDarkMode 
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog
      open={showReferences}
      onClose={() => setShowReferences(false)}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: '12px',
          background: isDarkMode ? 'var(--dark-white)' : 'var(--white)',
          color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontWeight: 600,
        borderBottom: '1px solid',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      }}>
        {t('chat.references')}
      </DialogTitle>
      <DialogContent>
        <List sx={{ pt: 0 }}>
          {currentReferences.map((ref, index) => (
            <Box key={index}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight={600}>
                      {ref.file_name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span" display="block">
                        {t('common.pages')}: {ref.page_label}
                      </Typography>
                      <Typography variant="body2" component="span" display="block">
                        {t('common.date')}: {formatDate(ref.upload_date)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < currentReferences.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ 
        borderTop: '1px solid',
        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
      }}>
        <Button 
          onClick={() => setShowReferences(false)}
          sx={{
            color: isDarkMode ? 'var(--dark-text)' : 'var(--text-dark)',
            '&:hover': {
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
            }
          }}
        >
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};