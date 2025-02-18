# Use a slim Python base image for consistency
FROM python:3.12-slim-bookworm AS base

# ---- Builder Stage ----
FROM base AS builder

# Install build dependencies # needed for py-tlsh library
RUN apt-get update && apt-get install -y \
    build-essential \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy the uv binary from the official uv image (pin to a version if desired)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Configure uv to compile bytecode and copy files (improves startup time)
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Set working directory for the build
WORKDIR /app

# Copy dependency files first – this layer will be cached until these files change
# Ensure the correct path for pyproject.toml and uv.lock
COPY ../pyproject.toml ../uv.lock /app/

# Install project dependencies (without installing the project itself)
# Using a cache mount to speed up subsequent builds
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-install-project

# Now copy the full application source
COPY . /app

# Install the project (this syncs the application code into the virtual environment)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

# ---- Final Stage ----
FROM base

# Copy the built application (including the virtual environment) from the builder stage
COPY --from=builder /app /app

# Ensure the virtual environment's binaries are on the PATH
ENV PATH="/app/.venv/bin:$PATH"

# Expose the port your backend listens on (adjust if needed)
EXPOSE 8000

# Start the backend service.
# CMD ["uv", "run", "app"]
CMD ["uv", "run", "flask_testing.py"]
# CMD ["uv", "run", "test_pubsub.py"]
