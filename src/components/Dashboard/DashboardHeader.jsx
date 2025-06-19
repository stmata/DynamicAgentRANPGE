import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Dashboard header component displaying title and user information
 * 
 * @param {Object} props - Component props
 * @param {string} props.username - Username to display
 * @returns {React.ReactElement} DashboardHeader component
 */
const DashboardHeader = ({ username }) => {
  const { t } = useTranslation();

  return (
    <div className="dash-header">
      <h1>{t('dashboard.title')}</h1>
      <p>
        {username} • {t('dashboard.subtitle')}
      </p>
    </div>
  );
};

export default DashboardHeader; 