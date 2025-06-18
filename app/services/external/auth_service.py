from datetime import datetime, timedelta, timezone
import json
from typing import Optional, Dict
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import redis
from azure.identity import DefaultAzureCredential
from app.logs import logger
import os
from dotenv import load_dotenv

security = HTTPBearer()

class AuthService:
    """
    A service class for handling JWT token operations including creation, verification, 
    refresh, and revocation using Azure Redis as storage backend.
    """
    
    def __init__(self):
        """
        Initialize the AuthService with Azure Redis connection and JWT configuration.
        Loads environment variables and sets up Redis connection with Azure authentication.
        """
        load_dotenv()

        # Redis configuration
        redis_host = os.getenv("REDIS_HOST")
        redis_port = int(os.getenv("REDIS_PORT", 6380))
        redis_username = os.getenv("REDIS_USERNAME", "default")

        try:
            # Azure authentication for Redis
            credential = DefaultAzureCredential()
            token = credential.get_token("https://redis.azure.com/.default").token

            logger.info(f"🌐 Connecting to Azure Redis: {redis_host}:{redis_port} with user {redis_username}")

            # Initialize Redis client with Azure authentication
            self.redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                ssl=True,
                decode_responses=True,
                username=redis_username,
                password=token
            )

            # Test connection
            self.redis_client.ping()
            logger.info("✅ Azure Redis connection successful")

        except Exception as e:
            logger.error(f"❌ Azure Redis connection failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )

        # JWT configuration
        self.SECRET_KEY = os.getenv("JWT_SECRET_KEY")
        self.REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY")
        self.ALGORITHM = "HS256"
        self.ACCESS_TOKEN_EXPIRE_MINUTES = 2 * 60
        self.REFRESH_TOKEN_EXPIRE_DAYS = 7

    def create_tokens(self, user_id: str) -> Dict[str, str]:
        """
        Create a new pair of access and refresh tokens for a given user.
        
        Args:
            user_id (str): The unique identifier of the user
            
        Returns:
            Dict[str, str]: A dictionary containing access token, refresh token, 
                           token type, and expiration timestamps, or None if creation fails
        """
        try:
            access_token_expires = datetime.now(timezone.utc) + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
            refresh_token_expires = datetime.now(timezone.utc) + timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS)

            access_token = jwt.encode(
                {"sub": str(user_id), "exp": access_token_expires},
                self.SECRET_KEY,
                algorithm=self.ALGORITHM
            )

            refresh_token = jwt.encode(
                {"sub": str(user_id), "exp": refresh_token_expires},
                self.REFRESH_SECRET_KEY,
                algorithm=self.ALGORITHM
            )
            
            token_data = {
                "user_id": str(user_id),
                "access_token": access_token,
                "refresh_token": refresh_token,
                "access_token_expires": access_token_expires.isoformat(),
                "refresh_token_expires": refresh_token_expires.isoformat(),
                "is_revoked": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            token_json = json.dumps(token_data)
            pipeline = self.redis_client.pipeline()
            
            pipeline.set(f"token:{access_token}", token_json, ex=int(timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES).total_seconds()))
            
            pipeline.set(f"refresh:{refresh_token}", token_json, ex=int(timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()))
            
            pipeline.sadd(f"user_tokens:{user_id}", access_token)
            pipeline.expire(f"user_tokens:{user_id}", int(timedelta(days=self.REFRESH_TOKEN_EXPIRE_DAYS).total_seconds()))
            
            pipeline.execute()
            
            logger.info(f"Tokens created successfully for user: {user_id}")
            
            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "access_token_expires": access_token_expires.timestamp(),
                "refresh_token_expires": refresh_token_expires.timestamp()
            }
        except Exception as e:
            logger.error(f"Error creating tokens: {str(e)}")
            return None

    def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, str]]:
        """
        Generate a new access token using a valid refresh token.
        
        Args:
            refresh_token (str): The refresh token to use for generating a new access token
            
        Returns:
            Optional[Dict[str, str]]: A dictionary containing the new access token and 
                                   expiration timestamp, or None if refresh fails
        """
        try:
            token_data_str = self.redis_client.get(f"refresh:{refresh_token}")
            if not token_data_str:
                logger.warning("No valid refresh token found in Redis")
                return None
                
            token_data = json.loads(token_data_str)
            if token_data.get("is_revoked"):
                logger.warning("Refresh token has been revoked")
                return None

            refresh_expires = datetime.fromisoformat(token_data["refresh_token_expires"])
            if refresh_expires < datetime.now(timezone.utc):
                logger.warning("Refresh token has expired")
                return None

            try:
                payload = jwt.decode(refresh_token, self.REFRESH_SECRET_KEY, algorithms=[self.ALGORITHM])
            except jwt.InvalidTokenError:
                logger.warning("Invalid refresh token signature")
                return None

            user_id = payload.get("sub")
            if not user_id:
                logger.warning("No user ID found in refresh token")
                return None

            access_token_expires = datetime.now(timezone.utc) + timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES)
            new_access_token = jwt.encode(
                {"sub": user_id, "exp": access_token_expires},
                self.SECRET_KEY,
                algorithm=self.ALGORITHM
            )

            token_data.update({
                "access_token": new_access_token,
                "access_token_expires": access_token_expires.isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            })

            token_json = json.dumps(token_data)
            pipeline = self.redis_client.pipeline()
            
            pipeline.set(f"token:{new_access_token}", token_json, ex=int(timedelta(minutes=self.ACCESS_TOKEN_EXPIRE_MINUTES).total_seconds()))
            
            pipeline.sadd(f"user_tokens:{user_id}", new_access_token)
            
            pipeline.execute()

            logger.info(f"Access token refreshed successfully for user: {user_id}")

            return {
                "access_token": new_access_token,
                "token_type": "bearer",
                "access_token_expires": access_token_expires.timestamp()
            }

        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            return None

    def verify_token(self, token: str) -> Optional[str]:
        """
        Verify the validity of an access token and return the associated user ID.
        
        Args:
            token (str): The access token to verify
            
        Returns:
            Optional[str]: The user ID associated with the token if valid, None otherwise
        """
        try:
            token_data_str = self.redis_client.get(f"token:{token}")
            if not token_data_str:
                logger.warning("Token not found in Redis")
                return None

            token_data = json.loads(token_data_str)
            if token_data.get("is_revoked"):
                logger.warning("Token has been revoked")
                return None

            payload = jwt.decode(token, self.SECRET_KEY, algorithms=[self.ALGORITHM])
            user_id = payload.get("sub")
            
            if user_id:
                logger.debug(f"Token verified successfully for user: {user_id}")
            
            return user_id

        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}")
            return None

    def revoke_all_tokens(self, user_id: str) -> bool:
        """
        Revoke all tokens associated with a specific user by marking them as revoked.
        
        Args:
            user_id (str): The unique identifier of the user whose tokens should be revoked
            
        Returns:
            bool: True if tokens were successfully revoked, False otherwise
        """
        try:
            token_keys = self.redis_client.smembers(f"user_tokens:{user_id}")
            
            if not token_keys:
                logger.info(f"No tokens found for user: {user_id}")
                return False

            pipeline = self.redis_client.pipeline()
            
            for token in token_keys:
                token_data_str = self.redis_client.get(f"token:{token}")
                if token_data_str:
                    token_data = json.loads(token_data_str)
                    token_data["is_revoked"] = True
                    pipeline.set(f"token:{token}", json.dumps(token_data))

            pipeline.delete(f"user_tokens:{user_id}")
            
            pipeline.execute()
            
            logger.info(f"All tokens revoked successfully for user: {user_id}")
            return True

        except Exception as e:
            logger.error(f"Error revoking tokens: {str(e)}")
            return False
    
    async def get_current_user(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
        """
        FastAPI dependency function to extract and verify the current user from the authorization header.
        
        Args:
            credentials (HTTPAuthorizationCredentials): The HTTP Bearer token credentials
            
        Returns:
            str: The user ID of the authenticated user
            
        Raises:
            HTTPException: If token verification fails or user is not authenticated
        """
        try:
            token = credentials.credentials
            user_id = self.verify_token(token)
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token"
                )
            return user_id
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in token verification: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )

    async def get_current_user_id(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
        """
        Alias for get_current_user method for clarity when only user ID is needed
        """
        return await self.get_current_user(credentials)
    
    def cleanup_expired_tokens(self) -> int:
        """
        Clean up expired tokens. This method returns 0 as Azure Redis automatically handles 
        token expiration through TTL (Time To Live) set during token creation.
        
        Returns:
            int: Always returns 0 since manual cleanup is not needed with Redis TTL
        """
        logger.debug("Token cleanup not needed - Azure Redis handles TTL automatically")
        return 0

# Global instance
auth_service = AuthService()