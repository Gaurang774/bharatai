import requests
import json
import os
from typing import Generator
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("LLM_MODEL", "llama3:latest")

class LLMService:
    def __init__(self, model: str = DEFAULT_MODEL):
        self.model = model

    def generate_streaming_response(self, prompt: str, system_prompt: str) -> Generator[str, None, None]:
        """
        Connects to local Ollama and streams response.
        If Ollama is down, returns a mock streaming response.
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": True,
            "options": {
                "temperature": 0.3,
                "num_predict": 2048
            }
        }

        try:
            # First try with requested model
            response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, stream=True, timeout=180)
            response.raise_for_status()
        except requests.exceptions.HTTPError as he:
            if response.status_code == 404 and self.model != DEFAULT_MODEL:
                print(f"Model {self.model} not found in Ollama. Falling back to {DEFAULT_MODEL}")
                payload["model"] = DEFAULT_MODEL
                try:
                    response = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, stream=True, timeout=180)
                    response.raise_for_status()
                except Exception as secondary_error:
                    print(f"Ollama Fallback Error: {secondary_error}")
                    yield from self._mock_streaming_response(prompt)
                    return
            else:
                print(f"Ollama HTTP Error: {he}")
                yield from self._mock_streaming_response(prompt)
                return
        except requests.exceptions.ConnectionError:
            print(f"CRITICAL: Cannot connect to Ollama at {OLLAMA_URL}. Ensure it is running.")
            yield from self._mock_streaming_response(prompt)
            return
        except Exception as e:
            print(f"Ollama Error: {e}. Falling back to mock response.")
            yield from self._mock_streaming_response(prompt)
            return

        try:
            for line in response.iter_lines():
                if line:
                    chunk = json.loads(line.decode("utf-8"))
                    if "response" in chunk:
                        yield chunk["response"]
                    if chunk.get("done"):
                        break
        except requests.exceptions.ConnectionError:
            print(f"CRITICAL: Cannot connect to Ollama at {OLLAMA_URL}. Ensure it is running.")
            yield from self._mock_streaming_response(prompt)
        except Exception as e:
            print(f"Ollama Error: {e}. Falling back to mock response.")
            yield from self._mock_streaming_response(prompt)

    def _mock_streaming_response(self, prompt: str) -> Generator[str, None, None]:
        mock_text = (
            "This is a demonstration response from BharatAI. "
            "Local Ollama service was not detected, so I am providing this mock message. "
            f"Regarding your query about '{prompt[:30]}...', I am here to assist with sovereign government tasks."
        )
        for word in mock_text.split():
            yield word + " "
