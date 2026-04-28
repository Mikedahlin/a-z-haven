"""Image generation — gpt-image-1 via emergentintegrations using user's own key."""
import os
import base64
import logging
from fastapi import APIRouter, Depends, HTTPException
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

from auth_utils import current_user
from db import db
from models import ImageGenRequest, ImageGenResponse

router = APIRouter(prefix="/image", tags=["image"])
log = logging.getLogger("image")

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
OPENAI_IMAGE_MODEL = os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-1")

STYLE_TOKEN = (
    "warm cozy storybook illustration, soft natural light, organic earthy palette of "
    "cream, terracotta, moss green, ochre, gentle sky blue; hand-painted feel, premium "
    "quality, no text, no watermark, no logos"
)


def _wrap_prompt(prompt: str, purpose: str) -> str:
    if purpose == "pet":
        return f"Adorable pet portrait, {prompt}, {STYLE_TOKEN}"
    if purpose == "story":
        return (
            f"Storybook scene of two dogs Archie and Zeke (a gentle quietly-devoted dog "
            f"and a bright bouncy play-forward dog) in a cozy home: {prompt}. {STYLE_TOKEN}"
        )
    return f"{prompt}. {STYLE_TOKEN}"


@router.post("/generate", response_model=ImageGenResponse)
async def generate(payload: ImageGenRequest, user: dict = Depends(current_user)):
    full_prompt = _wrap_prompt(payload.prompt, payload.purpose)
    try:
        gen = OpenAIImageGeneration(api_key=OPENAI_API_KEY)
        images = await gen.generate_images(
            prompt=full_prompt, model=OPENAI_IMAGE_MODEL, number_of_images=1
        )
    except Exception as e:
        log.exception("image gen failure")
        raise HTTPException(status_code=502, detail=f"Image gen failed: {e}")

    if not images:
        raise HTTPException(status_code=502, detail="No image returned")

    b64 = base64.b64encode(images[0]).decode("utf-8")
    await db.images.insert_one({
        "user_id": user["id"],
        "purpose": payload.purpose,
        "prompt": payload.prompt[:500],
    })
    return ImageGenResponse(image_base64=b64)
