"""GameState persistence — local-first; server hydrates if no local key."""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone

from auth_utils import current_user
from db import db
from models import GameStateRequest, GameState

router = APIRouter(prefix="/gamestate", tags=["gamestate"])


@router.get("")
async def get_state(user: dict = Depends(current_user)):
    state = await db.gamestates.find_one({"user_id": user["id"]}, {"_id": 0})
    if not state:
        gs = GameState().model_dump()
        gs["user_id"] = user["id"]
        gs["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.gamestates.insert_one(gs)
        state = await db.gamestates.find_one({"user_id": user["id"]}, {"_id": 0})
    state.pop("user_id", None)
    state.pop("_id", None)
    return {"state": state}


@router.post("")
async def save_state(payload: GameStateRequest, user: dict = Depends(current_user)):
    doc = dict(payload.state)
    doc["user_id"] = user["id"]
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.gamestates.update_one(
        {"user_id": user["id"]},
        {"$set": doc},
        upsert=True,
    )
    return {"ok": True}
