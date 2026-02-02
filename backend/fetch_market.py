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

# Common English stopwords and generic terms to exclude
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
    'years', 'skills', 'knowledge', 'ability', 'strong', 'good', 'proficient',
    # Resume/Job specific noise
    'nbsp', 'amp', 'quot', 'lt', 'gt', 'etc', 'eg', 'ie', 'services', 'systems', 
    'solutions', 'products', 'development', 'design', 'engineering', 'technical', 
    'support', 'business', 'process', 'project', 'management', 'application', 
    'applications', 'software', 'technology', 'technologies', 'working', 'experience',
    'qualification', 'qualifications', 'preferred', 'plus', 'benefit', 'opportunity',
    'benefits', 'salary', 'competitive', 'world', 'global', 'remote', 'home', 'office',
    'flexible', 'hours', 'time', 'full', 'part', 'contract', 'freelance', 'internship',
    'teams', 'applicants', 'candidates', 'people', 'culture', 'values', 'mission',
    'vision', 'impact', 'growth', 'career', 'learning', 'training', 'professional',
    'personal', 'communication', 'skills', 'excellent', 'written', 'verbal', 'oral',
    'interpersonal', 'organizational', 'detail', 'oriented', 'motivated', 'passionate',
    'driven', 'collaborative', 'independent', 'creative', 'innovative', 'problem',
    'solving', 'analytical', 'critical', 'thinking', 'fast', 'paced', 'environment',
    'degree', 'bachelor', 'master', 'phd', 'computer', 'science', 'related', 'field',
    'equivalent', 'hands-on', 'track', 'record', 'proven', 'demonstrated', 'ability',
    'familiarity', 'understanding', 'proficiency', 'expertise', 'advanced', 'intermediate',
    'basic', 'foundational', 'concepts', 'principles', 'practices', 'methodologies',
    'frameworks', 'tools', 'languages', 'libraries', 'across', 'partner', 'best', 'use',
    'new', 'existing', 'ensure', 'help', 'make', 'create', 'build', 'maintain', 'using',
    'our', 'your', 'their', 'its', 'user', 'users', 'customer', 'customers', 'client',
    'clients', 'stakeholders', 'partners',
    'including', 'includes', 'please', 'must', 'plus', 'have', 'has', 'had', 'read',
    'write', 'written', 'spoken', 'fluent', 'native', 'role', 'responsibilities',
    'duties', 'task', 'tasks', 'perform', 'performing', 'within', 'without',
    'benefits', 'perks', 'salary', 'compensation', 'pay', 'paid', 'leave', 'holiday',
    'vacation', 'health', 'insurance', 'dental', 'vision', 'retirement', '401k',
    'stock', 'options', 'equity', 'bonus', 'commission', 'remote', 'hybrid', 'onsite',
    'office', 'location', 'relocation', 'visa', 'sponsorship', 'citizenship',
    'authorization', 'equal', 'opportunity', 'employer', 'gender', 'race', 'religion',
    'sexual', 'orientation', 'disability', 'veteran', 'status', 'protected', 'class',
    'identity', 'expression', 'age', 'marital', 'pregnancy', 'genetic', 'information',
    'national', 'origin', 'ancestry', 'apply', 'applying', 'application', 'resume',
    'cover', 'letter', 'portfolio', 'github', 'linkedin', 'profile', 'link', 'url',
    'click', 'button', 'form', 'email', 'contact', 'send', 'submit', 'upload',
    'file', 'format', 'pdf', 'docx', 'doc', 'txt', 'rtf', 'jpg', 'png', 'jpeg',
    'maximum', 'minimum', 'size', 'mb', 'kb', 'limit', 'required', 'preferred',
    'nice', 'good', 'great', 'excellent', 'strong', 'solid', 'deep', 'broad',
    'extensive', 'demonstrated', 'proven', 'track', 'record', 'history', 'background',
    'experience', 'years', 'months', 'degree', 'bachelor', 'master', 'phd',
    'diploma', 'certificate', 'certification', 'license', 'accredited', 'university',
    'college', 'school', 'bootcamp', 'course', 'program', 'training', 'education'
}

