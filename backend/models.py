"""Pydantic models — A–Z Haven."""
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Literal, Dict, Any
from datetime import datetime, timezone
import uuid


def _id() -> str:
    return str(uuid.uuid4())


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_id)
    email: str
    name: str
    picture: Optional[str] = None
    google_sub: str
    created_at: str = Field(default_factory=_now)


class GoogleAuthRequest(BaseModel):
    credential: str  # ID token from GIS


class AuthResponse(BaseModel):
    user: Dict[str, Any]
    token: str


class PetProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    pet_type: str = "Dog"
    pet_name: str = ""
    bio: Optional[str] = None
    personality: str = ""
    age_vibe: Literal["younger", "older"] = "younger"
    tags: List[str] = []
    image_url: Optional[str] = None
    onboarding_complete: bool = False


class PetPresentation(BaseModel):
    mood: Literal["idle", "happy", "playful", "sleepy", "excited", "snuggly"] = "idle"
    last_reaction_at: float = 0
    happiness: int = 70
    energy: int = 80


class GameState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    version: int = 3
    coins: int = 50
    treats: int = 5
    bones: int = 0
    decor_tokens: int = 1
    stars: int = 0
    puzzle_level: int = 1
    puzzle_best_score: int = 0
    unlocked_rooms: List[str] = ["sleeping", "living"]
    selected_room: str = "living"
    placed_decor: Dict[str, str] = {}
    owned_decor_ids: List[str] = ["woven-bed"]
    scrapbook_unlocked_ids: List[str] = ["first-tail-wag"]
    pet: PetPresentation = PetPresentation()
    pet_profile: PetProfile = PetProfile()
    sound_enabled: bool = True
    music_enabled: bool = False
    reduced_motion: bool = False
    has_seen_welcome: bool = False
    snake_high_score: int = 0
    archie_photo_url: Optional[str] = None
    zeke_photo_url: Optional[str] = None
    ambient_enabled: bool = False
    postcards: List[Dict[str, Any]] = []  # rolling list of saved postcard entries
    daily_greeting: Optional[str] = None
    last_daily_greeting_at: Optional[str] = None


class GameStateRequest(BaseModel):
    state: Dict[str, Any]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    mode: Literal["assistant", "archie", "zeke", "bmo", "narrator", "pet"] = "assistant"
    pet_profile: Optional[PetProfile] = None


class ChatResponse(BaseModel):
    reply: str


class ImageGenRequest(BaseModel):
    prompt: str
    purpose: Literal["pet", "story", "general"] = "general"


class ImageGenResponse(BaseModel):
    image_base64: str


class StoryChapterRequest(BaseModel):
    chapter_index: int = 0
    pet_name: Optional[str] = None  # User's pet to weave in (optional)


class StoryChapter(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=_id)
    chapter_index: int
    title: str
    body: str
    image_base64: Optional[str] = None
    created_at: str = Field(default_factory=_now)
