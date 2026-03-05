# routes/chat.py
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from bson import ObjectId
from database import get_db
from routes.auth import get_current_user
from services.ai_service import chat_with_aira, intro_chat

router = APIRouter(prefix="/chat", tags=["chat"])


def msg_to_dict(m: dict) -> dict:
    return {
        "_id": str(m.get("_id", "")),
        "role": m.get("role", ""),
        "content": m.get("content", ""),
        "created_at": str(m.get("created_at", "")),
        "feedback_type": m.get("feedback_type"),
    }


class SendRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    intro: bool = False


@router.post("/start_intro")
async def start_intro(user=Depends(get_current_user), db=Depends(get_db)):
    reply, completed = await intro_chat(None, [], intro_step=0)
    return {"message": reply, "intro_completed": completed}


@router.post("/new_session")
async def new_session(user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    doc = {
        "user_id": user_id,
        "session_title": f"Session {datetime.utcnow().strftime('%b %d')}",
        "messages": [],
        "intro_flag": user.get("intro_completed", 0),
        "journal_start_flag": 0,
        "journal_end_flag": 0,
        "created_at": datetime.utcnow(),
    }
    result = await db.chat_history.insert_one(doc)
    return {"session_id": str(result.inserted_id), "session_title": doc["session_title"]}


@router.get("/sessions")
async def get_sessions(user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    cursor = db.chat_history.find({"user_id": user_id}).sort("created_at", -1).limit(20)
    sessions = []
    async for doc in cursor:
        sessions.append({
            "session_id": str(doc["_id"]),
            "session_title": doc.get("session_title", "Chat Session"),
            "created_at": str(doc.get("created_at", "")),
            "message_count": len(doc.get("messages", [])),
        })
    return sessions


@router.get("/history")
async def get_history(session_id: str, user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    doc = await db.chat_history.find_one({
        "_id": ObjectId(session_id),
        "user_id": user_id
    })
    if not doc:
        raise HTTPException(404, "Session not found")
    return [msg_to_dict(m) for m in doc.get("messages", [])]


@router.post("/send")
async def send_message(req: SendRequest, user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])

    # Intro flow
    if req.intro:
        history_doc = await db.chat_history.find_one({"user_id": user_id, "intro_session": True})
        history = []
        if history_doc:
            history = history_doc.get("messages", [])

        reply, completed = await intro_chat(req.message, history)

        new_msgs = [
            {"role": "user", "content": req.message, "created_at": datetime.utcnow()},
            {"role": "assistant", "content": reply, "created_at": datetime.utcnow()},
        ]

        if history_doc:
            await db.chat_history.update_one(
                {"_id": history_doc["_id"]},
                {"$push": {"messages": {"$each": new_msgs}}}
            )
        else:
            await db.chat_history.insert_one({
                "user_id": user_id,
                "intro_session": True,
                "messages": new_msgs,
                "created_at": datetime.utcnow()
            })

        if completed:
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"intro_completed": 1, "assessment_flag": 1}}
            )

        return {
            "content": reply,
            "role": "assistant",
            "intro_completed": completed,
            "_id": str(ObjectId()),
        }

    # Regular chat
    if not req.session_id:
        raise HTTPException(400, "session_id required for regular chat")

    session = await db.chat_history.find_one({
        "_id": ObjectId(req.session_id),
        "user_id": user_id
    })
    if not session:
        raise HTTPException(404, "Session not found")

    history = session.get("messages", [])

    # Get user memory
    brain = await db.aira_brain.find_one({"user_id": user_id})
    memory_text = ""
    if brain:
        timeline = brain.get("memory_timeline", [])
        if timeline:
            memory_text = " | ".join([t.get("memory", "") for t in timeline[-5:]])

    reply = await chat_with_aira(req.message, history, user_memory=memory_text)

    new_id = ObjectId()
    user_msg = {"_id": ObjectId(), "role": "user", "content": req.message, "created_at": datetime.utcnow()}
    ai_msg   = {"_id": new_id,     "role": "assistant", "content": reply,        "created_at": datetime.utcnow()}

    await db.chat_history.update_one(
        {"_id": ObjectId(req.session_id)},
        {"$push": {"messages": {"$each": [user_msg, ai_msg]}}}
    )

    return {
        "_id": str(new_id),
        "role": "assistant",
        "content": reply,
        "created_at": str(datetime.utcnow()),
    }
