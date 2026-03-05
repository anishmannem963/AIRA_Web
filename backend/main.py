# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import connect_db, close_db, get_db
from config import get_settings
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.user import router as user_router
from routes.sentiment import router as sentiment_router
from routes.reminders import router as reminders_router
from routes.visionboard import router as visionboard_router, feedback_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="AIRA API",
    description="Adaptive Interactive Responsive Assistant — Mental Wellness Backend",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth_router,       prefix="/api")
app.include_router(chat_router,       prefix="/api")
app.include_router(user_router,       prefix="/api")
app.include_router(sentiment_router,  prefix="/api")
app.include_router(reminders_router,  prefix="/api")
app.include_router(visionboard_router,prefix="/api")
app.include_router(feedback_router,   prefix="/api")


@app.get("/")
async def root():
    return {"message": "AIRA API v2.0 🧠💜", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
