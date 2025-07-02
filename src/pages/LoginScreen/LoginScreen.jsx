import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import logoImage from '../../assets/images/logo.png';
import microsoftIcon from '../../assets/images/microsoft.svg'
import './LoginScreen.css';

/**
 * Login component with Azure SSO authentication
 * 
 * @component
 * @returns {JSX.Element} Login page with Azure authentication
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


  useEffect(() => {
    clearError();
    setLocalError('');
  }, [clearError]);

  /**
   * Handle Azure SSO login button click
   * 
   * @async
   * @function handleAzureLogin
   * @param {Event} e - Form submit event
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