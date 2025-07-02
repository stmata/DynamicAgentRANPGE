import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ModuleCard from '../components/ModuleCard/ModuleCard';
import CourseInfo from '../components/CourseInfo/CourseInfo';
import { validateCourseModuleParams } from '../utils/helpers';

/**
 * Course modules page component
 * 
 * @returns {React.ReactElement} CourseModules component
 */
const CourseModuleScreen = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const { getUserId, getAllCourses, getModulesForCourse, getTopicsCountForModule, courseExists, getCourseProgress } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [error, setError] = useState(null);
  
  const searchParams = new URLSearchParams(location.search);
  const courseTitle = searchParams.get('course');

  /**
   * Get course description for course modules
   * @param {string} courseName - Name of the course
   * @param {string} language - Current language
   * @returns {string} Course description
   */
  const getCourseDescription = (courseName, language) => {
    return t('courseModules.genericDescription');
  };

  useEffect(() => {
    if (!courseTitle || !getAllCourses() || Object.keys(getAllCourses()).length === 0) {
      navigate('/');
      return;
    }
  }, [courseTitle, getAllCourses, navigate]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseTitle) {
        setError('No course specified');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const allCourses = getAllCourses();
        
        const validation = validateCourseModuleParams(allCourses, courseTitle);
        
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

        const courseModules = getModulesForCourse(courseTitle);
        const courseProgress = getCourseProgress(courseTitle);
        
        const courseInfo = {
          title: courseTitle,
          fullDescription: getCourseDescription(courseTitle, i18n.language),
          totalModules: Object.keys(courseModules).length
        };

        const modulesList = Object.keys(courseModules).map((moduleName, index) => {
          const moduleStatus = courseProgress?.modules_status?.[moduleName];
          const isLocked = moduleStatus ? 
            moduleStatus.status === 'locked' : 
            index !== 0;
          
          return {
            id: moduleName,
            title: moduleName.replace(/_/g, ' '),
            documentCount: getTopicsCountForModule(courseTitle, moduleName),
            isLocked: isLocked
          };
        });
        
        setCourse(courseInfo);
        setModules(modulesList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course data');
        setLoading(false);
      }
    };

    fetchCourseData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseTitle, getUserId, getAllCourses, getModulesForCourse, getTopicsCountForModule, courseExists, i18n.language]);

  /**
   * Handle navigation to Evaluation Case page
   * @param {string} moduleId - Module identifier
   */
  const handleEvaluationCaseClick = (moduleId) => {
    console.log(`Chat clicked for module ${moduleId}`);
    navigate(`/evaluation-case?module=${moduleId}&course=${courseTitle}`);
  };

  /**
   * Handle navigation to evaluation-case page
   * Updated: Navigate to evaluation-case instead of chat
   * @param {string} moduleId - Module identifier
   */
  const handleEvaluationClick = (moduleId) => {
    console.log(`Evaluation clicked for module ${moduleId}`);
    navigate(`/evaluation?module=${moduleId}&course=${courseTitle}`);
  };

  if (loading) {
    return (
      <div className={`app ${isDarkMode ? 'dark-theme' : ''}`}>
        <main className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={`app ${isDarkMode ? 'dark-theme' : ''}`}>
        <main className="main-content">
          <div className="error-container">
            <h2>{t('common.error')}</h2>
            <p>{error || t('courseModules.notFound')}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-theme' : ''}`}>
      <main className="main-content">
        <CourseInfo 
          title={course.title}
          description={course.fullDescription}
          modules={course.totalModules}
          courseName={courseTitle}
        />
        
        <section className="modules-section">
          <div className="modules-grid">
            {modules.map(module => (
              <ModuleCard 
                key={module.id}
                title={module.title}
                topicsCount={module.documentCount}
                isLocked={module.isLocked}
                onEvaluationCaseClick={() => handleEvaluationCaseClick(module.id)}
                onEvaluationClick={() => handleEvaluationClick(module.id)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CourseModuleScreen;