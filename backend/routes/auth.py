# routes/auth.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from datetime import datetime
from bson import ObjectId
from database import get_db
from services.auth_service import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token
)

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


def serialize_user(u: dict) -> dict:
    return {
        "_id": str(u["_id"]),
        "username": u.get("username", ""),
        "email": u.get("email", ""),
        "intro_completed": u.get("intro_completed", 0),
        "assessment_flag": u.get("assessment_flag", 0),
        "created_at": str(u.get("created_at", "")),
    }


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")
    user_id = payload.get("sub")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register")
async def register(req: RegisterRequest, db=Depends(get_db)):
    if await db.users.find_one({"email": req.email}):
        raise HTTPException(400, "Email already registered")
    if await db.users.find_one({"username": req.username}):
        raise HTTPException(400, "Username already taken")

    user = {
        "username": req.username,
        "email": req.email,
        "password": hash_password(req.password),
        "intro_completed": 0,
        "assessment_flag": 0,
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(user)
    user_id = str(result.inserted_id)

    # Init related collections
    await db.aira_brain.insert_one({"user_id": user_id, "memory_timeline": []})
    await db.sentiment_collection.insert_one({"user_id": user_id, "sentiments": []})
    await db.reminders.insert_one({"user_id": user_id, "daily_reminders": []})
    await db.vision_board.insert_one({"user_id": user_id, "goals": []})

    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})

    user["_id"] = result.inserted_id
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": serialize_user(user)
    }


@router.post("/login")
async def login(req: LoginRequest, db=Depends(get_db)):
    user = await db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(401, "Invalid email or password")

    user_id = str(user["_id"])
    access_token = create_access_token({"sub": user_id})
    refresh_token = create_refresh_token({"sub": user_id})
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": serialize_user(user)
    }


@router.post("/logout")
async def logout():
    return {"message": "Logged out"}


@router.post("/refresh")
async def refresh(req: RefreshRequest, db=Depends(get_db)):
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid refresh token")
    user_id = payload.get("sub")
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(401, "User not found")
    access_token = create_access_token({"sub": user_id})
    return {"access_token": access_token}


@router.post("/reset-password")
async def reset_password(body: dict, db=Depends(get_db)):
    # In production: send email with reset link
    email = body.get("email")
    if not await db.users.find_one({"email": email}):
        raise HTTPException(404, "Email not found")
    return {"message": "Reset email sent (placeholder — implement email service)"}
