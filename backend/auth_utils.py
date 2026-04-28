"""Auth helpers — verify Google ID tokens, issue/verify our JWT cookies.

REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
"""
import os
import time
from typing import Optional
import jwt
from fastapi import HTTPException, Request, Depends
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from db import db

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_DAYS = int(os.environ.get("JWT_EXPIRES_DAYS", "30"))
GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]


def verify_google_id_token(credential: str) -> dict:
    """Validate a Google ID token (credential from GIS) and return the payload."""
    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
        return payload
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google token: {e}")


def issue_jwt(user_id: str, email: str) -> str:
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": email,
        "iat": now,
        "exp": now + (JWT_DAYS * 24 * 3600),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


def _extract_token(request: Request) -> Optional[str]:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:]
    return request.cookies.get("az_session")


async def current_user(request: Request) -> dict:
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_jwt(token)
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def optional_user(request: Request) -> Optional[dict]:
    token = _extract_token(request)
    if not token:
        return None
    try:
        payload = decode_jwt(token)
        return await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    except HTTPException:
        return None
