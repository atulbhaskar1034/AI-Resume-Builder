"""
ResuMatch Backend - LangGraph Implementation
AI-powered resume analysis using LangGraph agents
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv
import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime
from pypdf import PdfReader
import io

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import RAG engine and workflow
from rag_engine import ingest_knowledge_base
from workflow import app as langgraph_app, run_analysis_streaming
import asyncio
import json as json_module


# Startup event handler
@asynccontextmanager
async def lifespan(app):
    """Startup and shutdown events"""
    # Startup: Ingest knowledge base
    logger.info("Starting ResuMatch with LangGraph backend...")
    logger.info("Ingesting knowledge base into vector DB...")
    try:
        ingest_knowledge_base()
        logger.info("Knowledge base ingestion complete!")
    except Exception as e:
        logger.error(f"Failed to ingest knowledge base: {e}")
    
    yield  # App runs here
    
    # Shutdown
    logger.info("Shutting down ResuMatch...")


# Initialize FastAPI app with lifespan
app = FastAPI(
    title="ResuMatch",
    description="AI-Powered Resume Analysis with LangGraph",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Create directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("results", exist_ok=True)


def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF file bytes"""
    try:
        pdf_reader = PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text.strip()
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise ValueError(f"Failed to extract text from PDF: {e}")


def extract_text_from_file(content: bytes, filename: str) -> str:
    """Extract text from uploaded file based on extension"""
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    
    if ext == 'pdf':
        return extract_text_from_pdf(content)
    elif ext == 'txt':
        return content.decode('utf-8', errors='ignore')
    elif ext in ['doc', 'docx']:
        # For now, try to decode as text
        # TODO: Add python-docx support
        return content.decode('utf-8', errors='ignore')
    else:
        # Try to decode as plain text
        return content.decode('utf-8', errors='ignore')


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "engine": "LangGraph",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(None)
):
    """
    Analyze resume using LangGraph workflow
    
    1. Extract text from uploaded PDF/DOCX/TXT
    2. Run LangGraph analysis pipeline
    3. Return structured analysis result
    """
    try:
        # Read resume file
        content = await resume.read()
        filename = resume.filename or "resume.pdf"
        
        logger.info(f"Received resume: {filename}")
        
        # Extract text from file
        pdf_text = extract_text_from_file(content, filename)
        
        if not pdf_text or len(pdf_text) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract sufficient text from the uploaded file"
            )
        
        logger.info(f"Extracted {len(pdf_text)} characters from resume")
        
        # Prepare initial state
        initial_state = {
            "resume_text": pdf_text,
            "role": "",
            "skill_gaps": [],
            "retrieved_docs": "",
            "final_result": {}
        }
        
        # If job description provided, add it to context
        if job_description:
            initial_state["resume_text"] = f"{pdf_text}\n\nTARGET JOB DESCRIPTION:\n{job_description}"
        
        # Invoke LangGraph workflow
        logger.info("Running LangGraph analysis...")
        result = langgraph_app.invoke(initial_state)
        
        # Extract final result
        final_result = result.get("final_result", {})
        
        # Get skill gaps from heatmap for fallback generation
        heatmap_data = final_result.get("heatmap", [])
        skill_gaps_for_fallback = [item["skill"] for item in heatmap_data if item.get("status") == "gap"]
        
        # Get role from LLM response first, then state, then infer from context
        role_detected = final_result.get("detected_role") or result.get("role") or "Professional"
        
        # Log the match score reasoning for transparency
        match_score_reasoning = final_result.get("match_score_reasoning", "")
        if match_score_reasoning:
            logger.info(f"Match score reasoning: {match_score_reasoning}")
        
        logger.info(f"Detected role: {role_detected}")
        
        # Generate roadmap - either from LLM result or fallback  
        from workflow import generate_fallback_roadmap, generate_fallback_jobs
        
        llm_roadmap = final_result.get("roadmap", [])
        llm_jobs = final_result.get("recommended_jobs", [])
        
        # Use LLM result if available, otherwise generate fallback
        if not llm_roadmap:
            logger.warning("LLM returned no roadmap, using fallback")
            llm_roadmap = generate_fallback_roadmap(skill_gaps_for_fallback if skill_gaps_for_fallback else ["Python", "Cloud Computing", "DevOps"])
        
        if not llm_jobs:
            logger.warning("LLM returned no jobs, using fallback")
            llm_jobs = generate_fallback_jobs(role_detected, skill_gaps_for_fallback)
        
        # Map fields to match frontend expectations
        response = {
            "status": "success",
            "role_detected": role_detected,
            "match_score": final_result.get("match_score", 50),
            "heatmap_data": heatmap_data,
            "roadmap": [],
            "matched_jobs": [],
            "detailed_analysis": {
                "overall_assessment": f"Role: {role_detected}. Match Score: {final_result.get('match_score', 50)}%",
                "strengths": [],
                "areas_for_improvement": result.get("skill_gaps", [])
            },
            "timestamp": datetime.now().isoformat()
        }
        
        # Populate roadmap from llm_roadmap (which is either LLM or fallback)
        for item in llm_roadmap:
            response["roadmap"].append({
                "month": item.get("month", 1),
                "skill": item.get("skill", ""),
                "course_title": item.get("course_title", ""),
                "course_url": item.get("course_url", ""),
                "thumbnail": item.get("thumbnail", "https://i.ytimg.com/vi/default/hqdefault.jpg"),
                "description": item.get("description", f"Learn {item.get('skill', 'this skill')}"),
                "status": item.get("status", "Recommended")
            })
        
        # Populate jobs from llm_jobs (which is either LLM or fallback)
        for job in llm_jobs:
            response["matched_jobs"].append({
                "id": job.get("id", str(hash(job.get("title", "")))),
                "position": job.get("title", job.get("position", "")),
                "company": job.get("company", ""),
                "location": job.get("location", "Remote"),
                "url": job.get("url", ""),
                "date": job.get("date", datetime.now().isoformat()),
                "match_score": job.get("match_score", 70)
            })
        
        logger.info(f"Analysis complete. Role: {response.get('role_detected')}")
        logger.info(f"Response roadmap count: {len(response.get('roadmap', []))}")
        logger.info(f"Response matched_jobs count: {len(response.get('matched_jobs', []))}")
        
        return JSONResponse(content=response)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "ResuMatch API",
        "version": "2.0.0",
        "engine": "LangGraph",
        "endpoints": ["/analyze", "/analyze-stream", "/health", "/docs"]
    }


