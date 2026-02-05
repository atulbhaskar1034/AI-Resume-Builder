"""
LangGraph Workflow for ResuMatch
Core logic for resume analysis using a multi-agent system
"""

from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv
import json
import os
import logging

from datetime import datetime
from tools import tools
from logger import log_message_sync, send_node_status_sync, send_result_sync
from fetch_market import fetch_jobs_by_role
from youtube_courses import fetch_courses_for_skill_gaps, format_courses_for_llm, generate_search_url_fallback

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("debug.log", mode='w')
    ]
)
logger = logging.getLogger(__name__)

# =============================================================================
# State Definition
# =============================================================================

class GraphState(TypedDict):
    """State that flows through the graph"""
    resume_text: str
    role: str
    skill_gaps: List[str]
    retrieved_docs: str  # Context from Vector DB
    final_result: dict


# =============================================================================
# LLM Setup - Using xAI Grok API
# =============================================================================

from langchain_groq import ChatGroq

# Use Groq API (FREE tier available)
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3
)

# Debug: Print loaded API keys (masked) to console
grok_key = os.getenv("GROK_API_KEY")
google_key = os.getenv("GOOGLE_API_KEY")
print(f"DEBUG: Loaded GROK_API_KEY: {grok_key[:5] + '...' if grok_key else 'None'}")
print(f"DEBUG: Loaded GOOGLE_API_KEY: {google_key[:5] + '...' if google_key else 'None'}")


# =============================================================================
# Node Definitions
# =============================================================================

def analyze_profile(state: GraphState) -> GraphState:
    """
    Node 1: Analyze the resume to extract role and skill gaps
    """
    # Send node status
    send_node_status_sync("analyze", "running", "Analyzing your resume...")
    log_message_sync("[INFO] Starting resume analysis...", step="analyze")
    
    resume_text = state["resume_text"]
    log_message_sync(f"[INFO] Parsing document ({len(resume_text)} characters)...", step="analyze")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert career analyst. Analyze resumes and identify skill gaps.
Always respond with valid JSON only, no markdown formatting."""),
        ("human", """Extract the target role and top 3 missing critical skills from this resume:

{resume_text}

