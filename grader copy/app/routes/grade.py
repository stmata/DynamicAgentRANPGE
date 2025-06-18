"""
Grade evaluation routes

This module contains the FastAPI routes for grading operations.
All business logic has been moved to the GradeService class.
"""

from fastapi import APIRouter

from ..models.grade_models import (
    GradeRequest, GradeResponse,
    CaseGradeRequest, CaseGradeResponse
)
from ..services.grade_service import GradeService


router = APIRouter()


@router.post("/grade", response_model=GradeResponse)
async def grade_user_answers(req: GradeRequest) -> GradeResponse:
    """
    Grade user answers for standard MCQ and open-ended questions.
    
    - MCQ: direct compare
    - Open: LLM grades 0–10
    Study guide now includes:
      • missed MCQs
      • open Qs graded <10
    
    Args:
        req: GradeRequest containing user answers and questions
        
    Returns:
        GradeResponse with results, study guide and final score
    """
    return await GradeService.grade_user_answers(req)


@router.post("/grade-case", response_model=CaseGradeResponse)
async def grade_case_evaluation(req: CaseGradeRequest) -> CaseGradeResponse:
    """
    Grade a case-based evaluation response using LLM with detailed evaluation criteria.
    Returns score, feedback and detailed analysis with strengths and improvements.
    
    Args:
        req: CaseGradeRequest containing case data and user response
        
    Returns:
        CaseGradeResponse with score, feedback and detailed analysis
    """
    return await GradeService.grade_case_evaluation(req)