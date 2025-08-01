import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageSlider from '../components/ImageSlider/ImageSlider';
import CourseCarousel from '../components/CourseCarousel/CourseCarousel';

/**
 * Home page component that serves as the main landing page of the application.
 * Displays a hero section with descriptive content, smooth scroll navigation to courses,
 * and renders the main course carousel. Provides the primary entry point for users
 * to discover and access available courses. Includes responsive design elements
 * and interactive scroll indicators for improved user experience.
 * @returns {React.ReactElement} Home screen component with hero section and course carousel
 */
const HomeScreen = () => {
  const { t } = useTranslation();

/**
 * Smooth scroll navigation function that scrolls to the courses section.
 * Finds the courses section element using querySelector and performs smooth scrolling
 * to bring it into view at the top of the viewport. Provides seamless navigation
 * between the hero section and course content without page jumps.
 * Used by the scroll indicator component for enhanced user interaction.
 * @function
 */
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
        <h2>{t('home.title')}</h2>
        <p style={{ fontWeight: 'bold', marginTop: '1em' }}>{t('home.descriptionP1')}</p>
        <p style={{ fontWeight: 'bold', marginTop: '1em' }}>{t('home.descriptionP2')}</p>
        <p style={{ fontWeight: 'bold', marginTop: '1em' }}>{t('home.descriptionP3')}</p>
        <div style={{ fontWeight: 'bold', marginTop: '1em' }}>
          <div>⚠️</div>
          {t('home.notice')}
        </div>
        
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