Return ONLY valid JSON in this exact format:
{{"role": "string", "gaps": ["skill1", "skill2", "skill3"]}}""")
    ])
    
    parser = JsonOutputParser()
    chain = prompt | llm | parser
    
    log_message_sync("[INFO] Invoking LLM for skill extraction...", step="analyze")
    
    try:
        result = chain.invoke({"resume_text": resume_text})
        role = result.get("role", "Software Engineer")
        gaps = result.get("gaps", [])
        
        log_message_sync(f"[INFO] Role identified: {role}", step="analyze")
        log_message_sync(f"[INFO] Skill gaps detected: {', '.join(gaps)}", step="analyze")
        send_node_status_sync("analyze", "complete", f"Identified role: {role}")
        
        return {
            **state,
            "role": role,
            "skill_gaps": gaps
        }
    except Exception as e:
        log_message_sync(f"[ERROR] Analysis failed: {str(e)}", step="analyze")
        print(f"Error in analyze_profile: {e}")
        return {
            **state,
            "role": "Software Engineer",
            "skill_gaps": ["Python", "Data Structures", "System Design"]
        }


def retrieve_nodes(state: GraphState) -> GraphState:
    """
    Node 2: Retrieve relevant courses and materials from vector store
    """
    try:
        with open("debug_retrieve.txt", "a", encoding="utf-8") as f:
            f.write(f"\n--- RETRIEVE START {datetime.now()} ---\n")
    except:
        pass

    log_message_sync("[INFO] Retrieving relevant courses...", step="retrieve")
    send_node_status_sync("retrieve", "running", "Searching course database...")
    
    role = state.get("role", "")
    skill_gaps = state.get("skill_gaps", [])
    
    # Get the retriever tool
    retriever_tool = tools[0]
    
    all_docs = []
    
    # Search for each skill gap
    for i, skill in enumerate(skill_gaps):
        try:
            log_message_sync(f"[GET] ChromaDB: Searching for '{skill}'...", step="fetch")
            query = f"{skill} {role}"
            results = retriever_tool.invoke(query)
            all_docs.append(f"### Resources for {skill}:\n{results}")
            log_message_sync(f"[INFO] Found resources for {skill} ({i+1}/{len(skill_gaps)})", step="fetch")
        except Exception as e:
            log_message_sync(f"[ERROR] Failed to fetch {skill}: {str(e)}", step="fetch")
            print(f"Error fetching resources for {skill}: {e}")
            all_docs.append(f"### Resources for {skill}:\nNo results found.")
    
    # Concatenate all results
    retrieved_docs = "\n\n".join(all_docs)
    
    log_message_sync(f"[INFO] Retrieved {len(all_docs)} resource sections", step="fetch")
    send_node_status_sync("fetch", "complete", f"Found resources for {len(skill_gaps)} skills")
    
    return {
        **state,
        "retrieved_docs": retrieved_docs
    }


def synthesize_roadmap(state: GraphState) -> GraphState:
    """
    Node 3: Synthesize the final roadmap and recommendations using LIVE market data
    """
    # Send node status
    send_node_status_sync("synthesize", "running", "Building your roadmap...")
    log_message_sync("[INFO] Starting roadmap synthesis...", step="synthesize")
    
    try:
        with open("debug_explicit.txt", "a", encoding="utf-8") as f:
            f.write(f"\n\n--- SYNTHESIS NODE STARTED {datetime.now()} ---\n")
    except:
        pass
    
    retrieved_docs = state.get("retrieved_docs", "")
    skill_gaps = state.get("skill_gaps", [])
    role = state.get("role", "")
    resume_text = state.get("resume_text", "")
    
    log_message_sync(f"[INFO] Context length: {len(retrieved_docs)} characters", step="synthesize")
    log_message_sync(f"[INFO] Target role: {role}", step="synthesize")
    
    # Fetch LIVE market data for the detected role
    log_message_sync(f"[INFO] Fetching live job market data for: {role}", step="synthesize")
    market_data = fetch_jobs_by_role(role, max_jobs=15)
    market_skills = market_data.get('market_skills', [])
    market_jobs = market_data.get('jobs', [])
    
    log_message_sync(f"[INFO] Found {len(market_jobs)} live jobs and {len(market_skills)} market skills", step="synthesize")
    
    # FALLBACK: If no market skills found (e.g. non-tech role), infer them or use defaults
    if not market_skills:
        log_message_sync(f"[WARN] No market skills found for {role}. Using fallback skills.", step="synthesize")
        # Basic fallback to ensure radar chart works. The LLM will refine this.
        market_skills = ["Technical Knowledge", "Problem Solving", "Project Management", "Communication", "Data Analysis", "Industry Tools"]
        
    # Fetch LIVE YouTube courses for skill gaps - Ensure 6 months of content
    log_message_sync(f"[INFO] Generatng search queries for 6-month roadmap...", step="synthesize")
    
    # Create expanded search queries to ensure we have enough content for 6 months
    search_queries = list(skill_gaps)
    
    # If fewer than 6, add "Advanced" and "Project" variations to fill the roadmap
    needed = 6 - len(search_queries)
    if needed > 0:
        for gap in skill_gaps[:needed]:
            search_queries.append(f"Advanced {gap} Course")
            
    # If still short (e.g. only 1 gap), add role-based topics
    if len(search_queries) < 6:
        search_queries.append(f"{role} Full Course")
        search_queries.append(f"{role} Capstone Project")
        search_queries.append(f"{role} Interview Preparation")
        
    search_queries = search_queries[:6]  # Cap at 6 distinct topics
    
    log_message_sync(f"[INFO] Fetching YouTube courses for: {search_queries}", step="synthesize")
    youtube_courses = fetch_courses_for_skill_gaps(search_queries, max_per_skill=2)
    youtube_courses_context = format_courses_for_llm(youtube_courses)
    
    log_message_sync(f"[INFO] Found YouTube courses for {len(youtube_courses)} skills", step="synthesize")
    
    # Format live job data for the prompt
    live_jobs_context = ""
    for job in market_jobs[:5]:
        live_jobs_context += f"\n[LIVE_JOB] Title: {job['title']}, Company: {job['company']}, URL: {job['url']}"
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert career coach and learning path architect. Your job is to create INTELLIGENT, PERSONALIZED learning roadmaps for job seekers.

CRITICAL RULES:
1. For ROADMAP: Use ONLY the [YOUTUBE_COURSE] items provided below. These are REAL YouTube courses.
2. For JOBS: Use the [LIVE_JOB] items from live market data.
3. Generate exactly 6 skills for the SKILL RADAR comparing user proficiency vs market demand.
4. Use the EXACT URLs and thumbnails from the YouTube courses - NEVER make up URLs.
5. Match score should reflect how the RESUME matches LIVE MARKET skill requirements.

ROADMAP INTELLIGENCE RULES:
- THINK like a mentor: What should a student learn FIRST to build a strong foundation?
- Order courses by PREREQUISITES: Foundational concepts → Intermediate skills → Advanced topics
- Each month should BUILD on the previous month's learning
- Explain WHY each course is chosen and how it helps their career
- Consider what the TARGET ROLE requires and work backwards

Always respond with valid JSON only, no markdown formatting."""),
        ("human", """AVAILABLE YOUTUBE COURSES (use these EXACT URLs and thumbnails):
{youtube_courses_context}

LIVE MARKET DATA:
Top skills required in {role} jobs: {market_skills}
{live_jobs_context}

RESUME TEXT:
{resume_text}

User's Skill Gaps: {skill_gaps}
Target Role: {role}

TASK - Create a PERSONALIZED learning roadmap:

1. MATCH SCORE: Compare the resume against these LIVE MARKET SKILLS: {market_skills}
   - Count how many of these market skills are evidenced in the resume
   - Calculate: (matched_skills / total_market_skills) * 100
   
2. SKILL RADAR (exactly 6 skills from market_skills):
   - For each of the top 6 market-demanded skills
   - userScore: How much evidence in the resume supports this skill (1-10)
   - marketScore: Always 10 (represents market demand)
   
3. LEARNING ROADMAP (EXACTLY 6 months - REQUIRED):
   - You MUST generate content for all 6 months.
   - Month 1-2: Foundational skills (basics, prerequisites)
   - Month 3-4: Intermediate skills (tools, frameworks)
   - Month 5-6: Advanced topics & CAPSTONE PROJECTS
   - If you run out of unique gaps, suggest "Advanced [Skill]" or "Build [Skill] Project"
   - EXPLAIN WHY each course is recommended - be specific about how it fills the user's gap

4. MATCHED JOBS: Return top 3 jobs from [LIVE_JOB] items

Return ONLY valid JSON in this exact schema:
{{
    "detected_role": "<exact_role_based_on_resume>",
    "match_score": <percentage_0_to_100>,
    "match_score_reasoning": "User has X of Y market-demanded skills: [list matched skills]",
    "skill_radar": [
        {{"skill": "<market_skill_1>", "userScore": <1-10>, "marketScore": 10}},
        {{"skill": "<market_skill_2>", "userScore": <1-10>, "marketScore": 10}},
        {{"skill": "<market_skill_3>", "userScore": <1-10>, "marketScore": 10}},
        {{"skill": "<market_skill_4>", "userScore": <1-10>, "marketScore": 10}},
        {{"skill": "<market_skill_5>", "userScore": <1-10>, "marketScore": 10}},
        {{"skill": "<market_skill_6>", "userScore": <1-10>, "marketScore": 10}}
    ],
    "roadmap": [
        {{
            "month": 1,
            "skill": "<skill_to_learn>",
            "priority": "foundation",
            "course_title": "EXACT Course Title from [COURSE] above",
            "course_url": "EXACT URL from [COURSE] above",
            "thumbnail": "EXACT Thumbnail URL from [COURSE] above",
            "description": "What this course covers in 1 sentence",
            "why_learn": "2-3 sentences explaining WHY this course is recommended for this user's skill gaps and target role. Be specific about how it builds their foundation.",
            "prerequisites": "None - this is a beginner course",
            "learning_outcome": "After completing this course, you will be able to...",
            "status": "Recommended"
        }},
        {{
            "month": 2,
            "skill": "<nextskill>",
            "priority": "foundation",
            "course_title": "...",
            "course_url": "...",
            "thumbnail": "...",
            "description": "...",
            "why_learn": "This builds on Month 1's foundation and...",
            "prerequisites": "Completion of Month 1 course",
            "learning_outcome": "...",
            "status": "Recommended"
        }}
    ],
    "recommended_jobs": [
        {{
            "title": "EXACT Title from [LIVE_JOB]",
            "company": "EXACT Company from [LIVE_JOB]",
            "url": "EXACT URL from [LIVE_JOB]",
            "match_score": <job_relevance_percentage>
        }}
    ]
}}""")
    
    ])
    
    parser = JsonOutputParser()
    chain = prompt | llm | parser
    
    try:
        # Explicit debug logging
        with open("debug_explicit.txt", "a", encoding="utf-8") as f:
            f.write(f"\n\n--- SYNTHESIS START {datetime.now()} ---\n")
            f.write(f"Role: {role}, Gaps: {skill_gaps}\n")
            f.write(f"Context Length: {len(retrieved_docs)}\n")
            f.write(f"Market Skills: {market_skills}\n")
            f.write(f"Live Jobs: {len(market_jobs)}\n")
        
        logger.info(f"Synthesizing roadmap for role: {role} with {len(skill_gaps)} gaps and {len(market_skills)} market skills")
        
        import time
        max_retries = 3
        result = None
        
        for attempt in range(max_retries):
            try:
                result = chain.invoke({
                    "youtube_courses_context": youtube_courses_context,
                    "skill_gaps": json.dumps(skill_gaps),
                    "role": role,
                    "market_skills": json.dumps(market_skills),
                    "live_jobs_context": live_jobs_context,
                    "resume_text": resume_text[:3000]  # Limit to avoid token limits
                })
                break # Success
            except Exception as e:
                error_str = str(e).lower()
                if "429" in error_str or "rate" in error_str:
                    wait_time = (2 ** attempt) * 2  # 2, 4, 8 seconds
                    log_message_sync(f"[WARN] API Rate Limit hit. Retrying in {wait_time}s...", step="synthesize")
                    logger.warning(f"Rate limit hit: {e}. Retrying in {wait_time}s")
                    time.sleep(wait_time)
                elif attempt == max_retries - 1:
                    raise e # Re-raise if it's the last attempt
                else:
                    raise e # Re-raise other errors immediately
        
        if not result:
            raise Exception("Failed to generate roadmap after retries")
        
        with open("debug_explicit.txt", "a", encoding="utf-8") as f:
            f.write(f"LLM Result Raw: {result}\n")
            f.write("--- SYNTHESIS SUCCESS ---\n")
        
        num_courses = len(result.get('roadmap', []))
        num_jobs = len(result.get('recommended_jobs', []))
        
        log_message_sync(f"[INFO] Generated {num_courses} course recommendations", step="synthesize")
        log_message_sync(f"[INFO] Found {num_jobs} matching jobs", step="synthesize")
        log_message_sync("[SUCCESS] Roadmap synthesis complete!", step="synthesize")
        
        logger.info(f"Synthesis successful: {num_courses} courses, {num_jobs} jobs")
        send_node_status_sync("synthesize", "complete", "Roadmap ready!")
        
        # NOTE: Don't send result here - the SSE async workflow sends the properly mapped response_payload
        # send_result_sync(result)  # This was sending 'detected_role' but frontend expects 'role_detected'
        
        # Ensure roadmap and jobs have fallback data if empty
        if not result.get("roadmap") or len(result.get("roadmap", [])) == 0:
            logger.warning("LLM returned empty roadmap, adding fallback courses")
            log_message_sync("[INFO] Generating fallback course recommendations...", step="synthesize")
            result["roadmap"] = generate_fallback_roadmap(skill_gaps)
        
        # robust check for valid jobs
        jobs = result.get("recommended_jobs", [])
        is_invalid_jobs = (
            not jobs or 
            len(jobs) == 0 or 
            (len(jobs) == 1 and "no jobs" in str(jobs[0].get("title", "")).lower())
        )
        
        if is_invalid_jobs:
            logger.warning("LLM returned empty or invalid jobs, adding fallback jobs")
            log_message_sync("[INFO] Generating fallback job recommendations...", step="synthesize")
            result["recommended_jobs"] = generate_fallback_jobs(role, skill_gaps)
        
        logger.info(f"Final result - Roadmap: {len(result.get('roadmap', []))} courses, Jobs: {len(result.get('recommended_jobs', []))} jobs")
        
        return {
            **state,
            "final_result": result
        }
    except Exception as e:
        with open("debug_explicit.txt", "a", encoding="utf-8") as f:
            f.write(f"CRITICAL ERROR: {str(e)}\n")
            import traceback
            traceback.print_exc(file=f)
            f.write("--- SYNTHESIS FAILED ---\n")
            
        print(f"DEBUG: CRITICAL LLM ERROR: {str(e)}")
        log_message_sync(f"[ERROR] Synthesis failed: {str(e)}", step="synthesize")
        logger.error(f"Error in synthesize_roadmap: {type(e).__name__}: {e}")
        
        # Generate fallback result on error
        fallback_roadmap = generate_fallback_roadmap(skill_gaps)
        fallback_jobs = generate_fallback_jobs(role, skill_gaps)
        
        return {
            **state,
            "final_result": {
                "match_score": 50,
                "heatmap": [{"skill": gap, "status": "gap", "score": 30} for gap in skill_gaps],
                "roadmap": fallback_roadmap,
                "recommended_jobs": fallback_jobs,
                "error": str(e)
            }
        }


