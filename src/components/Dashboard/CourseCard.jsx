import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Course card component displaying course progress and statistics
 * 
 * @param {Object} props - Component props
 * @param {string} props.courseName - Name of the course
 * @param {Object} props.courseData - Course data object with average_score and total_evaluations
 * @param {Array} props.evaluations - Array of evaluation objects for this course
 * @param {Object} props.moduleStats - Module statistics object
 * @returns {React.ReactElement} CourseCard component
 */
const CourseCard = ({ courseName, courseData, evaluations, moduleStats }) => {
  const { t } = useTranslation();
  const progressRingRef = useRef(null);

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
   * Calculate progress trend from evaluations
   * @param {Array} evaluations - Array of evaluation objects
   * @returns {string} Trend type ('up', 'down', 'stable')
   */
  const calculateTrend = (evaluations) => {
    if (evaluations.length < 2) return 'stable';
    
    const scores = evaluations.map(e => e.score);
    const first = scores[0];
    const last = scores[scores.length - 1];
    const diff = last - first;
    
    if (Math.abs(diff) <= 5) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  /**
   * Get trend information object
   * @param {string} trend - Trend type
   * @returns {Object} Trend information with arrow, text, and class
   */
  const getTrendInfo = (trend) => {
    const trendInfo = {
      up: { 
        arrow: '↗️', 
        text: t('dashboard.progressPositive'), 
        class: 'dash-trend-up' 
      },
      down: { 
        arrow: '↘️', 
        text: t('dashboard.progressNegative'), 
        class: 'dash-trend-down' 
      },
      stable: { 
        arrow: '➡️', 
        text: t('dashboard.progressStable'), 
        class: 'dash-trend-stable' 
      }
    };
    return trendInfo[trend];
  };

  useEffect(() => {
    if (progressRingRef.current) {
      const score = courseData.average_score;
      const circumference = 2 * Math.PI * 25;
      const progress = score / 100;
      const dashOffset = circumference * (1 - progress);
      
      setTimeout(() => {
        progressRingRef.current.style.strokeDashoffset = dashOffset;
      }, 500);
    }
  }, [courseData.average_score]);

  const scores = evaluations.map(e => e.score);
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const latestScore = scores.length > 0 ? scores[scores.length - 1] : 0;
  const trend = calculateTrend(evaluations);
  const trendData = getTrendInfo(trend);

  const timelinePoints = scores.map((score, index) => (
    <div 
      key={index}
      className={`dash-timeline-point ${getScoreClass(score)}`}
      style={{ left: `${score}%` }}
      data-score={`${score} pts`}
      title={`${t('evaluation.evaluation')} ${index + 1}: ${score} points`}
    >
    </div>
  ));

  const moduleItems = Object.entries(moduleStats).map(([module, stats]) => (
    <div key={module} className="dash-module-item">
      <span className="dash-module-name">
        {module.replace(/_/g, ' ')}
      </span>
      <span className="dash-module-score">
        {stats.average} pts ({stats.count})
      </span>
    </div>
  ));

  return (
    <div className="dash-card">
      <div className="dash-course-header">
        <h3 className="dash-course-title">{courseName}</h3>
        <span className="dash-course-badge">
          {courseData.total_evaluations} {t('dashboard.evaluationsCount')}
        </span>
      </div>

      <div className="dash-progress-container">
        <div className="dash-circular-progress">
          <svg viewBox="0 0 60 60">
            <circle 
              className="dash-progress-ring" 
              cx="30" 
              cy="30" 
              r="25"
            />
            <circle 
              ref={progressRingRef}
              className="dash-progress-ring-fill" 
              cx="30" 
              cy="30" 
              r="25"
            />
          </svg>
          <div className="dash-progress-text">{courseData.average_score}</div>
        </div>

        <div className="dash-stats-grid">
          <div className="dash-stat-item">
            <div className="dash-stat-value">{bestScore}</div>
            <div className="dash-stat-label">{t('dashboard.bestScore')}</div>
          </div>
          <div className="dash-stat-item">
            <div className="dash-stat-value">{latestScore}</div>
            <div className="dash-stat-label">{t('dashboard.latestScore')}</div>
          </div>
        </div>
      </div>

      {scores.length > 0 && (
        <div className="dash-evolution-timeline">
          <div className="dash-timeline-container">
            <div className="dash-timeline-scale">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
            <div className="dash-timeline-line"></div>
            {timelinePoints}
          </div>
        </div>
      )}

      {Object.keys(moduleStats).length > 0 && (
        <div className="dash-modules-section">
          {moduleItems}
        </div>
      )}

      <div className="dash-trend-indicator">
        <span className={`dash-trend-arrow ${trendData.class}`}>
          {trendData.arrow}
        </span>
        <span className="dash-trend-text">{trendData.text}</span>
      </div>
    </div>
  );
};

export default CourseCard; 