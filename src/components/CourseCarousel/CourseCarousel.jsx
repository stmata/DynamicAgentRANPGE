import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../CourseCard/CourseCard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../../contexts/AuthContext';
import { getStaticCourses, createPositionnementCard } from '../../services/courseService';
import './CourseCarousel.css';
import CourseSelectionDialog from './CourseSelectionDialog';

/**
 * CourseCarousel component that displays available courses in a carousel format
 * Uses local cache data instead of making redundant API calls
 * @returns {React.ReactElement} CourseCarousel component
 */
const CourseCarousel = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getAllCourses, coursesLoading, courses }  = useAuth();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const carouselRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [allCards, setAllCards] = useState([]);
  const [courseSelectionDialogOpen, setCourseSelectionDialogOpen] = useState(false);

  /**
   * Transform API course data to card format using local cache
   * @param {string} courseName - Name of the course
   * @param {Object} courseData - Course data from local cache
   * @returns {Object} Formatted course card object
   */
  const transformApiCourseToCard = (courseName, courseData) => {
    return {
      id: `api_${courseName.toLowerCase().replace(/\s+/g, '_')}`,
      title: {
        en: courseName,
        fr: courseName
      },
      shortDescription: {
        en: `Learn ${courseName} fundamentals and advanced concepts.`,
        fr: `Apprenez les fondamentaux et concepts avancés de ${courseName}.`
      },
      fullDescription: {
        en: `Complete course covering all aspects of ${courseName}. Master the essential skills and knowledge needed in this field.`,
        fr: `Cours complet couvrant tous les aspects de ${courseName}. Maîtrisez les compétences et connaissances essentielles dans ce domaine.`
      },
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=300&fit=crop",
      modules: courseData.totalModules || Object.keys(courseData.modules || {}).length || 0,
      isActive: true
    };
  };

  /**
   * Builds the complete list of cards combining positioning, API courses, and static courses
   * Uses local cache data to avoid redundant API calls
   */
  const buildAllCards = () => {
    const cards = [];
    
    cards.push(createPositionnementCard());
    
    const coursesData = getAllCourses();
    
    if (coursesData && Object.keys(coursesData).length > 0) {
      Object.entries(coursesData).forEach(([courseName, courseData]) => {
        cards.push(transformApiCourseToCard(courseName, courseData));
      });
    }
    
    cards.push(...getStaticCourses());
    
    setAllCards(cards);
  };

  /**
   * Updates the number of visible cards based on screen width
   */
  const updateVisibleCards = () => {
    let count = 3; 
    
    if (window.innerWidth < 768) {
      count = 1;
    } else if (window.innerWidth < 992) {
      count = 2;
    }
    
    setVisibleCards(count);
  };

  /**
   * Updates the card width for carousel calculations
   */
  const updateCardWidth = () => {
    if (carouselRef.current) {
      setCardWidth(324);
    }
  };

  /**
   * Handles navigation to the next card in carousel
   */
  const nextCard = () => {
    if (allCards.length <= visibleCards) return;
    
    const maxIndex = allCards.length - visibleCards;
    
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  /**
   * Handles navigation to the previous card in carousel
   */
  const prevCard = () => {
    if (allCards.length <= visibleCards) return;
    
    const maxIndex = allCards.length - visibleCards;
    
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(maxIndex);
    }
  };
  
  /**
   * Handles course start button click and navigation
   * @param {string} courseTitle - Title of the course to start
   */
  const handleStartCourse = (courseTitle) => {
    if (courseTitle.toLowerCase() === "positionnement") {
      setCourseSelectionDialogOpen(true);
    } else {
      navigate(`/course-modules?course=${encodeURIComponent(courseTitle)}`);
    }
  };

  /**
   * Handles course selection from the positioning dialog
   * @param {Object} selectedCourse - Selected course object
   */
  const handleCourseSelection = (selectedCourse) => {
    const courseTitle = selectedCourse.title?.fr || selectedCourse.title?.en || selectedCourse.title;
    
    navigate('/evaluation', { 
      state: { 
        selectedCourse: courseTitle,
        isPositionnement: true 
      } 
    });
  };

  /**
   * Close course selection dialog
   */
  const handleCloseDialog = () => {
    setCourseSelectionDialogOpen(false);
  };

  useEffect(() => {
    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);
  
  useEffect(() => {
    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  /**
   * Build cards when courses data changes
   */
  useEffect(() => {
    buildAllCards();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  const showNavButtons = allCards.length > visibleCards;

  if (coursesLoading) {
    return (
      <section className="courses-section">
        <div className="courses-container">
          <h2 className="courses-title">{t('courses.title')}</h2>
          <div className="loading-placeholder">
            {t('common.loading')}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="courses-section">
      <div className="courses-container">
        <h2 className="courses-title">{t('courses.title')}</h2>
        
        <div className="carousel-wrapper">
          <div 
            className="carousel"
            ref={carouselRef}
          >
            <div 
              className="carousel-container"
              style={{ 
                transform: `translateX(-${currentIndex * cardWidth}px)`,
              }}
            >
              {allCards.map((course, index) => (
                <div className="carousel-item" key={course.id}>
                  <CourseCard
                    course={course}
                    onStartCourse={handleStartCourse}
                    index={index}
                    lang={i18n.language}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {showNavButtons && (
            <>
              <button 
                className={`carousel-btn prev ${currentIndex === 0 ? 'disabled' : ''}`}
                onClick={prevCard} 
                aria-label="Précédent"
              >
                <ChevronLeftIcon />
              </button>
              <button 
                className={`carousel-btn next ${currentIndex >= allCards.length - visibleCards ? 'disabled' : ''}`}
                onClick={nextCard} 
                aria-label="Suivant"
              >
                <ChevronRightIcon />
              </button>
            </>
          )}
        </div>

        <CourseSelectionDialog
          open={courseSelectionDialogOpen}
          onClose={handleCloseDialog}
          onCourseSelect={handleCourseSelection}
          availableCourses={allCards}
        />
      </div>
    </section>
  );
};

export default CourseCarousel;