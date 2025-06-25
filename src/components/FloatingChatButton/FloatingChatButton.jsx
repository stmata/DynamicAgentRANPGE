import { HiMiniChatBubbleLeftRight, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const FloatingChatButton = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  /**
   * Navigate to chat page
   */
  const handleChatNavigation = () => {
    navigate('/chat');
  };

  const hiddenRoutes = ['/chat', '/login'];
  const isHidden = hiddenRoutes.some((path) => location.pathname.startsWith(path));
  if (isHidden) return null;

  const style = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    background: 'var(--primary-gradient)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 1000,
    boxShadow: isDarkMode ? 'var(--enhanced-shadow-dark)' : 'var(--enhanced-shadow-light)',
  };

  const iconColor = isDarkMode ? 'white' : '#ffffff';
  const iconSize = 26;

  return (
    <div
      style={style}
      onClick={handleChatNavigation}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)';
        e.currentTarget.style.boxShadow = isDarkMode
          ? 'var(--enhanced-shadow-hover-dark)'
          : 'var(--enhanced-shadow-hover-light)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = isDarkMode
          ? 'var(--enhanced-shadow-dark)'
          : 'var(--enhanced-shadow-light)';
      }}
    >
      {isDarkMode ? (
        <HiMiniChatBubbleLeftRight color={iconColor} size={iconSize} />
      ) : (
        <HiOutlineChatBubbleLeftRight color={iconColor} size={iconSize} />
      )}
    </div>
  );
};

export default FloatingChatButton;