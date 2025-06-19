import httpx
import logging
from typing import Dict, Any, List
from app.config import GRADER_API_URL

logger = logging.getLogger(__name__)

class GraderService:
    """Service for communicating with the grader API"""
    
    def __init__(self):
        self.base_url = GRADER_API_URL
        self.timeout = 300.0
    
    async def grade_evaluation(
        self,
        user_id: str,
        questions: List[Any],
        responses: List[str]
    ) -> Dict[str, Any]:
        """
        Submit evaluation to grader for standard grading
        
        Args:
            user_id: User ID
            questions: List of questions
            responses: List of user responses
            
        Returns:
            Grading results from grader API
            
        Raises:
            Exception: If grader API call fails
        """
        url = f"{self.base_url}/grade"
        payload = {
            "userID": user_id,
            "questions": questions,
            "responses": responses
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                result = response.json()
                
                logger.info(f"Grade evaluation successful for user: {user_id}")
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Grader API error {e.response.status_code}: {e.response.text}")
            raise Exception(f"Grader service error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Grader API request error: {str(e)}")
            raise Exception(f"Failed to connect to grader service: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected grader error: {str(e)}")
            raise Exception(f"Grader service error: {str(e)}")
    
    async def grade_case_evaluation(
        self,
        user_id: str,
        case_data: Dict[str, Any],
        user_response: str,
        course: str,
        level: str,
        topics: List[str]
    ) -> Dict[str, Any]:
        """
        Submit case evaluation to grader for case-based grading
        
        Args:
            user_id: User ID
            case_data: Original case evaluation data
            user_response: User's response to the case
            course: Course name
            level: Academic level
            topics: List of topics covered
            
        Returns:
            Case grading results from grader API
            
        Raises:
            Exception: If grader API call fails
        """
        url = f"{self.base_url}/grade-case"
        payload = {
            "userID": user_id,
            "case_data": case_data,
            "user_response": user_response,
            "course": course,
            "level": level,
            "topics": topics
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                result = response.json()
                
                logger.info(f"Grade case evaluation successful for user: {user_id}")
                return result
                
        except httpx.HTTPStatusError as e:
            logger.error(f"Grader API error {e.response.status_code}: {e.response.text}")
            raise Exception(f"Grader service error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Grader API request error: {str(e)}")
            raise Exception(f"Failed to connect to grader service: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected grader error: {str(e)}")
            raise Exception(f"Grader service error: {str(e)}")
