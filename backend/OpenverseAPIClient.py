import requests
from dotenv import load_dotenv
import os

load_dotenv()

class OpenverseClient:
    def __init__(self):
        self.client_id = os.getenv("OPENVERS_CLIENT_ID")
        self.client_secret = os.getenv("OPENVERS_CLIENT_SECRET")
        self.base_url = "https://api.openverse.org/v1/"
        self.access_token = None
        self._authenticate()

    def _authenticate(self):
        url = f"{self.base_url}auth_tokens/token/"
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        response = requests.post(url, headers=headers, data=data)
        if response.status_code == 200:
            self.access_token = response.json().get("access_token")
        else:
            raise Exception(f"Authentication failed: {response.json()}")

    def search_images(self, query, page=1, page_size=20, license_type=None, creator=None, tags=None):
        url = f"{self.base_url}images/"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        params = {
            "q": query,
            "page": page,
            "page_size": page_size,
            "license_type": license_type,
            "creator": creator,
            "tags": ",".join(tags) if tags else None,
        }
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 429:
            raise Exception("Rate limit exceeded")
        else:
            raise Exception(f"Search failed: {response.json()}")

    def search_audio(self, query, page=1, page_size=20, license_type=None):
        url = f"{self.base_url}audio/"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        params = {
            "q": query,
            "page": page,
            "page_size": page_size,
            "license_type": license_type,
        }
        response = requests.get(url, headers=headers, params=params)
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 429:
            raise Exception("Rate limit exceeded")
        else:
            raise Exception(f"Search failed: {response.json()}")
# Usage example:
# client = OpenVerseClient()
# results = client.search_images("nature", page=1, page_size=10)