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

from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatOpenAI(
    model="google/gemini-2.0-flash-001",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
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
    
    # Format live job data for the prompt
    live_jobs_context = ""
    for job in market_jobs[:5]:
        live_jobs_context += f"\n[LIVE_JOB] Title: {job['title']}, Company: {job['company']}, URL: {job['url']}"
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an expert career coach and learning path architect. Your job is to create INTELLIGENT, PERSONALIZED learning roadmaps for job seekers.

CRITICAL RULES:
1. For ROADMAP: Use ONLY items marked as [COURSE] from the context. These are real NPTEL courses.
2. For JOBS: Use the [LIVE_JOB] items from live market data.
3. Generate exactly 6 skills for the SKILL RADAR comparing user proficiency vs market demand.
4. Use the EXACT URLs and thumbnails from the context - never make up URLs.
5. Match score should reflect how the RESUME matches LIVE MARKET skill requirements.

ROADMAP INTELLIGENCE RULES:
- THINK like a mentor: What should a student learn FIRST to build a strong foundation?
- Order courses by PREREQUISITES: Foundational concepts → Intermediate skills → Advanced topics
- Each month should BUILD on the previous month's learning
- Explain WHY each course is chosen and how it helps their career
- Consider what the TARGET ROLE requires and work backwards

Always respond with valid JSON only, no markdown formatting."""),
        ("human", """Context from our database:
{retrieved_docs}

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
   
3. LEARNING ROADMAP (6 courses over 6 months):
   - Order from FOUNDATION → INTERMEDIATE → ADVANCED
   - Month 1-2: Foundational skills (basics, prerequisites)
   - Month 3-4: Intermediate skills (tools, frameworks)
   - Month 5-6: Advanced/Specialized skills
   - EXPLAIN WHY each course is recommended

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
        
        result = chain.invoke({
            "retrieved_docs": retrieved_docs,
            "skill_gaps": json.dumps(skill_gaps),
            "role": role,
            "market_skills": json.dumps(market_skills),
            "live_jobs_context": live_jobs_context,
            "resume_text": resume_text[:3000]  # Limit to avoid token limits
        })
        
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
        
        if not result.get("recommended_jobs") or len(result.get("recommended_jobs", [])) == 0:
            logger.warning("LLM returned empty jobs, adding fallback jobs")
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
    """Generate fallback NPTEL course recommendations based on skill gaps"""
    # Common NPTEL courses that cover many skills
    nptel_courses = [
        {
            "skill": "Python Programming",
            "course_title": "Programming, Data Structures and Algorithms Using Python",
            "course_url": "https://www.youtube.com/playlist?list=PLJ5C_6qdAvBHYz8B2jZ1Xz9b-lZqL8RYH",
            "thumbnail": "https://i.ytimg.com/vi/1FxCsoPRQVY/hqdefault.jpg",
            "description": "NPTEL course covering Python fundamentals, data structures, and algorithms",
        },
        {
            "skill": "Machine Learning",
            "course_title": "Machine Learning - NPTEL",
            "course_url": "https://www.youtube.com/playlist?list=PLJ5C_6qdAvBG2kj4D6X7KuQ-cZ6j9qSU3",
            "thumbnail": "https://i.ytimg.com/vi/YOUTUBE_ML/hqdefault.jpg",
            "description": "Comprehensive machine learning course from IIT",
        },
        {
            "skill": "Data Structures",
            "course_title": "Data Structures and Algorithms",
            "course_url": "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O",
            "thumbnail": "https://i.ytimg.com/vi/0IAPZzGSbME/hqdefault.jpg",
            "description": "Complete DSA course with practical implementations",
        },
        {
            "skill": "Cloud Computing",
            "course_title": "Cloud Computing - NPTEL",
            "course_url": "https://www.youtube.com/playlist?list=PLJ5C_6qdAvBHBPQo_-YCe8fYCfHzH7Wgz",
            "thumbnail": "https://i.ytimg.com/vi/cloud_thumb/hqdefault.jpg",
            "description": "Introduction to cloud computing concepts including AWS, Azure, and GCP",
        },
        {
            "skill": "DevOps",
            "course_title": "DevOps and Software Engineering",
            "course_url": "https://www.youtube.com/playlist?list=PLJ5C_6qdAvBHDevOps",
            "thumbnail": "https://i.ytimg.com/vi/devops_thumb/hqdefault.jpg",
            "description": "CI/CD pipelines, containerization, and deployment practices",
        },
        {
            "skill": "Software Testing",
            "course_title": "Software Testing - NPTEL",
            "course_url": "https://www.youtube.com/playlist?list=PLJ5C_6qdAvBHTesting",
            "thumbnail": "https://i.ytimg.com/vi/testing_thumb/hqdefault.jpg",
            "description": "Software testing methodologies and best practices",
        },
    ]
    
    roadmap = []
    month = 1
    
    # Try to match skill gaps with available courses
    for gap in skill_gaps[:6]:  # Max 6 months
        matched_course = None
        gap_lower = gap.lower()
        
        for course in nptel_courses:
            if course["skill"].lower() in gap_lower or gap_lower in course["skill"].lower():
                matched_course = course
                break
        
        if matched_course:
            roadmap.append({
                "month": month,
                "skill": gap,
                "course_title": matched_course["course_title"],
                "course_url": matched_course["course_url"],
                "thumbnail": matched_course["thumbnail"],
                "description": matched_course["description"],
                "status": "Recommended"
            })
        else:
            # Generic course for unmatched skills
            roadmap.append({
                "month": month,
                "skill": gap,
                "course_title": f"Learn {gap} - Online Course",
                "course_url": f"https://www.youtube.com/results?search_query=NPTEL+{gap.replace(' ', '+')}",
                "thumbnail": "https://i.ytimg.com/vi/default/hqdefault.jpg",
                "description": f"Search for NPTEL courses on {gap}",
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
