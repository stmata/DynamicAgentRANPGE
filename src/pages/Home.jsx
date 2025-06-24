import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageSlider from '../components/ImageSlider/ImageSlider';
import CourseCarousel from '../components/CourseCarousel/CourseCarousel';

/**
 * Home page component
 * 
 * @returns {React.ReactElement} Home component
 */
const Home = () => {
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
      <ImageSlider />
      <section className="description">
        <h2>{t('home.title')}</h2><br/>
        <p>{t('home.description')}</p>
        
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

export default Home;