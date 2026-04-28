"""Pet profile route."""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone

from auth_utils import current_user
from db import db
from models import PetProfile

router = APIRouter(prefix="/pet", tags=["pet"])


@router.post("")
async def save_pet(profile: PetProfile, user: dict = Depends(current_user)):
    doc = profile.model_dump()
    doc["user_id"] = user["id"]
    doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.pets.update_one({"user_id": user["id"]}, {"$set": doc}, upsert=True)
    # Also embed into gamestate.pet_profile
    await db.gamestates.update_one(
        {"user_id": user["id"]},
        {"$set": {"pet_profile": profile.model_dump(), "updated_at": doc["updated_at"]}},
        upsert=True,
    )
    return {"ok": True, "pet": profile.model_dump()}


@router.get("")
async def get_pet(user: dict = Depends(current_user)):
    pet = await db.pets.find_one({"user_id": user["id"]}, {"_id": 0, "user_id": 0})
    return {"pet": pet}
