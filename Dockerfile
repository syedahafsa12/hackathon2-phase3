# Dockerfile for Hugging Face Spaces (Backend)
# Uses Python 3.10
FROM python:3.10-slim

# Set working directory
WORKDIR /code

# Copy backend requirements first for caching
COPY backend/requirements.txt /code/requirements.txt

# Install dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the backend code contents (app/, requirements.txt) into /code
COPY backend /code

# Set PYTHONPATH to include the app
ENV PYTHONPATH=/code

# Expose port (HF Spaces defaults to 7860)
EXPOSE 7860

# Command to run the application using uvicorn
# We map internal port 8000 (from app) to 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
