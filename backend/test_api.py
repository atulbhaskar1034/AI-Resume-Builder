"""Test the /analyze endpoint and show key fields"""
import requests
import json

# Test resume text
test_resume = """
John Doe
Python Software Developer

Experience:
- 3 years Python development at TechCorp
- Built REST APIs with Flask and Django
- Basic SQL knowledge
- Familiar with Git version control

Education:
- B.S. Computer Science, University of Technology

Skills:
- Python, Flask, Django, SQL, Git
- Basic HTML/CSS
- Linux command line
"""

# Create a test file
with open("test_resume.txt", "w") as f:
    f.write(test_resume)

# Send request
url = "http://localhost:8000/analyze"
files = {"resume": ("test_resume.txt", open("test_resume.txt", "rb"), "text/plain")}

print("Sending request to", url)
response = requests.post(url, files=files)

print(f"\nStatus: {response.status_code}")
data = response.json()

# Print full response for debugging
import json
print("\n=== FULL JSON RESPONSE ===")
print(json.dumps(data, indent=2, default=str)[:3000])

print("\n=== KEY FIELDS ===")
print(f"status: {data.get('status')}")
print(f"role_detected: {data.get('role_detected')}")
print(f"match_score: {data.get('match_score')}")
print(f"heatmap_data count: {len(data.get('heatmap_data', []))}")
print(f"roadmap count: {len(data.get('roadmap', []))}")
print(f"matched_jobs count: {len(data.get('matched_jobs', []))}")

print("\n=== HEATMAP DATA ===")
for item in data.get('heatmap_data', [])[:5]:
    print(f"  - {item}")

print("\n=== ROADMAP ===")
for item in data.get('roadmap', [])[:3]:
    print(f"  - Month {item.get('month')}: {item.get('skill')} - {item.get('course_title')}")

print("\n=== MATCHED JOBS ===")
for job in data.get('matched_jobs', [])[:3]:
    print(f"  - {job.get('position')} at {job.get('company')}")