# Common technical skills to look for in job descriptions
KNOWN_SKILLS = {
    # Software/Tech
    'python', 'java', 'javascript', 'typescript', 'react', 'nodejs', 'sql', 'aws', 'docker',
    'kubernetes', 'git', 'linux', 'api', 'rest', 'graphql', 'mongodb', 'postgresql', 'redis',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'data science', 'analytics',
    'c++', 'c#', 'go', 'golang', 'rust', 'ruby', 'rails', 'php', 'laravel', 'vue', 'angular',
    'svelte', 'nextjs', 'express', 'flask', 'django', 'fastapi', 'spring', 'boot', 'hibernate',
    'dotnet', 'azure', 'gcp', 'spark', 'hadoop', 'kafka', 'airflow', 'jenkins', 'gitlab',
    'circleci', 'terraform', 'ansible', 'chef', 'puppet', 'selenium', 'cypress', 'jest',
    'mocha', 'chai', 'enzyme', 'pandas', 'numpy', 'scikit-learn', 'keras', 'opencv', 'nlp',
    'computervision', 'generative ai', 'llm', 'transformers', 'bert', 'gpt', 'huggingface',
    'langchain', 'llama', 'stable diffusion', 'midjourney', 'dalle', 'openai', 'anthropic',
    'claude', 'gemini', 'vertex ai', 'sagemaker', 'bedrock', 'copilot', 'chatgpt',
    
    # Engineering & Data
    'cad', 'solidworks', 'autocad', 'matlab', 'simulation', 'fea', 'cfd', 'manufacturing',
    'materials', 'metallurgy', 'thermodynamics', 'mechanics',
    'quality control', 'lean', 'six sigma', 'project management', 'agile', 'scrum',
    'kanban', 'tableau',
    'power bi', 'looker', 'metabase', 'superset', 'snowflake', 'databricks', 'bigquery',
    'redshift', 'mysql', 'mariadb', 'oracle', 'sql server', 'sqlite', 'dynamodb',
    'cassandra', 'hbase', 'neo4j', 'elasticsearch', 'opensearch', 'solr', 'lucene'
}


