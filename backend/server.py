"""A–Z Haven backend — FastAPI entrypoint."""
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import logging
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

from db import db, client  # noqa: E402
from routes.auth import router as auth_router  # noqa: E402
from routes.gamestate import router as gamestate_router  # noqa: E402
from routes.chat import router as chat_router  # noqa: E402
from routes.image import router as image_router  # noqa: E402
from routes.story import router as story_router  # noqa: E402
from routes.pet import router as pet_router  # noqa: E402
from routes.voice import router as voice_router  # noqa: E402
from routes.daily import router as daily_router  # noqa: E402
from routes.share import router as share_router  # noqa: E402

app = FastAPI(title="A–Z Haven API")

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"app": "A–Z Haven", "status": "ok"}


@api_router.get("/health")
async def health():
    try:
        await db.command("ping")
        return {"status": "ok", "db": "ok"}
    except Exception as e:
        return {"status": "degraded", "db": str(e)}


api_router.include_router(auth_router)
api_router.include_router(gamestate_router)
api_router.include_router(chat_router)
api_router.include_router(image_router)
api_router.include_router(story_router)
api_router.include_router(pet_router)
api_router.include_router(voice_router)
api_router.include_router(daily_router)
api_router.include_router(share_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("azhaven")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
