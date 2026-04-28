"""Round 4 — sharing feature tests (public /api/share/*)."""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://embedded-tamagotchi.preview.emergentagent.com").rstrip("/")


# ---- models.py / voice.py cleanup regression (smoke) ----
def test_models_has_single_last_daily_greeting_at():
    """Ensure duplicate field declaration removed."""
    src = open("/app/backend/models.py").read()
    assert src.count("last_daily_greeting_at:") == 1


def test_voice_content_type_block_removed():
    src = open("/app/backend/routes/voice.py").read()
    # The old if-block with just `pass` should be gone.
    assert "content_type and 'video/webm' not in" not in src
    assert "pass\n" not in src or src.count("pass\n") == 0


# ---- /api/share/postcard POST ----
class TestShareCreate:
    def test_create_requires_auth(self, api_client):
        r = api_client.post(f"{BASE}/api/share/postcard", json={
            "chapter_index": 0, "title": "Hi", "body_excerpt": "x", "thumb": "data:,"
        })
        assert r.status_code in (401, 403)

    def test_create_ok(self, auth_client):
        payload = {
            "chapter_index": 2,
            "title": "TEST_ShareCh2",
            "body_excerpt": "A cozy moment under the willow.",
            "thumb": "data:image/jpeg;base64,AAA=",
        }
        r = auth_client.post(f"{BASE}/api/share/postcard", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "short_id" in data and isinstance(data["short_id"], str) and len(data["short_id"]) > 4
        assert data["url"] == f"/share/{data['short_id']}"
        assert "created_at" in data
        pytest.share_short_id = data["short_id"]  # stash for later tests

    def test_create_thumb_too_large_413(self, auth_client):
        big = "A" * 900_000
        r = auth_client.post(f"{BASE}/api/share/postcard", json={
            "chapter_index": 0, "title": "TEST_big", "body_excerpt": "e", "thumb": big
        })
        assert r.status_code == 413


# ---- /api/share/{short_id} PUBLIC GET ----
class TestShareGet:
    def test_public_get_no_auth(self, api_client):
        sid = getattr(pytest, "share_short_id", None)
        assert sid, "prerequisite: create test ran"
        # Deliberately unauth'd client
        r = api_client.get(f"{BASE}/api/share/{sid}")
        assert r.status_code == 200, r.text
        doc = r.json()
        assert doc["short_id"] == sid
        assert doc["title"] == "TEST_ShareCh2"
        assert doc["chapter_index"] == 2
        assert doc["body_excerpt"].startswith("A cozy moment")
        # mongo _id and user_id should NOT leak
        assert "_id" not in doc
        assert "user_id" not in doc
        # author_name populated from user
        assert doc.get("author_name")
        # view count returned is pre-increment value (backend increments after find)
        assert isinstance(doc["views"], int)

    def test_public_get_increments_views(self, api_client):
        sid = getattr(pytest, "share_short_id", None)
        r1 = api_client.get(f"{BASE}/api/share/{sid}")
        v1 = r1.json()["views"]
        r2 = api_client.get(f"{BASE}/api/share/{sid}")
        v2 = r2.json()["views"]
        assert v2 > v1

    def test_public_get_404_not_found(self, api_client):
        r = api_client.get(f"{BASE}/api/share/doesnotexistxxx")
        assert r.status_code == 404


# ---- /api/share/me/list GET ----
class TestShareList:
    def test_list_requires_auth(self, api_client):
        r = api_client.get(f"{BASE}/api/share/me/list")
        assert r.status_code in (401, 403)

    def test_list_returns_my_shares_without_thumb(self, auth_client):
        r = auth_client.get(f"{BASE}/api/share/me/list")
        assert r.status_code == 200
        items = r.json().get("items", [])
        assert any(it["short_id"] == pytest.share_short_id for it in items)
        for it in items:
            assert "thumb" not in it  # omitted to keep payload small
            assert "user_id" not in it
            assert "_id" not in it


# ---- DELETE /api/share/postcard/{short_id} ----
class TestShareDelete:
    def test_delete_requires_auth(self, api_client):
        r = api_client.delete(f"{BASE}/api/share/postcard/{pytest.share_short_id}")
        assert r.status_code in (401, 403)

    def test_delete_404_for_unknown(self, auth_client):
        r = auth_client.delete(f"{BASE}/api/share/postcard/nopezzzz")
        assert r.status_code == 404

    def test_delete_owner_ok_and_gone(self, auth_client, api_client):
        sid = pytest.share_short_id
        r = auth_client.delete(f"{BASE}/api/share/postcard/{sid}")
        assert r.status_code == 200
        assert r.json().get("ok") is True
        # Should now be 404 on public get
        r2 = api_client.get(f"{BASE}/api/share/{sid}")
        assert r2.status_code == 404


# ---- 100-card cap logic presence (lightweight: inspect source) ----
def test_cap_logic_exists_in_source():
    src = open("/app/backend/routes/share.py").read()
    assert "count_documents" in src
    assert "429" in src
    assert ">= 100" in src or ">=100" in src
