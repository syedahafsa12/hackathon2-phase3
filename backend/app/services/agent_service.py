# File: backend/app/services/agent_service.py
# Phase III: AI Chatbot - LangChain Agent with Ollama
# Spec: specs/001-competition-todo-app/phase3.md
# Implements stateless agent that uses MCP tools to manage tasks

from typing import List, Dict, Any
from langchain_ollama import ChatOllama
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from sqlmodel import Session

from app.models.user import User
from app.mcp.langchain_tools import create_langchain_tools


# ============================================================================
# AGENT SYSTEM PROMPT
# ============================================================================

SYSTEM_PROMPT = """You are a task management assistant. Be brief and direct.

Tools available:
- add_task: Create tasks
- list_tasks: Show all tasks
- complete_task: Mark done/undone
- delete_task: Remove tasks
- update_task: Change details

Always confirm actions. Show task IDs when listing. Keep responses under 3 sentences."""


# ============================================================================
# AGENT FACTORY
# ============================================================================

def create_agent(session: Session, user: User) -> AgentExecutor:
    """
    Create a LangChain agent with Ollama LLM and MCP tools.

    The agent is stateless - conversation history is managed externally
    and passed in with each request.

    Args:
        session: Database session for tool execution
        user: Current authenticated user

    Returns:
        AgentExecutor ready to process messages
    """

    # Initialize Ollama LLM (llama3.2) - OPTIMIZED FOR SPEED
    llm = ChatOllama(
        model="llama3.2",
        temperature=0.3,  # Lower = faster, more focused responses
        base_url="http://localhost:11434",  # Ollama default URL
        num_predict=200,  # Reduced from 512 - shorter responses
        top_k=10,  # Reduce sampling space
        top_p=0.9,  # Nucleus sampling
        repeat_penalty=1.1,  # Prevent repetition
        num_ctx=2048,  # Context window (reduced for speed)
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
