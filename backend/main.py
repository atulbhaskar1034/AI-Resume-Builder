from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os

# Explicitly load .env from the same directory as main.py
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(dotenv_path)

import asyncio
import aiofiles
import os
import shutil
import logging
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from text_extractor import TextExtractor
from text_preprocessor import TextPreprocessor
from similarity_engine import SimilarityEngine
from gap_analysis import GapAnalyzer
from recommender import CourseRecommender


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


cors_origins_str = os.environ.get("CORS_ORIGINS", "http://localhost:3000,https://resumatchfrontend.vercel.app")
cors_origins = cors_origins_str.split(",")
explicit_domains = [
    "http://localhost:3000",
    "https://resumatchfrontend.vercel.app",
    "https://resmatchfrontend.vercel.app",
    "https://resmatchfrontend-crc4bg6mn-gaurav-singhs-projects-9a3381d4.vercel.app",
    "https://resmatchfrontend-6wcnragsb-gaurav-singhs-projects-9a3381d4.vercel.app"
]
all_origins = list(set(cors_origins + explicit_domains))

# Add wildcard support for development and dynamic Vercel URLs
if os.environ.get("ENVIRONMENT") != "production":
    all_origins.append("*")
logger.info(f"CORS origins: {all_origins}")

app = FastAPI(
    title="ResuMatch",
    description="AI-Powered Resume-Job Matching Application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,  
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


os.makedirs("uploads", exist_ok=True)
os.makedirs("results", exist_ok=True)




text_extractor = TextExtractor()
text_preprocessor = TextPreprocessor()
similarity_engine = SimilarityEngine()
market_trends_path = os.path.join(os.path.dirname(__file__), 'data', 'market_trends.json')
gap_analyzer = GapAnalyzer(market_data_path=market_trends_path)

courses_path = os.path.join(os.path.dirname(__file__), 'data', 'nptel_courses.json')
recommender = CourseRecommender(courses_data_path=courses_path)



analysis_results = {}

market_jobs = []

@app.on_event("startup")
async def load_market_data():
    global market_data, market_jobs
    try:
        # Load trends
        trends_path = os.path.join(os.path.dirname(__file__), 'data', 'market_trends.json')
        if os.path.exists(trends_path):
            async with aiofiles.open(trends_path, 'r') as f:
                content = await f.read()
                market_data = json.loads(content)
            logger.info("Loaded market trends data")
        
        # Load jobs
        jobs_path = os.path.join(os.path.dirname(__file__), 'data', 'market_jobs.json')
        if os.path.exists(jobs_path):
             async with aiofiles.open(jobs_path, 'r') as f:
                content = await f.read()
                market_jobs = json.loads(content)
             logger.info(f"Loaded {len(market_jobs)} market jobs")
        else:
            logger.warning("market_jobs.json not found")

    except Exception as e:
        logger.error(f"Failed to load market data: {str(e)}")

@app.get("/api/market-trends")
async def get_market_trends():
    return JSONResponse(content=market_data)



# Helper to find matching jobs
def find_matching_jobs(resume_data, jobs):
    matches = []
    # Limit to top 20 to avoid performance hit if list grows
    # But since we only have ~50, checking all is fine.
    # We'll check first 30 for speed.
    for job in jobs[:30]: 
        try:
            # Construct job data for similarity engine
            # Combine title + description + tags
            job_text = f"{job['position']} {job['description']} {' '.join(job.get('tags', []))}"
            
            job_data_for_sim = {
                'text': job_text,
                'cleaned_text': job_text
            }
            
            # Use similarity engine
            # Note: this fits TF-IDF every time, which is imperfect but works for small batch
            score_result = similarity_engine.calculate_similarity(resume_data, job_data_for_sim)
            overall_score = score_result.get('overall_score', 0)
            
            if overall_score > 40: # Only relevant matches
                matches.append({
                    **job,
                    'match_score': overall_score
                })
        except Exception:
            continue
            
    # Sort by score descending
    matches.sort(key=lambda x: x['match_score'], reverse=True)
    return matches[:3]

class ResuMatchAnalyzer:
    def __init__(self):
        self.extractor = text_extractor
        self.preprocessor = text_preprocessor
        self.similarity_engine = similarity_engine
        self.gap_analyzer = gap_analyzer
        self.recommender = recommender

    async def analyze_match(self, resume_file: UploadFile, job_description: Optional[str] = None, matching_jobs: List[Dict] = []) -> Dict[str, Any]:
        try:
            analysis_id = str(uuid.uuid4())

            logger.info("Extracting text from resume...")
            resume_content = await resume_file.read()

            extraction_result = self.extractor.extract_text(
                resume_file.filename,
                resume_content
            )

            if not extraction_result['success']:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to extract text from resume: {extraction_result.get('error', 'Unknown error')}"
                )

            resume_text = extraction_result['text']

            logger.info("Preprocessing texts...")
            resume_processed = self.preprocessor.preprocess_text(resume_text)
            job_processed = self.preprocessor.preprocess_text(job_description)

            logger.info("Starting resume analysis...")
            logger.info(f"DEBUG: Analyzing resume file: {resume_file.filename}")
            
            # Prepare data dictionaries as expected by SimilarityEngine
            resume_data_for_analysis = extraction_result
            
            job_data_for_analysis = {
                'text': job_description,
                'cleaned_text': job_processed['cleaned_text'],
                'keywords': job_processed.get('skills', {})
            }

            logger.info("Calculating similarity...")
            similarity_result = self.similarity_engine.calculate_similarity(
                resume_data_for_analysis,
                job_data_for_analysis
            )

            # Step 2: Role Detection
            detected_role = self.preprocessor.detect_role(resume_text)
            logger.info(f"Detected role: {detected_role}")

            # Step 3: Hybrid Skill Gap Analysis
            # Scenario A: JD Provided -> Use JD skills as target + Bonus Cross-Reference
            # Scenario B: No JD -> Use Role Standard + Market Trends as target
            
            logger.info("Performing skill gap analysis...")
            missing_skills = []
            final_match_score = 0
            
            market_insights = [] # Hidden gaps from market comparison (Bonus)
            
            if job_description and job_description.strip():
                # --- SCENARIO A: JD Provided ---
                # Use Similarity Engine for base match against JD
                final_match_score = int(similarity_result.get('overall_score', 0))
                
                # Extract JD skills for gap analysis
                jd_skills_keywords = job_processed.get('skills', {}).keys()
                # Create a pseudo-market structure for gap analyzer
                jd_target_skills = [{"keyword": k, "count": 100} for k in jd_skills_keywords] # High count implies required
                
                # Find gaps against JD
                missing_skills = self.gap_analyzer.find_skill_gaps(resume_text, matched_role=detected_role, target_skills_override=jd_target_skills)
                
                # --- Bonus: Cross-Reference (Hidden Market Gaps) ---
                # Compare against Role Standard to find what's missing for the *role* generally, even if JD didn't ask
                role_standard_keywords = self.preprocessor.role_keywords.get(detected_role, [])
                role_target_skills = [{"keyword": k, "count": 50} for k in role_standard_keywords]
                
                # We find gaps against role standard
                role_gaps = self.gap_analyzer.find_skill_gaps(resume_text, matched_role=detected_role, target_skills_override=role_target_skills)
                
                # Filter role gaps: include only if NOT in missing_skills (to avoid duplicates) and NOT in resume
                current_gap_names = {g['skill'] for g in missing_skills}
                for gap in role_gaps:
                    if gap['skill'] not in current_gap_names:
                        market_insights.append(gap)
                        
            else:
                # --- SCENARIO B: No JD (Market Mode) ---
                logger.info(f"No JD provided. Analyzing against market standards for {detected_role}...")
                
                # Use Role Standard keywords + Top General Market keywords
                role_standard_keywords = self.preprocessor.role_keywords.get(detected_role, [])
                
                # Combine Role keywords with top general market trends
                # Create target list
                targets = []
                for k in role_standard_keywords:
                    targets.append({"keyword": k, "count": 100}) # Role Core Skills
                
                # Add top 10 general market skills that aren't already in role keywords
                for mk in self.gap_analyzer.market_skills[:10]:
                    if mk['keyword'] not in role_standard_keywords:
                        targets.append(mk)
                        
                # Find gaps against this Market Standard
                missing_skills = self.gap_analyzer.find_skill_gaps(resume_text, matched_role=detected_role, target_skills_override=targets)
                
                # Calculate a "Market Match Score" roughly based on missing skills count
                # Start with 100. Deduct for each missing core skill.
                # This is a heuristic since we don't have a similarity score against a text.
                base_score = 100
                deduction = len(missing_skills) * 5
                final_match_score = max(20, base_score - deduction) # Floor at 20

            # Step 4: Course Recommendations
            logger.info("Generating learning roadmap...")
            career_roadmap = self.recommender.generate_roadmap(missing_skills)
            
            # Matched Skills for Heatmap
            matched_skills_list = []
            if 'matched_skills' in similarity_result:
                matched_skills_list = similarity_result['matched_skills']
            
            # Construct Heatmap Data
            heatmap_data = []
            for skill in matched_skills_list:
                heatmap_data.append({"skill": skill, "status": "match", "score": 90}) # Dummy high score for match
            
            for gap in missing_skills:
                # SkillGap object has: skill, importance, gap_type
                score = 0
                if gap['gap_type'] == 'Critical':
                    score = 20
                else:
                    score = 40
                heatmap_data.append({"skill": gap['skill'], "status": "gap", "score": score})


            # Market Job Matching
            matched_jobs = []
            if matching_jobs:
                logger.info(f"Matching against {len(matching_jobs)} market jobs...")
                matched_jobs = find_matching_jobs(resume_data_for_analysis, matching_jobs)
                logger.info(f"Found {len(matched_jobs)} matching market jobs")

            # Final Specific Response Structure
            response_payload = {
                "status": "success",
                "role_detected": detected_role,
                "role_detected": detected_role,
                "match_score": final_match_score,
                "market_insights": market_insights, # Bonus field
                "heatmap_data": heatmap_data,
                "roadmap": career_roadmap,
                
                # Keeping legacy fields for now to prevent breaking existing frontend totally before refactor
                "analysis_id": analysis_id,
                "timestamp": datetime.now().isoformat(),
                "matched_jobs": matched_jobs,
                "detailed_analysis": { # Helper for frontend standard display
                     "strengths": matched_skills_list,
                     "areas_for_improvement": [g['skill'] for g in missing_skills],
                     "areas_for_improvement": [g['skill'] for g in missing_skills],
                     "overall_assessment": f"Role: {detected_role}. Match Score: {final_match_score}%"
                }

            }
            
            analysis_results[analysis_id] = response_payload

            logger.info(f"Analysis completed successfully. ID: {analysis_id}")
            return response_payload

            analysis_results[analysis_id] = analysis_result

            logger.info(f"Analysis completed successfully. ID: {analysis_id}")
            return analysis_result

        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

