import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Evaluation history card component displaying evaluation history for a course
 * 
 * @param {Object} props - Component props
 * @param {string} props.courseName - Name of the course
 * @param {Array} props.evaluations - Array of evaluation objects for this course
 * @returns {React.ReactElement} EvaluationHistoryCard component
 */
const EvaluationHistoryCard = ({ courseName, evaluations }) => {
  const { t } = useTranslation();

  /**
   * Get score class based on score value
   * @param {number} score - Score value
   * @returns {string} CSS class name
   */
  const getScoreClass = (score) => {
    if (score >= 50) return 'dash-excellent';
    if (score >= 30) return 'dash-good';
    return 'dash-needs-improvement';
  };

  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string
   */
  const formatDate = (date) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Sort evaluations by date (most recent first)
  const sortedEvaluations = [...evaluations].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateB - dateA;
  });

  const evaluationCards = sortedEvaluations.map((evaluation, index) => (
    <div 
      key={index}
      className={`dash-evaluation-card ${getScoreClass(evaluation.score)}`}
    >
      <div className="dash-eval-header">
        <span className="dash-eval-score">{evaluation.score} pts</span>
        <span className="dash-eval-date">
          {formatDate(evaluation.date)}
        </span>
      </div>
      <div className="dash-eval-module">
        {evaluation.module?.replace(/_/g, ' ') || 'Module non spécifié'}
      </div>
      <span className="dash-eval-type">
        {t(`dashboard.evaluationTypes.${evaluation.evaluation_type}`) || evaluation.evaluation_type}
      </span>
    </div>
  ));

  if (evaluations.length === 0) {
    return null;
  }

  return (
    <div className="dash-card">
      <div className="dash-course-header">
        <h3 className="dash-course-title">
          {t('dashboard.modulesHistory')} {courseName}
        </h3>
        <span className="dash-course-badge">
          {evaluations.length} {t('dashboard.evaluationsCount')}
        </span>
      </div>
      
      <div className="dash-evaluations-list">
        {evaluationCards}
      </div>
    </div>
  );
};

export default EvaluationHistoryCard; 