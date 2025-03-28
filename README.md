Author: Andrew P. Berg
Created: 2/15/2025
Edited: 2/16/2025

# DNSTwist Testing Project

A full-stack application for DNS fuzzing and monitoring using DNSTwist, Flask, Next.js, and Docker.

## Prerequisites

- Docker and Docker Compose

## Installation

### Clone the Repository

```bash
git clone <repository-url>
cd dnstwist-testing
```

## Running the Application

Start all services with Docker Compose:

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

Run the following one-liner to take back control of your cached builds, containers, images, and volumes:

> be careful not to delete all of the docker images and containers on your system!

```bash
docker compose down --rmi all --volumes --remove-orphans
docker builder prune -f --filter label=com.docker.compose.project=dnstwist-testing
```

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

## API Documentation

### Available Endpoints

- `GET /`: Health check endpoint
- `GET /db-test`: Test database connection
- `GET /test-pubsub`: Test Pub/Sub messaging

## Troubleshooting

### Common Issues

1. Database Connection Issues
   - Verify MySQL container is running
   - Check Docker network connectivity

2. Pub/Sub Emulator Issues
   - Verify emulator container is running
   - Ensure proper port configuration

## License

[TODO License Here]

## Contributors [TODO]



