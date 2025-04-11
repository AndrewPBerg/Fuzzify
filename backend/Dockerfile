# Use a slim Python base image
FROM python:3.12-slim-bookworm AS base

# Install build dependencies needed for py-tlsh library and mysqlclient
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    pkg-config \
    default-libmysqlclient-dev \
    python3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome and ChromeDriver

RUN if [ "$(uname -m)" = "x86_64" ]; then \
        apt-get update && apt-get install -y wget unzip && \
        wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
        apt install -y ./google-chrome-stable_current_amd64.deb && \
        rm google-chrome-stable_current_amd64.deb && \
        apt-get clean; \
    else \
        echo "Skipping Chrome installation: not an amd64 system"; \
    fi

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
