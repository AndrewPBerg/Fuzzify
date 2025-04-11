# Use a slim Python base image
FROM python:3.12-slim-bookworm AS base

RUN apt-get update && apt-get install -y \
build-essential \
g++ \
pkg-config \
default-libmysqlclient-dev \
python3-dev \
curl \
&& rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y snapd sudo

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies using pip with caching
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Copy the application code
COPY . .

# Explicitly expose port 8000
EXPOSE 8000

# Start the backend service
CMD ["python", "app.py"]
