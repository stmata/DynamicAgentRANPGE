import React from 'react';

/**
 * Statistics card component for dashboard metrics
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {number} props.value - Numeric value to display
 * @param {React.ReactElement} props.icon - Icon component
 * @param {string} props.borderColor - CSS border color class
 * @param {string} props.valueColor - CSS text color class
 * @returns {React.ReactElement} StatsCard component
 */
const StatsCard = ({ title, value, icon, borderColor, valueColor }) => {
  return (
    <div className={`dashboard-stats-card ${borderColor}`}>
      <div className="dashboard-stats-content">
        <div className="dashboard-stats-text">
          <p className="dashboard-stats-label">{title}</p>
          <p className={`dashboard-stats-value ${valueColor}`}>{value}</p>
        </div>
        <div className="dashboard-stats-icon">{icon}</div>
      </div>
    </div>
  );
};

export default StatsCard;