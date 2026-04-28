"""Shared fixtures for A-Z Haven backend tests."""
import os
import sys
import time
import pytest
import requests
import jwt

sys.path.insert(0, '/app/backend')
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

BASE_URL = os.environ['REACT_APP_BACKEND_URL'].rstrip('/') if os.environ.get('REACT_APP_BACKEND_URL') else "https://embedded-tamagotchi.preview.emergentagent.com"
JWT_SECRET = os.environ['JWT_SECRET']
TEST_USER_ID = "test-user-001"
TEST_EMAIL = "test@azhaven.local"


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def test_token():
    payload = {
        "sub": TEST_USER_ID,
        "email": TEST_EMAIL,
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


@pytest.fixture
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def auth_client(api_client, test_token):
    api_client.headers.update({"Authorization": f"Bearer {test_token}"})
    return api_client
