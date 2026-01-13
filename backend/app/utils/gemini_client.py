# File: backend/app/utils/gemini_client.py
# Phase III: AI Chatbot - Google Gemini API Client Wrapper
# Spec: specs/001-competition-todo-app/spec.md § Phase III (AI Chatbot)

import google.generativeai as genai
from typing import List, Dict, Any, Optional
import os

from app.mcp.todo_tools import GEMINI_TOOLS


# ============================================================================
# GEMINI API CONFIGURATION
# ============================================================================

# Initialize Gemini API with user's API key
GEMINI_API_KEY = "AIzaSyAgB1vomtnwrwPgtWxmCSci_hwo9uqxr3k"
genai.configure(api_key=GEMINI_API_KEY)

# Model configuration
MODEL_NAME = "gemini-1.5-flash"  # Free tier, fast, function calling support

# System instructions for the AI assistant
SYSTEM_INSTRUCTION = """You are a helpful AI assistant integrated into a todo list application.

Your role:
- Help users manage their tasks through natural conversation
- Use the provided tools (add_task, list_tasks, complete_task, delete_task, update_task) to interact with their todo list
- Be conversational and friendly
- Confirm actions after completing them
- If users ask questions unrelated to tasks, answer politely but gently remind them this is a todo app

When users say things like:
- "Add buy groceries" → Use add_task tool
- "Show my tasks" → Use list_tasks tool
- "Mark task 3 as done" → Use complete_task tool
- "Delete task 5" → Use delete_task tool
- "Change task 2 to 'Call mom tonight'" → Use update_task tool

Always confirm what you did after using a tool.
Be concise but friendly."""


# ============================================================================
# GEMINI CLIENT
# ============================================================================

class GeminiClient:
    """
    Wrapper for Google Gemini API with function calling support.

    Stateless design: Each request is independent, conversation history
    passed as parameter.
    """

    def __init__(self):
        """Initialize Gemini model with tools and configuration"""
        self.model = genai.GenerativeModel(
            model_name=MODEL_NAME,
            tools=GEMINI_TOOLS,
            system_instruction=SYSTEM_INSTRUCTION
        )

    def chat(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Send a chat message to Gemini and get response.

        Args:
            message: User's message
            conversation_history: Previous messages in format:
                [
                    {"role": "user", "content": "..."},
                    {"role": "assistant", "content": "..."},
                    ...
                ]

        Returns:
            {
                "response": "AI's text response",
                "tool_calls": [  # If AI wants to call tools
                    {
                        "name": "add_task",
                        "args": {"title": "Buy groceries", "priority": "medium"}
                    }
                ],
                "finish_reason": "STOP" or "TOOL_CALL"
            }
        """
        try:
            # Build conversation history for Gemini
            history = []
            if conversation_history:
                for msg in conversation_history:
                    role = "user" if msg["role"] == "user" else "model"
                    history.append({
                        "role": role,
                        "parts": [msg["content"]]
                    })

            # Start chat session with history
            chat_session = self.model.start_chat(history=history)

            # Send message
            response = chat_session.send_message(message)

            # Extract response
            result = {
                "response": "",
                "tool_calls": [],
                "finish_reason": "STOP"
            }

            # Check if AI wants to call tools
            if response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    # Text response
                    if hasattr(part, 'text') and part.text:
                        result["response"] += part.text

                    # Function call (tool call)
                    if hasattr(part, 'function_call') and part.function_call:
                        tool_call = {
                            "name": part.function_call.name,
                            "args": dict(part.function_call.args)
                        }
                        result["tool_calls"].append(tool_call)
                        result["finish_reason"] = "TOOL_CALL"

            return result

        except Exception as e:
            return {
                "response": f"Error communicating with AI: {str(e)}",
                "tool_calls": [],
                "finish_reason": "ERROR"
            }

    def format_tool_result_for_ai(
        self,
        tool_name: str,
        tool_result: Dict[str, Any]
    ) -> str:
        """
        Format tool execution result into natural language for AI.

        This helps the AI understand what happened and formulate a good response.
        """
        if not tool_result.get("success"):
            return f"Error: {tool_result.get('error', 'Unknown error')}"

        # Format based on tool type
        if tool_name == "add_task":
            return f"Task created successfully: '{tool_result['title']}' (ID: {tool_result['task_id']}, Priority: {tool_result['priority']})"

        elif tool_name == "list_tasks":
            if tool_result["count"] == 0:
                return "No tasks found."

            tasks = tool_result["tasks"]
            task_lines = []
            for task in tasks[:10]:  # Limit to 10 tasks to avoid token limits
                status = "✓" if task["completed"] else "○"
                task_lines.append(
                    f"{status} Task {task['id']}: {task['title']} "
                    f"[{task['priority']}]"
                )

            result = f"Found {tool_result['count']} task(s):\n" + "\n".join(task_lines)
            if tool_result["count"] > 10:
                result += f"\n... and {tool_result['count'] - 10} more"
            return result

        elif tool_name == "complete_task":
            return f"Task marked as {'complete' if tool_result['completed'] else 'incomplete'}: '{tool_result['title']}'"

        elif tool_name == "delete_task":
            return tool_result["message"]

        elif tool_name == "update_task":
            return f"Task updated: '{tool_result['title']}'"

        else:
            return str(tool_result)


# ============================================================================
# SINGLETON INSTANCE
# ============================================================================

# Create a single instance to reuse across requests
gemini_client = GeminiClient()
