import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import './CourseInfo.css';

/**
 * CourseInfo component for displaying course information and statistics
 * @param {Object} props - Component props
 * @param {string} props.title - Course title
 * @param {string} props.description - Course description
 * @param {number} props.modules - Number of modules
 * @param {string} props.courseName - Course name for score lookup
 * @returns {JSX.Element} CourseInfo component
 */
const CourseInfo = ({ 
  title, 
  description, 
  modules, 
  courseName 
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const { getCourseScore } = useAuth();
  
  const courseScore = getCourseScore(courseName);
  const formattedRating = courseScore === null ? "00/00" : `${courseScore}/100`;

  return (
    <div className={`courseInfo-section ${isDarkMode ? 'dark-mode' : ''}`}>
      <h1 className="courseInfo-title">{title}</h1>
      <p className="courseInfo-description">{description}</p>
      
      {(modules || courseScore !== undefined) && (
        <div className="courseInfo-stats">
          {modules && (
            <div className="courseInfo-stat">
              <i className="fas fa-book"></i>
              <span>{modules} {t('courseModules.modules')}</span>
            </div>
          )}
          
          <div className="courseInfo-stat">
            <i className="fas fa-star"></i>
            <span>{t('courseModules.averageRating')}: {formattedRating}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseInfo;