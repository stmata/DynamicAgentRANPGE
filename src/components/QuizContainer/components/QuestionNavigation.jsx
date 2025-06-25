import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Question navigation controls component
 * @param {Object} currentQuestion - Current question object
 * @param {number} currentQuestionIndex - Current question index
 * @param {number} totalQuestions - Total number of questions
 * @param {Function} goToPrevQuestion - Navigate to previous question
 * @param {Function} goToNextQuestion - Navigate to next question
 * @param {Function} onBackToModules - Navigate to Modules for current course
 */
const QuestionNavigation = ({
  //currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  goToPrevQuestion,
  goToNextQuestion,
  onBackToModules
}) => {
  const { t } = useTranslation();

  return (
    <div className="question-controls">
      <button 
        className="nav-button" 
        id="prev-btn" 
        onClick={goToPrevQuestion}
        disabled={currentQuestionIndex === 0}
      >
        <i className="fas fa-chevron-left"></i>
        <span>{t('evaluation.previousQuestion')}</span>
      </button>
      
      <button 
        className="flag-button" 
        id="flag-btn"
        onClick={onBackToModules}
      >
        <span>
          {/*currentQuestion?.flagged ? t('evaluation.unflag') : t('evaluation.flag')*/}
          <span>{t('common.backToModules')}</span>
        </span>
      </button>
      
      <button 
        className="nav-button" 
        id="next-btn"
        onClick={goToNextQuestion}
        disabled={currentQuestionIndex === totalQuestions - 1}
      >
        <span>{t('evaluation.nextQuestion')}</span>
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default QuestionNavigation; 