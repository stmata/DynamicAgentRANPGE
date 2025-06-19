import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Topics card component displaying the top studied topics
 * 
 * @param {Object} props - Component props
 * @param {Array} props.topicFrequency - Array of [topic, count] tuples
 * @param {Array} props.mostFrequent - Most frequent topic tuple [topic, count]
 * @returns {React.ReactElement} TopicsCard component
 */
const TopicsCard = ({ topicFrequency, mostFrequent }) => {
  const { t } = useTranslation();

  const limitedTopics = topicFrequency.slice(0, 10);

  const topicTags = limitedTopics.map(([topic, count]) => (
    <div 
      key={topic}
      className={`dash-topic-tag ${count > 1 ? 'dash-topic-frequent' : ''}`}
      title={`${t('common.count')}: ${count}`}
    >
      {topic}
    </div>
  ));

  return (
    <div className="dash-card">
      <div className="dash-course-header">
        <h3 className="dash-course-title">{t('dashboard.topicsStudied')}</h3>
        <span className="dash-course-badge">{t('dashboard.topLimit')}</span>
      </div>

      <div className="dash-topics-grid">
        {topicTags}
      </div>

      {mostFrequent && (
        <div className="dash-trend-indicator">
          <span className="dash-trend-arrow dash-trend-up">📚</span>
          <span className="dash-trend-text">
            {t('dashboard.mostStudiedTopic', { 
              topic: mostFrequent[0], 
              count: mostFrequent[1] 
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default TopicsCard; 