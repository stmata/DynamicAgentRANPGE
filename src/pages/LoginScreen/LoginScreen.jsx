import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { validateEmail, validateVerificationCode } from '../../utils/helpers';
import logoImage from '../../assets/images/logo.png';
import './LoginScreen.css';

const LoginScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { 
    sendVerificationCode, 
    verifyCodeAndLogin, 
    loading, 
    error, 
    clearError 
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); 
  const [timer, setTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [localError, setLocalError] = useState('');
  const [redirectPath, setRedirectPath] = useState('/');

  useEffect(() => {
    setRedirectPath('/');
  }, [location.state]);

  useEffect(() => {
    let interval = null;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  useEffect(() => {
    clearError();
    setLocalError('');
  }, [step, clearError]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    clearError();
    setLocalError('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!validateEmail(normalizedEmail)) {
      setLocalError(t('login.errorSkemaDomain'));
      return;
    }

    try {
      await sendVerificationCode(normalizedEmail);
      setStep(2);
      setTimer(120);
      setIsTimerActive(true);
      console.log(`Verification code sent to ${normalizedEmail}`);
    } catch (err) {
      console.error('Failed to send verification code:', err);
      setLocalError(err.message || t('login.errorSendingCode'));
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();

    clearError();
    setLocalError('');

    if (!validateVerificationCode(verificationCode)) {
      setLocalError(t('login.errorInvalidCode'));
      return;
    }

    try {
      const response = await verifyCodeAndLogin(email, verificationCode);
      
      if (response) {
        navigate(redirectPath, { replace: true });
      } else {
        throw new Error(t('login.errorInvalidResponse'));
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setLocalError(err.message || t('login.errorInvalidCode'));
    }
  };

  const handleResendCode = async () => {
    clearError();
    setLocalError('');

    try {
      await sendVerificationCode(email);
      setTimer(60);
      setIsTimerActive(true);
      console.log(`Verification code resent to ${email}`);
    } catch (err) {
      console.error('Failed to resend verification code:', err);
      setLocalError(err.message || t('login.errorSendingCode'));
    }
  };

  const displayError = localError || error;

  return (
    <div className={`login-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="login-card">
        <div className="login-header">
          <h1>{t('login.title')}</h1>
          <p>{t('login.subtitle')}</p>
          <img width="250" src='https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnRrNTExdHB6cGVub3lmNWI2cDc5d2I4NHpzdXhianE3b3k4b2s2NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/dZ780yXLsSsNZsfIul/giphy.gif' />
        </div>

        {step === 1 ? (
          <div className="login-form-container">
            <div style={{marginBottom:"15px"}}>
              <img width={150} src={logoImage}/>
            </div>
            <p className="login-description">
              {t('login.welcomeDescription')}
            </p>

            {displayError && <div className="login-error">{displayError}</div>}

            <form onSubmit={handleEmailSubmit} className="login-form">
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('login.emailPlaceholder')}
                  required
                />
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? (
                  <span className="button-loader"></span>
                ) : (
                  t('login.requestCodeButton')
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="login-form-container">
            <div style={{marginBottom:"15px"}}>
              <img width={150} src={logoImage}/>
            </div>
            <p className="login-description">
              {t('login.verificationDescription')} <strong>{email}</strong>
            </p>

            {displayError && <div className="login-error">{displayError}</div>}

            <form onSubmit={handleCodeSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="code">{t('login.codeLabel')}</label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  placeholder={t('login.codePlaceholder')}
                  maxLength="6"
                  required
                />
              </div>

              <div className="timer-container">
                {isTimerActive ? (
                  <p>{t('login.expiresIn')} <span className="timer">{timer} {t('login.seconds')}</span></p>
                ) : (
                  <button
                    type="button"
                    className="resend-button"
                    onClick={handleResendCode}
                    disabled={loading}
                  >
                    {t('login.resendButton')}
                  </button>
                )}
              </div>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? (
                  <span className="button-loader"></span>
                ) : (
                  t('login.verifyButton')
                )}
              </button>

              <button
                type="button"
                className="back-button"
                onClick={() => setStep(1)}
              >
                {t('login.backButton')}
              </button>
            </form>
          </div>
        )}

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