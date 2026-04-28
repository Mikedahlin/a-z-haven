"""Round 3 tests — daily greeting, voice transcribe, gamestate roundtrip with new fields."""
import io
import struct
import pytest
import requests
from conftest import BASE_URL


def _silent_wav_bytes(duration_s: float = 0.5, sample_rate: int = 16000) -> bytes:
    """Build a tiny silent PCM16 WAV file in-memory."""
    n = int(duration_s * sample_rate)
    data = b"\x00\x00" * n
    fmt_chunk = struct.pack("<4sIHHIIHH", b"fmt ", 16, 1, 1, sample_rate, sample_rate * 2, 2, 16)
    data_chunk = struct.pack("<4sI", b"data", len(data)) + data
    riff = struct.pack("<4sI4s", b"RIFF", 4 + len(fmt_chunk) + len(data_chunk), b"WAVE")
    return riff + fmt_chunk + data_chunk


# ---------- Daily Greeting ----------
class TestDailyGreeting:
    def test_requires_auth(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/daily/greeting")
        assert r.status_code == 401

    @pytest.mark.timeout(60)
    def test_greeting_first_call_fresh(self, auth_client):
        # Force a fresh greeting first to normalize state
        r = auth_client.get(f"{BASE_URL}/api/daily/greeting?force=true", timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "greeting" in data and isinstance(data["greeting"], str) and len(data["greeting"]) > 0
        assert "date" in data
        assert data["fresh"] is True

    @pytest.mark.timeout(60)
    def test_greeting_second_call_cached(self, auth_client):
        # Second non-forced call same day should be cached
        r = auth_client.get(f"{BASE_URL}/api/daily/greeting", timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["fresh"] is False
        assert isinstance(data["greeting"], str) and len(data["greeting"]) > 0

    @pytest.mark.timeout(60)
    def test_greeting_force_regenerates(self, auth_client):
        r1 = auth_client.get(f"{BASE_URL}/api/daily/greeting", timeout=60)
        assert r1.status_code == 200
        r2 = auth_client.get(f"{BASE_URL}/api/daily/greeting?force=true", timeout=60)
        assert r2.status_code == 200
        assert r2.json()["fresh"] is True


# ---------- Voice Transcribe ----------
class TestVoiceTranscribe:
    def test_requires_auth(self, api_client):
        # Send a tiny multipart with no auth
        files = {"audio": ("v.wav", b"\x00\x00", "audio/wav")}
        # api_client has Content-Type: application/json in default headers — strip for multipart
        s = requests.Session()
        r = s.post(f"{BASE_URL}/api/voice/transcribe", files=files)
        assert r.status_code == 401

    def test_empty_body_400(self, test_token):
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {test_token}"})
        files = {"audio": ("empty.webm", b"", "audio/webm")}
        r = s.post(f"{BASE_URL}/api/voice/transcribe", files=files, timeout=30)
        assert r.status_code == 400

    @pytest.mark.timeout(90)
    def test_silent_wav_returns_string(self, test_token):
        s = requests.Session()
        s.headers.update({"Authorization": f"Bearer {test_token}"})
        wav = _silent_wav_bytes(0.5)
        files = {"audio": ("silence.wav", wav, "audio/wav")}
        r = s.post(f"{BASE_URL}/api/voice/transcribe", files=files, timeout=90)
        # Whisper should accept silent audio and return some string (often empty)
        assert r.status_code in (200, 502), r.text
        if r.status_code == 200:
            data = r.json()
            assert "text" in data
            assert isinstance(data["text"], str)
        else:
            pytest.skip(f"Whisper upstream returned 502: {r.text[:200]}")


# ---------- GameState round-trip with new fields ----------
class TestGameStateRound3Fields:
    def test_postcards_and_greeting_persist(self, auth_client):
        postcards = [
            {"id": "pc-1", "title": "First wag", "body": "Tiny tail.", "ts": "2026-01-15"},
            {"id": "pc-2", "title": "Sunny nap", "body": "Sun puddle.", "ts": "2026-01-16"},
        ]
        new_state = {
            "coins": 200,
            "level": 2,
            "postcards": postcards,
            "daily_greeting": "Archie peeked at the door — you're back.",
            "last_daily_greeting_at": "2026-01-15",
        }
        r = auth_client.post(f"{BASE_URL}/api/gamestate", json={"state": new_state})
        assert r.status_code == 200
        # GET back
        r2 = auth_client.get(f"{BASE_URL}/api/gamestate")
        assert r2.status_code == 200
        s = r2.json()["state"]
        assert isinstance(s.get("postcards"), list)
        assert len(s["postcards"]) == 2
        assert s["postcards"][0]["id"] == "pc-1"
        assert s.get("daily_greeting") == "Archie peeked at the door — you're back."
        assert s.get("last_daily_greeting_at") == "2026-01-15"


# ---------- Real-lore chat checks ----------
class TestRealLoreChat:
    @pytest.mark.timeout(60)
    def test_archie_lore_boston_or_lynne(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/chat",
            json={"mode": "archie", "messages": [{"role": "user", "content": "Tell me one thing about your family or breed."}]},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "").lower()
        assert any(k in reply for k in ["boston", "lynne", "mom", "treat", "trick"]), f"Archie reply lacks lore: {reply[:200]}"

    @pytest.mark.timeout(60)
    def test_zeke_lore_frenchton_or_mike(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/chat",
            json={"mode": "zeke", "messages": [{"role": "user", "content": "Tell me about your eyes or your dad."}]},
            timeout=60,
        )
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "").lower()
        assert any(k in reply for k in ["frenchton", "blue", "mike", "dad"]), f"Zeke reply lacks lore: {reply[:200]}"
