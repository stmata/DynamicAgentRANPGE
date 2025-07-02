import { API_CONFIG } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
//import { useNavigate, useLocation } from 'react-router-dom';
import {useLocation } from 'react-router-dom';
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
  //const navigate = useNavigate();
  const location = useLocation();
  
  const courseScore = getCourseScore(courseName);
  const formattedRating = courseScore === null ? "00/00" : `${courseScore}/100`;

  const searchParams = new URLSearchParams(location.search);
  const isTopicView = searchParams.has('module');

  /**
   * Handle navigation to course modules
   */
  const handleModulesClick = () => {
    //navigate(`/course-modules?course=${encodeURIComponent(courseName)}`);
    window.location.href = API_CONFIG.BACKTOK2;
  };

  return (
    <div className={`courseInfo-section ${isDarkMode ? 'dark-mode' : ''}`}>
      <h1 className="courseInfo-title">{title}</h1>
      <p className="courseInfo-description">{description}</p>
      
      {(modules || courseScore !== undefined) && (
        <div className="courseInfo-stats">
          {modules && (
            <div 
              className="courseInfo-stat courseInfo-stat-clickable" 
              onClick={handleModulesClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleModulesClick();
                }
              }}
            >
              <i className="fas fa-book"></i>
              <span>{modules} {t(isTopicView ? 'courseModules.topics' : 'courseModules.modules')}</span>
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