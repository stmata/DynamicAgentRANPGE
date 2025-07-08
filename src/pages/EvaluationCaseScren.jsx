import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext'; 
import EvaluationCase from '../components/EvaluationCase/EvaluationCase';

/**
 * Evaluation case screen component that provides a full-screen layout for case-based evaluations.
 * Acts as a wrapper component that validates URL parameters and renders the EvaluationCase component.
 * Handles navigation validation and redirects to home if required parameters are missing or invalid.
 * Designed for immersive case study evaluations that require full screen real estate.
 * @returns {React.ReactElement} Full screen evaluation case component
 */
const EvaluationCaseScren = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getAllCourses, courseExists } = useAuth();
  
  // Extract module and course from URL params
  const searchParams = new URLSearchParams(location.search);
  const moduleId = searchParams.get('module');
  const courseTitle = searchParams.get('course');

  /**
   * Effect hook for URL parameter validation and navigation protection.
   * Ensures both moduleId and courseTitle are present in URL parameters before rendering.
   * Validates that the specified course exists in the system using courseExists function.
   * Redirects to home page if any validation fails to prevent rendering invalid states.
   * Critical for maintaining data integrity and preventing broken evaluation sessions.
   */
  useEffect(() => {
    if (!moduleId || !courseTitle) {
      navigate('/');
      return;
    }
    
    if (getAllCourses && !courseExists(courseTitle)) {
      navigate('/');
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, courseTitle, navigate]);
  
  return (
    <div className="evaluation-screen">
      <EvaluationCase 
        moduleId={moduleId}
        courseTitle={courseTitle}
      />
    </div>
  );
};

export default EvaluationCaseScren;