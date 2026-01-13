#!/bin/bash
set -e

# Export model directory so Ollama knows where to look for baked models
export OLLAMA_MODELS=/code/ollama_models
export OLLAMA_HOST=127.0.0.1:11434

echo "=== System Information ==="
whoami
pwd
ls -la /usr/local/bin/ollama || echo "Ollama NOT found in /usr/local/bin"
ls -la $OLLAMA_MODELS || echo "Model dir NOT found"
echo "=========================="

# Start Ollama in the background
echo "Starting Ollama service..."
ollama serve > /tmp/ollama.log 2>&1 &

# Wait for Ollama to start
echo "Waiting for Ollama API to be ready on 127.0.0.1:11434..."
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://127.0.0.1:11434/api/tags > /dev/null; then
        echo "Ollama API is UP!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT+1))
    sleep 1
done

# Ensure model is verified
echo "Verifying llama3.2 model..."
ollama list

# Start the FastAPI application
echo "Starting FastAPI app..."
exec uvicorn app.main:app --host 0.0.0.0 --port 7860
