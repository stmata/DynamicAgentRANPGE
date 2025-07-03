import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../contexts/SettingsContext';
import { useAuth } from '../../contexts/AuthContext';
import logoImage from '../../assets/images/logo_dark.png';
import './Navbar.css';

/**
 * Navbar component for all authenticated pages
 * 
 * @returns {React.ReactElement} Navbar component
 */
const Navbar = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { openSettings } = useSettings();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  //const location = useLocation();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  
  // Get username from auth context
  const username = user?.username || 'User';
  
  /**
   * Get user initials from username
   * 
   * @returns {string} User initials
   */
  const getInitials = () => {
    if (!username) return 'U';
    
    if (username.includes(' ')) {
      return username.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    if (username.includes('.')) {
      return username.split('.')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    
    return username.slice(0, 2).toUpperCase();
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Handle user logout using auth service
   */
  const handleLogout = async () => {
    try {
      await logout(); 
      setIsProfileOpen(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsProfileOpen(false);
      navigate('/login');
    }
  };

    /**
     * Navigate to home page
     *
    const handleHomeNavigation = () => {
      setIsProfileOpen(false);
      navigate('/');
    };*/

  return (
    <div className={`navbar ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="navbar-logo" /*onClick={() => navigate('/')}*/>
        <img src={logoImage} alt="Logo" className="logo-image" />
      </div>
      
      <div className="navbar-profile" ref={profileRef}>
        <div className="profile-trigger" onClick={toggleProfileDropdown}>
          <div className="profile-initials">
            {getInitials()}
          </div>
          <div className={`profile-arrow ${isProfileOpen ? 'up' : 'down'}`}>
            <span className={`arrow-icon ${isProfileOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></span>
          </div>
        </div>
        
        {isProfileOpen && (
          <div className="profile-dropdown">
            {/*location.pathname === '/dashboard' && (
              <div className="profile-dropdown-item" onClick={handleHomeNavigation}>
                <span className="fas fa-home"></span>
                <span>{t('common.home')}</span>
              </div>
            )*/}
            
            {/*<div className="profile-dropdown-item" onClick={() => {
              setIsProfileOpen(false);
              navigate('/dashboard');
            }}>
              <span className="fas fa-dashboard"></span>
              <span>{t('navbar.dashboard')}</span>
            </div>*/}
            
            <div className="profile-dropdown-item" onClick={() => {
              setIsProfileOpen(false);
              openSettings();
            }}>
              <span className="fas fa-cog"></span>
              <span>{t('navbar.settings')}</span>
            </div>
            
            {/*<div className="profile-dropdown-item logout" onClick={() => {
              handleLogout();
            }}>
              <span className="fas fa-sign-out-alt"></span>
              <span>{t('navbar.logout')}</span>
            </div>*/}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;