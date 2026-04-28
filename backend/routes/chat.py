"""Chat — Archie, Zeke, BMO, Assistant personas. Uses user's OWN OpenAI key."""
import os
import logging
from fastapi import APIRouter, Depends, HTTPException
from emergentintegrations.llm.chat import LlmChat, UserMessage

from auth_utils import current_user
from db import db
from models import ChatRequest, ChatResponse
from personas import build_system_prompt

router = APIRouter(prefix="/chat", tags=["chat"])
log = logging.getLogger("chat")

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
OPENAI_CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o-mini")


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest, user: dict = Depends(current_user)):
    if not payload.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
    last_user = next((m for m in reversed(payload.messages) if m.role == "user"), None)
    if not last_user:
        raise HTTPException(status_code=400, detail="No user message")

    sys_prompt = build_system_prompt(payload.mode, payload.pet_profile)
    session_id = f"{user['id']}-{payload.mode}"

    chat_client = LlmChat(
        api_key=OPENAI_API_KEY,
        session_id=session_id,
        system_message=sys_prompt,
    ).with_model("openai", OPENAI_CHAT_MODEL)

    # Replay short history (last 6 user/assistant turns) so context is preserved
    history = [m for m in payload.messages if m.role in ("user", "assistant")][-7:-1]
    for m in history:
        if m.role == "user":
            await chat_client.send_message(UserMessage(text=m.content))
        # Assistant turns are implicitly stored by emergentintegrations once it replies.

    try:
        reply = await chat_client.send_message(UserMessage(text=last_user.content))
    except Exception as e:
        log.exception("chat failure")
        raise HTTPException(status_code=502, detail=f"Chat upstream error: {e}")

    # Store turn for audit
    await db.chat_messages.insert_one({
        "user_id": user["id"],
        "mode": payload.mode,
        "user_message": last_user.content[:500],
        "assistant_reply": (reply or "")[:1000],
    })

    return ChatResponse(reply=reply or "")
