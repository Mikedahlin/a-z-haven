"""Voice transcription via OpenAI Whisper using user's own API key."""
import os
import httpx
import logging
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from auth_utils import current_user

router = APIRouter(prefix="/voice", tags=["voice"])
log = logging.getLogger("voice")

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]


@router.post("/transcribe")
async def transcribe(audio: UploadFile = File(...), user: dict = Depends(current_user)):
    blob = await audio.read()
    if len(blob) == 0:
        raise HTTPException(status_code=400, detail="Empty audio")
    if len(blob) > 24 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio too large (>24MB)")
    filename = audio.filename or "voice.webm"
    try:
        async with httpx.AsyncClient(timeout=60.0) as cx:
            resp = await cx.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                files={"file": (filename, blob, audio.content_type or "audio/webm")},
                data={"model": "whisper-1", "response_format": "json"},
            )
        if resp.status_code != 200:
            log.error("whisper failure: %s %s", resp.status_code, resp.text[:300])
            raise HTTPException(status_code=502, detail=f"Whisper upstream error: {resp.status_code}")
        data = resp.json()
        return {"text": (data.get("text") or "").strip()}
    except HTTPException:
        raise
    except Exception as e:
        log.exception("whisper exception")
        raise HTTPException(status_code=502, detail=f"Whisper error: {e}")
