import requests
import json
import os
import re
from collections import Counter
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
OUTPUT_FILE = os.path.join(DATA_DIR, 'market_trends.json')

# Common English stopwords (simplified list to avoid NLTK dependency if not setup)
STOPWORDS = {
    'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 
    'does', 'did', 'but', 'if', 'as', 'than', 'from', 'about', 'into', 'over', 'after', 
    'will', 'would', 'can', 'could', 'should', 'may', 'might', 'must', 'we', 'you', 
    'they', 'it', 'this', 'that', 'these', 'those', 'not', 'no', 'only', 'also', 
    'very', 'much', 'many', 'some', 'any', 'all', 'more', 'most', 'other', 'such', 
    'even', 'just', 'like', 'than', 'now', 'then', 'here', 'there', 'who', 'which', 
    'what', 'when', 'where', 'why', 'how', 'description', 'requirements', 'experience',
    'work', 'team', 'company', 'role', 'job', 'position', 'looking', 'seeking', 'year',
    'years', 'skills', 'knowledge', 'ability', 'strong', 'good', 'proficient'
}

def fetch_market_data():
    url = "https://remoteok.com/api"
    logger.info(f"Fetching data from {url}...")
    
    try:
        # User-Agent is often required for scraping/API calls
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ResuMatch/1.0'}
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        logger.info(f"Retrieved {len(data)} items (including metadata)")
        
        # RemoteOK API returns metadata as the first item or mixed in? 
        # Usually it's a list. Filter filtering for jobs.
        jobs = [item for item in data if isinstance(item, dict) and 'description' in item]
        
        # Filter for "Software Engineer" related roles
        engineer_jobs = []
        for job in jobs:
            title = job.get('position', '').lower()
            if 'software' in title and 'engineer' in title:
                engineer_jobs.append(job)
        
        logger.info(f"Filtered down to {len(engineer_jobs)} Software Engineer jobs")
        
        # Extract keywords
        all_text = ""
        for job in engineer_jobs:
            # Combine title, description, and tags
            text = job.get('position', '') + " " + job.get('description', '') + " " + " ".join(job.get('tags', []))
            all_text += " " + text
            
        # Clean and tokenize
        # remove html tags
        all_text = re.sub(r'<[^>]+>', ' ', all_text)
        # matches words with 3+ characters
        words = re.findall(r'\b[a-zA-Z]{3,}\b', all_text.lower())
        
        # Filter stopwords
        filtered_words = [w for w in words if w not in STOPWORDS]
        
        # Count frequency
        counter = Counter(filtered_words)
        top_50 = counter.most_common(50)
        
        # Structure the output for trends
        result = {
            'timestamp': response.headers.get('Date'),
            'job_count': len(engineer_jobs),
            'top_keywords': [{'keyword': k, 'count': v} for k, v in top_50]
        }
        
        # Structure the output for job matching (top 50 jobs)
        # We need to save the details so we can match against them
        jobs_output = []
        raw_jobs_output = []
        
        for job in engineer_jobs[:50]:
            # Clean description
            raw_desc = job.get('description', '')
            clean_desc = re.sub(r'<[^>]+>', ' ', raw_desc)
            clean_desc = re.sub(r'\s+', ' ', clean_desc).strip()
            
            job_entry = {
                'id': job.get('id', '') or str(hash(job.get('url', ''))),
                'position': job.get('position', ''), # For existing backend compatibility
                'title': job.get('position', ''),   # Requested "title" field
                'company': job.get('company', ''),
                'description': clean_desc,
                'url': job.get('url', ''),
                'date': job.get('date', ''),
                'tags': job.get('tags', []),
                'location': job.get('location', '')
            }
            jobs_output.append(job_entry)
            raw_jobs_output.append(job_entry)
            
        # Ensure data directory exists
        os.makedirs(DATA_DIR, exist_ok=True)
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2)
            
        jobs_file = os.path.join(DATA_DIR, 'market_jobs.json')
        with open(jobs_file, 'w', encoding='utf-8') as f:
            json.dump(jobs_output, f, indent=2)
            
        raw_jobs_file = os.path.join(DATA_DIR, 'raw_jobs.json')
        with open(raw_jobs_file, 'w', encoding='utf-8') as f:
            json.dump(raw_jobs_output, f, indent=2)
            
        logger.info(f"Saved market trends to {OUTPUT_FILE}")
        logger.info(f"Saved {len(jobs_output)} jobs to {jobs_file}")
        logger.info(f"Saved {len(raw_jobs_output)} raw jobs to {raw_jobs_file}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to fetch market data: {str(e)}")
        return False

if __name__ == "__main__":
    fetch_market_data()
