# database.py
from motor.motor_asyncio import AsyncIOMotorClient
from config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DB_NAME]
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.chat_history.create_index("user_id")
    await db.journals.create_index("user_id")
    await db.sentiment_collection.create_index("user_id")
    await db.reminders.create_index("user_id")
    await db.vision_board.create_index("user_id")
    await db.aira_brain.create_index("user_id")
    print("✅ Connected to MongoDB")

async def close_db():
    if client:
        client.close()

def get_db():
    return db
