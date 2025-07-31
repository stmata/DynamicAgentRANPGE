from pydantic import BaseModel, EmailStr
from typing import Optional


class RefreshTokenRequest(BaseModel):
    """Request model for refreshing access token."""
    refresh_token: str

class TokenResponse(BaseModel):
    """Response model for token operations."""
    access_token: str
    token_type: str
    access_token_expires: float

class LogoutResponse(BaseModel):
    """Response model for logout operation."""
    message: str
    status: bool

class AuthErrorResponse(BaseModel):
    """Response model for authentication errors."""
    message: str
    status: bool
    detail: Optional[str] = None

class EmailRequest(BaseModel):
    """Request model for sending verification code to email."""
    email: EmailStr

class VerificationRequest(BaseModel):
    """Request model for verifying email with code."""
    email: EmailStr
    code: str

class VerificationResponse(BaseModel):
    """Response model for successful email verification."""
    user_id: str
    status: bool
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: Optional[str] = None
    access_token_expires: Optional[float] = None
    refresh_token_expires: Optional[float] = None