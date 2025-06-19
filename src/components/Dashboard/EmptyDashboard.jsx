import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * Empty dashboard component displayed when user has no evaluations
 * Shows encouragement and tips for getting started
 * 
 * @returns {React.ReactElement} EmptyDashboard component
 */
const EmptyDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /**
   * Handle navigation to Home page
   */
  const handleStartEvaluation = () => {
    navigate('/');
  };

  return (
    <div className="dash-grid">
      {/* Main empty state card */}
      <div className="dash-card dash-summary-card">
        <div className="dash-empty-state">
          <div className="dash-empty-state-icon">📚</div>
          <h3>{t('dashboard.emptyState.title')}</h3>
          <p>{t('dashboard.emptyState.description')}</p>
          <button 
            className="dash-empty-state-action"
            onClick={handleStartEvaluation}
          >
            {t('dashboard.emptyState.startButton')}
          </button>
        </div>
      </div>
      
      {/* Sample course card */}
      <div className="dash-card">
        <div className="dash-course-header">
          <h3 className="dash-course-title">Marketing</h3>
          <span className="dash-course-badge">
            {t('dashboard.emptyState.readyToStart')}
          </span>
        </div>
        <div className="dash-empty-state">
          <div className="dash-empty-state-icon">🎯</div>
          <h3>{t('dashboard.emptyState.firstCourseTitle')}</h3>
          <p>{t('dashboard.emptyState.firstCourseDescription')}</p>
        </div>
      </div>
      
      {/* Tips card */}
      <div className="dash-card">
        <div className="dash-course-header">
          <h3 className="dash-course-title">
            {t('dashboard.emptyState.tipsTitle')}
          </h3>
          <span className="dash-course-badge">Tips</span>
        </div>
        <div className="dash-modules-section">
          <div className="dash-module-item">
            <span className="dash-module-name">
              {t('dashboard.emptyState.tip1')}
            </span>
          </div>
          <div className="dash-module-item">
            <span className="dash-module-name">
              {t('dashboard.emptyState.tip2')}
            </span>
          </div>
          <div className="dash-module-item">
            <span className="dash-module-name">
              {t('dashboard.emptyState.tip3')}
            </span>
          </div>
          <div className="dash-module-item">
            <span className="dash-module-name">
              {t('dashboard.emptyState.tip4')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyDashboard; 