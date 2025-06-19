"""
FastAPI entry‑point.
Initialises global agent in every worker on startup.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from threading import Event
import asyncio
import uvicorn

from app.state import reload_agent_from_json, tools
from app.api import evaluation_routes, admin_routes, chat_routes, users_routes, auth_routes
from app.logs import logger


# Flag de readiness
tools_ready = Event()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan handler.
    Triggers background loading of the tools/agent on startup without blocking the server.
    """

    async def init_agent():
        """
        Background task to load the ReAct agent and tools.
        Sets the readiness flag when completed.
        """
        try:
            await reload_agent_from_json()
            tools_ready.set()
            logger.info(f"[startup] Tools loaded → {len(tools)} tools")
        except Exception as e:
            logger.error(f"[startup] Failed to load tools: {e}")

    # Start the tool loading process in the background
    asyncio.create_task(init_agent())
    logger.info("[startup] Agent loading in background...")

    yield

app = FastAPI(
    title="LLM Concurrent API",
    lifespan=lifespan,
    docs_url=None,  
    redoc_url=None,  
    openapi_url=None  
)

# Configure CORS
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

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/readiness")
async def readiness():
    if tools_ready.is_set():
        return {"status": "ready"}
    return {"status": "loading"}, 503

if __name__ == "__main__":                    # dev mode
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)