import React, { useState, useEffect } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './ImageSlider.css';
import brazil from '../../assets/images/brazil.png';
import china from '../../assets/images/china.png';
import france from '../../assets/images/france.png';
import uae from '../../assets/images/uae.png';
import usa from '../../assets/images/usa.png';
import world from '../../assets/images/world.png';

const slides = [
  {
    id: 1,
    image: france,
    alt: "France",
    campus: "CAMPUS FRANCE - PARIS & LILLE & SOPHIA ANTIPOLIS"
  },
  {
    id: 2,
    image: world,
    alt: "World",
    campus: "WORLDWIDE"
  },
  {
    id: 3,
    image: brazil,
    alt: "Brazil",
    campus: "CAMPUS BRAZIL - BELO HORIZONTE"
  },
  {
    id: 4,
    image: china,
    alt: "China",
    campus: "CAMPUS CHINA - SUZHOU"
  },
  {
    id: 5,
    image: uae,
    alt: "UAE",
    campus: "CAMPUS UAE - ABU DHABI"
  },
  {
    id: 6,
    image: usa,
    alt: "USA",
    campus: "CAMPUS USA - RALEIGH"
  }
];

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animateText, setAnimateText] = useState(true);

  const nextSlide = () => {
    setAnimateText(false); 
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setAnimateText(true); 
    }, 300);
  };

  const prevSlide = () => {
    setAnimateText(false); 
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setAnimateText(true); 
    }, 300);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="image-slider">
      <div className="slider-container">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={slide.image} alt={slide.alt} />
          </div>
        ))}
        
        {/* Text animation */}
        <div className={`campus-text-container ${animateText ? 'animate' : ''}`}>
          <h2 className="campus-name">{slides[currentSlide].campus}</h2>
        </div>
      </div>
      
      <button className="slider-btn prev" onClick={prevSlide} aria-label="Image précédente">
        <ChevronLeftIcon />
      </button>
      <button className="slider-btn next" onClick={nextSlide} aria-label="Image suivante">
        <ChevronRightIcon />
      </button>
    </section>
  );
};

export default ImageSlider;