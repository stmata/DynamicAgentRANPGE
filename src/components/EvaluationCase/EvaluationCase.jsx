import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../contexts/SettingsContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEvaluationFlow } from '../../hooks/useEvaluationFlow';
import { getUserInitials } from '../../utils/helpers';
import { generateEvaluationCasePDF } from '../../utils/pdfGenerator';
import { API_CONFIG } from '../../utils/constants';
import {
  ChatInput,
  ProfileDropdown,
  ReferencesDialog
} from '../SharedChatComponents/SharedChatComponents';
import EvaluationContent from './EvaluationContent';
import "./EvaluationCase.css"

/**
 * EvaluationCase component for handling case-based evaluations
 * @param {Object} props - Component props
 * @param {string} props.moduleId - Module identifier
 * @param {string} props.courseTitle - Course title
 * @returns {JSX.Element} EvaluationCase component
 */
const EvaluationCase = ({ moduleId, courseTitle }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [currentReferences, setCurrentReferences] = useState([]);

  const textareaRef = useRef(null);
  const profileRef = useRef(null);
  const chatContentRef = useRef(null);
  
  const { openSettings } = useSettings();
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  
  const {
    messages,
    evaluationState,
    isInputDisabled,
    evaluationLoading,
    evaluationError,
    startEvaluation,
    submitEvaluationResponse,
    EVALUATION_STATES
  } = useEvaluationFlow(moduleId, courseTitle);

  const userInitials = getUserInitials(user?.username);

  /**
   * Auto-resize textarea based on content
   */
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [inputMessage]);

  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [messages]);

  /**
   * Handle submission of evaluation response
   */
  const handleSendEvaluationResponse = async () => {
    if (!inputMessage.trim()) return;

    const response = inputMessage.trim();
    setInputMessage('');
    await submitEvaluationResponse(response);
  };

  /**
   * Handle PDF download for evaluation case
   */
  const handleDownloadEvaluationPDF = async () => {
    try {
      if (!messages || messages.length === 0) {
        console.error('No conversation messages available for PDF generation');
        return;
      }
      
      await generateEvaluationCasePDF(messages, moduleId, courseTitle);
    } catch (error) {
      console.error('Error downloading evaluation case PDF:', error);
    }
  };

  /**
   * Handle references click event
   * @param {Array} references - Array of reference objects
   */
  const handleReferencesClick = (references) => {
    setCurrentReferences(references);
    setShowReferences(true);
  };

  /**
   * Navigate to home page
   *
  const handleNavigateHome = () => {
    setIsProfileOpen(false);
    navigate('/');
  };*/

  /**
   * Open settings dialog
   */
  const handleOpenSettings = () => {
    setIsProfileOpen(false);
    openSettings();
  };

  /**
   * Navigate to Dahboard page
   */
  const handleNavigateDashboard = () => {
    setIsProfileOpen(false);
    navigate('/dashboard');
  };

  /**
   * Handle user logout
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

  const handleBackToCourseModules = () => {
    //navigate(`/course-modules?course=${encodeURIComponent(courseTitle)}`);
    window.location.href = API_CONFIG.BACKTOK2;
  };

  return (
    <div className="chat-container">
      <main className="chat-main-content">
        <header className="chat-header">
          <ProfileDropdown
            userInitials={userInitials}
            isProfileOpen={isProfileOpen}
            setIsProfileOpen={setIsProfileOpen}
            //onNavigateHome={handleNavigateHome}
            onNavigateDasboard={handleNavigateDashboard}
            onOpenSettings={handleOpenSettings}
            onLogout={handleLogout}
            profileRef={profileRef}
          />
        </header>

        <div className="chat-content" ref={chatContentRef}>
          <EvaluationContent
            evaluationState={evaluationState}
            messages={messages}
            userInitials={userInitials}
            isDarkMode={isDarkMode}
            onReferencesClick={handleReferencesClick}
            onStartEvaluation={startEvaluation}
            evaluationLoading={evaluationLoading}
            evaluationError={evaluationError}
            EVALUATION_STATES={EVALUATION_STATES}
          />
        </div>

        {evaluationState === EVALUATION_STATES.EVALUATION_ACTIVE && (
          <ChatInput
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendMessage={handleSendEvaluationResponse}
            isLoading={false}
            disabled={isInputDisabled}
            textareaRef={textareaRef}
            placeholder={t('evaluation.case.placeholders.responseInput')}
          />
        )}

        {evaluationState === EVALUATION_STATES.COMPLETED && (
          <div className="chat-input-container">
            <div className="evaluation-completed-actions">
              <button 
                className="evaluation-download-pdf-btn"
                onClick={handleDownloadEvaluationPDF}
              >
                📄 {t('common.download_pdf')}
              </button>
              <button 
                className="evaluation-back-to-modules-btn"
                onClick={handleBackToCourseModules}
              >
                {t('common.backToK2')}
              </button>
            </div>
          </div>
        )}

        <ReferencesDialog
          showReferences={showReferences}
          setShowReferences={setShowReferences}
          currentReferences={currentReferences}
          isDarkMode={isDarkMode}
        />
      </main>
    </div>
  );
};

export default EvaluationCase;