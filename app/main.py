"""
FastAPI entry‑point.
Initialises global agent in every worker on startup.
Optimized for Gunicorn + UvicornWorker deployment.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from icecream import ic
import uvicorn
import asyncio
import signal
from app.state import reload_agent_from_json, tools
from app.api import evaluation_routes, admin_routes, chat_routes, users_routes, auth_routes
from app.logs import logger

# Global variables to track state
tools_loading = True
tools_loaded = False
loading_error = None
background_task = None
shutdown_event = None

async def load_tools_background():
    """
    Background task to load tools.
    Keeps running indefinitely to prevent Gunicorn shutdown.
    """
    global tools_loading, tools_loaded, loading_error, shutdown_event
    
    try:
        logger.info("Starting background tool loading...")
        await reload_agent_from_json()
        
        tools_loaded = True
        tools_loading = False
        logger.info(f"Tool loading complete: {len(tools)} tools")
        
    except Exception as e:
        loading_error = str(e)
        tools_loading = False
        logger.error(f"Tool loading failed: {str(e)}")
    
    # Keep the task alive to prevent Gunicorn from shutting down
    # This is crucial for Gunicorn stability
    try:
        while not shutdown_event.is_set():
            await asyncio.sleep(60)  # Heartbeat every minute
            logger.debug("Background task heartbeat")
    except asyncio.CancelledError:
        logger.info("Background task cancelled during shutdown")
        raise

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager optimized for Gunicorn.
    """
    global background_task, shutdown_event
    
    logger.info("Application starting - health check ready")
    
    # Create shutdown event
    shutdown_event = asyncio.Event()
    
    # Start background loading task
    background_task = asyncio.create_task(load_tools_background())
    
    # Setup signal handlers for graceful shutdown
    def signal_handler(signum, frame):
        logger.info(f"Received signal {signum}, initiating graceful shutdown")
        if shutdown_event:
            shutdown_event.set()
    
    # Register signal handlers
    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    
    try:
        yield
    finally:
        # Graceful shutdown
        logger.info("Initiating graceful shutdown...")
        
        if shutdown_event:
            shutdown_event.set()
        
        if background_task and not background_task.done():
            logger.info("Cancelling background task...")
            background_task.cancel()
            try:
                await asyncio.wait_for(background_task, timeout=5.0)
            except (asyncio.CancelledError, asyncio.TimeoutError):
                logger.info("Background task cleanup completed")
        
        logger.info("Application shutdown complete")

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
        
        return {
            "status": "healthy", 
            "ready": True, 
            "tools_loaded": tools_count,
            "tools_loading": tools_loading,
            "tools_ready": tools_loaded,
            "loading_error": loading_error,
            "background_task_running": background_task and not background_task.done() if background_task else False
        }
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        return {
            "status": "healthy", 
            "ready": True, 
            "tools_loaded": 0,
            "tools_loading": tools_loading,
            "tools_ready": tools_loaded
        }

@app.get("/")
async def root():
    """
    Root endpoint for Azure App Service.
    Returns basic application information.
    """
    try:
        tools_count = len(tools) if tools is not None else 0
        return {
            "message": "LLM API is running", 
            "status": "ready", 
            "tools_loaded": tools_count,
            "tools_ready": tools_loaded
        }
    except Exception as e:
        logger.error(f"Error in root endpoint: {str(e)}")
        return {
            "message": "LLM API is running", 
            "status": "ready", 
            "tools_loaded": 0,
            "tools_ready": tools_loaded
        }

@app.get("/tools/status")
async def tools_status():
    """
    Dedicated endpoint to check tool loading status.
    """
    return {
        "tools_loading": tools_loading,
        "tools_ready": tools_loaded,
        "tools_count": len(tools) if tools is not None else 0,
        "loading_error": loading_error,
        "background_task_alive": background_task and not background_task.done() if background_task else False
    }

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
