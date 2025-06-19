import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import './ErrorScreen.css';

/**
 * Error component for 404 page
 * 
 * @returns {React.ReactElement} Error component
 */
const ErrorScreen = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();

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