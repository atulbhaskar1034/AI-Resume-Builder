import requests
import json
import os

url = "http://localhost:8000/analyze"

resume_path = "dummy_resume.txt"
if not os.path.exists(resume_path):
    print("Dummy resume not found.")
    exit(1)

files = {
    'resume': (resume_path, open(resume_path, 'rb'), 'text/plain')
}
data = {
    'job_description': "Looking for a Python Developer with experience in Machine Learning, Data Science, and React."
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print("\nAnalysis Success!")
        
        print("\n--- Response Overview ---")
        print(f"Status: {result.get('status')}")
        print(f"Role Detected: {result.get('role_detected')}")
        print(f"Match Score: {result.get('match_score')}")
        
        print("\n--- Heatmap Data (First 3) ---")
        print(json.dumps(result.get('heatmap_data', [])[:3], indent=2))
        
        print("\n--- Roadmap (First 2) ---")
        print(json.dumps(result.get('roadmap', [])[:2], indent=2))
        
        if result.get('role_detected') and result.get('heatmap_data'):
            print("\nVERIFICATION PASSED: New JSON format confirmed.")
        else:
            print("\nVERIFICATION WARNING: Missing expected fields.")
            
    else:
        print(f"Request failed with status {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"Error: {e}")
