"""
FastAPI entry‑point.
Initialises global agent in every worker on startup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from icecream import ic
import uvicorn
import asyncio
from app.state import reload_agent_from_json, tools
from app.api import evaluation_routes, admin_routes, chat_routes, users_routes, auth_routes
from app.logs import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Marks the application as ready immediately for health checks.
    """
    logger.info("Application starting - health check ready")
    
    # Background tool loading
    async def load_tools_background():
        """
        Background task to load tools without blocking the application.
        """
        try:
            logger.info("Starting background tool loading...")
            await reload_agent_from_json()
            logger.info(f"Background tool loading complete: {len(tools)} tools")
        except Exception as e:
            logger.error(f"Background tool loading failed: {str(e)}")
    
    # Start background loading task
    asyncio.create_task(load_tools_background())
    
    yield
    
    logger.info("Application shutting down")

app = FastAPI(
    title="LLM Concurrent API",
    lifespan=lifespan,
    docs_url=None,  
    redoc_url=None,  
    openapi_url=None  
)

# Health check endpoints
@app.get("/health")
async def health_check():
    """
    Health check endpoint for Azure App Service.
    Returns application status and tool loading progress.
    """
    try:
        tools_count = len(tools) if tools is not None else 0
        return {"status": "healthy", "ready": True, "tools_loaded": tools_count}
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        return {"status": "healthy", "ready": True, "tools_loaded": 0}

@app.get("/")
async def root():
    """
    Root endpoint for Azure App Service.
    Returns basic application information.
    """
    try:
        tools_count = len(tools) if tools is not None else 0
        return {"message": "LLM API is running", "status": "ready", "tools_loaded": tools_count}
    except Exception as e:
        logger.error(f"Error in root endpoint: {str(e)}")
        return {"message": "LLM API is running", "status": "ready", "tools_loaded": 0}

# Configure CORS with restricted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ranpge-test.skema.edu",
        "https://bottomup-ranpge-test.skema.edu"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# mount routers
app.include_router(admin_routes.router)
app.include_router(evaluation_routes.router)
app.include_router(auth_routes.router)
app.include_router(chat_routes.router)
app.include_router(users_routes.router)

if __name__ == "__main__":                    # dev mode
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)
