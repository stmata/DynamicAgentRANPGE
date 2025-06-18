from pydantic import BaseModel
from typing import List, Optional

class TopicResponse(BaseModel):
    """Response model for module topics."""
    program: str
    level: str
    course: str
    module: str
    topics: List[str]
    last_updated: Optional[str] = None

class TopicsListResponse(BaseModel):
    """Response model for listing all available topics."""
    total_modules: int
    modules: List[TopicResponse]

class TopicRequest(BaseModel):
    """Request model for topic operations."""
    course: str
    module: str