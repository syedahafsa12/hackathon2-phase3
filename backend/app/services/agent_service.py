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

SYSTEM_PROMPT = """You are a task management assistant. You MUST use the available tools to perform actions.

IMPORTANT: When the user asks you to do something, you MUST call the appropriate tool. Never just say you'll do it - actually do it by calling the tool!

Available tools:
- add_task(title, priority, category, due_date): Create a new task
- list_tasks(completed): Show all tasks (completed=true/false/None for all)
- complete_task(task_id, completed): Mark task as done (true) or undone (false)
- delete_task(task_id): Remove a task permanently
- update_task(task_id, title, description, priority, category, due_date): Modify task details

Examples:
User: "Add a task to buy groceries"
You: Call add_task(title="Buy groceries", priority="medium") then say "✓ Added task: Buy groceries"

User: "Show my tasks"
You: Call list_tasks() then list them with IDs and status

User: "Mark task 1 as complete"
You: Call complete_task(task_id=1, completed=true) then confirm

User: "Delete task 2"
You: Call delete_task(task_id=2) then confirm

ALWAYS call the tool first, then confirm what you did. Be brief (max 2 sentences)."""


# ============================================================================
# AGENT FACTORY
# ============================================================================

def _check_ollama_available() -> bool:
    """Check if Ollama is running and accessible."""
    try:
        response = httpx.get("http://localhost:11434/api/tags", timeout=2.0)
        return response.status_code == 200
    except:
        return False


def create_agent(session: Session, user: User) -> AgentExecutor:
    """
    Create a LangChain agent with LLM and MCP tools.

    Auto-detects environment:
    - Local development: Uses Ollama (llama3.2)
    - Production/Cloud: Uses Groq API (llama-3.3-70b-versatile)

    The agent is stateless - conversation history is managed externally
    and passed in with each request.

    Args:
        session: Database session for tool execution
        user: Current authenticated user

    Returns:
        AgentExecutor ready to process messages
    """

    # Check if Ollama is available (local development)
    use_ollama = _check_ollama_available()
    groq_api_key = os.getenv("GROQ_API_KEY", "")

    if use_ollama:
        # LOCAL: Use Ollama (llama3.2)
        print("🟢 Using Ollama (local)")
        llm = ChatOllama(
            model="llama3.2",
            temperature=0.3,
            base_url="http://localhost:11434",
            num_predict=200,
            top_k=10,
            top_p=0.9,
            repeat_penalty=1.1,
            num_ctx=2048,
        )
    elif groq_api_key:
        # PRODUCTION: Use Groq API (free, fast)
        print("🔵 Using Groq API (production)")
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",  # Fast and capable
            temperature=0.3,
            max_tokens=200,
            groq_api_key=groq_api_key,
        )
    else:
        raise ValueError(
            "No LLM available! Set GROQ_API_KEY environment variable for production. "
            "Get free API key at https://console.groq.com"
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
        verbose=True,  # Log tool calls for debugging
        handle_parsing_errors=True,
        max_iterations=5,  # Allow enough iterations for tool calling
        return_intermediate_steps=True,  # Return tool call details
        max_execution_time=15,  # 15 second timeout
        early_stopping_method="force",  # Stop immediately if max iterations reached
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
            response = "I've processed your request. The task should be complete. You can check your task list to verify."

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
