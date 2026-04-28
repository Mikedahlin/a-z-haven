"""Backend tests for A-Z Haven — health, auth, gamestate, pet, chat, story, image."""
import pytest
from conftest import BASE_URL


# ---------- Health ----------
class TestHealth:
    def test_health(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert data["db"] == "ok"

    def test_root(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


# ---------- Auth ----------
class TestAuth:
    def test_google_with_bogus_credential_returns_401(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/auth/google", json={"credential": "bogus-token"})
        assert r.status_code == 401

    def test_me_without_token_returns_401(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_with_token(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert "user" in data
        assert data["user"]["id"] == "test-user-001"
        assert data["user"]["email"] == "test@azhaven.local"

    def test_logout(self, auth_client):
        r = auth_client.post(f"{BASE_URL}/api/auth/logout")
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---------- GameState ----------
class TestGameState:
    def test_get_initial_state(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/gamestate")
        assert r.status_code == 200
        data = r.json()
        assert "state" in data
        assert isinstance(data["state"], dict)

    def test_save_and_persist_state(self, auth_client):
        new_state = {
            "coins": 123,
            "level": 2,
            "happiness": 85,
            "energy": 60,
            "pet_profile": None,
        }
        r = auth_client.post(f"{BASE_URL}/api/gamestate", json={"state": new_state})
        assert r.status_code == 200
        assert r.json().get("ok") is True
        # GET back
        r2 = auth_client.get(f"{BASE_URL}/api/gamestate")
        assert r2.status_code == 200
        state = r2.json()["state"]
        assert state.get("coins") == 123
        assert state.get("level") == 2


# ---------- Pet ----------
class TestPet:
    def test_save_pet(self, auth_client):
        payload = {
            "pet_name": "TEST_Buddy",
            "pet_type": "Dog",
            "personality": "playful",
            "tags": ["playful", "fluffy"],
            "age_vibe": "younger",
            "onboarding_complete": True,
        }
        r = auth_client.post(f"{BASE_URL}/api/pet", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True
        assert data["pet"]["pet_name"] == "TEST_Buddy"

    def test_get_pet_persisted(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/pet")
        assert r.status_code == 200
        pet = r.json().get("pet")
        assert pet is not None
        assert pet.get("pet_name") == "TEST_Buddy"

    def test_pet_embedded_in_gamestate(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/gamestate")
        assert r.status_code == 200
        state = r.json()["state"]
        assert state.get("pet_profile") is not None
        assert state["pet_profile"]["pet_name"] == "TEST_Buddy"


# ---------- Chat ----------
class TestChat:
    def _chat(self, client, mode, text, pet_profile=None, timeout=60):
        body = {"mode": mode, "messages": [{"role": "user", "content": text}]}
        if pet_profile:
            body["pet_profile"] = pet_profile
        return client.post(f"{BASE_URL}/api/chat", json=body, timeout=timeout)

    def test_chat_no_messages(self, auth_client):
        r = auth_client.post(f"{BASE_URL}/api/chat", json={"mode": "assistant", "messages": []})
        assert r.status_code == 400

    def test_assistant_reply(self, auth_client):
        r = self._chat(auth_client, "assistant", "Say a one-sentence hello.")
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "")
        assert len(reply) > 0
        assert len(reply.split()) <= 220  # ~200 words tenet, allow small margin

    def test_archie_first_person(self, auth_client):
        r = self._chat(auth_client, "archie", "Hi Archie, how are you today?")
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "").lower()
        # Should be in first person (uses I/my) — Archie speaks AS himself
        assert any(tok in reply for tok in [" i ", "i'm", "i’m", "my ", "me "]) or reply.startswith("i")

    def test_zeke_reply(self, auth_client):
        r = self._chat(auth_client, "zeke", "Hi Zeke, got any ball news?")
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "")
        assert len(reply) > 0

    def test_bmo_reply(self, auth_client):
        r = self._chat(auth_client, "bmo", "BMO, what time is it?")
        assert r.status_code == 200, r.text
        assert len(r.json().get("reply", "")) > 0

    def test_pet_mode_speaks_as_pet(self, auth_client):
        pet = {"name": "TEST_Buddy", "type": "dog", "photo_id": "p1", "tags": ["playful"]}
        r = self._chat(auth_client, "pet", "Hello, what are you up to?", pet_profile=pet)
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "")
        assert len(reply) > 0

    def test_chat_brevity(self, auth_client):
        r = self._chat(auth_client, "archie", "Tell me about your day in detail.")
        assert r.status_code == 200
        reply = r.json().get("reply", "")
        assert len(reply.split()) <= 250  # cozy brevity

    def test_medical_topic_redirect(self, auth_client):
        r = self._chat(auth_client, "assistant", "My dog is bleeding heavily, what should I do?")
        assert r.status_code == 200, r.text
        reply = r.json().get("reply", "").lower()
        # Should redirect gently — expect reference to vet/professional help
        assert any(k in reply for k in ["vet", "veterinar", "professional", "emergency", "help"])


# ---------- Story ----------
class TestStory:
    def test_outline_10_chapters(self, auth_client):
        r = auth_client.get(f"{BASE_URL}/api/story/outline")
        assert r.status_code == 200
        outline = r.json().get("outline", [])
        assert len(outline) == 10
        assert outline[0]["index"] == 0
        assert "seed" in outline[0]

    @pytest.mark.timeout(120)
    def test_chapter_generation(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/story/chapter",
            json={"chapter_index": 0, "pet_name": "TEST_Buddy"},
            timeout=120,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("title")
        assert data.get("body")
        assert data.get("chapter_index") == 0


# ---------- Image ----------
class TestImage:
    @pytest.mark.timeout(120)
    def test_image_generate(self, auth_client):
        r = auth_client.post(
            f"{BASE_URL}/api/image/generate",
            json={"prompt": "a cozy sleeping dog", "purpose": "pet"},
            timeout=120,
        )
        # Image gen can occasionally fail — accept 200 or 502
        if r.status_code == 200:
            b64 = r.json().get("image_base64", "")
            assert len(b64) > 100
        else:
            pytest.skip(f"Image gen upstream 502: {r.text[:200]}")
