import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageSlider from '../components/ImageSlider/ImageSlider';
import CourseCarousel from '../components/CourseCarousel/CourseCarousel';

/**
 * Home page component
 * 
 * @returns {React.ReactElement} HomeScreen component
 */
const HomeScreen = () => {
  const { t } = useTranslation();

  const scrollToContent = () => {
    const coursesSection = document.querySelector('.courses');
    if (coursesSection) {
      coursesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <>
      {/*<ImageSlider />*/}
      <section className="description">
        <h2>{t('home.title')}</h2>
        <p style={{ fontWeight: 'bold', marginTop: '1em' }}>{t('home.descriptionP1')}</p>
        <p style={{ fontWeight: 'bold', marginTop: '1em' }}>{t('home.descriptionP2')}</p>
        <p style={{ fontWeight: 'bold', marginTop: '1em' }}>{t('home.descriptionP3')}</p>
        {/*<div style={{ fontWeight: 'bold', marginTop: '1em' }}>
          <div>⚠️</div>
          {t('home.notice')}
        </div>*/}
        
        <div className="scroll-indicator" onClick={scrollToContent}>
          <div className="scroll-arrow">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="scroll-text">{t('home.scrollHover')}</div>
        </div>
      </section>
      <section className="courses">
        <CourseCarousel />
      </section>
    </>
  );
};

export default HomeScreen;