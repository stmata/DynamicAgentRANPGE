import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext'; 
import EvaluationCase from '../components/EvaluationCase/EvaluationCase';

/**
 * Evaluation screen component with full screen layout
 * 
 * @returns {React.ReactElement} Evaluation screen component
 */
const EvaluationCaseScren = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getAllCourses, courseExists } = useAuth();
  
  // Extract module and course from URL params
  const searchParams = new URLSearchParams(location.search);
  const moduleId = searchParams.get('module');
  const courseTitle = searchParams.get('course');

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