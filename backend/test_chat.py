
import requests
import json
import uuid

def test_chat():
    url = "http://localhost:8000/chat/agent"
    
    session_id = str(uuid.uuid4())
    payload = {
        "message": "Hello! Can you help me find a job?",
        "session_id": session_id,
        "context": {
            "role": "Software Engineer",
            "skill_gaps": ["Python"]
        }
    }
    
    print(f"Testing Chat Agent at {url}...")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, stream=True)
        response.raise_for_status()
        
        print("\n--- Streaming Response ---")
        for chunk in response.iter_content(chunk_size=None, decode_unicode=True):
            if chunk:
                print(chunk, end="", flush=True)
        print("\n\n--- End of Stream ---")
        
    except Exception as e:
        print(f"\nError: {e}")
        if 'response' in locals():
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")

if __name__ == "__main__":
    test_chat()
