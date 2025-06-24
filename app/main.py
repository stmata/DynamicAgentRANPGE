"""
FastAPI entry‑point.
No longer initializes agents at startup - uses lazy initialization.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from threading import Event
import asyncio
import uvicorn

from app.state import agents_cache
from app.api import evaluation_routes, admin_routes, chat_routes, users_routes, auth_routes
from app.logs import logger

tools_ready = Event()
tools_ready.set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("[startup] Using lazy agent initialization - server ready")
    yield

app = FastAPI(
    title="LLM Concurrent API",
    lifespan=lifespan 
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
    return {"status": "ready", "cached_agents": list(agents_cache.keys())}

if __name__ == "__main__":                    # dev mode
    uvicorn.run(app, host="0.0.0.0", port=8000, workers=1)