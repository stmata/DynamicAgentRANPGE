import React from 'react';
import { useTranslation } from 'react-i18next';
import './ModuleCard.css';

/**
 * Module card component with optimized navigation and topic count display
 * Uses local cache data instead of API calls
 */
const ModuleCard = ({ title, topicsCount = 0, onEvaluationCaseClick, onEvaluationClick }) => {
  const { t } = useTranslation();
  
  const cardTitle = title || t('courseModules.generalModule');
  
  return (
    <div className="cardModule-container">
      <div className="cardModule-icon">🎓</div>
      <h2 className="cardModule-title">{cardTitle}</h2>
      
      <div className="cardModule-document-count">
        <span className="cardModule-document-icon">📄</span>
        <span>{topicsCount}</span>
      </div>
      
      <div className="cardModule-buttons">
        <button 
          className="cardModule-btn chat" 
          onClick={onEvaluationCaseClick}
        >
          {t('courseModules.evaluation_case')}
        </button>
        <button 
          className="cardModule-btn eval" 
          onClick={onEvaluationClick}
        >
          {t('courseModules.evaluation')}
        </button>
      </div>
    </div>
  );
};

ModuleCard.defaultProps = {
  topicsCount: 0,
  onChatClick: () => {},
  onEvaluationClick: () => {}
};

export default ModuleCard;