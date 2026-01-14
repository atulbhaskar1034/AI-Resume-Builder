import json
import os
import logging
from typing import List, Dict, Any
from similarity_engine import SimilarityEngine
from text_preprocessor import TextPreprocessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GapAnalyzer:
    # Whitelist of valid technical skills - only these will appear in gap analysis
    VALID_TECH_SKILLS = {
        # Programming Languages
        'python', 'java', 'javascript', 'js', 'typescript', 'ts', 'c++', 'cpp', 'c#', 'csharp', 'c', 
        'ruby', 'php', 'go', 'golang', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 
        'dart', 'objective-c', 'objc', 'groovy', 'lua', 'haskell', 'clojure', 'elixir', 'erlang',
        'shell', 'bash', 'powershell', 'vba', 'cobol', 'fortran', 'assembly', 'asm',
        
        # Web Technologies
        'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 
        'bootstrap', 'material ui', 'mui', 'chakra', 'styled-components', 'emotion',
        
        # Frontend Frameworks & Libraries
        'react', 'reactjs', 'react.js', 'angular', 'angularjs', 'vue', 'vuejs', 'vue.js', 
        'svelte', 'next.js', 'nextjs', 'next', 'nuxt', 'nuxtjs', 'gatsby', 'remix',
        'redux', 'mobx', 'zustand', 'recoil', 'jquery', 'backbone', 'd3', 'd3.js', 'three.js',
        
        # Backend Frameworks
        'node.js', 'nodejs', 'node', 'express', 'expressjs', 'express.js', 'django', 'flask', 
        'fastapi', 'fast api', 'spring', 'springboot', 'spring boot', 'rails', 'ruby on rails',
        'laravel', 'symfony', 'asp.net', '.net', 'dotnet', 'nestjs', 'nest.js', 'koa', 'hapi',
        'gin', 'echo', 'fiber', 'actix', 'rocket',
        
        # Databases
        'sql', 'mysql', 'postgresql', 'postgres', 'psql', 'mongodb', 'mongo', 'redis', 
        'elasticsearch', 'elastic', 'oracle', 'sqlite', 'mariadb', 'cassandra', 'couchdb', 
        'dynamodb', 'neo4j', 'firebase', 'firestore', 'supabase', 'cockroachdb', 'timescaledb',
        'influxdb', 'clickhouse', 'mssql', 'sql server', 'aurora', 'rds', 'bigquery',
        
        # Cloud Platforms
        'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud', 
        'google cloud platform', 'heroku', 'digitalocean', 'linode', 'cloudflare', 'vercel', 
        'netlify', 'render', 'fly.io', 'railway', 'oracle cloud', 'ibm cloud', 'alibaba cloud',
        'ec2', 's3', 'lambda', 'cloudfront', 'route53', 'sagemaker', 'ecs', 'eks', 'fargate',
        
        # DevOps & Infrastructure  
        'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'puppet', 'chef', 'vagrant',
        'jenkins', 'gitlab ci', 'gitlab-ci', 'github actions', 'circleci', 'travis ci', 'travisci',
        'bamboo', 'teamcity', 'argo', 'argocd', 'spinnaker', 'helm', 'istio', 'envoy',
        'prometheus', 'grafana', 'datadog', 'splunk', 'elk', 'logstash', 'kibana', 'new relic',
        'nginx', 'apache', 'caddy', 'haproxy', 'traefik', 'consul', 'vault', 'packer',
        
        # Data Science, ML & AI - EXPANDED
        'machine learning', 'ml', 'deep learning', 'dl', 'artificial intelligence', 'ai',
        'natural language processing', 'nlp', 'computer vision', 'cv', 'reinforcement learning', 'rl',
        'neural network', 'neural networks', 'cnn', 'rnn', 'lstm', 'transformer', 'transformers',
        'bert', 'gpt', 'llm', 'llms', 'large language model', 'large language models',
        'generative ai', 'gen ai', 'genai', 'chatgpt', 'openai', 'langchain', 'llamaindex',
        'huggingface', 'hugging face', 'diffusers', 'stable diffusion', 'midjourney',
        
        # ML/AI Libraries & Tools
        'pandas', 'numpy', 'scipy', 'scikit-learn', 'sklearn', 'tensorflow', 'tf', 
        'pytorch', 'torch', 'keras', 'theano', 'caffe', 'mxnet', 'jax', 'flax',
        'xgboost', 'lightgbm', 'catboost', 'gradient boosting', 'random forest',
        'opencv', 'cv2', 'pillow', 'pil', 'spacy', 'nltk', 'gensim', 'textblob',
        'matplotlib', 'seaborn', 'plotly', 'bokeh', 'altair', 'ggplot',
        
        # Data Tools & Platforms
        'jupyter', 'jupyter notebook', 'jupyterlab', 'colab', 'google colab',
        'spark', 'pyspark', 'apache spark', 'hadoop', 'hdfs', 'hive', 'presto', 'trino',
        'airflow', 'apache airflow', 'dagster', 'prefect', 'luigi', 'dbt', 'fivetran',
        'snowflake', 'databricks', 'redshift', 'looker', 'metabase', 'superset',
        'tableau', 'power bi', 'powerbi', 'excel', 'google sheets', 'looker studio',
        'mlflow', 'kubeflow', 'mlops', 'weights and biases', 'wandb', 'neptune',
        'streamlit', 'gradio', 'dash', 'shiny', 'panel',
        
        # Version Control & Collaboration
        'git', 'github', 'gitlab', 'bitbucket', 'svn', 'subversion', 'mercurial', 'hg',
        'gitflow', 'trunk-based', 'monorepo',
        
        # Operating Systems
        'linux', 'unix', 'ubuntu', 'centos', 'debian', 'fedora', 'rhel', 'redhat',
        'windows', 'macos', 'mac os', 'freebsd', 'alpine',
        
        # API & Protocols
        'rest', 'restful', 'rest api', 'graphql', 'grpc', 'soap', 'websocket', 'websockets',
        'oauth', 'oauth2', 'jwt', 'json', 'xml', 'protobuf', 'avro', 'http', 'https',
        'openapi', 'swagger', 'postman', 'insomnia',
        
        # Testing
        'jest', 'mocha', 'chai', 'pytest', 'unittest', 'junit', 'testng', 'nunit',
        'selenium', 'cypress', 'playwright', 'puppeteer', 'cucumber', 'behave',
        'karma', 'jasmine', 'vitest', 'testing library', 'enzyme', 'supertest',
        'tdd', 'bdd', 'unit testing', 'integration testing', 'e2e testing',
        
        # Mobile Development
        'react native', 'flutter', 'ionic', 'xamarin', 'cordova', 'phonegap',
        'android', 'android studio', 'ios', 'xcode', 'swiftui', 'uikit', 'jetpack compose',
        'kotlin multiplatform', 'kmp', 'expo',
        
        # Messaging & Streaming
        'kafka', 'apache kafka', 'rabbitmq', 'celery', 'redis', 'memcached',
        'sqs', 'sns', 'kinesis', 'pubsub', 'nats', 'zeromq', 'activemq',
        
        # Security
        'cybersecurity', 'security', 'penetration testing', 'pentest', 'owasp',
        'encryption', 'ssl', 'tls', 'https', 'firewall', 'vpn', 'sso', 'saml', 'ldap',
        'iam', 'rbac', 'zero trust',
        
        # Concepts & Methodologies
        'agile', 'scrum', 'kanban', 'lean', 'devops', 'devsecops', 'sre', 'gitops',
        'ci/cd', 'cicd', 'continuous integration', 'continuous deployment',
        'microservices', 'monolith', 'serverless', 'faas', 'paas', 'saas', 'iaas',
        'event-driven', 'domain-driven design', 'ddd', 'cqrs', 'event sourcing',
        'solid', 'dry', 'kiss', 'clean code', 'clean architecture', 'hexagonal',
        'oop', 'functional programming', 'fp', 'reactive', 'async', 'concurrency',
        
        # Project Management & Tools
        'jira', 'confluence', 'trello', 'asana', 'notion', 'monday', 'linear',
        'slack', 'teams', 'zoom', 'miro', 'figma', 'sketch', 'adobe xd', 'invision',
        
        # Blockchain & Web3
        'blockchain', 'solidity', 'ethereum', 'web3', 'web3.js', 'ethers.js', 
        'smart contracts', 'defi', 'nft', 'hardhat', 'truffle', 'foundry'
    }
    
    def __init__(self, market_data_path: str = "backend/data/market_trends.json"):
        self.market_data_path = market_data_path
        self.similarity_engine = SimilarityEngine()
        self.text_preprocessor = TextPreprocessor()
        self.market_skills = self._load_market_skills()

    def _load_market_skills(self) -> List[Dict[str, Any]]:
        """Load top market skills from the JSON file, filtering only valid tech skills."""
        try:
            if not os.path.exists(self.market_data_path):
                logger.warning(f"Market data file not found: {self.market_data_path}")
                return []
            
            with open(self.market_data_path, 'r') as f:
                data = json.load(f)
                raw_keywords = data.get('top_keywords', [])
                
                # Filter to only include valid tech skills
                valid_skills = []
                for item in raw_keywords:
                    keyword = item.get('keyword', '').lower().strip()
                    if keyword in self.VALID_TECH_SKILLS:
                        valid_skills.append(item)
                
                logger.info(f"Loaded {len(valid_skills)} valid tech skills from {len(raw_keywords)} raw keywords")
                return valid_skills
        except Exception as e:
            logger.error(f"Failed to load market data: {str(e)}")
            return []

    def find_skill_gaps(self, resume_text: str, matched_role: str = "General", target_skills_override: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Identify missing skills by comparing resume against market trends.
        Uses semantic similarity to avoid false positives.
        """
        missing_skills = []
        
        # Step A: Extract skills/entities from resume using existing NLP pipeline
        # We process the text to get a structured representation
        processed_resume = self.text_preprocessor.preprocess_text(resume_text)
        
        # Helper to get all text components to check against
        # combining raw text, cleaned text, and extracted skills for robust matching
        resume_content_combined = resume_text.lower() + " " + " ".join(processed_resume.get('processed_tokens', []))

        # Market Skills (Default to Top 20 loaded from market trends)
        # Using the loaded top keywords. 
        # If custom targets provided (e.g. from JD or Role Standard), use them.
        target_skills = self.market_skills[:20] 
        if target_skills_override:
             target_skills = target_skills_override 

        # Step C: The Semantic Check
        for skill_item in target_skills:
            skill_name = skill_item['keyword'].lower()
            frequency = skill_item['count']
            
            # 1. Explicit Exact/Substring Match
            if skill_name in resume_content_combined:
                continue # User knows it

            # 2. Contextual Semantic Match using SimilarityEngine
            # We treat the skill as a "job requirement" and the resume as "resume text"
            # calculating similarity between the skill concept and the resume content.
            # Using _get_semantic_embeddings directly if possible or the high level calculation
            
            try:
                # We construct a minimal context for the skill to make it comparable to a document
                skill_context = f"experience with {skill_name} and related technologies"
                
                embeddings = self.similarity_engine._get_semantic_embeddings([resume_text, skill_context])
                
                # Manual cosine similarity calculation since we are accessing internal method
                # (Dot product of normalized vectors)
                vec_resume = embeddings[0]
                vec_skill = embeddings[1]
                
                # Cosine similarity
                norm_resume = sum(x*x for x in vec_resume) ** 0.5
                norm_skill = sum(x*x for x in vec_skill) ** 0.5
                
                if norm_resume * norm_skill == 0:
                    similarity = 0.0
                else:
                    dot_product = sum(a*b for a,b in zip(vec_resume, vec_skill))
                    similarity = dot_product / (norm_resume * norm_skill)
                
                # Threshold check (0.85 as requested)
                # Note: TF-IDF might yield lower scores than BERT, so 0.85 is very strict.
                # Adjusting logic: if using TF-IDF, 0.85 might be too high for single word vs document.
                # However, sticking to user instruction: "If similarity > 0.85"
                if similarity > 0.85:
                    continue # Contextual match found
                    
                # If we are here, it's a GAP
                missing_skills.append({
                    "skill": skill_name,
                    "importance": frequency,
                    "gap_type": "Critical" if frequency > 50 else "Recommended"
                })

            except Exception as e:
                logger.error(f"Semantic check failed for {skill_name}: {str(e)}")
                # Fallback: if check fails, assume it's missing to be safe
                missing_skills.append({
                    "skill": skill_name,
                    "importance": frequency,
                    "gap_type": "Unknown"
                })

        # Return sorted by importance
        return sorted(missing_skills, key=lambda x: x['importance'], reverse=True)

if __name__ == "__main__":
    # Simple test
    analyzer = GapAnalyzer()
    sample_resume = "I am a software engineer with experience in Python and Data Science."
    gaps = analyzer.find_skill_gaps(sample_resume)
    print("Found Gaps:", json.dumps(gaps, indent=2))
