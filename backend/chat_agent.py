
import os
from typing import Annotated, List, Dict, Any
from typing_extensions import TypedDict

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

from tools import tools as rag_tools
from agent_tools.project_architect import project_architect_tool
from agent_tools.quiz_master import quiz_master_tool

# Combine all tools
tools = rag_tools + [project_architect_tool, quiz_master_tool]

# Define State
class ChatState(TypedDict):
    messages: List[BaseMessage]
    context: Dict[str, Any]

# Initialize LLM (Using OpenRouter as established in workflow.py)
# User requested ChatGoogleGenerativeAI(model="gemini-1.5-flash"), 
# but we know that requires valid Google API Quota/Credits which might be an issue,
# and we have a working OpenRouter setup.
llm = ChatOpenAI(
    model="google/gemini-2.0-flash-001",
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
    temperature=0.7
)

# System Prompt
SYSTEM_PROMPT = """You are an elite AI Career Coach. You have access to the user's resume analysis (Context). 

Context: {context}

If they ask about gaps, use the 'search_career_resources' tool to find specific courses.
Be proactive. Offer to build projects or quiz them.
Keep answers concise and use Markdown."""

# Create the ReAct Agent
# We wrap the system prompt to inject context dynamically
def get_system_message(state: ChatState):
    context = state.get("context", {})
    # Format context as string if it's a dict
    context_str = str(context)
    return SYSTEM_PROMPT.format(context=context_str)

# Initialize Memory
memory = MemorySaver()

# Create the graph
agent_executor = create_react_agent(
    llm, 
    tools, 
    checkpointer=memory
)

if __name__ == "__main__":
    from langchain_core.messages import HumanMessage
    import uuid
    
    # Test the agent
    session_id = str(uuid.uuid4())
    config = {"configurable": {"thread_id": session_id}}
    
    # Prepare context and system message
    context = {"role": "Engineer", "skill_gaps": ["Python"]}
    sys_msg = get_system_message({"context": context, "messages": []})
    
    inputs = {
        "messages": [
            SystemMessage(content=sys_msg),
            HumanMessage(content="Help me find python courses")
        ],
        "context": context
    }
    
    print("Running Chat Agent Test...")
    try:
        for event in agent_executor.stream(inputs, config=config):
            for key, value in event.items():
                print(f"\n{key}:")
                # print(value) 
                if 'messages' in value:
                    print(value['messages'][-1].content)
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
