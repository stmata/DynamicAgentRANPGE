import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import logoImage from '../../assets/images/logo.png';
import microsoftIcon from '../../assets/images/microsoft.svg'
import './LoginScreen.css';

/**
 * Login screen component that provides Azure SSO authentication interface.
 * Displays a modern login form with Microsoft Azure integration, loading states,
 * error handling, and feature highlights. Supports both light and dark themes.
 * Handles authentication flow, user feedback, and provides visual appeal with
 * animations and illustrations to enhance user experience during login process.
 * @component
 * @returns {JSX.Element} Login page component with Azure authentication capabilities
 */
const LoginScreen = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { 
    loginWithAzureRedirect, 
    loading, 
    error, 
    clearError 
  } = useAuth();
  
  const [localError, setLocalError] = useState('');

  /**
     * Effect hook for cleaning up authentication errors on component mount.
     * Clears any existing authentication errors and local error states to ensure
     * a clean login experience. Prevents stale error messages from previous
     * authentication attempts from being displayed to users.
     * Runs once on component initialization to reset error states.
   */
  useEffect(() => {
    clearError();
    setLocalError('');
  }, [clearError]);

 /**
   * Handle Azure SSO login button click and initiate authentication flow.
   * Prevents default form submission, clears any existing error states,
   * and triggers the Azure AD redirect authentication process.
   * Provides clean error state management before starting authentication.
   * Essential for maintaining proper authentication flow and user feedback.
   * @async
   * @function
   * @param {Event} e - Form submit event to prevent default browser behavior
 */
  const handleAzureLogin = (e) => {
    e.preventDefault();
    clearError();
    setLocalError('');
    loginWithAzureRedirect();
  };
  const displayError = localError || error;

  return (
    <div className={`login-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="login-card">
        <div className="login-header">
          <h1>{t('login.title')}</h1>
          <p>{t('login.subtitle')}</p>
          <img width="250" src='https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnRrNTExdHB6cGVub3lmNWI2cDc5d2I4NHpzdXhianE3b3k4b2s2NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/dZ780yXLsSsNZsfIul/giphy.gif' alt="Animation" />
        </div>

        <div className="login-form-container">
          <div style={{marginBottom:"15px"}}>
            <img width={150} src={logoImage} alt="Logo"/>
          </div>
          <p className="login-description">
            {t('login.ssoDescription')}
          </p>

          {displayError && <div className="login-error">{displayError}</div>}
          <form onSubmit={handleAzureLogin} className="login-form">
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? (
                <span className="button-loader"></span>
              ) : (
                <>
                  <img src={microsoftIcon} width="30" height="30" alt="Microsoft" />
                  {t('login.azureLoginButton')}
                </>
              )}
            </button>
        </form>
        </div>

        <div className="login-footer">
          <div className="login-decoration login-divider"></div>
          <div className="login-illustration">
            <div className="illustration-content">
              <div className="illustration-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <span>📚💬</span>
                  </div>
                  <div className="feature-text">{t('login.featureChat')}</div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <span>📝</span>
                  </div>
                  <div className="feature-text">{t('login.featureEvaluation')}</div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <span>🎯</span>
                  </div>
                  <div className="feature-text">{t('login.featureProgress')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;