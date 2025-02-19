Author: Andrew P. Berg
Created: 2/15/2025
Edited: 2/16/2025

# DNSTwist Testing Project

A full-stack application for DNS fuzzing and monitoring using DNSTwist, Flask, Next.js, and Docker.

## Prerequisites

- Docker and Docker Compose
- Python 3.11 or higher
- Node.js 18 or higher
- Poetry, uv, or venv for Python dependency management
- npm or yarn for Node.js dependency management

## Installation

### Clone the Repository

```bash
git clone <repository-url>
cd dnstwist-testing
```

### Backend Setup

1. Change to the backend directory:
```bash
cd backend
```

2. Install Python dependencies (choose one):
```bash
# Using uv
uv pip install -r requirements.txt

# Using Poetry
poetry install

# Using venv
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the values as needed

### Frontend Setup

1. Change to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## Running the Application

### Option 1: Running with Docker (Recommended)

1. Start all services:
```bash
docker compose up --build
```

The following services will be available:
- Frontend: http://localhost:10002
- Backend API: http://localhost:10001
- MySQL: localhost:5010
- PubSub Emulator: localhost:8085


### Docker Cleanup

Docker loves to eat up local storage, so please be careful when contributing.

Run the following commands to take back control of your cached builds, containers, images, and volumes:

```bash
# Remove all stopped containers
docker container prune -f

# Remove all unused images
docker image prune -a -f

# Remove all unused volumes
docker volume prune -f

docker compose down --rmi all --volumes --remove-orphans
docker builder prune -f --filter label=com.docker.compose.project=dnstwist-testing

# Remove the builder cache
docker builder prune -a
```



### Option 2: Running Locally

1. Start the backend server:
```bash
cd backend
python app.py
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm run dev
```

Access the application at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Development

### Backend Development

The backend uses:
- Flask for the API server
- SQLModel for database operations
- Google Cloud Pub/Sub for message queuing
- DNSTwist for DNS fuzzing

### Frontend Development

The frontend is built with:
- Next.js
- React
- TypeScript

## Testing

### Backend Tests [TODO]

```bash
cd backend
python -m pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## API Documentation

### Available Endpoints

- `GET /`: Health check endpoint
- `GET /db-test`: Test database connection
- `GET /test-pubsub`: Test Pub/Sub messaging

## Troubleshooting

### Common Issues

1. Database Connection Issues
   - Verify MySQL is running
   - Check .env configuration
   - Ensure proper network connectivity

2. Pub/Sub Emulator Issues
   - Verify emulator is running
   - Check environment variables
   - Ensure proper port configuration

## License

[TODO License Here]

## Contributors [TODO]



