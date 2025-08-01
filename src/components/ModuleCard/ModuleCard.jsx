import { useTranslation } from 'react-i18next';
import './ModuleCard.css';

/**
 * Module card component with optimized navigation and topic count display
 * Uses local cache data instead of API calls
 */
const ModuleCard = ({ title, topicsCount = 0, isLocked = false, onEvaluationCaseClick, onEvaluationClick }) => {
  const { t } = useTranslation();
  
  const cardTitle = title || t('courseModules.generalModule');
  
  return (
    <div className={`cardModule-container ${isLocked ? 'locked' : ''}`}>
      <div className="cardModule-icon">{isLocked ? '🔒' : '🎓'}</div>
      <h2 className="cardModule-title">{cardTitle}</h2>
      
      <div className="cardModule-document-count">
        <span className="cardModule-document-icon">📄</span>
        <span>{topicsCount}</span>
      </div>
      
      {isLocked && (
        <div className="cardModule-locked-message">
          {t('courseModules.lockedMessage')}
        </div>
      )}
      
      <div className="cardModule-buttons">
        <button 
          className="cardModule-btn chat" 
          onClick={isLocked ? null : onEvaluationCaseClick}
          disabled={isLocked}
        >
          {t('courseModules.evaluation_case')}
        </button>
        <button 
          className="cardModule-btn eval" 
          onClick={isLocked ? null : onEvaluationClick}
          disabled={isLocked}
        >
          {t('courseModules.evaluation')}
        </button>
      </div>
    </div>
  );
};

ModuleCard.defaultProps = {
  topicsCount: 0,
  isLocked: false,
  onEvaluationCaseClick: () => {},
  onEvaluationClick: () => {}
};

export default ModuleCard;