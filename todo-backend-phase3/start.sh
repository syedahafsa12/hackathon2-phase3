#!/bin/bash

# Start Ollama in the background
echo "Starting Ollama..."
ollama serve &

# Wait for Ollama to start (max 60 seconds)
echo "Waiting for Ollama to be ready..."
for i in {1..60}; do
    if curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "Ollama is ready!"
        break
    fi
    sleep 1
done

# Pull the model if it doesn't exist (failsafe, though we should pull in build)
# We use llama3.2 as specified in agent_service.py
echo "Ensuring model llama3.2 is available..."
ollama pull llama3.2

# Start the FastAPI application
echo "Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 7860
