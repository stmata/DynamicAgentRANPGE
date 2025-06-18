"""
FastAPI entry‑point.
Initialises global agent in every worker on startup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from icecream import ic
import uvicorn
from app.state import reload_agent_from_json, tools
from app.api import evaluation_routes, admin_routes, chat_routes, users_routes, auth_routes
from app.logs import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    await reload_agent_from_json()
    #ic(f"worker ready → {len(tools)} tools")
    logger.info(f"worker ready → {len(tools)} tools")

    yield

app = FastAPI(title="LLM Concurrent API",lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
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