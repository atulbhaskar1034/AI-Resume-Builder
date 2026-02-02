"""
LangGraph Tools for ResuMatch
Defines tools for the AI agent to use
"""

from langchain_core.tools import Tool
from rag_engine import get_retriever


def search_career_resources(query: str) -> str:
    """
    Search for relevant NPTEL courses and Live Jobs matching specific skills.
    
    Args:
        query: The search query (skill or topic to search for)
    
    Returns:
        String containing relevant courses and jobs from the database
    """
    retriever = get_retriever()
    docs = retriever.invoke(query)
    
    if not docs:
        return "No relevant resources found."
    
    results = []
    for doc in docs:
        content = doc.page_content
        metadata = doc.metadata
        doc_type = metadata.get("type", "unknown")
        
        if doc_type == "course":
            course_info = f"""📚 [COURSE]
   Title: {metadata.get('title', 'Unknown Course')}
   URL: {metadata.get('url', '')}
   Thumbnail: {metadata.get('thumbnail', '')}
   Source: NPTEL (YouTube)"""
            results.append(course_info)
        elif doc_type == "job":
            job_info = f"""💼 [JOB]
   Title: {metadata.get('title', 'Unknown')}
   Company: {metadata.get('company', 'Unknown')}
   URL: {metadata.get('url', '')}
   Skills: {metadata.get('tags', '')}"""
            results.append(job_info)
        else:
            results.append(content)
    
    return "\n\n".join(results)


# Create the tool
career_resources_tool = Tool(
    name="search_career_resources",
    description="Search for relevant NPTEL courses and Live Jobs matching specific skills.",
    func=search_career_resources
)

# Export tools list
tools = [career_resources_tool]
