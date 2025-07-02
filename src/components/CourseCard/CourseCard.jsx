import React from 'react';
import { useTranslation } from 'react-i18next';
import './CourseCard.css';
import CardImage from '../../assets/images/background.png';
import CardImage2 from '../../assets/images/lesard.png';
import CardAssessment from '../../assets/images/ranking.png';

const CourseCard = ({ course, onStartCourse, index, lang }) => {
  const { t } = useTranslation();

  if (!(course.title.en === 'Positionnement' || course.title.fr === 'Positionnement')) {
    return null;
  }

  const getImageToUse = () => {
    if (course.title.en === 'Positionnement' || course.title.fr === 'Positionnement') {
      return CardAssessment;
    }
    return index % 2 === 0 ? CardImage : CardImage2;
  };

  const imageToUse = getImageToUse();
  
  // Check if the course is active
  const isActive = course.isActive || false;


  const handleStartCourse = () => {
    if (!isActive) return; 
    onStartCourse(course.title[lang] || course.title['en']);
  };

  return (
    <>
      <div className="course-card">
        <div className="course-image">
          <img src={imageToUse} alt={course.title[lang] || course.title['en']} />
          {!isActive && (
            <div className="course-coming-soon">
            </div>
          )}
        </div>
        <div className="course-content">
          <h3>{course.title[lang] || course.title['en']}</h3>
          <p 
            className="course-description"
            data-full-text={course.fullDescription[lang] || course.fullDescription['en']}
          >
            {course.shortDescription[lang] || course.shortDescription['en']}
            <span className="read-more">...</span>
          </p>
          <div className="course-info">
            <span>
              <i className="fas fa-book"></i> {course.modules} {t('course.modules')}
            </span>
          </div>
          <button 
            className={`course-btn ${!isActive ? 'disabled' : ''}`}
            onClick={handleStartCourse}
            disabled={!isActive}
          >
            {isActive ? t('course.start') : t('course.placementTestRequired')}
          </button>
        </div>
      </div>

    </>
  );
};

export default CourseCard;