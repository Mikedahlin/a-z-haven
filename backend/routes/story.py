"""Story Mode — AI-generated chapters about Archie & Zeke with images."""
import os
import base64
import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from emergentintegrations.llm.chat import LlmChat, UserMessage
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

from auth_utils import current_user
from db import db
from models import StoryChapterRequest, StoryChapter

router = APIRouter(prefix="/story", tags=["story"])
log = logging.getLogger("story")

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
OPENAI_CHAT_MODEL = os.environ.get("OPENAI_CHAT_MODEL", "gpt-4o-mini")
OPENAI_IMAGE_MODEL = os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-1")

STORY_OUTLINE = [
    "The First Quiet Morning — Archie (3yo black-and-white Boston Terrier, watchful and clever) and Zeke (1.5yo blue-eyed Frenchton, a touch bigger than Archie and goofily unaware of it) wake up in the cozy sleeping nook, lamp glow, soft blankets.",
    "The Great Sock Mystery — Archie picks up a stray sock because he's learned that opening his mouth = treat from mom Lynne; Zeke decides this is also a game and full-body wags about it.",
    "Treat Kitchen Patience Academy — Archie performs polite, calculated patience (he is running the angle); Zeke just vibrates near the jar.",
    "Backyard Breeze — Zeke wants to play and forgets he's the bigger one; Archie supervises with dignity and the occasional dignified zoom.",
    "Bath Day Negotiations — Zeke splashes joyfully; Archie negotiates terms with his eyes.",
    "Movie Night on the Living Room Rug — Two dogs, one rug, a folded-up nap pile. Mike (Lynne's son, Zeke's favorite human) is mentioned with a soft tail thump.",
    "The Window Watch — Bird-time, mail-truck-time, world-time. Archie misses nothing.",
    "Birthday Quiet — Confetti soft, candles warm, both dogs eyeing the cake-adjacent air, Zeke's blue eyes shining.",
    "Seasonal Twinkle Lights — Cocoa steam and cozy sweaters hung with care. Archie poses by the lamp; Zeke is wearing his sweater inside-out and could not be prouder.",
    "The Memory Gallery — Stars overhead, soft echoes of every chapter so far, and one quiet line about how lucky Archie and Zeke are to be home.",
]


def _story_system_prompt() -> str:
    return (
        "You are the warm narrator of A–Z Haven, a cozy virtual pet world starring two dogs: "
        "Archie (gentle, observant, quietly devoted; soft tug rope, polite tail thumps) and "
        "Zeke (bright, affectionate, play-forward; bouncy ball, full-body wag). "
        "Write a single short chapter — 3 to 5 paragraphs total, ~140 words — about the prompt. "
        "Voice: sincere, poetic-brief, sweetly funny in a gentle way. Mini-moments over lists. "
        "Always name Archie and Zeke. Optionally reference the user's pet by name when given. "
        "No medical / crisis / unsafe topics. Return STRICT JSON only: "
        '{"title": "Short evocative title", "body": "the chapter prose"}.'
    )


@router.post("/chapter", response_model=StoryChapter)
async def generate_chapter(payload: StoryChapterRequest, user: dict = Depends(current_user)):
    idx = max(0, min(payload.chapter_index, len(STORY_OUTLINE) - 1))
    seed = STORY_OUTLINE[idx]
    pet_clause = (
        f" The player's beloved companion {payload.pet_name} also wanders in for one warm beat."
        if payload.pet_name
        else ""
    )

    chat_client = LlmChat(
        api_key=OPENAI_API_KEY,
        session_id=f"story-{user['id']}-{idx}",
        system_message=_story_system_prompt(),
    ).with_model("openai", OPENAI_CHAT_MODEL)

    try:
        raw = await chat_client.send_message(
            UserMessage(text=f"Chapter {idx + 1}: {seed}{pet_clause}")
        )
    except Exception as e:
        log.exception("story chat failure")
        raise HTTPException(status_code=502, detail=f"Story upstream error: {e}")

    title = f"Chapter {idx + 1}"
    body = raw or ""
    cleaned = (raw or "").strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].strip()
    try:
        parsed = json.loads(cleaned)
        title = parsed.get("title") or title
        body = parsed.get("body") or body
    except Exception:
        pass

    # Generate one illustration. Failure is non-fatal — chapter still returns.
    image_b64 = None
    try:
        gen = OpenAIImageGeneration(api_key=OPENAI_API_KEY)
        prompt = (
            f"Cozy storybook scene: {seed}. Two dogs Archie and Zeke. "
            "Warm hand-painted feel, premium illustration, organic earthy palette of cream, "
            "terracotta, moss green, ochre. No text, no watermark."
        )
        images = await gen.generate_images(prompt=prompt, model=OPENAI_IMAGE_MODEL, number_of_images=1)
        if images:
            image_b64 = base64.b64encode(images[0]).decode("utf-8")
    except Exception as e:
        log.warning("story image gen skipped: %s", e)

    chapter = StoryChapter(
        chapter_index=idx,
        title=title,
        body=body,
        image_base64=image_b64,
    )
    doc = chapter.model_dump()
    doc["user_id"] = user["id"]
    await db.story_chapters.insert_one(doc)
    return chapter


@router.get("/outline")
async def outline():
    return {"outline": [{"index": i, "seed": s} for i, s in enumerate(STORY_OUTLINE)]}
