# Use a slim Python base image for consistency
FROM python:3.12-slim-bookworm AS base

# ---- Builder Stage ----
FROM base AS builder

# Install build dependencies # needed for py-tlsh library
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy the uv binary from the official uv image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Configure uv to compile bytecode and copy files (improves startup time)
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install project dependencies (without installing the project itself)
# Using a cache mount to speed up subsequent builds
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

# Copy the full application source
COPY . .

# Install the project
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

# ---- Final Stage ----
FROM base

# Copy uv from builder stage
COPY --from=builder /usr/local/bin/uv /usr/local/bin/uv

# Copy the built application
COPY --from=builder /app /app

# Set working directory
WORKDIR /app

# Ensure the virtual environment's binaries are on the PATH
ENV PATH="/app/.venv/bin:$PATH"

# Expose the port
EXPOSE 8000

# Start the backend service using python directly instead of uv
CMD ["python", "flask_testing.py"]
