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
 * Modern Dashboard component displaying student academic evolution
 * Shows course progress, evaluations history, and analytics
 * @returns {React.ReactElement} DashboardScreen component
 */
const DashboardScreen = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      setEvaluations(user.evaluations || []);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  /**
   * Calculate days since last activity
   * @param {Date|Object} lastActivity - Last activity date
   * @returns {number} Days since last activity
   */
  const calculateDaysSinceActivity = (lastActivity) => {
    if (!lastActivity) return 0;
    
    let date;
    if (lastActivity.$date) {
      date = new Date(lastActivity.$date);
    } else if (typeof lastActivity === 'string' || typeof lastActivity === 'number') {
      date = new Date(lastActivity);
    } else {
      date = lastActivity;
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
  const lastActivityDate = user.learning_analytics?.last_activity_date || user.last_activity_date;
  const daysSinceActivity = calculateDaysSinceActivity(lastActivityDate);

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
            value={daysSinceActivity}
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