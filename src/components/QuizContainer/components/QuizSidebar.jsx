import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Quiz sidebar component containing questions navigation, summary, timer and actions
 * @param {Array} questions - Array of questions
 * @param {number} currentQuestionIndex - Current question index
 * @param {number} attemptedCount - Number of attempted questions
 * @param {number} flaggedCount - Number of flagged questions
 * @param {number} unattemptedCount - Number of unattempted questions
 * @param {string} timer - Timer display string
 * @param {boolean} isSubmitted - Whether quiz is submitted
 * @param {boolean} isLoading - Whether quiz is loading
 * @param {Function} updateQuestionUI - Update current question
 * @param {Function} onSubmit - Submit quiz handler
 * @param {Function} onViewGuide - View guide handler
 */
const QuizSidebar = ({
  questions,
  currentQuestionIndex,
  attemptedCount,
  flaggedCount,
  unattemptedCount,
  timer,
  isSubmitted,
  isLoading,
  updateQuestionUI,
  onSubmit,
  onViewGuide
}) => {
  const { t } = useTranslation();
  const [useResponsiveGrid, setUseResponsiveGrid] = useState(false);

  /**
   * Check window size for responsive layout
   */
  useEffect(() => {
    const checkSize = () => {
      if (typeof window !== 'undefined') {
        setUseResponsiveGrid(window.innerWidth <= 992 && window.innerWidth >= 769);
      }
    };

    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  /**
   * Groups questions for responsive layout
   */
  const getGroupedQuestions = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 992 && window.innerWidth >= 769) {
      const rows = [];
      for (let i = 0; i < questions.length; i += 4) {
        rows.push(questions.slice(i, i + 4));
      }
      return rows;
    }
    
    const rows = [];
    for (let i = 0; i < questions.length; i += 5) {
      rows.push(questions.slice(i, i + 5));
    }
    return rows;
  };

  const questionGroups = getGroupedQuestions();

  return (
    <div className="quiz-sidebar">
      <div className="sidebar-section">
        <h2><i className="fas fa-list-ol"></i> {t('evaluation.questions')}</h2>
        
        {useResponsiveGrid ? (
          <>
            {questionGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="questions-grid questions-grid-responsive">
                {group.map((question, index) => {
                  const actualIndex = groupIndex * 4 + index;
                  return (
                    <div 
                      key={question.id}
                      className={`question-circle ${question.attempted ? 'attempted' : ''} ${question.flagged ? 'flagged' : ''} ${actualIndex === currentQuestionIndex ? 'current' : ''}`}
                      onClick={() => updateQuestionUI(actualIndex)}
                    >
                      {actualIndex + 1}
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        ) : (
          <div className="questions-grid">
            {questions.map((question, index) => (
              <div 
                key={question.id}
                className={`question-circle ${question.attempted ? 'attempted' : ''} ${question.flagged ? 'flagged' : ''} ${index === currentQuestionIndex ? 'current' : ''}`}
                onClick={() => updateQuestionUI(index)}
              >
                {index + 1}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-section">
        <h2><i className="fas fa-check"></i> {t('evaluation.summary')}</h2>
        <div className="summary-container">
          <div className="summary-item">
            <span><i className="fas fa-check attempted-icon"></i> {t('evaluation.attempted')}</span>
            <span id="attempted-count">{attemptedCount}</span>
          </div>
          <div className="summary-item">
            <span><i className="fas fa-flag flagged-icon"></i> {t('evaluation.flagged')}</span>
            <span id="flagged-count">{flaggedCount}</span>
          </div>
          <div className="summary-item">
            <span><i className="fas fa-question-circle unattempted-icon"></i> {t('evaluation.unattempted')}</span>
            <span id="unattempted-count">{unattemptedCount}</span>
          </div>
        </div>
      </div>

      <div className="timer-section">
        <h2><i className="fas fa-hourglass-half"></i> {t('evaluation.timeRemaining')}</h2>
        <div className="timer-display" id="timer">{timer}</div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn btn-submit" 
          onClick={isSubmitted ? onViewGuide : onSubmit}
          disabled={isLoading}
        >
          <i className={isSubmitted ? "fas fa-book-open" : "fas fa-paper-plane"}></i>
          <span>{isSubmitted ? t('evaluation.viewGuide') : t('evaluation.submit')}</span>
        </button>
      </div>
    </div>
  );
};

export default QuizSidebar; 