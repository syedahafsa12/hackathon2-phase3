# Use Python 3.11
FROM python:3.11-slim

# Set working directory
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Configure Ollama environment for model baking
ENV OLLAMA_HOST=127.0.0.1:11434
ENV OLLAMA_MODELS=/code/ollama_models
RUN mkdir -p /code/ollama_models

# Pre-pull the model during build (Baking models into the image)
# We start the server in background, wait for it, pull, and then kill it.
RUN ollama serve & \
    sleep 5 && \
    ollama pull llama3.2 && \
    pkill ollama

# Set up user and permissions
RUN useradd -m -u 1000 user
RUN chown -R user:user /code

# Copy requirements first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .
RUN chmod +x start.sh && chown user:user start.sh

# Switch to user
USER user

# Set environment variables
ENV HOME=/home/user

# Expose port
EXPOSE 7860

# Command to run the application using the startup script
CMD ["./start.sh"]