analyzer = ResuMatchAnalyzer()


@app.post("/analyze")
async def analyze_resume_job_match(
    background_tasks: BackgroundTasks,
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(None)
):
    try:
        # Job Description is now optional. If empty/None, treated as Market Mode.
        # if not job_description.strip():
        #     raise HTTPException(status_code=400, detail="Job description cannot be empty")
        allowed_types = {'.pdf', '.doc', '.docx', '.txt'}
        file_ext = os.path.splitext(resume.filename)[1].lower()
        if file_ext not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file_ext}. Allowed types: {', '.join(allowed_types)}"
            )
            
        # Perform main analysis
        if file_ext not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type: {file_ext}. Allowed types: {', '.join(allowed_types)}"
            )
            
        # Perform main analysis
        # Pass the global market_jobs list
        result = await analyzer.analyze_match(resume, job_description, matching_jobs=market_jobs)
        
        # Return the simplified structure directly
        return JSONResponse(content=result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in analyze endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error occurred")

@app.post("/analyse")
async def analyse_resume_job_match(
    background_tasks: BackgroundTasks,
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(None)
):
    return await analyze_resume_job_match(background_tasks, resume, job_description)

@app.get("/analyze")
async def analyze_get_method():
    raise HTTPException(
        status_code=405,
        detail="Method not allowed. Use POST for resume analysis with multipart/form-data"
    )

@app.get("/analyse")
async def analyse_get_method():
    raise HTTPException(
        status_code=405,
        detail="Method not allowed. Use POST for resume analysis with multipart/form-data"
    )


@app.get("/analysis/{analysis_id}")
async def get_analysis_result(analysis_id: str):
    if analysis_id not in analysis_results:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return JSONResponse(content=analysis_results[analysis_id])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/batch-analyze")
async def batch_analyze(
    resumes: List[UploadFile] = File(...),
    job_description: Optional[str] = Form(None)
):
    try:
        if len(resumes) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 resumes allowed per batch")
        results = []
        for resume in resumes:
            try:
                result = await analyzer.analyze_match(resume, job_description)
                results.append({
                    'filename': resume.filename,
                    'analysis_id': result['analysis_id'],
                    'overall_score': result['similarity_analysis']['overall_score'],
                    'status': 'success'
                })
            except Exception as e:
                results.append({
                    'filename': resume.filename,
                    'error': str(e),
                    'status': 'failed'
                })
        successful_results = [r for r in results if r['status'] == 'success']
        failed_results = [r for r in results if r['status'] == 'failed']
        successful_results.sort(key=lambda x: x['overall_score'], reverse=True)
        return JSONResponse(content={
            'total_resumes': len(resumes),
            'successful': len(successful_results),
            'failed': len(failed_results),
            'results': successful_results + failed_results
        })
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Batch analysis failed")


@app.get("/api/stats")
async def get_statistics():
    return JSONResponse(content={
        'total_analyses': len(analysis_results),
        'models_loaded': {
            'text_extractor': text_extractor is not None,
            'text_preprocessor': text_preprocessor is not None,
            'similarity_engine': similarity_engine.sentence_model is not None
        },
        'supported_formats': text_extractor.supported_formats,
        'uptime': datetime.now().isoformat()
    })

@app.get("/debug")
async def debug_info():
    import sys
    import platform
    import fastapi
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    }
    
    return JSONResponse(
        content={
            'api_status': 'online',
            'timestamp': datetime.now().isoformat(),
            'python_version': sys.version,
            'platform': platform.platform(),
            'fastapi_version': fastapi.__version__,
            'available_endpoints': [
                {'path': route.path, 'methods': list(route.methods)} 
                for route in app.routes
            ],
            'environment': {
                'cors_origins': os.environ.get('CORS_ORIGINS', 'Not set'),
                'port': os.environ.get('PORT', 'Not set'),
            }
        },
        headers=headers
    )

