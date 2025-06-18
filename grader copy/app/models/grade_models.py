"""
Grade evaluation models

This module contains all Pydantic models used for grade evaluation endpoints.
"""

from pydantic import BaseModel
from typing import List, Any, Dict


class GradeRequest(BaseModel):
    """Request model for standard grading endpoint"""
    userID: str
    questions: List[List[Any]]
    responses: List[str]


class GradeResponse(BaseModel):
    """Response model for standard grading endpoint"""
    results: List[Dict[str, Any]]
    study_guide: str
    final_score: int 


class DetailedAnalysis(BaseModel):
    """Detailed analysis model for case evaluation"""
    strengths: List[str]
    improvements: List[str]


class CaseGradeRequest(BaseModel):
    """Request model for case evaluation grading endpoint"""
    userID: str
    case_data: Dict[str, Any]
    user_response: str
    course: str
    level: str
    topics: List[str]


class CaseGradeResponse(BaseModel):
    """Response model for case evaluation grading endpoint"""
    score: int
    feedback: str
    detailed_analysis: DetailedAnalysis 