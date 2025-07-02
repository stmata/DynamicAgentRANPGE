import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Question navigation controls component
 * @param {Object} currentQuestion - Current question object
 * @param {number} currentQuestionIndex - Current question index
 * @param {number} totalQuestions - Total number of questions
 * @param {Function} goToPrevQuestion - Navigate to previous question
 * @param {Function} goToNextQuestion - Navigate to next question
 * @param {boolean} isSubmitted - Whether quiz is submitted
 * @param {Function} onSubmit - Submit quiz handler
 * @param {Function} onViewGuide - View guide handler
 * @param {boolean} allQuestionsAnswered - Whether all questions are answered
 */
const QuestionNavigation = ({
  //currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  isSubmitted,
  goToPrevQuestion,
  goToNextQuestion,
  onSubmit,
  onViewGuide,
  allQuestionsAnswered
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
        onClick={isSubmitted ? onViewGuide : onSubmit}
        disabled={!isSubmitted && !allQuestionsAnswered}
      >
        <span>
          {/*currentQuestion?.flagged ? t('evaluation.unflag') : t('evaluation.flag')*/}
          <span>{isSubmitted ? t('evaluation.viewGuide') : t('evaluation.submit')}</span>
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