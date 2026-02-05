
import os
from typing import List, Dict, Any
from typing_extensions import TypedDict

from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

# Import tools
from agent_tools.quiz_master import generate_quiz
from agent_tools.project_architect import generate_project_idea

# Define State
class ChatState(TypedDict):
    messages: List[BaseMessage]
    context: Dict[str, Any]

# Initialize LLM (Using Groq API - FREE tier)
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.7
)

# System Prompt - Enhanced to handle quiz and project requests
SYSTEM_PROMPT = """You are an elite AI Career Coach named "ResuMatch Coach". You help users improve their careers.

CONTEXT FROM USER'S RESUME ANALYSIS:
{context}

YOUR CAPABILITIES:
1. **Explain skill gaps** - Tell users what skills they're missing and why they matter
2. **Suggest courses** - Recommend searching on YouTube, Coursera, Udemy for specific topics
3. **Project ideas** - Generate project ideas to build portfolio (use [PROJECT:topic] format)
4. **Mock interviews/Quizzes** - Generate quiz questions (use [QUIZ:topic] format)
5. **Career advice** - General career guidance based on their resume analysis

SPECIAL COMMANDS - When user asks for quiz or project, include these exact tags:
- For quizzes: Include [QUIZ:topic_name] in your response where topic_name is the skill to quiz on
- For projects: Include [PROJECT:skill_name] in your response where skill_name is the skill to practice

Example: "I'll create a Python quiz for you! [QUIZ:Python]"

RULES:
- Be proactive and encouraging
- Keep answers concise but helpful
- Use Markdown formatting for readability
- Reference the user's specific skill gaps and target role from context
- If user asks for a quiz or project, always include the appropriate tag
"""

def get_system_message(context: Dict[str, Any]) -> str:
    """Format the system prompt with user context."""
    context_str = ""
    if context:
        role = context.get('role', 'Not specified')
        skill_gaps = context.get('skill_gaps', [])
        match_score = context.get('match_score', 'N/A')
        
        context_str = f"""
- Target Role: {role}
- Skill Gaps: {', '.join(skill_gaps) if skill_gaps else 'None identified'}
- Match Score: {match_score}%
"""
    else:
        context_str = "No resume analysis available yet. Provide general career advice."
    
    return SYSTEM_PROMPT.format(context=context_str)


def process_special_commands(response_text: str) -> str:
    """Process [QUIZ:topic] and [PROJECT:topic] commands in the response."""
    import re
    
    # Process quiz commands
    quiz_matches = re.findall(r'\[QUIZ:([^\]]+)\]', response_text)
    for topic in quiz_matches:
        try:
            quiz_json = generate_quiz(topic.strip())
            formatted_quiz = f"\n\n**📝 Quiz: {topic.strip()}**\n```json\n{quiz_json}\n```"
            response_text = response_text.replace(f"[QUIZ:{topic}]", formatted_quiz)
        except Exception as e:
            response_text = response_text.replace(f"[QUIZ:{topic}]", f"\n\n*Quiz generation failed: {str(e)}*")
    
    # Process project commands
    project_matches = re.findall(r'\[PROJECT:([^\]]+)\]', response_text)
    for skill in project_matches:
        try:
            project_json = generate_project_idea(f"skill: {skill.strip()}")
            formatted_project = f"\n\n**🚀 Project Idea: {skill.strip()}**\n```json\n{project_json}\n```"
            response_text = response_text.replace(f"[PROJECT:{skill}]", formatted_project)
        except Exception as e:
            response_text = response_text.replace(f"[PROJECT:{skill}]", f"\n\n*Project generation failed: {str(e)}*")
    
    return response_text


def chat_node(state: ChatState) -> ChatState:
    """Process chat messages and generate response."""
    messages = state.get("messages", [])
    context = state.get("context", {})
    
    # Prepend system message
    system_msg = SystemMessage(content=get_system_message(context))
    full_messages = [system_msg] + messages
    
    # Get LLM response
    response = llm.invoke(full_messages)
    
    # Process special commands in the response
    processed_content = process_special_commands(response.content)
    processed_response = AIMessage(content=processed_content)
    
    # Return updated state with new message
    return {
        "messages": messages + [processed_response],
        "context": context
    }


# Build the graph
def build_chat_graph():
    """Build and return the chat agent graph."""
    graph = StateGraph(ChatState)
    
    # Add nodes
    graph.add_node("chat", chat_node)
    
    # Add edges
    graph.add_edge(START, "chat")
    graph.add_edge("chat", END)
    
    # Compile with memory
    memory = MemorySaver()
    return graph.compile(checkpointer=memory)


# Create the agent executor
agent_executor = build_chat_graph()


if __name__ == "__main__":
    import uuid
    
    # Test the agent
    session_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": session_id}}
    
    # Prepare context
    context = {
        "role": "Software Engineer",
        "skill_gaps": ["Python", "Data Structures", "System Design"],
        "match_score": 65
    }
    
    inputs = {
        "messages": [HumanMessage(content="Give me a quiz on Python")],
        "context": context
    }
    
    print("Running Chat Agent Test...")
    try:
        result = agent_executor.invoke(inputs, config=config)
        print("\nResponse:")
        print(result["messages"][-1].content)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
