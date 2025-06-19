import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import DashboardHeader from '../../components/Dashboard/DashboardHeader';
import DashboardSummary from '../../components/Dashboard/DashboardSummary';
import CourseCard from '../../components/Dashboard/CourseCard';
import TopicsCard from '../../components/Dashboard/TopicsCard';
import EvaluationHistoryCard from '../../components/Dashboard/EvaluationHistoryCard';
import EmptyDashboard from '../../components/Dashboard/EmptyDashboard';
import './DashboardScreen.css';

/**
 * Main Dashboard component displaying student academic evolution
 * Shows course progress, evaluations history, and topics studied
 * 
 * @returns {React.ReactElement} Dashboard component
 */
const Dashboard = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      const retrieveUser = user.evaluations || [];
      setEvaluations(retrieveUser);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * Calculate topic frequency from evaluations
   * @param {Array} evaluations - Array of evaluation objects
   * @returns {Array} Array of [topic, count] tuples sorted by frequency
   */
  const calculateTopicFrequency = (evaluations) => {
    const topicCount = {};
    evaluations.forEach(evaluation => {
      if (evaluation.topics) {
        evaluation.topics.forEach(topic => {
          topicCount[topic] = (topicCount[topic] || 0) + 1;
        });
      }
    });

    return Object.entries(topicCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  /**
   * Calculate module statistics from evaluations
   * @param {Array} evaluations - Array of evaluation objects  
   * @returns {Object} Module statistics object
   */
  const calculateModuleStats = (evaluations) => {
    const modules = {};
    evaluations.forEach(evaluation => {
      if (!modules[evaluation.module]) {
        modules[evaluation.module] = { scores: [], count: 0 };
      }
      modules[evaluation.module].scores.push(evaluation.score);
      modules[evaluation.module].count++;
    });

    Object.keys(modules).forEach(module => {
      const scores = modules[module].scores;
      modules[module].average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });

    return modules;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="error-container">
        <h2>{t('error.authenticationFailed')}</h2>
        <p>{t('error.sessionExpired')}</p>
      </div>
    );
  }

  const hasEvaluations = evaluations && evaluations.length > 0;
  const topicFrequency = hasEvaluations ? calculateTopicFrequency(evaluations) : [];

  return (
    <div className="dash-dashboard">
      <DashboardHeader username={user.username} />
      
      {hasEvaluations ? (
        <div className="dash-grid">
          <DashboardSummary 
            averageScore={user.average_score || 0}
            evaluations={evaluations}
          />
          
          {user.course_scores && Object.entries(user.course_scores).map(([courseName, courseData]) => {
            const courseEvaluations = evaluations.filter(e => e.course === courseName);
            const moduleStats = calculateModuleStats(courseEvaluations);
            
            return (
              <CourseCard
                key={courseName}
                courseName={courseName}
                courseData={courseData}
                evaluations={courseEvaluations}
                moduleStats={moduleStats}
              />
            );
          })}

          {user.course_scores && Object.entries(user.course_scores).map(([courseName]) => {
            const courseEvaluations = evaluations.filter(e => e.course === courseName);
            
            return (
              <EvaluationHistoryCard
                key={`history-${courseName}`}
                courseName={courseName}
                evaluations={courseEvaluations}
              />
            );
          })}

          {topicFrequency.length > 0 && (
            <TopicsCard
              topicFrequency={topicFrequency}
              mostFrequent={topicFrequency[0]}
            />
          )}
        </div>
      ) : (
        <EmptyDashboard />
      )}
    </div>
  );
};

export default Dashboard; 