def generate_fallback_roadmap(skill_gaps: List[str]) -> List[dict]:
    """Generate fallback course recommendations using YouTube API or search URLs.
    
    This function is called when the LLM fails to generate a roadmap.
    It fetches real YouTube courses or provides search URLs as fallback.
    """
    from youtube_courses import search_youtube_courses, generate_search_url_fallback
    
    roadmap = []
    month = 1
    
    # Fetch real YouTube courses for each skill gap
    # Fetch real YouTube courses for each skill gap - Ensure 6 months
    # We loop 6 times, cycling through gaps if needed but adding variety
    
    extended_gaps = skill_gaps[:]
    while len(extended_gaps) < 6:
        extended_gaps.extend([f"Advanced {g}" for g in skill_gaps])
        extended_gaps.append("Capstone Project")
    
    for i in range(6):  # Exactly 6 months
        query = extended_gaps[i] if i < len(extended_gaps) else skill_gaps[0]
        
        logger.info(f"Fallback: Fetching YouTube course for: {query}")
        
        # Try to get real YouTube courses
        courses = search_youtube_courses(query, max_results=1)
        
        if courses and len(courses) > 0:
            course = courses[0]
            roadmap.append({
                "month": month,
                "skill": query.replace("Advanced ", "").replace("Capstone Project", "Project"),
                "priority": "foundation" if i < 2 else "intermediate" if i < 4 else "advanced",
                "course_title": course["title"],
                "course_url": course["url"],
                "thumbnail": course["thumbnail"],
                "description": course.get("description", f"Learn {query} through this course"),
                "why_learn": f"We recommend this course to master {query}.",
                "status": "Recommended"
            })
        else:
            # Use search URL as ultimate fallback
            fallback = generate_search_url_fallback(query)
            roadmap.append({
                "month": month,
                "skill": query,
                "priority": "foundation" if i < 2 else "intermediate" if i < 4 else "advanced",
                "course_title": fallback["title"],
                "course_url": fallback["url"],
                "thumbnail": fallback["thumbnail"],
                "description": fallback["description"],
                "why_learn": f"Search YouTube for {query} to find the best learning resources.",
                "status": "Recommended"
            })
        month += 1
    
    return roadmap


