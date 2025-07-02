import { HiMiniChatBubbleLeftRight, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import LogoK2 from "../../assets/images/K2.png";
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { API_CONFIG } from '../../utils/constants';

/**
 * Floating action button that can either navigate to chat or redirect to K2 Skema
 * @param {boolean} isK2Mode - When true, shows K2 logo and redirects to Skema. When false, shows chat icons and navigates to chat
 * @param {boolean} intoSidebar - When true, positions button on bottom left. When false, positions on bottom right
 */
const FloatingChatButton = ({ isK2Mode = false, intoSidebar = false }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  /**
   * Handle button click navigation based on mode
   */
  const handleNavigation = () => {
    if (isK2Mode) {
      //window.open('https://k2.skema.edu/my/', '_blank', 'noopener,noreferrer');
      window.location.href = API_CONFIG.BACKTOK2;
    } else {
      navigate('/chat');
    }
  };

  /**
   * Determine if button should be hidden based on current route and mode
   * @returns {boolean} True if button should be hidden, false otherwise
   */
  const getIsHidden = () => {
    // List of valid application routes
    const validRoutes = [
      '/',
      '/dashboard',
      '/evaluation',
      '/course-modules',
      '/chat',
      '/evaluation-case',
      '/login'
    ];
    
    // Check if current path matches a valid route or sub-route
    const isValidRoute = validRoutes.some(route => {
      if (route === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(route);
    });
    
    // Hide button if not on a valid route (404 error page)
    if (!isValidRoute) {
      return true;
    }

    if (isK2Mode) {
      return !location.pathname.startsWith('/chat');
    } else {
      const hiddenRoutes = ['/chat', '/login'];
      return hiddenRoutes.some((path) => location.pathname.startsWith(path));
    }
  };

  if (getIsHidden()) return null;

  /*const style = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '45px',
    height: '45px',
    background: 'var(--primary-gradient)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    zIndex: 1000,
    boxShadow: isDarkMode ? 'var(--enhanced-shadow-dark)' : 'var(--enhanced-shadow-light)',
  };*/
  const style = {
    position: 'fixed',
    bottom: '24px',
    ...(intoSidebar ? { left: '24px' } : { right: '24px' }),
    width: '45px',
    height: '45px',
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
  const logoK2Size = 60;

  /**
   * Render appropriate content based on mode
   */
  const renderContent = () => {
    if (isK2Mode) {
      return (
        <img
          src={LogoK2}
          alt="K2 Skema"
          style={{
            width: logoK2Size,
            height: logoK2Size,
            objectFit: 'contain',
          }}
        />
      );
    }

    return isDarkMode ? (
      <HiMiniChatBubbleLeftRight color={iconColor} size={iconSize} />
    ) : (
      <HiOutlineChatBubbleLeftRight color={iconColor} size={iconSize} />
    );
  };

  return (
    <div
      style={style}
      onClick={handleNavigation}
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
      {renderContent()}
    </div>
  );
};

export default FloatingChatButton;