@app.get("/cors-test")
async def cors_test():
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "*"
    }
    return JSONResponse(
        content={
            'message': 'CORS is working properly!',
            'timestamp': datetime.now().isoformat(),
            'configured_origins': all_origins,
            'status': 'success'
        },
        headers=headers
    )


@app.get("/status", response_class=HTMLResponse)
async def status_page():
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>ResuMatch API Status</title>
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; background-color: #f5f5f5; }}
            .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .status {{ color: #28a745; font-weight: bold; }}
            .endpoint {{ background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 5px; }}
            .cors-origins {{ background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            .test-button {{ background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 10px 5px; }}
            .test-button:hover {{ background: #0056b3; }}
            .result {{ margin: 15px 0; padding: 15px; border-radius: 5px; background: #f8f9fa; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎯 ResuMatch API Status</h1>
            <p class="status">✅ API is online and running</p>
            <p><strong>Timestamp:</strong> {datetime.now().isoformat()}</p>
            
            <h2>📋 Available Endpoints</h2>
            <div class="endpoint"><strong>POST</strong> /analyze - Resume analysis</div>
            <div class="endpoint"><strong>GET</strong> /health - Health check</div>
            <div class="endpoint"><strong>GET</strong> /cors-test - CORS test</div>
            <div class="endpoint"><strong>GET</strong> /debug - Debug information</div>
            
            <h2>🌐 CORS Configuration</h2>
            <div class="cors-origins">
                <strong>Allowed Origins:</strong><br>
                {'<br>'.join(all_origins)}
            </div>
            
            <h2>🧪 Test CORS</h2>
            <button class="test-button" onclick="testCORS()">Test CORS from Browser</button>
            <button class="test-button" onclick="testHealth()">Test Health Endpoint</button>
            
            <div id="test-result" class="result" style="display: none;"></div>
            
            <script>
                async function testCORS() {{
                    const resultDiv = document.getElementById('test-result');
                    resultDiv.style.display = 'block';
                    resultDiv.innerHTML = 'Testing CORS...';
                    
                    try {{
                        const response = await fetch('/cors-test');
                        const data = await response.json();
                        resultDiv.innerHTML = '<strong>✅ CORS Test Success:</strong><br>' + JSON.stringify(data, null, 2);
                        resultDiv.style.background = '#d4edda';
                        resultDiv.style.color = '#155724';
                    }} catch (error) {{
                        resultDiv.innerHTML = '<strong>❌ CORS Test Failed:</strong><br>' + error.message;
                        resultDiv.style.background = '#f8d7da';
                        resultDiv.style.color = '#721c24';
                    }}
                }}
                
                async function testHealth() {{
                    const resultDiv = document.getElementById('test-result');
                    resultDiv.style.display = 'block';
                    resultDiv.innerHTML = 'Testing health endpoint...';
                    
                    try {{
                        const response = await fetch('/health');
                        const data = await response.json();
                        resultDiv.innerHTML = '<strong>✅ Health Test Success:</strong><br>' + JSON.stringify(data, null, 2);
                        resultDiv.style.background = '#d4edda';
                        resultDiv.style.color = '#155724';
                    }} catch (error) {{
                        resultDiv.innerHTML = '<strong>❌ Health Test Failed:</strong><br>' + error.message;
                        resultDiv.style.background = '#f8d7da';
                        resultDiv.style.color = '#721c24';
                    }}
                }}
            </script>
        </div>
    </body>
    </html>
    """
    
    # Set custom headers including CSP to allow inline scripts
    headers = {
        "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    }
    
    return HTMLResponse(content=html_content, headers=headers)


@app.options("/analyze")
async def options_analyze():
    """Handle CORS preflight requests for analyze endpoint"""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.options("/analyse")
async def options_analyse():
    """Handle CORS preflight requests for analyse endpoint"""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
        }
    )


if __name__ == "__main__":
    logger.info("Starting ResuMatch application...")
    logger.info("Using lightweight similarity engine with TF-IDF")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
