import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuizState } from './hooks/useQuizState';
import { useQuizTimer } from './hooks/useQuizTimer';
import ProgressBar from './components/ProgressBar';
import QuizSidebar from './components/QuizSidebar';
import QuestionContent from './components/QuestionContent';
import QuizDialogs from './components/QuizDialogs';
import './QuizContainer.css';

/**
 * Main quiz container component managing the entire quiz flow
 * @param {string} moduleId - Module identifier
 * @param {string} courseTitle - Course title
 * @param {Array} moduleTopics - Topics for the module
 * @param {boolean} isPositionnement - Whether this is a positioning evaluation
 */
const QuizContainer = ({ moduleId, courseTitle, moduleTopics, isPositionnement }) => {
  const { t } = useTranslation();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [guideDialogOpen, setGuideDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  const {
    questions,
    currentQuestion,
    currentQuestionIndex,
    isLoading,
    error,
    isSubmitted,
    submissionResults,
    attemptedCount,
    flaggedCount,
    unattemptedCount,
    progressPercentage,
    saveCurrentAnswer,
    toggleFlag,
    submitQuiz,
    goToPrevQuestion,
    goToNextQuestion,
    updateQuestionUI,
  } = useQuizState(moduleId, courseTitle, moduleTopics, isPositionnement);

  const { timer } = useQuizTimer(isSubmitted, () => setConfirmDialogOpen(true));

  /**
   * Handles quiz submission initiation
   */
  const handleSubmit = () => {
    setConfirmDialogOpen(true);
  };

  /**
   * Confirms and processes quiz submission
   */
  const confirmSubmit = async () => {
    setConfirmDialogOpen(false);
    try {
      await submitQuiz();
      setSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      setErrorDialogOpen(true);
    }
  };

  /**
   * Handles view study guide action
   */
  const handleViewGuide = () => {
    setGuideDialogOpen(true);
  };

  /**
   * Handles MCQ option selection
   * @param {number} optionIndex - Selected option index
   */
  const handleOptionSelect = (optionIndex) => {
    if (isSubmitted) return;
    saveCurrentAnswer(optionIndex);
  };

  /**
   * Handles text area change for open questions
   * @param {Event} e - Input change event
   */
  const handleTextAreaChange = (e) => {
    if (isSubmitted) return;
    saveCurrentAnswer(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="quiz-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
          <img 
            src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnR0c3hzcG9rYnBqZXpkcHQ0bWY3dXNodTQ5amx3N2hpdHdhczE1YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/hvYaelBdwVvv7Gb3HL/giphy.gif" 
            alt="Loading..." 
            style={{ width: '150px', marginBottom: '15px' }}
          />
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="error-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
          <h2>{t('common.error')}</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <ProgressBar progressPercentage={progressPercentage} />
      
      <QuizSidebar
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        attemptedCount={attemptedCount}
        flaggedCount={flaggedCount}
        unattemptedCount={unattemptedCount}
        timer={timer}
        isSubmitted={isSubmitted}
        isLoading={isLoading}
        updateQuestionUI={updateQuestionUI}
        onSubmit={handleSubmit}
        onViewGuide={handleViewGuide}
        allQuestionsAnswered={unattemptedCount === 0}
      />

      <QuestionContent
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        isSubmitted={isSubmitted}
        handleOptionSelect={handleOptionSelect}
        handleTextAreaChange={handleTextAreaChange}
        goToPrevQuestion={goToPrevQuestion}
        goToNextQuestion={goToNextQuestion}
        toggleFlag={toggleFlag}
      />
      
      <QuizDialogs
        confirmDialogOpen={confirmDialogOpen}
        successDialogOpen={successDialogOpen}
        guideDialogOpen={guideDialogOpen}
        errorDialogOpen={errorDialogOpen}
        attemptedCount={attemptedCount}
        totalQuestions={questions.length}
        submissionResults={submissionResults}
        error={error}
        setConfirmDialogOpen={setConfirmDialogOpen}
        setSuccessDialogOpen={setSuccessDialogOpen}
        setGuideDialogOpen={setGuideDialogOpen}
        setErrorDialogOpen={setErrorDialogOpen}
        confirmSubmit={confirmSubmit}
      />
    </div>
  );
};

export default QuizContainer;