@app.post("/analyze-stream")
async def analyze_resume_stream(
    resume: UploadFile = File(...),
    job_description: Optional[str] = Form(None)
):
    """
    Stream resume analysis using Server-Sent Events (SSE).
    Returns real-time updates as each LangGraph node executes.
    """
    try:
        # Read resume file
        content = await resume.read()
        filename = resume.filename or "resume.pdf"
        
        logger.info(f"SSE: Received resume for streaming analysis: {filename}")
        
        # Extract text from file
        pdf_text = extract_text_from_file(content, filename)
        
        if not pdf_text or len(pdf_text) < 50:
            raise HTTPException(
                status_code=400, 
                detail="Could not extract sufficient text from the uploaded file"
            )
        
        # If job description provided, add it to context
        if job_description:
            pdf_text = f"{pdf_text}\n\nTARGET JOB DESCRIPTION:\n{job_description}"
        
        # Return streaming response
        return StreamingResponse(
            run_analysis_streaming(pdf_text),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SSE Analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Chat Request Model
from pydantic import BaseModel
class ChatRequest(BaseModel):
    message: str
    session_id: str
    context: Optional[Dict[str, Any]] = None

@app.post("/chat/agent")
async def chat_agent(request: ChatRequest):
    """
    Chat with the AI Career Coach Agent.
    Streams the response token by token.
    """
    from chat_agent import agent_executor, get_system_message
    from langchain_core.messages import HumanMessage, SystemMessage

    async def generate():
        # Prepare input
        input_message = HumanMessage(content=request.message)
        
        # Config with session ID for memory
        config = {"configurable": {"thread_id": request.session_id}}
        
        # Prepare system message
        context = request.context if request.context else {}
        sys_msg_content = get_system_message({"context": context, "messages": []})
        
        # Prepare state update with system message prepended
        state_update = {
            "messages": [
                SystemMessage(content=sys_msg_content),
                input_message
            ]
        }
        if request.context:
            state_update["context"] = request.context

        # Stream the agent's response
        try:
            async for event in agent_executor.astream_events(
                state_update, 
                config=config,
                version="v1"
            ):
                kind = event["event"]
                
                # Stream LLM tokens
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        yield content
        except Exception as e:
            logger.error(f"Agent Error: {e}")
            yield f"Error: {str(e)}"

    return StreamingResponse(generate(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
