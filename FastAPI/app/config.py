import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from urllib.parse import quote_plus

class Settings(BaseSettings):
    # Core
    DEBUG: bool = False
    SECRET_KEY: str = "your-super-secret-key-here-change-this-in-production"
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Database
    USE_SQLITE: bool = True  # Default to SQLite for development
    USE_POSTGRESQL: bool = False  # Django-style compatibility flag
    AUTO_CREATE_TABLES: bool = False  # Keep False for shared/prod DBs; run create_tables.py explicitly instead
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    DB_NAME: str = "postgres"
    DB_SSLMODE: str = "require"
    
    # CORS
    CORS_ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://10.0.11.154:8000",
        "http://localhost:8081",
        "http://localhost:8082",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:8082",
        "http://10.0.11.154:8081",
        "http://10.0.11.154:8082",
        "https://aivirtualhealthassistant.web.app",
        "https://aivirtualhealthassistant.firebaseapp.com",
        "*", # Allow all for development flexibility
    ]
    
    # ML
    ML_MODEL_PATH: str = "ML/models/disease_predictor_v2.pkl"
    ML_DATASETS_PATH: str = "ML/Datasets/active"
    
    # AI Keys
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    COHERE_API_KEY: str = ""
    ZENMUX_API_KEY: str = ""
    
    # Rasa
    RASA_SERVER_URL: str = "http://localhost:5005"
    
    # Cloudinary
    CLOUD_NAME: str = ""
    API_KEY: str = ""
    API_SECRET: str = ""
    
    # SMTP / Brevo
    SMTP_SERVER: str = "smtp-relay.brevo.com"
    SMTP_PORT: int = 587
    LOGIN: str = ""
    SMTP_KEY: str = ""
    EMAILS_FROM_EMAIL: str = "healthassistant778@gmail.com"
    EMAILS_FROM_NAME: str = "CPSU Health Assistant"
    
    @property
    def DATABASE_URL(self) -> str:
        use_sqlite = self.USE_SQLITE and not self.USE_POSTGRESQL
        if use_sqlite:
            return "sqlite+aiosqlite:///./db.sqlite3"

        safe_user = quote_plus(self.DB_USER)
        safe_password = quote_plus(self.DB_PASSWORD)
        return (
            f"postgresql+asyncpg://{safe_user}:{safe_password}@"
            f"{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?ssl={self.DB_SSLMODE}"
        )

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
