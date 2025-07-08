import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import CourseInfo from '../../components/CourseInfo/CourseInfo';
import QuizContainer from '../../components/QuizContainer/QuizContainer';
import { validateCourseModuleParams, getEvaluationTitleKey, getWelcomeTextKey } from '../../utils/helpers';
import './EvaluationScreen.css';


/**
 * Main evaluation screen component that handles both module evaluations and positioning tests.
 * Supports regular evaluations, positioning tests, and final validation evaluations.
 * Manages loading states, error handling, and displays welcome screen before evaluation.
 * @returns {React.ReactElement} The evaluation screen component
 */
const EvaluationScreen = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'en';
  const [showWelcome, setShowWelcome] = useState(true);
  const { isDarkMode } = useTheme();
  const { getUserId, getAllCourses, getTopicsForModule, getTopicsCountForModule, courseExists, moduleExists, user } = useAuth();
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
  const isFinal = searchParams.get('final') === 'true';
  
  //const isPositionnement = isPositionnementFromDialog || (!moduleId && !courseTitle);
  
  const isPositionnement = isPositionnementFromDialog || (!moduleId && !courseTitle) || isFinal;
  
  /**
   * Determines if this is the first time the user is taking a positioning test.
   * Checks user's course progress to see if positioning test status is "not_attempted".
   * @returns {boolean} True if it's the first time positioning test, false otherwise
   */
  const isFirstTimePositionnement = () => {
    if (!isPositionnement) return false;
    if (!user?.course_progress) return true;
      
    const courseToCheck = selectedCourse || courseTitle;
    const courseProgress = user.course_progress[courseToCheck];
    return courseProgress?.positionnement_test?.status === "not_attempted";
  };


  /**
   * Effect hook for navigation validation and redirect logic.
   * Redirects to home page if required parameters are missing or course doesn't exist.
   * Runs when positioning state, module ID, course title, or related functions change.
   */
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


  /**
   * Effect hook for navigation validation and redirect logic.
   * Redirects to home page if required parameters are missing or course doesn't exist.
   * Runs when positioning state, module ID, course title, or related functions change.
   */
  useEffect(() => {
    const fetchData = async () => {
      if (isPositionnement) {
        const positioningTitle = isFinal 
          ? t('evaluation.positioning.finalValidationTitle')
          : (selectedCourse 
              ? t('evaluation.positioning.titleWithCourse', { course: selectedCourse })
              : t('evaluation.positioning.title'));
          
        setModuleData({
          displayTitle: positioningTitle,
          topics: [],
        });
        
        let positioningDescription;
        if (isFinal) {
          positioningDescription = t('evaluation.positioning.descriptionWithCourseFinale', { course: selectedCourse });
        } else if (selectedCourse) {
          positioningDescription = t('evaluation.positioning.descriptionWithCourse', { course: selectedCourse });
        } else {
          positioningDescription = t('evaluation.positioning.description');
        }
        
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
        
        setCourseDescription(t('evaluation.moduleEvaluation.description'));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load module data');
        setLoading(false);
      }
    };

    fetchData();
  }, [moduleId, courseTitle, selectedCourse, currentLanguage, isPositionnement, getAllCourses, getTopicsForModule, getTopicsCountForModule, courseExists, moduleExists, t, isFinal]);

  if (showWelcome) {
  return (
    <div className={`app ${isDarkMode ? 'dark-theme' : ''}`}>
      <section className="main-content">
        <div className="chat-greeting">
          <span className="chat-greeting-emoji">📝</span>
          <h1 className="chat-greeting-title">
            {t(getEvaluationTitleKey(isPositionnement))}
          </h1>
          <Trans 
            i18nKey={t(getWelcomeTextKey(isPositionnement, isFirstTimePositionnement))}
            components={{ 
              p: <p />, 
              ul: <ul />, 
              li: <li />,
              em: <em/>,
              strong: <strong/>
            }}
          />
          <button 
            className="chat-start-evaluation-btn"
            onClick={() => setShowWelcome(false)}
          >
            {t('course.start')}
          </button>
        </div>
      </section>
    </div>
  );
  }
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
          courseName={isFinal ? courseTitle : (isPositionnement ? (selectedCourse || 'positionnement') : courseTitle)}
        />
      </section>
      <section className="modules-section">
        <QuizContainer 
          moduleId={isPositionnement ? 'positionnement' : moduleId}
          courseTitle={isPositionnement ? (courseTitle || selectedCourse || 'positionnement') : courseTitle}
          moduleTopics={moduleData.topics || []}
          userId={getUserId()}
          isPositionnement={isPositionnement}
        />
      </section>
    </div>
  );
};

export default EvaluationScreen;