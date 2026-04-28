"""Daily greeting — first-of-day cozy narrator note about Archie & Zeke."""
import os
import logging
from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, HTTPException
from emergentintegrations.llm.chat import LlmChat, UserMessage

from auth_utils import current_user
from db import db
from personas import build_system_prompt

router = APIRouter(prefix="/daily", tags=["daily"])
log = logging.getLogger("daily")

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
OPENAI_CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o-mini")


def _today_iso() -> str:
    return date.today().isoformat()


@router.get("/greeting")
async def daily_greeting(force: bool = False, user: dict = Depends(current_user)):
    """Return today's narrator greeting. Cached to gamestate; force=true to regenerate."""
    state = await db.gamestates.find_one({"user_id": user["id"]}, {"_id": 0})
    today = _today_iso()
    last = (state or {}).get("last_daily_greeting_at") if state else None
    cached = (state or {}).get("daily_greeting") if state else None

    if not force and last == today and cached:
        return {"greeting": cached, "date": today, "fresh": False}

    pet_name = None
    pp = (state or {}).get("pet_profile") or {}
    if isinstance(pp, dict) and pp.get("pet_name"):
        pet_name = pp["pet_name"]

    pet_clause = ""
    if pet_name:
        pet_clause = f"Mention the human's pet {pet_name} too in one beat. "
    sys_prompt = build_system_prompt("narrator", None) + (
        "\n\nThis is the *first-of-day* greeting for the human. Open with one warm "
        "specific mini-moment from Archie or Zeke (or both) noticing the human is back. "
        + pet_clause +
        "Two short sentences max — under 50 words. No greetings like 'Hello!' or 'Hey there!' — "
        "just go straight into the moment, like a sweet text from someone who loves you."
    )
    chat = LlmChat(
        api_key=OPENAI_API_KEY,
        session_id=f"daily-{user['id']}-{today}",
        system_message=sys_prompt,
    ).with_model("openai", OPENAI_CHAT_MODEL)

    try:
        reply = await chat.send_message(
            UserMessage(text=f"It's {datetime.now(timezone.utc).strftime('%A %B %d')}, the human just opened the haven.")
        )
    except Exception as e:
        log.exception("daily greeting failure")
        raise HTTPException(status_code=502, detail=f"Greeting upstream error: {e}")

    greeting = (reply or "Welcome back. Archie just opened one eye.").strip().strip('"')

    await db.gamestates.update_one(
        {"user_id": user["id"]},
        {"$set": {
            "daily_greeting": greeting,
            "last_daily_greeting_at": today,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
        upsert=True,
    )
    return {"greeting": greeting, "date": today, "fresh": True}
