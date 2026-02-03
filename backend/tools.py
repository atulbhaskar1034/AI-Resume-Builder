"""
LangGraph Tools for ResuMatch
Defines tools for the AI agent to use

NOTE: Courses are now fetched from YouTube API dynamically in workflow.py
This module now focuses on job search from the RAG vector store.
"""

from langchain_core.tools import Tool
from fetch_market import fetch_jobs_by_role
import logging

logger = logging.getLogger(__name__)

def search_career_resources(query: str) -> str:
    """
    Search for relevant Live Jobs matching specific skills or roles using RemoteOK API.
    Courses are fetched from YouTube API separately.
    
    Args:
        query: The search query (skill or role to search for, e.g. "Python Developer")
    
    Returns:
        String containing relevant live jobs
    """
    logger.info(f"Tool searching for live jobs with query: {query}")
    
    # Fetch live jobs
    result = fetch_jobs_by_role(query, max_jobs=5)
    jobs = result.get('jobs', [])
    
    if not jobs:
        return f"No live jobs found for '{query}' at the moment."
    
    results = [f"Found {len(jobs)} live jobs for '{query}':"]
    
    for job in jobs:
        job_info = f"""💼 [JOB]
   Title: {job.get('title', 'Unknown')}
   Company: {job.get('company', 'Unknown')}
   URL: {job.get('url', '')}
   Location: {job.get('location', 'Remote')}
   Salary: {job.get('salary', 'Not specified')}
   Description: {job.get('description', '')[:200]}..."""
        results.append(job_info)
    
    return "\n\n".join(results)


# Create the tool
career_resources_tool = Tool(
    name="search_career_resources",
    description="Search for relevant Live Jobs matching specific skills or roles.",
    func=search_career_resources
)

# Export tools list
tools = [career_resources_tool]
