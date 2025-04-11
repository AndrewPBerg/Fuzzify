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
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Chrome based on architecture
ARG TARGETARCH
RUN if [ "$TARGETARCH" = "amd64" ]; then \
        apt-get update && apt-get install -y \
        libasound2 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libatspi2.0-0 \
        libc6 \
        libcairo2 \
        libcups2 \
        libcurl4 \
        libdbus-1-3 \
        libexpat1 \
        libgbm1 \
        libglib2.0-0 \
        libgtk-3-0 \
        libnspr4 \
        libnss3 \
        libpango-1.0-0 \
        libudev1 \
        libvulkan1 \
        libx11-6 \
        libxcb1 \
        libxcomposite1 \
        libxdamage1 \
        libxext6 \
        libxfixes3 \
        libxkbcommon0 \
        libxrandr2 \
        && wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
        && apt install -y ./google-chrome-stable_current_amd64.deb \
        && rm google-chrome-stable_current_amd64.deb \
        && apt-get clean; \
    else \
        echo "Chrome installation skipped for non-amd64 architecture"; \
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
