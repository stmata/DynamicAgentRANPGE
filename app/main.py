"""
FastAPI entry-point with background initialization of agents cache to prevent first-request latency.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from threading import Event
import asyncio
import uvicorn

from app.state import agents_cache
from app.api import evaluation_routes, admin_routes, chat_routes, users_routes, auth_routes
from app.logs import logger
from app.state import _build_agent_for_course

tools_ready = Event()


async def preload_agents():
    try:
        logger.info("[preload] Starting background agent preloading...")
        
        # Load general agent
        await _build_agent_for_course(None)
        
        from app.services.database.mongo_utils import get_service
        service = await get_service()
        course_names = await service.topics.distinct("course")
        
        for course_name in course_names:
            await _build_agent_for_course(course_name)
        
        tools_ready.set()
        logger.info(f"[preload] Agents preloaded successfully. Cached: {list(agents_cache.keys())}")
        
    except Exception as e:
        logger.error(f"[preload] Error during agent preloading: {str(e)}")
        tools_ready.set()  

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager that handles startup and shutdown events.
    
    Launches agent preloading as a background task during startup to avoid
    blocking the server initialization. The server becomes ready immediately
    while agents load asynchronously.
    
    Args:
        app (FastAPI): The FastAPI application instance.
        
    Yields:
        None: Control back to the application after startup tasks are initiated.
    """
    asyncio.create_task(preload_agents())
    logger.info("[startup] Server ready - agents loading in background")
    yield

app = FastAPI(
    title="LLM Concurrent API",
    lifespan=lifespan,
    docs_url=None,  
    redoc_url=None,  
    openapi_url=None
)

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

app.include_router(admin_routes.router)
app.include_router(evaluation_routes.router)
app.include_router(auth_routes.router)
app.include_router(chat_routes.router)
app.include_router(users_routes.router)

@app.get("/health")
async def health():
    """
    Health check endpoint to verify the application is running.
    
    Returns:
        dict: Simple status response indicating the application is operational.
    """
    return {"status": "ok"}

@app.get("/readiness")
async def readiness():
    """
    Readiness check endpoint providing detailed application state information.
    
    Returns detailed information about the application's readiness state,
    including which agents are cached and whether preloading is complete.
    
    Returns:
        dict: Application readiness status with cached agents and preload completion status.
    """
    return {
        "status": "ready", 
        "cached_agents": list(agents_cache.keys()),
        "preload_complete": tools_ready.is_set()
    }

@app.post("/preload-agents")
async def trigger_preload_agents():
    """Manually trigger agent preloading in background."""
    try:
        asyncio.create_task(preload_agents())
        return {
            "status": "started",
            "message": "Agent preloading started in background"
        }
    except Exception as e:
        logger.error(f"Error starting agent preloading: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while starting agent preloading"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)
