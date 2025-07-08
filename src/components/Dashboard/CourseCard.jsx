import React from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

/**
 * Course progress card component
 * @param {Object} props - Component props
 * @param {string} props.courseName - Name of the course
 * @param {Object} props.courseData - Course progress data
 * @param {Array} props.evaluations - User evaluations for this course
 * @returns {React.ReactElement} CourseCard component
 */
const CourseCard = ({ courseName, courseData, evaluations }) => {
  const { t } = useTranslation();

  /**
   * Get status color based on test status
   * @param {string} status - Test status
   * @returns {string} CSS color class
   */
  const getStatusColor = (status) => {
    switch(status) {
      case 'passed': return 'dashboard-status-passed';
      case 'failed': return 'dashboard-status-failed';
      default: return 'dashboard-status-not-attempted';
    }
  };

  /**
   * Get status icon based on test status
   * @param {string} status - Test status
   * @returns {React.ReactElement} Status icon
   */
  const getStatusIcon = (status) => {
    switch(status) {
      case 'passed': return <CheckCircle className="dashboard-status-icon" />;
      case 'failed': return <XCircle className="dashboard-status-icon" />;
      default: return <AlertCircle className="dashboard-status-icon" />;
    }
  };

  /**
   * Get status text based on test status
   * @param {string} status - Test status
   * @returns {string} Translated status text
   */
  const getStatusText = (status) => {
    switch(status) {
      case 'passed': return t('dashboard.status.passed');
      case 'failed': return t('dashboard.status.failed');
      default: return t('dashboard.status.notAttempted');
    }
  };

  /**
   * Format score display - show "00/00" if no score available
   * @param {number|null} score - Score value
   * @returns {string} Formatted score
   */
  const formatScore = (score) => {
    if (score === null || score === undefined) {
      return '00/00';
    }
    
    if (typeof score === 'string' && score.includes('/')) {
      return score;
    }
    
    const roundedScore = Math.round(Number(score) * 100) / 100;
    return `${roundedScore}/100`;
  };

  const evaluationTypes = ['positionnement', 'module_mixed', 'module_case', 'finale'];
  const progressPercentage = Math.round((courseData.unlocked_modules / courseData.total_modules) * 100);

  return (
    <div className="dashboard-course-card">
      <div className="dashboard-course-header">
        <h3 className="dashboard-course-title">
          <BookOpen className="dashboard-course-icon" />
          {courseName}
        </h3>
      </div>
      
      <div className="dashboard-course-content">
        <div className="dashboard-test-section">
          <div className="dashboard-test-header">
            <h4 className="dashboard-test-title">
              {getStatusIcon(courseData.positionnement_test.status)}
              {t('dashboard.positioningTest')}
            </h4>
            <span className={`dashboard-status-badge ${getStatusColor(courseData.positionnement_test.status)}`}>
              {getStatusText(courseData.positionnement_test.status)}
            </span>
          </div>
          <div className="dashboard-test-details">
            <span>{t('dashboard.score')}: {formatScore(courseData.positionnement_test.score)}</span>
            <span>{t('dashboard.attempts')}: {courseData.positionnement_test.attempts}</span>
          </div>
        </div>

        <div className="dashboard-progress-section">
          <h4 className="dashboard-section-title">{t('dashboard.moduleProgress')}</h4>
          <div className="dashboard-progress-details">
            <div className="dashboard-progress-text">
              <span>{t('dashboard.unlockedModules')}</span>
              <span className="dashboard-progress-numbers">
                {courseData.unlocked_modules}/{courseData.total_modules}
              </span>
            </div>
            <div className="dashboard-progress-bar">
              <div 
                className="dashboard-progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="dashboard-progress-footer">
              {/*<span>{t('dashboard.completed')}: {courseData.completed_modules}</span>*/}
              <span>{progressPercentage}%</span>
            </div>
          </div>
        </div>

        <div className="dashboard-evaluations-section">
          <h4 className="dashboard-section-title">{t('dashboard.courseEvaluations')}</h4>
          <div className="dashboard-evaluation-types">
            {evaluationTypes.map(type => {
              const count = evaluations.filter(e => e.evaluation_type === type).length;
              return (
                <div key={type} className="dashboard-evaluation-type">
                  <span className="dashboard-evaluation-label">
                    {t(`dashboard.evaluationType.${type}`)}
                  </span>
                  <span className="dashboard-evaluation-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;