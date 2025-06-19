from fastapi import APIRouter, HTTPException, Depends
from typing import Dict

from app.services.external.auth_service import AuthService
from app.models.entities.user import UserCreate, UserResponse, UserUpdate
from app.repositories.user_repository import UserCollection

# ─── Dépendances ────────────────────────────────

async def get_auth_service() -> AuthService:
    """
    Dependency to get an instance of AuthService.
    Returns:
        AuthService: new instance of the authentication service.
    """
    return AuthService()

async def get_user_collection() -> UserCollection:
    """
    Dependency to get an instance of UserCollection repository.
    Returns:
        UserCollection: new instance of the user repository.
    """
    return UserCollection()

async def get_current_user(auth_service: AuthService = Depends(get_auth_service)):
    """
    Dependency to get the current authenticated user ID.
    Raises 401 if user is not authenticated.
    """
    return await auth_service.get_current_user()

router = APIRouter(
    prefix="/api/users",
    tags=["users"],
    dependencies=[Depends(get_current_user)] 
)

@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    user_data: UserCreate,
    user_collection: UserCollection = Depends(get_user_collection)
):
    """
    Creates a new user.
    """
    # Check if email already exists
    existing_user = await user_collection.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="This email is already in use")
    
    # Create the user
    user_id = await user_collection.create_user(
        user_data
    )
    
    # Retrieve the created user
    new_user = await user_collection.get_user_by_id(user_id)
    return new_user

@router.get("/id-user/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    user_collection: UserCollection = Depends(get_user_collection)
):
    """
    Retrieves user information.
    """
    user = await user_collection.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user 

@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email(
    email: str,
    user_collection: UserCollection = Depends(get_user_collection)
):
    """
    Retrieves a user by their email address.
    """
    user = await user_collection.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.put("/update/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    user_collection: UserCollection = Depends(get_user_collection)
):
    """
    Updates user information.
    """
    # Check if user exists
    existing_user = await user_collection.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if email is already used by another user
    if update_data.email and update_data.email != existing_user.email:
        user_with_email = await user_collection.get_user_by_email(update_data.email)
        if user_with_email and str(user_with_email.id) != user_id:
            raise HTTPException(status_code=400, detail="This email is already used by another user")
    
    # Update the user
    updated_user = await user_collection.update_user(user_id, update_data)
    if not updated_user:
        raise HTTPException(status_code=500, detail="Failed to update user")
    
    return updated_user

@router.delete("/delete/{user_id}", status_code=204)
async def delete_user(
    user_id: str,
    user_collection: UserCollection = Depends(get_user_collection)
):
    """
    Deletes a user.
    """
    # Check if user exists
    existing_user = await user_collection.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete the user
    success = await user_collection.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete user")
    
    return {"message": "User deleted successfully", "user_id": user_id}

@router.patch("/{user_id}/login", response_model=Dict[str, bool])
async def update_last_login(
    user_id: str,
    user_collection: UserCollection = Depends(get_user_collection)
):
    """
    Updates the last login date of a user.
    """
    # Check if user exists
    existing_user = await user_collection.get_user_by_id(user_id)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update the last login date
    success = await user_collection.update_last_login(user_id)
    return {"success": success}
