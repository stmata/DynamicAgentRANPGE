import { useState, useEffect } from 'react';

/**
 * Custom hook for managing quiz timer functionality
 * @param {boolean} isSubmitted - Whether the quiz has been submitted
 * @param {Function} onTimeUp - Callback when timer reaches zero
 * @returns {Object} Timer state and functions
 */
export const useQuizTimer = (isSubmitted, isLoading, onTimeUp) => {
  const [timer, setTimer] = useState('0:30:00');

  useEffect(() => {
    if (isSubmitted || isLoading) return;
    
    let timeArray = timer.split(':');
    let hours = parseInt(timeArray[0]);
    let minutes = parseInt(timeArray[1]);
    let seconds = parseInt(timeArray[2]);
    
    const interval = setInterval(() => {
      seconds--;
      
      if (seconds < 0) {
        seconds = 59;
        minutes--;
        
        if (minutes < 0) {
          minutes = 59;
          hours--;
          
          if (hours < 0) {
            clearInterval(interval);
            onTimeUp?.();
            return;
          }
        }
      }
      
      setTimer(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timer, isSubmitted, isLoading, onTimeUp]);

  return { timer };
}; 