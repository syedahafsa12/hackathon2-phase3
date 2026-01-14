# File: backend/app/services/agent_service.py
# Phase III: AI Chatbot - LangChain Agent with Ollama/Groq
# Spec: specs/001-competition-todo-app/phase3.md
# Implements stateless agent that uses MCP tools to manage tasks
# PRODUCTION: Uses Groq API as fallback when Ollama isn't available

from typing import List, Dict, Any
import os
from langchain_ollama import ChatOllama
from langchain_groq import ChatGroq
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from sqlmodel import Session
import httpx

from app.models.user import User
from app.mcp.langchain_tools import create_langchain_tools


# ============================================================================
# AGENT SYSTEM PROMPT
# ============================================================================

SYSTEM_PROMPT = """You are a helpful task management assistant. 

Available tools:
- add_task(title, priority, category, due_date): Create a new task
- list_tasks(completed): Show tasks
- complete_task(task_id, completed): Mark done/undone
- delete_task(task_id): Remove a task
- update_task(task_id, ...): Modify task details

CRITICAL:
1. If the user asks for a task action (add, list, delete, etc.), you MUST call the appropriate tool.
2. If the user is just saying hello, asking general questions, or small talk, just respond normally without calling any tools.
3. Be brief and professional (max 2 sentences)."""


# ============================================================================
# AGENT FACTORY
# ============================================================================

def _check_ollama_available() -> bool:
    """Check if Ollama is running and accessible (for local dev)."""
    try:
        # Use 127.0.0.1 for container stability
        response = httpx.get("http://127.0.0.1:11434/api/tags", timeout=1.0)
        return response.status_code == 200
    except:
        return False


def create_agent(session: Session, user: User) -> AgentExecutor:
    """
    Create a LangChain agent with LLM and MCP tools.

    Auto-detects environment:
    - Production/Cloud: Uses Groq API if GROQ_API_KEY set (HIGH PRIORITY)
    - Local development: Uses Ollama (llama3.2) if running
    """

    groq_api_key = os.getenv("GROQ_API_KEY", "").strip()
    
    # Priority 1: Groq API (Fast, reliable, best for production)
    if groq_api_key:
        print("🔵 Using Groq API (Production/High Performance)")
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=200,
            groq_api_key=groq_api_key,
        )
    # Priority 2: Ollama (Local development or fallback)
    elif _check_ollama_available():
        print("🟢 Using Ollama (Local/Fallback)")
        llm = ChatOllama(
            model="llama3.2",
            temperature=0.3,
            base_url="http://127.0.0.1:11434",
            num_predict=200,
            top_k=10,
            top_p=0.9,
            repeat_penalty=1.1,
            num_ctx=2048,
        )
    else:
        raise ValueError(
            "No LLM provider available! Please set GROQ_API_KEY in environment variables "
            "for production performance. (https://console.groq.com)"
        )

    # Create tools with bound session and user
    tools = create_langchain_tools(session, user)

    # Create prompt template with system message and chat history
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    # Create tool-calling agent
    agent = create_tool_calling_agent(
        llm=llm,
        tools=tools,
        prompt=prompt
    )

    # Create agent executor - OPTIMIZED
    agent_executor = AgentExecutor(
        agent=agent,
        tools=tools,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=5,
        return_intermediate_steps=True,
        max_execution_time=25,  # Increased for slow cold-starts
        early_stopping_method="force",
    )

    return agent_executor


# ============================================================================
# AGENT RUNNER
# ============================================================================

async def run_agent(
    agent_executor: AgentExecutor,
    user_message: str,
    chat_history: List[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Run the agent with a user message and optional chat history.

    This function converts the chat history from database format to
    LangChain message format, runs the agent, and extracts the response.

    Args:
        agent_executor: The agent to run
        user_message: The user's current message
        chat_history: Previous messages in [{"role": "...", "content": "..."}] format

    Returns:
        {
            "response": "AI response text",
            "tool_calls": [{"tool": "...", "args": {...}, "result": {...}}]
        }
    """

    # Convert chat history to LangChain format - OPTIMIZED
    lc_history = []
    if chat_history:
        # Use only last 4 messages (2 exchanges) for speed
        for msg in chat_history[-4:]:
            if msg["role"] == "user":
                lc_history.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                lc_history.append(AIMessage(content=msg["content"]))

    # Run agent
    try:
        result = await agent_executor.ainvoke({
            "input": user_message,
            "chat_history": lc_history
        })

        # Extract tool calls from intermediate steps
        tool_calls = []
        if "intermediate_steps" in result:
            for step in result["intermediate_steps"]:
                action, observation = step
                tool_calls.append({
                    "tool": action.tool,
                    "args": action.tool_input,
                    "result": observation
                })

        # Check if agent completed successfully
        response = result.get("output", "")

        # If output is empty or agent stopped early, provide helpful message
        if not response or "Agent stopped" in str(result):
            if not tool_calls:
                 response = "I'm sorry, I couldn't process that request properly. Could you please rephrase it?"
            else:
                 response = "I've processed your request. You can check your task list to verify the changes."

        return {
            "response": response,
            "tool_calls": tool_calls
        }

    except Exception as e:
        error_msg = str(e)

        # Provide more helpful error messages
        if "max iterations" in error_msg.lower():
            return {
                "response": "I'm working on it, but it's taking longer than expected. Your task may have been added. Please check your task list.",
                "tool_calls": [],
                "error": "max_iterations"
            }
        elif "timeout" in error_msg.lower():
            return {
                "response": "The request timed out. Please try a simpler command or check if the task was completed.",
                "tool_calls": [],
                "error": "timeout"
            }
        else:
            return {
                "response": f"I encountered an error: {error_msg}. Please try rephrasing your request.",
                "tool_calls": [],
                "error": error_msg
            }
