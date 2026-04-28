"""Public sharing — postcards & story chapters via short tokens."""
import os
import secrets
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from auth_utils import current_user
from db import db

router = APIRouter(prefix="/share", tags=["share"])
log = logging.getLogger("share")


def _short_id(n: int = 10) -> str:
    # url-safe random short id
    return secrets.token_urlsafe(8)[:n]


class SharePostcardRequest(BaseModel):
    chapter_index: int
    title: str
    body_excerpt: str
    thumb: str  # data URL or http URL
    author_name: Optional[str] = None  # display name override


class ShareResponse(BaseModel):
    short_id: str
    url: str
    created_at: str


@router.post("/postcard", response_model=ShareResponse)
async def create_postcard_share(payload: SharePostcardRequest, user: dict = Depends(current_user)):
    # Soft cap: 100 active shares per user
    count = await db.shared_cards.count_documents({"user_id": user["id"]})
    if count >= 100:
        raise HTTPException(status_code=429, detail="Share limit reached. Delete some first.")

    # Validate thumb size (data URL can be huge — cap at ~600KB)
    if len(payload.thumb) > 850_000:
        raise HTTPException(status_code=413, detail="Postcard image too large.")

    short_id = _short_id()
    doc = {
        "short_id": short_id,
        "user_id": user["id"],
        "user_name": user.get("name") or "A friend",
        "user_picture": user.get("picture"),
        "type": "postcard",
        "chapter_index": payload.chapter_index,
        "title": payload.title,
        "body_excerpt": payload.body_excerpt,
        "thumb": payload.thumb,
        "author_name": payload.author_name or user.get("name") or "A friend",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "views": 0,
    }
    await db.shared_cards.insert_one(doc)
    return ShareResponse(
        short_id=short_id,
        url=f"/share/{short_id}",
        created_at=doc["created_at"],
    )


@router.get("/{short_id}")
async def get_shared(short_id: str):
    """Public read — no auth required."""
    doc = await db.shared_cards.find_one(
        {"short_id": short_id},
        {"_id": 0, "user_id": 0},
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Postcard not found or expired.")
    # increment view count (fire-and-forget)
    await db.shared_cards.update_one({"short_id": short_id}, {"$inc": {"views": 1}})
    return doc


@router.delete("/postcard/{short_id}")
async def delete_share(short_id: str, user: dict = Depends(current_user)):
    res = await db.shared_cards.delete_one({"short_id": short_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found or not yours.")
    return {"ok": True}


@router.get("/me/list")
async def list_my_shares(user: dict = Depends(current_user)):
    cur = db.shared_cards.find(
        {"user_id": user["id"]},
        {"_id": 0, "user_id": 0, "thumb": 0},  # omit large field on list
    ).sort("created_at", -1).limit(50)
    items = await cur.to_list(50)
    return {"items": items}
