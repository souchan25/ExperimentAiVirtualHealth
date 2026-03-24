from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from .config import settings
from .database import engine, Base, get_db
from sqlalchemy.ext.asyncio import AsyncSession
import os
import logging

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Only auto-create tables when explicitly enabled (safer for shared/prod DBs).
    if settings.AUTO_CREATE_TABLES:
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
        except Exception as e:
            logger.warning(f"Table creation warning: {str(e)}")

    # Always run lightweight column migrations (safe & idempotent)
    try:
        from sqlalchemy import text
        async with engine.begin() as conn:
            await conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wellness_checkins' AND column_name='sleep_quality') THEN
                        ALTER TABLE wellness_checkins ADD COLUMN sleep_quality VARCHAR(50);
                    END IF;
                END
                $$;
            """))
            logger.info("Column migration check completed successfully")
    except Exception as e:
        logger.warning(f"Column migration warning (non-critical): {str(e)}")
            
    yield

app = FastAPI(
    title="CPSU Virtual Health Assistant API",
    description="FastAPI replication of the Health Assistant Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _apply_cors_headers(request: Request, response: JSONResponse) -> JSONResponse:
    """Mirror CORS headers for allowed browser origins, including error responses."""
    origin = request.headers.get("origin")
    if origin and origin in settings.CORS_ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
    return response


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    import traceback
    from datetime import datetime

    try:
        with open("error_log.txt", "a") as f:
            f.write(f"\n--- {datetime.now()} ---\n")
            f.write(f"Path: {request.url.path}\n")
            f.write(traceback.format_exc())
    except Exception:
        pass

    logger.exception("Unhandled application error", exc_info=exc)
    detail = str(exc) if settings.DEBUG else "Internal server error"
    response = JSONResponse(status_code=500, content={"detail": detail})
    return _apply_cors_headers(request, response)

# Static Files
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {
        "message": "Welcome to CPSU Virtual Health Assistant API",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/health/detail")
async def health_detail(db: AsyncSession = Depends(get_db)):
    try:
        # Check database connection
        from sqlalchemy import text
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
        
    import time
    return {
        "status": "online",
        "database": db_status,
        "api_v1": "healthy",
        "server_time": time.ctime(),
        "uptime": "stable"
    }

from .api import auth, clinic, emergency, chat, medication, followup, staff, documents, excuse_slips, inventory, wellness, notifications, knowledge, alerts, profile, appointments, messages, reports, audit, settings as settings_router, stats as stats_router

# Register Routers
app.include_router(auth.router)
app.include_router(clinic.router)
app.include_router(emergency.router)
app.include_router(chat.router)
app.include_router(medication.router)
app.include_router(followup.router)
app.include_router(staff.router)
app.include_router(documents.router)
app.include_router(excuse_slips.router)
app.include_router(inventory.router)
app.include_router(wellness.router)
app.include_router(notifications.router)
app.include_router(knowledge.router)
app.include_router(alerts.router)
app.include_router(profile.router)
app.include_router(appointments.router)
app.include_router(messages.router)
app.include_router(reports.router)
app.include_router(audit.router)
app.include_router(settings_router.router)
app.include_router(stats_router.router)
