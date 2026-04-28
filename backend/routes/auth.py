"""Auth routes — Google ID token sign-in.

REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
"""
from fastapi import APIRouter, Depends, Response
from datetime import datetime, timezone

from auth_utils import verify_google_id_token, issue_jwt, current_user
from db import db
from models import GoogleAuthRequest, User

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google")
async def google_sign_in(payload: GoogleAuthRequest, response: Response):
    info = verify_google_id_token(payload.credential)
    sub = info["sub"]
    email = info.get("email", "")
    name = info.get("name", email.split("@")[0] if email else "Friend")
    picture = info.get("picture")

    existing = await db.users.find_one({"google_sub": sub}, {"_id": 0})
    if existing:
        user = existing
    else:
        new_user = User(email=email, name=name, picture=picture, google_sub=sub)
        doc = new_user.model_dump()
        await db.users.insert_one(doc)
        user = doc
        # Seed an initial GameState
        from models import GameState
        gs = GameState().model_dump()
        gs["user_id"] = user["id"]
        gs["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.gamestates.insert_one(gs)

    token = issue_jwt(user["id"], user["email"])
    response.set_cookie(
        key="az_session",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=30 * 24 * 3600,
    )
    return {"user": {k: v for k, v in user.items() if k != "_id"}, "token": token}


@router.get("/me")
async def me(user: dict = Depends(current_user)):
    return {"user": user}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("az_session")
    return {"ok": True}
