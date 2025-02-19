# Use a slim Python base image
FROM python:3.12-slim-bookworm AS base

# Install build dependencies needed for py-tlsh library
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies using pip with caching
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Copy the application code
COPY . .

# Removed EXPOSE 8000 as it's not necessary

# Start the backend service
CMD ["python", "flask_testing.py"]
