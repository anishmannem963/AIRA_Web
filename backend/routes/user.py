# routes/user.py
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from database import get_db
from routes.auth import get_current_user
from services.ai_service import generate_story, generate_motivation
from services.sentiment_service import analyze_text_sentiment

router = APIRouter(prefix="/user", tags=["user"])


def serialize_user(u: dict) -> dict:
    return {
        "_id": str(u["_id"]),
        "username": u.get("username", ""),
        "email": u.get("email", ""),
        "name": u.get("name"),
        "age": u.get("age"),
        "sex": u.get("sex"),
        "interests": u.get("interests"),
        "intro_completed": u.get("intro_completed", 0),
        "assessment_flag": u.get("assessment_flag", 0),
        "streak_count": u.get("streak_count", 0),
        "created_at": str(u.get("created_at", "")),
    }


@router.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    return serialize_user(user)


@router.put("/update")
async def update_profile(body: dict, user=Depends(get_current_user), db=Depends(get_db)):
    allowed = {"name", "age", "sex", "interests"}
    update = {k: v for k, v in body.items() if k in allowed}
    await db.users.update_one({"_id": user["_id"]}, {"$set": update})
    updated = await db.users.find_one({"_id": user["_id"]})
    return serialize_user(updated)


@router.post("/send_motivation")
async def get_motivation(user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    sentiment_doc = await db.sentiment_collection.find_one({"user_id": user_id})
    latest_score = None
    if sentiment_doc:
        sentiments = sentiment_doc.get("sentiments", [])
        if sentiments:
            latest_score = sentiments[-1].get("mental_score")
    user_info = {"name": user.get("name") or user.get("username", "friend")}
    message = await generate_motivation(user_info, latest_score)
    return {"message": message}


@router.post("/generate_story")
async def gen_story(user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    brain = await db.aira_brain.find_one({"user_id": user_id})
    summaries = []
    if brain:
        summaries = [t.get("memory", "") for t in brain.get("memory_timeline", [])[-5:]]
    user_info = {"name": user.get("name") or user.get("username", ""), "interests": user.get("interests", "")}
    story = await generate_story(summaries, user_info)
    return {"story": story}
