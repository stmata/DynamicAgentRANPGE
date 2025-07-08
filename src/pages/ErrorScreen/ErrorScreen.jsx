import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import './ErrorScreen.css';

/**
 * Error screen component that displays a user-friendly 404 page not found interface.
 * Features an animated GIF, localized error messages, and navigation back to home.
 * Supports both light and dark theme modes and provides a visually appealing
 * error experience to prevent user frustration. Includes clear call-to-action
 * button to guide users back to the main application flow.
 * @returns {React.ReactElement} Error component with 404 handling and home navigation
 */
const ErrorScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();


  /**
   * Navigation handler function that redirects users back to the home page.
   * Uses React Router's navigate function with replace option to prevent
   * users from returning to the error page via browser back button.
   * Provides smooth recovery from error states and maintains clean navigation history.
   * Essential for user experience when recovering from 404 or routing errors.
   * @function
   */
  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className={`error-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="error-content">
        <div className="error-gif-container">
          <img 
            src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDhkbzdyNHQ1NDY0Y2hkN2xkazM1NjhoajA1OHRhcDR2aXgydmoyaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/FE9GxNvzyI1kizsFZF/giphy.gif"
            alt="404 Error Animation"
            className="error-gif"
          />
        </div>
        
        <div className="error-text-container">
          <h1 className="error-title">{t('error.title')}</h1>
          <p className="error-description">{t('error.description')}</p>
          
          <button 
            className="error-button"
            onClick={handleGoHome}
          >
            {t('error.goHomeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorScreen;