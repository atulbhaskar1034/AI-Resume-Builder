
import os
import requests
import json
import uuid

def test_chat_tools():
    url = "http://localhost:8000/chat/agent"
    session_id = str(uuid.uuid4())
    
    # Test 1: Project Ideas
    print("\n--- TEST 1: Project Ideas ---")
    payload1 = {
        "message": "I want to learn Python by building something for music lovers.",
        "session_id": session_id,
        "context": {"role": "Software Engineer"}
    }
    
    try:
        response = requests.post(url, json=payload1, stream=True)
        response.raise_for_status()
        
        print(f"Session: {session_id}")
        print("Response Stream:")
        for chunk in response.iter_content(chunk_size=None, decode_unicode=True):
            if chunk:
                print(chunk, end="", flush=True)
        print("\n")
    except Exception as e:
        print(f"Test 1 Failed: {e}")

    # Test 2: Quiz
    print("\n--- TEST 2: Quiz ---")
    payload2 = {
        "message": "Give me a quiz on React hooks.",
        "session_id": session_id,  # Same session to test memory (optional)
        "context": {"role": "Frontend Developer"}
    }
    
    try:
        response = requests.post(url, json=payload2, stream=True)
        response.raise_for_status()
        
        print("Response Stream:")
        for chunk in response.iter_content(chunk_size=None, decode_unicode=True):
            if chunk:
                print(chunk, end="", flush=True)
        print("\n")
    except Exception as e:
        print(f"Test 2 Failed: {e}")

if __name__ == "__main__":
    test_chat_tools()
