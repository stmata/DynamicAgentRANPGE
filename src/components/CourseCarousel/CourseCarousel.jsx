import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../CourseCard/CourseCard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../../contexts/AuthContext';
import { createPositionnementCard } from '../../services/courseService';
import combinedCoursesService from '../../services/combinedCoursesService';
import { useCourses } from '../../hooks/useCourses';
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
  const { user, isAuthenticated } = useAuth();
  const { getAllCourses, coursesData } = useCourses(isAuthenticated);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const carouselRef = useRef(null);
  const [cardWidth, setCardWidth] = useState(0);
  const [allCards, setAllCards] = useState([]);
  const [allCoursesForSelection, setAllCoursesForSelection] = useState([]);
  const [courseSelectionDialogOpen, setCourseSelectionDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Build cards from cached courses with progression + positioning card
   * Uses combined service to merge course cache with user progression
   */
  const buildAllCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cards = [];
      
      // Always add positioning card first
      cards.push(createPositionnementCard());
      
      if (isAuthenticated && user?.id) {
        const allCourses = getAllCourses();
        
        // Only proceed if we have courses data
        if (Object.keys(allCourses).length > 0) {
          const coursesWithProgress = await combinedCoursesService.getCoursesWithProgression(
            user.id, 
            allCourses,
            user.course_progress
          );
          
          const allCoursesForSelectionData = await combinedCoursesService.getAllCoursesForSelection(
            user.id,
            allCourses,
            user.course_progress
          );
          
          cards.push(...coursesWithProgress);
          
          setAllCoursesForSelection([createPositionnementCard(), ...allCoursesForSelectionData]);
        }
      }
      
      setAllCards(cards);
    } catch (err) {
      console.error('Error loading courses with progression:', err);
      setError(err.message || 'Failed to load courses');
      
      // Fallback: only positioning card
      setAllCards([createPositionnementCard()]);
    } finally {
      setLoading(false);
    }
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
   * Build cards when authentication state OR courses data changes
   */
  useEffect(() => {
    buildAllCards();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, user?.course_progress, coursesData]);

  /**
   * Listen for progression updates to refresh interface
   */
  useEffect(() => {
    const handleProgressionUpdate = (event) => {
      if (event.detail.userId === user?.id) {
        buildAllCards();
      }
    };

    const handleCoursesLoaded = () => {
      buildAllCards();
    };

    window.addEventListener('progression:updated', handleProgressionUpdate);
    window.addEventListener('courses:loaded', handleCoursesLoaded);
    
    return () => {
      window.removeEventListener('progression:updated', handleProgressionUpdate);
      window.removeEventListener('courses:loaded', handleCoursesLoaded);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const showNavButtons = allCards.length > visibleCards;

  if (loading) {
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

  if (error) {
    return (
      <section className="courses-section">
        <div className="courses-container">
          <h2 className="courses-title">{t('courses.title')}</h2>
          <div className="error-placeholder">
            Error loading courses: {error}
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
              /*style={{ 
                transform: `translateX(-${currentIndex * cardWidth}px)`,
              }}*/
              style={{ 
                transform: `translateX(-${currentIndex * cardWidth}px)`,
                justifyContent: 'center',
                display: 'flex'
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
          availableCourses={allCoursesForSelection}
        />
      </div>
    </section>
  );
};

export default CourseCarousel;