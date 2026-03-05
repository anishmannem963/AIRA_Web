# config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "airadb"
    SECRET_KEY: str = "changeme"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    GROQ_API_KEY: str = ""
    FERNET_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
