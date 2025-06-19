import React from 'react';

/**
 * Progress bar component showing quiz completion percentage
 * @param {number} progressPercentage - Completion percentage (0-100)
 */
const ProgressBar = ({ progressPercentage }) => {
  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
    </div>
  );
};

export default ProgressBar; 