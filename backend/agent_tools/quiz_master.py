
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
