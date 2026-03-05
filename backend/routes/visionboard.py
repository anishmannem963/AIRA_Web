# routes/visionboard.py
from fastapi import APIRouter, Depends
from datetime import datetime
from bson import ObjectId
from database import get_db
from routes.auth import get_current_user

router = APIRouter(prefix="/visionboard", tags=["visionboard"])

@router.get("/get_goals")
async def get_goals(user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    doc = await db.vision_board.find_one({"user_id": user_id})
    if not doc:
        return []
    return [{"_id": str(g.get("_id","")), "goal": g.get("goal",""), "created_at": str(g.get("created_at",""))}
            for g in doc.get("goals", [])]

@router.post("/add_custom_goal")
async def add_goal(body: dict, user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    goal = {"_id": ObjectId(), "goal": body.get("goal",""), "created_at": datetime.utcnow()}
    await db.vision_board.update_one(
        {"user_id": user_id}, {"$push": {"goals": goal}}, upsert=True
    )
    return {"_id": str(goal["_id"]), "goal": goal["goal"]}


feedback_router = APIRouter(prefix="/feedback", tags=["feedback"])

@feedback_router.post("/submitL")
async def submit_feedback(body: dict, user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    session_id = body.get("session_id")
    message_id = body.get("message_id")
    feedback_type = body.get("feedback_type")
    comment = body.get("comment")

    if session_id and message_id:
        try:
            await db.chat_history.update_one(
                {"_id": ObjectId(session_id), "user_id": user_id, "messages._id": ObjectId(message_id)},
                {"$set": {
                    "messages.$.feedback_type": feedback_type,
                    "messages.$.comment": comment,
                }}
            )
        except Exception:
            pass

    return {"message": "Feedback recorded"}
