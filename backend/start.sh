#!/bin/bash
set -e

echo "=== System Information ==="
whoami
pwd
ls -la /usr/local/bin/ollama || echo "Ollama NOT found in /usr/local/bin"
echo "=========================="

# Start Ollama in the background with logging to stdout
echo "Starting Ollama service..."
ollama serve > /code/ollama.log 2>&1 &

# Wait for Ollama to start (max 60 seconds)
echo "Waiting for Ollama API to be ready on port 11434..."
MAX_RETRIES=60
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://127.0.0.1:11434/api/tags > /dev/null; then
        echo "Ollama API is UP and responding!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $((RETRY_COUNT % 10)) -eq 0 ]; then
        echo "Still waiting... ($RETRY_COUNT/$MAX_RETRIES)"
        tail -n 5 /code/ollama.log || true
    fi
    sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "ERROR: Ollama failed to start within 60 seconds."
    echo "=== Ollama Logs ==="
    cat /code/ollama.log
    echo "==================="
    # Continue anyway to see FastAPI errors, or could exit 1
fi

# Ensure model is available
echo "Checking for llama3.2 model..."
if ollama list | grep -q "llama3.2"; then
    echo "llama3.2 is already available."
else
    echo "Downloading llama3.2 (this may take a few minutes)..."
    ollama pull llama3.2
fi

echo "=== Ollama Status ==="
ollama list
echo "====================="

# Start the FastAPI application
echo "Starting FastAPI application with Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 7860
