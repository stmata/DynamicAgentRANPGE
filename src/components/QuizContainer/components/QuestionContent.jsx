import React from 'react';
import { useTranslation } from 'react-i18next';
import QuestionNavigation from './QuestionNavigation';

/**
 * Question content component displaying question and answer options
 * @param {Object} currentQuestion - Current question object
 * @param {number} currentQuestionIndex - Current question index
 * @param {number} totalQuestions - Total number of questions
 * @param {boolean} isSubmitted - Whether quiz is submitted
 * @param {Function} handleOptionSelect - Handle MCQ option selection
 * @param {Function} handleTextAreaChange - Handle text area change
 * @param {Function} goToPrevQuestion - Navigate to previous question
 * @param {Function} goToNextQuestion - Navigate to next question
 * @param {Function} toggleFlag - Toggle flag for current question
 */
const QuestionContent = ({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  isSubmitted,
  handleOptionSelect,
  handleTextAreaChange,
  goToPrevQuestion,
  goToNextQuestion,
  toggleFlag
}) => {
  const { t } = useTranslation();

  if (!currentQuestion) return null;

  return (
    <div className="question-content">
      <span className={`question-type ${currentQuestion.type === 'open' ? 'open' : ''}`}>
        {currentQuestion.type === 'mcq' ? t('evaluation.multipleChoice') : t('evaluation.openEnded')}
      </span>
      <h2 className="question-title">Q. {currentQuestion.title}</h2>

      {currentQuestion.type === 'mcq' && (
        <div className="options-container" id="mcq-container">
          {currentQuestion.options.map((option, index) => {
            const isUserAnswer = isSubmitted ? 
              currentQuestion.userAnswerIndex === index : 
              currentQuestion.answerIndex === index;
            
            const isCorrectAnswer = isSubmitted && currentQuestion.correctOptionIndex === index;
            const isIncorrectSelection = isSubmitted && isUserAnswer && !currentQuestion.isCorrect;
            
            return (
              <div 
                key={index} 
                className={`option-item 
                  ${isUserAnswer ? 'selected' : ''} 
                  ${isCorrectAnswer ? 'correct' : ''}
                  ${isIncorrectSelection ? 'incorrect' : ''}
                `}
                onClick={() => !isSubmitted && handleOptionSelect(index)}
              >
                <div className="custom-radio"></div>
                <span className="option-text">{option}</span>
                {isSubmitted && isCorrectAnswer && (
                  <span className="correct-indicator"><i className="fas fa-check"></i></span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {currentQuestion.type === 'open' && (
        <div id="open-container">
          <textarea 
            className="answer-textarea" 
            id="answer-textarea" 
            placeholder={t('evaluation.enterYourAnswer')}
            value={currentQuestion.answer || ''}
            onChange={handleTextAreaChange}
            readOnly={isSubmitted}
          ></textarea>
          
          {isSubmitted && currentQuestion.submissionResult && (
            <>
              <div className="model-answer">
                <p className="model-answer-title">{t('evaluation.modelAnswer')}:</p>
                <p className="model-answer-content">{currentQuestion.submissionResult.model_answer}</p>
              </div>
              
              <div className="open-feedback">
                <div className="open-feedback-header">
                  <span className="open-feedback-title">{t('evaluation.feedback')}</span>
                  <span className="open-feedback-grade">{currentQuestion.submissionResult.grade}/10</span>
                </div>
                <p className="open-feedback-content">{currentQuestion.submissionResult.feedback}</p>
              </div>
            </>
          )}
        </div>
      )}

      <QuestionNavigation
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        goToPrevQuestion={goToPrevQuestion}
        goToNextQuestion={goToNextQuestion}
        toggleFlag={toggleFlag}
      />
    </div>
  );
};

export default QuestionContent; 