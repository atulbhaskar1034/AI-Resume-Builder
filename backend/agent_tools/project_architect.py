
from langchain_core.tools import Tool
from langchain_openai import ChatOpenAI
import os
import json

# Initialize LLM
llm = ChatOpenAI(
    model="google/gemini-2.0-flash-001",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7
)

def generate_project_idea(query_str: str) -> str:
    """
    Generates a coding project idea combining a skill gap with a user interest.
    Input format: "skill: <skill>, interest: <interest>"
    """
    
    # Parse input (basic string splitting as Tool input is usually a string)
    try:
        parts = query_str.split("interest:")
        skill = parts[0].replace("skill:", "").strip()
        interest = parts[1].strip() if len(parts) > 1 else "general coding"
    except:
        skill = query_str
        interest = "general coding"

    prompt = f"""
    Generate a coding project idea that helps a developer learn '{skill}' 
    while building something related to '{interest}'.
    
    Return ONLY a valid JSON object with this structure:
    {{
      "title": "Project Title",
      "difficulty": "Beginner/Intermediate/Advanced",
      "description": "Short description of the project",
      "tech_stack": ["List", "of", "technologies"],
      "steps": ["Step 1", "Step 2", "Step 3", "Step 4"]
    }}
    """
    
    response = llm.invoke(prompt)
    content = response.content
    
    # Try to extract JSON if wrapped in markdown code blocks
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()
        
    return content

# Create Tool
project_architect_tool = Tool(
    name="generate_project_idea",
    description="Generates a coding project idea combining a skill. Input should be 'skill: <skill>, interest: <interest>'",
    func=generate_project_idea
)