def generate_fallback_jobs(role: str, skill_gaps: List[str]) -> List[dict]:
    """Generate fallback job recommendations"""
    import uuid
    
    # Sample job templates
    job_templates = [
        {"title": "Software Engineer", "company": "Tech Company", "base_score": 75},
        {"title": "Full Stack Developer", "company": "Startup Inc", "base_score": 70},
        {"title": "Data Scientist", "company": "Analytics Corp", "base_score": 68},
        {"title": "DevOps Engineer", "company": "Cloud Services", "base_score": 65},
        {"title": "ML Engineer", "company": "AI Solutions", "base_score": 72},
    ]
    
    jobs = []
    for template in job_templates[:3]:  # Top 3 jobs
        jobs.append({
            "id": str(uuid.uuid4())[:8],
            "title": f"{role or template['title']}",
            "company": template["company"],
            "url": "https://remoteok.com/remote-jobs",
            "match_score": template["base_score"]
        })
    
    return jobs



# =============================================================================
# Build Graph
# =============================================================================

# Initialize the graph with our state
workflow = StateGraph(GraphState)

# Add nodes
# Add nodes
workflow.add_node("analyze", analyze_profile)
workflow.add_node("retrieve", retrieve_nodes)
workflow.add_node("synthesize", synthesize_roadmap)

