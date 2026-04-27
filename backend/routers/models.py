import os
import requests
from fastapi import APIRouter, Depends, HTTPException
from dotenv import load_dotenv
from routers.auth import get_current_user
from models.user import User

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("")
async def list_models(current_user: User = Depends(get_current_user)):
    """
    Proxy GET /api/tags from Ollama and return a flat list of model names.
    Any logged-in user can call this endpoint.
    """
    try:
        resp = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        resp.raise_for_status()
        data = resp.json()
        # Ollama returns {"models": [{"name": "llama3.2:latest", ...}, ...]}
        models = [m["name"] for m in data.get("models", [])]
        return {"models": models}
    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Ollama server is not reachable. Ensure it is running on the configured OLLAMA_URL."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
