# routes/sentiment.py
from fastapi import APIRouter, Depends
from datetime import datetime
from bson import ObjectId
from database import get_db
from routes.auth import get_current_user
from services.sentiment_service import analyze_text_sentiment

router = APIRouter(prefix="/sentiment", tags=["sentiment"])

@router.get("/get_sentiments")
async def get_sentiments(user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    doc = await db.sentiment_collection.find_one({"user_id": user_id})
    if not doc:
        return []
    return doc.get("sentiments", [])

@router.post("/analyze")
async def analyze(user=Depends(get_current_user), db=Depends(get_db)):
    user_id = str(user["_id"])
    # Get recent messages
    cursor = db.chat_history.find({"user_id": user_id}).sort("created_at", -1).limit(5)
    texts = []
    async for session in cursor:
        for msg in session.get("messages", []):
            if msg.get("role") == "user":
                texts.append(msg.get("content", ""))

    result = analyze_text_sentiment(texts)
    result["date"] = datetime.utcnow().strftime("%Y-%m-%d")

    await db.sentiment_collection.update_one(
        {"user_id": user_id},
        {"$push": {"sentiments": result}},
        upsert=True
    )
    return result