def fetch_jobs_by_role(role: str, max_jobs: int = 20) -> dict:
    """
    Fetch jobs from RemoteOK API matching the detected role.
    Returns jobs with extracted skill requirements.
    
    Args:
        role: The target role (e.g., "Metallurgical Engineer", "Software Engineer")
        max_jobs: Maximum number of jobs to return
        
    Returns:
        dict with 'jobs' list and 'market_skills' (top required skills)
    """
    url = "https://remoteok.com/api"
    logger.info(f"Fetching jobs for role: {role}")
    
    # Debug logging to file since debug.log is empty
    try:
        with open("debug_role.txt", "a", encoding="utf-8") as f:
            f.write(f"\n--- FETCH JOBS START {role} ---\n")
    except:
        pass
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ResuMatch/1.0'}
        # Reduced timeout to 10s to prevent hanging
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        try:
            with open("debug_role.txt", "a", encoding="utf-8") as f:
                f.write(f"API Response received: {len(data)} items\n")
        except:
            pass

        jobs = [item for item in data if isinstance(item, dict) and 'description' in item]
        
        # Convert role to keywords for matching
        # Handle slashes like "AI Engineer/Data Scientist" -> "AI Engineer Data Scientist"
        clean_role = role.replace('/', ' ')
        role_keywords = clean_role.lower().split()
        
        try:
            with open("debug_role.txt", "a", encoding="utf-8") as f:
                f.write(f"Keywords: {role_keywords}\n")
        except:
            pass
        
        # Filter jobs by role keywords (STRICT weighted matching)
        GENERIC_TERMS = {'engineer', 'developer', 'consultant', 'manager', 'lead', 'senior', 'junior', 'staff', 'intern', 'analyst'}
        
        matched_jobs = []
        for job in jobs:
            title = job.get('position', '').lower()
            description = job.get('description', '').lower()
            tags = ' '.join(job.get('tags', [])).lower()
            
            # Calculate match score with weights
            score = 0
            found_specific_term = False
            
            for kw in role_keywords:
                if kw in GENERIC_TERMS:
                    # Generic terms only give a tiny boost (0.1)
                    if kw in title:
                        score += 0.1
                else:
                    # Specific terms (e.g. "AI", "Machine Learning", "Metallurgical") give full points (1.0)
                    if kw in title:
                        score += 10.0 # Huge boost if in title
                        found_specific_term = True
                    elif kw in description or kw in tags:
                        score += 1.0
                        found_specific_term = True
            
            # STRICT FILTER: Job MUST match at least one specific term (not just "Engineer")
            if score > 0 and found_specific_term:
                job['_match_score'] = score
                matched_jobs.append(job)
        
        # Sort by match score and take top jobs
        matched_jobs.sort(key=lambda x: x.get('_match_score', 0), reverse=True)
        matched_jobs = matched_jobs[:max_jobs]
        
        try:
            with open("debug_role.txt", "a", encoding="utf-8") as f:
                f.write(f"Matched Jobs after Generic Filter: {len(matched_jobs)}\n")
                if len(matched_jobs) > 0:
                    f.write(f"Top Match: {matched_jobs[0]['position']} Score: {matched_jobs[0]['_match_score']}\n")
        except:
            pass
        
        logger.info(f"Found {len(matched_jobs)} jobs matching '{role}'")
        
        # Extract skills from matched jobs
        all_text = ""
        for job in matched_jobs:
            text = job.get('position', '') + " " + job.get('description', '') + " " + " ".join(job.get('tags', []))
            all_text += " " + text
        
        # Clean HTML and extract words
        all_text = re.sub(r'<[^>]+>', ' ', all_text).lower()
        
        # Extract skills (multi-word and single-word)
        found_skills = []
        for skill in KNOWN_SKILLS:
            if skill in all_text:
                count = all_text.count(skill)
                # Boost KNOWN_SKILLS count significantly to prioritize them
                found_skills.append({'skill': skill.title(), 'count': count + 100})
        
        # Also extract single-word technical terms
        words = re.findall(r'\b[a-zA-Z]{3,}\b', all_text)
        word_counter = Counter(words)
        
        # Filter for technical terms (not in stopwords, appear multiple times)
        tech_words = [(w.title(), c) for w, c in word_counter.most_common(100) 
                      if w not in STOPWORDS and c >= 2]
        
        # Combine and deduplicate
        skill_set = {s['skill'].lower(): s for s in found_skills}
        for word, count in tech_words[:20]:
            if word.lower() not in skill_set:
                skill_set[word.lower()] = {'skill': word, 'count': count}
        
        # Sort by frequency and take top 12 skills
        market_skills = sorted(skill_set.values(), key=lambda x: x['count'], reverse=True)[:12]
        
        # Clean up job entries
        clean_jobs = []
        for job in matched_jobs:
            raw_desc = job.get('description', '')
            clean_desc = re.sub(r'<[^>]+>', ' ', raw_desc)
            clean_desc = re.sub(r'\s+', ' ', clean_desc).strip()[:500]  # Truncate long descriptions
            
            clean_jobs.append({
                'id': job.get('id', ''),
                'title': job.get('position', ''),
                'company': job.get('company', ''),
                'description': clean_desc,
                'url': job.get('url', ''),
                'date': job.get('date', ''),
                'tags': job.get('tags', []),
                'salary': job.get('salary', '')
            })
        
        return {
            'role': role,
            'jobs': clean_jobs,
            'market_skills': [s['skill'] for s in market_skills],
            'skill_frequencies': market_skills
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch jobs for role {role}: {str(e)}")
        return {
            'role': role,
            'jobs': [],
            'market_skills': [],
            'skill_frequencies': []
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
