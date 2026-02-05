
from langchain_core.tools import Tool
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv()

# Initialize LLM with Groq
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.7
)

def generate_quiz(topic: str) -> str:
    """
    Generates a 3-question multiple choice quiz for a given technical topic.
    """
    
    prompt = f"""
    Generate a 3-question multiple choice quiz to test proficiency in '{topic}'.
    
    Return ONLY a valid JSON object (List of dicts) with this structure:
    [
      {{
        "question": "The technical question?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": "The correct option text"
      }}
    ]
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
quiz_master_tool = Tool(
    name="generate_quiz",
    description="Generates a 3-question multiple choice quiz for a given topic/skill.",
    func=generate_quiz
)
