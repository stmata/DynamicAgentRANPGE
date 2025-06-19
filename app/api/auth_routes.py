from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import JSONResponse
from app.models.schemas.auth_models import (
    EmailRequest,
    VerificationRequest,
    RefreshTokenRequest,
    VerificationResponse,
    TokenResponse,
    LogoutResponse
)
from app.services.external.auth_service import auth_service
from app.services.external.email_service import email_service
from app.repositories.user_repository import UserCollection
from app.logs import logger

router = APIRouter(prefix="/api/auth", tags=["authentication"])

async def get_user_collection() -> UserCollection:
    """
    Dependency function to provide an instance of UserCollection repository.
    
    Returns:
        UserCollection: A new instance of the user repository.
    """
    return UserCollection()


@router.post("/send-verification-code")
async def send_verification_code(
    request: EmailRequest,
    user_collection: UserCollection = Depends(get_user_collection)
):
    """Send verification code to user email. Creates user if doesn't exist."""
    try:
        user_info = await user_collection.get_user_by_email(request.email)
        
        if not user_info:
            from app.models.entities.user import UserCreate
            email_prefix = request.email.split('@')[0]
            if '.' in email_prefix:
                prenom, nom = email_prefix.split('.', 1)
                username = f"{prenom.capitalize()} {nom.capitalize()}"
            else:
                username = email_prefix.capitalize()
            
            new_user_data = UserCreate(email=request.email, username=username)
            user_id = await user_collection.create_user(new_user_data)
            user_info = await user_collection.get_user_by_id(user_id)
        
        email_sent = email_service.send_verification_code(email=request.email)
        
        if email_sent:
            return {"message": "Verification code sent successfully", "status": True}
        else:
            raise HTTPException(status_code=500, detail="Failed to send verification code")

    except Exception as e:
        logger.error(f"Error sending verification code: {str(e)}")
        return JSONResponse(
            content={
                "message": "An error occurred while sending the verification code", 
                "status": False, 
                "detail": str(e)
            },
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.post("/verify-code", response_model=VerificationResponse)
async def verify_code(
    request: VerificationRequest,
    user_collection: UserCollection = Depends(get_user_collection)
):
    """Verify the code and generate authentication tokens."""
    try:
        is_valid = email_service.verify_code(request.email, request.code)
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
        user_info = await user_collection.get_user_by_email(request.email)
        if not user_info:
            raise HTTPException(status_code=404, detail="User not found")
        
        tokens = auth_service.create_tokens(str(user_info.id))
        if not tokens:
            raise HTTPException(status_code=500, detail="Failed to generate tokens")
        
        await user_collection.update_last_login(str(user_info.id))
        
        return VerificationResponse(
            user_id=str(user_info.id),
            status=True,
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            access_token_expires=tokens["access_token_expires"],
            refresh_token_expires=tokens["refresh_token_expires"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying code: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred during verification")

@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest
    ):
    """Refresh access token using refresh token."""
    try:
        new_tokens = auth_service.refresh_access_token(request.refresh_token)
        
        if not new_tokens:
            raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
        
        return TokenResponse(**new_tokens)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error refreshing token: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while refreshing token")

@router.post("/logout", response_model=LogoutResponse)
async def logout(
    current_user_id: str = Depends(auth_service.get_current_user)
    ):
    """Logout user by revoking all tokens."""
    try:
        success = auth_service.revoke_all_tokens(current_user_id)
        
        if success:
            return LogoutResponse(message="Successfully logged out", status=True)
        else:
            return LogoutResponse(message="No active tokens found", status=True)
            
    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred during logout")

@router.get("/me")
async def get_current_user_info(
    current_user_id: str = Depends(auth_service.get_current_user),
    user_collection: UserCollection = Depends(get_user_collection)
):
    """Get current authenticated user information."""
    try:
        user_info = await user_collection.get_user_by_id(current_user_id)
        if not user_info:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user_info
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user info: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while fetching user information")