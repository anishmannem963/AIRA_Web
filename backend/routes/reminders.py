# routes/reminders.py
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from database import get_db
from routes.auth import get_current_user

router = APIRouter(prefix="/reminder", tags=["reminders"])

def serialize_reminder(r):
    return {
        "_id": str(r.get("_id", "")),
        "generated_reminder": r.get("generated_reminder", ""),
        "scheduled_time": r.get("scheduled_time", ""),
        "status": r.get("status", "pending"),
        "created_at": str(r.get("created_at", "")),
    }

@router.get("/get_all_reminders")
async def get_all(user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    doc = await db.reminders.find_one({"user_id": user_id})
    if not doc:
        return []
    return [serialize_reminder(r) for r in doc.get("daily_reminders", [])]

@router.post("/add_reminder")
async def add_reminder(body: dict, user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    reminder = {
        "_id": ObjectId(),
        "generated_reminder": body.get("generated_reminder", ""),
        "scheduled_time": body.get("scheduled_time", ""),
        "status": "pending",
        "created_at": datetime.utcnow(),
    }
    await db.reminders.update_one(
        {"user_id": user_id},
        {"$push": {"daily_reminders": reminder}},
        upsert=True
    )
    return serialize_reminder(reminder)

@router.put("/update_reminder")
async def update_reminder(body: dict, user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    rid = body.get("id")
    await db.reminders.update_one(
        {"user_id": user_id, "daily_reminders._id": ObjectId(rid)},
        {"$set": {
            "daily_reminders.$.generated_reminder": body.get("generated_reminder", ""),
            "daily_reminders.$.scheduled_time": body.get("scheduled_time", ""),
        }}
    )
    return {"message": "Updated"}

@router.delete("/delete_reminder")
async def delete_reminder(body: dict, user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    rid = body.get("id")
    await db.reminders.update_one(
        {"user_id": user_id},
        {"$pull": {"daily_reminders": {"_id": ObjectId(rid)}}}
    )
    return {"message": "Deleted"}
