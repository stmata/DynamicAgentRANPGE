# app/main.py

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.routes.grade import router as grade_router

app = FastAPI(
    title="Grader Service",
    description="Grades MCQ & open-ended responses and returns detailed feedback + study guide",
    docs_url=None,  
    redoc_url=None,  
    openapi_url=None  
)

# Configure CORS with restricted origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ranpge-test.skema.edu",
        "https://middleware-ranpge-test.skema.edu"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Mount the grader router at root
app.include_router(grade_router)