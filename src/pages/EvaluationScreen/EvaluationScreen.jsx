import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import CourseInfo from '../../components/CourseInfo/CourseInfo';
import QuizContainer from '../../components/QuizContainer/QuizContainer';
import { validateCourseModuleParams } from '../../utils/helpers';
import './EvaluationScreen.css';

const EvaluationScreen = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const { isDarkMode } = useTheme();
  const { getUserId, getAllCourses, getTopicsForModule, getTopicsCountForModule, courseExists, moduleExists } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCourse, isPositionnement: isPositionnementFromDialog } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [moduleData, setModuleData] = useState(null);
  const [courseDescription, setCourseDescription] = useState('');
  const [error, setError] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const moduleId = searchParams.get('module');
  const courseTitle = searchParams.get('course') || selectedCourse;
  
  const isPositionnement = isPositionnementFromDialog || (!moduleId && !courseTitle);

  useEffect(() => {
    if (!isPositionnement && (!moduleId || !courseTitle)) {
      navigate('/');
      return;
    }
    
    if (!isPositionnement && getAllCourses() && !courseExists(courseTitle)) {
      navigate('/');
      return;
    }
  }, [isPositionnement, moduleId, courseTitle, navigate, getAllCourses, courseExists]);

  useEffect(() => {
    const fetchData = async () => {
      if (isPositionnement) {
        const positioningTitle = selectedCourse 
          ? t('evaluation.positioning.titleWithCourse', { course: selectedCourse })
          : t('evaluation.positioning.title');
          
        setModuleData({
          displayTitle: positioningTitle,
          topics: [],
        });
        
        const positioningDescription = selectedCourse 
          ? t('evaluation.positioning.descriptionWithCourse', { course: selectedCourse })
          : t('evaluation.positioning.description');
        
        setCourseDescription(positioningDescription);
        setLoading(false);
        return;
      }
      
      if (!moduleId || !courseTitle) {
        setError('No module or course specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const allCourses = getAllCourses();
        
        const validation = validateCourseModuleParams(allCourses, courseTitle, moduleId);
        
        if (!validation.isValid) {
          setError(validation.errors.join(', '));
          setLoading(false);
          return;
        }

        if (!courseExists(courseTitle)) {
          setError(`Course "${courseTitle}" not found`);
          setLoading(false);
          return;
        }

        if (!moduleExists(courseTitle, moduleId)) {
          setError(`Module "${moduleId}" not found in course "${courseTitle}"`);
          setLoading(false);
          return;
        }

        const topics = getTopicsForModule(courseTitle, moduleId);
        const topicsCount = getTopicsCountForModule(courseTitle, moduleId);
        
        setModuleData({
          displayTitle: moduleId.replace(/_/g, ' '),
          topics,
          topicsCount
        });
        
        // Use module evaluation description
        setCourseDescription(t('evaluation.moduleEvaluation.description'));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load module data');
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId, courseTitle, selectedCourse, currentLanguage, isPositionnement, getAllCourses, getTopicsForModule, getTopicsCountForModule, courseExists, moduleExists, t]);

  if (loading) {
    return (
      <div className={`app ${isDarkMode ? 'dark-theme' : ''}`}>
        <section className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
            <img 
              src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnR0c3hzcG9rYnBqZXpkcHQ0bWY3dXNodTQ5amx3N2hpdHdhczE1YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/hvYaelBdwVvv7Gb3HL/giphy.gif" 
              alt="Loading..." 
              style={{ width: '150px', marginBottom: '15px' }}
            />
            <p>{t('common.loading')}</p>
          </div>
        </section>
      </div>
    );
  }

  if (error || !moduleData) {
    return (
      <div className={`app ${isDarkMode ? 'dark-theme' : ''}`}>
        <section className="main-content">
          <div className="error-container">
            <h2>{t('common.error')}</h2>
            <p>{error || t('evaluation.moduleNotFound')}</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-theme' : ''}`}>
      <section className="main-content">
        <CourseInfo 
          title={moduleData.displayTitle}
          description={courseDescription}
          modules={isPositionnement ? "Tous les" : moduleData.topicsCount || moduleData.topics?.length || 0}
          courseName={isPositionnement ? (selectedCourse || 'positionnement') : courseTitle}
        />
      </section>
      <section className="modules-section">
        <QuizContainer 
          moduleId={isPositionnement ? 'positionnement' : moduleId}
          courseTitle={isPositionnement ? (selectedCourse || 'positionnement') : courseTitle}
          moduleTopics={moduleData.topics || []}
          userId={getUserId()}
          isPositionnement={isPositionnement}
        />
      </section>
    </div>
  );
};

export default EvaluationScreen;