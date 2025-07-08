import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import DashboardHeader from '../../components/Dashboard/DashboardHeader';
import StatsCard from '../../components/Dashboard/StatsCard';
import CourseCard from '../../components/Dashboard/CourseCard';
import EvaluationChart from '../../components/Dashboard/EvaluationChart';
import ScoreEvolutionChart from '../../components/Dashboard/ScoreEvolutionChart';
import EmptyDashboard from '../../components/Dashboard/EmptyDashboard';
import BackToK2Section from '../../components/Dashboard/BackToK2Section';
import { Target, BookOpen, Award, Calendar } from 'lucide-react';
import './DashboardScreen.css';

/**
 * Modern dashboard component displaying student academic evolution and analytics.
 * Shows course progress, evaluation history, active days tracking, and performance charts.
 * Handles authentication states, loading states, and renders appropriate content
 * based on user data availability. Provides comprehensive overview of learning progress.
 * @returns {React.ReactElement} DashboardScreen component with user analytics
 */
const DashboardScreen = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Effect hook for loading user evaluations and setting loading state.
   * Updates evaluations state when user authentication and data become available.
   * Manages loading state transition from initial load to content display.
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      setEvaluations(user.evaluations || []);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * Get the count of active learning days from user analytics.
   * @param {Object} user - User object with learning analytics
   * @returns {number} Number of active days
   */
  const getActiveDaysCount = (user) => {
    return user?.learning_analytics?.activity_dates?.length || 0;
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
  const activeDaysCount = getActiveDaysCount(user);

  return (
    <div className="dashboard-dashboard">
      <div className="dashboard-dashboard-container">
        
        <DashboardHeader 
          username={user.username}
          lastLogin={user.last_login || user.learning_analytics?.last_activity_date}
        />

        <div className="dashboard-stats-grid">
          <StatsCard
            title={t('dashboard.positioningTests')}
            value={user.learning_analytics?.total_positionnement_tests || 0}
            icon={<Target className="dashboard-icon" />}
            borderColor="dashboard-border-primary"
            valueColor="dashboard-text-primary"
          />
          
          <StatsCard
            title={t('dashboard.totalEvaluations')}
            value={user.total_evaluations || evaluations.length || 0}
            icon={<BookOpen className="dashboard-icon" />}
            borderColor="dashboard-border-accent"
            valueColor="dashboard-text-accent"
          />
          
          <StatsCard
            title={t('dashboard.activeCourses')}
            value={user.course_progress ? Object.keys(user.course_progress).length : 0}
            icon={<Award className="dashboard-icon" />}
            borderColor="dashboard-border-dark"
            valueColor="dashboard-text-dark"
          />
          
          <StatsCard
            title={t('dashboard.daysActivity')}
            value={activeDaysCount}
            icon={<Calendar className="dashboard-icon" />}
            borderColor="dashboard-border-gray"
            valueColor="dashboard-text-gray"
          />
        </div>

        <div className="dashboard-courses-grid">
          {user.course_progress && Object.entries(user.course_progress).map(([courseName, courseData]) => {
            const courseEvaluations = evaluations.filter(e => e.course === courseName);
            return (
              <CourseCard
                key={courseName}
                courseName={courseName}
                courseData={courseData}
                evaluations={courseEvaluations}
              />
            );
          })}
        </div>

        {hasEvaluations ? (
          <>
            <div className="dashboard-charts-grid">
              <EvaluationChart evaluations={evaluations} />
              <ScoreEvolutionChart evaluations={evaluations} />
            </div>
            <div className="dashboard-empty-state" style={{marginTop: "1rem"}}>
              <p className="dashboard-empty-description">
                {t('common.txtFloatiActionBtn')}
              </p>
              <BackToK2Section />
            </div>
          </>
        ) : (
          <EmptyDashboard />
        )}
      </div>
    </div>
  );
};

export default DashboardScreen;