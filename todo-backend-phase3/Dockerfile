# Use Python 3.11
FROM python:3.11-slim

# Set working directory
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Set up user immediately
RUN useradd -m -u 1000 user
ENV HOME=/home/user
RUN chown -R user:user /code

# Copy requirements first
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files (including start.sh)
COPY . .
RUN chmod +x start.sh && chown user:user start.sh

# Pre-pull the model during build to save time at startup
# This runs ollama serve in the background, waits, pulls, and then the step completes
RUN su user -c "ollama serve & sleep 10 && ollama pull llama3.2"

# Switch to user
USER user

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0

# Expose port
EXPOSE 7860

# Command to run the application using the startup script
CMD ["./start.sh"]
