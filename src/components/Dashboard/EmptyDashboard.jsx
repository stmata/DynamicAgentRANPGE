import React from 'react';
import { useTranslation } from 'react-i18next';
import { Target } from 'lucide-react';
import { API_CONFIG } from '../../utils/constants';

/**
 * Empty state component for new users without evaluations
 * @returns {React.ReactElement} EmptyDashboard component
 */
const EmptyDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="dashboard-empty-state">
      <Target className="dashboard-empty-icon" />
      <h3 className="dashboard-empty-title">{t('dashboard.startLearning')}</h3>
      <p className="dashboard-empty-description">{t('dashboard.startDescription')}</p>
      <a 
        href={API_CONFIG.BACKTOK2}
        style={{ textDecoration: 'none' }}
        className="dashboard-empty-button"
      >
        {t('common.backToK2')}
      </a>
    </div>
  );
};

export default EmptyDashboard;