# Set entry point
workflow.set_entry_point("analyze")

# Define edges: analyze -> retrieve -> synthesize -> END
workflow.add_edge("analyze", "retrieve")
workflow.add_edge("retrieve", "synthesize")
workflow.add_edge("synthesize", END)

# Compile the graph
app = workflow.compile()


# =============================================================================
# Helper function to run the workflow
# =============================================================================

def run_analysis(resume_text: str) -> dict:
    """
    Run the complete analysis workflow on a resume.
    
    Args:
        resume_text: The text content of the resume
        
    Returns:
        The final analysis result
    """
    initial_state = {
        "resume_text": resume_text,
        "role": "",
        "skill_gaps": [],
        "retrieved_docs": "",
        "final_result": {}
    }
    
    # Run the graph
    result = app.invoke(initial_state)
    
    return result.get("final_result", {})


async def run_analysis_streaming(resume_text: str):
    """
    Run the analysis workflow with REAL SSE streaming updates.
    Uses asyncio.Queue to stream logs from within workflow nodes.
    
    Args:
        resume_text: The text content of the resume
        
    Yields:
        SSE formatted strings with node status updates and logs
    """
    import asyncio
    from logger import set_log_queue, event_generator
    
    # Create a queue for this analysis session
    log_queue = asyncio.Queue(maxsize=100)
    
    # Set the queue in context for the workflow nodes to use
    set_log_queue(log_queue)
    
    initial_state = {
        "resume_text": resume_text,
        "role": "",
        "skill_gaps": [],
        "retrieved_docs": "",
        "final_result": {}
    }
    
    async def run_workflow():
        """Run the workflow in a way that allows yielding logs."""
        try:
            # Run each node sequentially, allowing logs to be sent
            current_state = initial_state.copy()
            
            # Run analyze_profile
            current_state = analyze_profile(current_state)
            await asyncio.sleep(0.1)  # Allow queue to flush
            
            # Run retrieve_nodes
            current_state = retrieve_nodes(current_state)
            await asyncio.sleep(0.1)  # Allow queue to flush
            
            # Run synthesize_roadmap
            current_state = synthesize_roadmap(current_state)
            await asyncio.sleep(0.1)  # Allow queue to flush
            
            # --- Result Processing & Fallback Logic (Matching main.py) ---
            final_result = current_state.get("final_result", {})
            
            # Debug: Log what final_result contains - write to file for visibility
            with open("debug_role.txt", "a", encoding="utf-8") as f:
                f.write(f"\n\n--- SSE ROLE DEBUG {datetime.now()} ---\n")
                f.write(f"final_result keys: {list(final_result.keys()) if final_result else 'EMPTY'}\n")
                f.write(f"detected_role from final_result: {final_result.get('detected_role', 'NOT FOUND')}\n")
                f.write(f"current_state role: {current_state.get('role', 'NOT SET')}\n")
            
            # Use skill_radar to determine skill gaps (skills with low userScore)
            skill_radar = final_result.get("skill_radar", [])
            skill_gaps = [item["skill"] for item in skill_radar if item.get("userScore", 0) <= 5]
            
            # Get role from LLM response first, then state, then default
            role = final_result.get("detected_role") or current_state.get("role") or "Professional"
            
            with open("debug_role.txt", "a", encoding="utf-8") as f:
                f.write(f"Final role being used: {role}\n")
            
            llm_roadmap = final_result.get("roadmap", [])
            llm_jobs = final_result.get("recommended_jobs", [])
            
            if not llm_roadmap:
                log_message_sync("[WARN] LLM returned no roadmap, generating fallback...", step="synthesize")
                llm_roadmap = generate_fallback_roadmap(skill_gaps if skill_gaps else ["Python", "Cloud Computing"])
                
            if not llm_jobs:
                log_message_sync("[WARN] LLM returned no jobs, generating fallback...", step="synthesize")
                llm_jobs = generate_fallback_jobs(role, skill_gaps)
            
            # Construct final response object (REMOVED heatmap_data - using only skill_radar)
            response_payload = {
                "status": "success",
                "role_detected": role,
                "match_score": final_result.get("match_score", 50),
                "match_score_reasoning": final_result.get("match_score_reasoning", ""),
                "skill_radar": skill_radar,
                "roadmap": [], # To be populated
                "matched_jobs": [], # To be populated
                "detailed_analysis": {
                    "overall_assessment": f"Role: {role}. Match Score: {final_result.get('match_score', 50)}%",
                    "strengths": [item["skill"] for item in skill_radar if item.get("userScore", 0) > 5],
                    "areas_for_improvement": skill_gaps
                }
            }
            
            # Map roadmap
            for item in llm_roadmap:
                response_payload["roadmap"].append({
                    "month": item.get("month", 1),
                    "skill": item.get("skill", ""),
                    "course_title": item.get("course_title", ""),
                    "course_url": item.get("course_url", ""),
                    "thumbnail": item.get("thumbnail", "https://i.ytimg.com/vi/default/hqdefault.jpg"),
                    "description": item.get("description", f"Learn {item.get('skill', 'this skill')}"),
                    "why_learn": item.get("why_learn", "Crucial for your professional growth."),
                    "priority": item.get("priority", "foundation"),
                    "prerequisites": item.get("prerequisites", ""),
                    "learning_outcome": item.get("learning_outcome", ""),
                    "status": item.get("status", "Recommended")
                })
                
            # Map jobs
            for job in llm_jobs:
                response_payload["matched_jobs"].append({
                    "id": job.get("id", str(hash(job.get("title", "")))),
                    "position": job.get("title", job.get("position", "")),
                    "company": job.get("company", ""),
                    "location": job.get("location", "Remote"),
                    "url": job.get("url", ""),
                    "date": job.get("date", datetime.now().isoformat()),
                    "match_score": job.get("match_score", 70)
                })
            
            # Send result event
            # Debug: Log the full payload being sent
            result_msg = json.dumps({"type": "result", "payload": response_payload})
            with open("debug_role.txt", "a", encoding="utf-8") as f:
                f.write(f"\n--- SSE RESPONSE PAYLOAD ---\n")
                f.write(f"role_detected in payload: {response_payload.get('role_detected')}\n")
                f.write(f"match_score in payload: {response_payload.get('match_score')}\n")
                f.write(f"FULL JSON STRING:\n{result_msg[:500]}...\n")
            
            await log_queue.put(result_msg)
            
            # Send done event
            done_msg = json.dumps({"type": "done"})
            await log_queue.put(done_msg)
            
        except Exception as e:
            error_msg = json.dumps({"type": "error", "content": str(e)})
            await log_queue.put(error_msg)
        finally:
            # Signal completion
            await log_queue.put(None)
    
    # Start the workflow in the background
    workflow_task = asyncio.create_task(run_workflow())
    
    # Yield events from the queue
    try:
        async for event in event_generator(log_queue):
            yield event
    finally:
        # Ensure the workflow task completes
        await workflow_task
        # Clear the context
        set_log_queue(None)


# Test the workflow when run directly
if __name__ == "__main__":
    test_resume = """
    John Doe
    Software Developer
    
    Experience:
    - 3 years Python development
    - Built REST APIs with Flask
    - Basic SQL knowledge
    
    Education:
    - B.S. Computer Science
    
    Skills:
    - Python, Flask, SQL, Git
    """
    
    print("=" * 50)
    print("Testing ResuMatch LangGraph Workflow")
    print("=" * 50)
    
    result = run_analysis(test_resume)
    print(json.dumps(result, indent=2))
