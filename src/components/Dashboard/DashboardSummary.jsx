import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Dashboard summary component displaying global average score and progress
 * 
 * @param {Object} props - Component props
 * @param {number} props.averageScore - Global average score
 * @param {Array} props.evaluations - Array of evaluation objects
 * @returns {React.ReactElement} DashboardSummary component
 */
const DashboardSummary = ({ averageScore, evaluations }) => {
  const { t } = useTranslation();

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

  const trend = calculateTrend(evaluations);
  const trendData = getTrendInfo(trend);

  return (
    <div className="dash-card dash-summary-card">
      <div className="dash-summary-score">{averageScore}</div>
      <div className="dash-summary-label">{t('dashboard.globalScore')}</div>
      <div className="dash-trend-indicator">
        <span className={`dash-trend-arrow ${trendData.class}`}>
          {trendData.arrow}
        </span>
        <span className="dash-trend-text">{trendData.text}</span>
      </div>
    </div>
  );
};

export default DashboardSummary; 