import sys
import os
sys.path.append('d:/Bharatai/bharatai/backend')
from services.llm_service import LLMService

llm = LLMService()
try:
    print(f"Testing with model: {llm.model}")
    for chunk in llm.generate_streaming_response("Hello", "You are an AI."):
        print(chunk, end="", flush=True)
    print("\n[SUCCESS]")
except Exception as e:
    print(f"Error: {e}")
