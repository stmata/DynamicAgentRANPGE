import { useTranslation, Trans } from 'react-i18next';
import { ChatMessage } from '../SharedChatComponents/SharedChatComponents';

/**
 * Evaluation content component that renders different content based on evaluation state
 * @param {Object} props - Component props
 * @param {string} props.evaluationState - Current evaluation state
 * @param {Array} props.messages - Array of messages
 * @param {string} props.userInitials - User initials for avatar
 * @param {boolean} props.isDarkMode - Dark mode state
 * @param {Function} props.onReferencesClick - References click handler
 * @param {Function} props.onStartEvaluation - Start evaluation handler
 * @param {boolean} props.evaluationLoading - Evaluation loading state
 * @param {string} props.evaluationError - Evaluation error message
 * @param {Object} props.EVALUATION_STATES - Evaluation states constants
 * @returns {JSX.Element} EvaluationContent component
 */
const EvaluationContent = ({
  evaluationState,
  messages,
  userInitials,
  isDarkMode,
  onReferencesClick,
  onStartEvaluation,
  evaluationLoading,
  evaluationError,
  EVALUATION_STATES
}) => {
  const { t } = useTranslation();

  switch (evaluationState) {
    case EVALUATION_STATES.WELCOME:
      return (
        <div className="chat-greeting">
          <span className="chat-greeting-emoji">📝</span>
          <h1 className="chat-greeting-title">{t('evaluation.case.welcome.title')}</h1>
          <Trans 
            i18nKey="evaluation.case.welcome.introBlock"
            components={{ 
              p: <p />, 
              ul: <ul />, 
              li: <li />,
              em: <em/> 
            }}
          />
          {evaluationError && (
            <div style={{ color: 'red', margin: '1rem 0' }}>
              {t('common.error')}: {evaluationError}
            </div>
          )}
          <button 
            className="chat-start-evaluation-btn"
            onClick={onStartEvaluation}
            disabled={evaluationLoading}
          >
            {evaluationLoading ? t('common.loading') : t('evaluation.case.welcome.startButton')}
          </button>
        </div>
      );
      
    case EVALUATION_STATES.LOADING_EVALUATION:
      return (
        <div className="chat-greeting">
          <img 
            src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGdzaWt2Z2FwZW43ZWxtamNreWFyY3k3N2drMWRtbjN0c3F6eWdzOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/hvYaelBdwVvv7Gb3HL/giphy.gif"
            alt={t('evaluation.case.loading.generating')}
            className="evaluation-loading-gif"
          />
          <h2 className="chat-greeting-title">{t('evaluation.case.loading.generating')}</h2>
        </div>
      );
      
    case EVALUATION_STATES.EVALUATION_ACTIVE:
    case EVALUATION_STATES.COMPLETED:
      return (
        <>
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              userInitials={userInitials}
              isDarkMode={isDarkMode}
              onReferencesClick={onReferencesClick}
            />
          ))}
        </>
      );
      
    case EVALUATION_STATES.LOADING_CORRECTION:
      return (
        <>
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              userInitials={userInitials}
              isDarkMode={isDarkMode}
              onReferencesClick={onReferencesClick}
            />
          ))}
          <div className="chat-message bot">
            <div className="chat-avatar bot">
              <img 
                src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2x4NGlwczVoYjl1NDNlbmkweXdmMjF2em9rZDg5N3VwdHptOW5mciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Kq5VRzXJfORmVRBUpr/giphy.gif"
                alt={t('evaluation.case.loading.correcting')}
                className="correction-loading-gif"
              />
            </div>
            <div className="chat-message-bubble">
              {t('evaluation.case.loading.correcting')}
            </div>
          </div>
        </>
      );
      
    default:
      return null;
  }
};

export default EvaluationContent; 