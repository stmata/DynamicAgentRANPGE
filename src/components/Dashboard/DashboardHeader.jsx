import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';

/**
 * Modern dashboard header component displaying title and user information
 * @param {Object} props - Component props
 * @param {string} props.username - Username to display
 * @param {Date|Object} props.lastLogin - Last login date
 * @returns {React.ReactElement} DashboardHeader component
 */
const DashboardHeader = ({ username, lastLogin }) => {
  const { t } = useTranslation();

  /**
   * Format date for display
   * @param {Date|Object} date - Date to format
   * @returns {string} Formatted date string
   */
  const formatDate = (date) => {
    console.log(date)
  if (!date) return '-';
  
  if (date instanceof Date) {
    return date.toLocaleString('fr-FR');
  }
  
  if (typeof date === 'string') {
    try {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
  }
  
  if (date.$date) {
    return formatDate(date.$date);
  }
  
  return '-';
};

  return (
    <div className="dashboard-header-card">
      <div className="dashboard-header-content">
        <div className="dashboard-header-info">
          <div className="dashboard-header-icon">
            <User className="dashboard-user-icon" />
          </div>
          <div className="dashboard-header-text">
            <h1 className="dashboard-title">{t('navbar.dashboard')}</h1>
            <p className="dashboard-subtitle">
              {username} {/*t('dashboard.platform')*/}
            </p>
          </div>
        </div>
        <div className="dashboard-header-date">
          <p className="dashboard-date-label">{t('dashboard.lastLogin')}</p>
          <p className="dashboard-date-value">{formatDate(lastLogin)}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;