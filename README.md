
<p align="center">
  <img src="fuzzify_logo.png" alt="Fuzzify Logo" width="200">
</p>


<!-- add shield icos -->

![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)
![GitHub stars](https://img.shields.io/github/stars/AndrewPBerg/Fuzzify?style=social)
![GitHub forks](https://img.shields.io/github/forks/AndrewPBerg/Fuzzify?style=social)

# Fuzzify 🛡️

Full-stack application for DNS fuzzing and monitoring domain impersontations.

## Installation 🏗️


### Clone the Repository 🛠️


```bash
gh repo clone AndrewPBerg/Fuzzify
```

## Running the Application 🐳

Start all services with Docker Compose:

```bash
docker compose up --build
```

The following services will be available:
- Static Hero/Demo Site: http://localhost:10003 
- Frontend: http://localhost:10002
- Backend API: http://localhost:10001
- MySQL: localhost:5010
- PubSub Emulator: localhost:8085

### Docker Cleanup 🧹

Docker loves to eat up local storage, so please be careful when trying locally.

Run the following one-liner to take back control of your cached builds, containers, images, and volumes:

> be careful not to delete all of the docker images and containers on your system!

```bash
docker compose down --rmi all --volumes --remove-orphans
docker builder prune -f --filter label=com.docker.compose.project=fuzzify
```

### Tech Stack 🚀


[![Python](https://img.shields.io/badge/Python-%2314354C.svg?logo=python&logoColor=white)](https://www.python.org/)<br>
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)<br>
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org/)<br>
[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](https://reactjs.org/)<br>
[![Flask](https://img.shields.io/badge/Flask-%23000.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)<br>
[![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?logo=docker&logoColor=white)](https://www.docker.com/)<br>
[![Google Cloud Pub/Sub](https://img.shields.io/badge/Google%20Cloud%20Pub%2FSub-%234285F4.svg?logo=google-cloud&logoColor=white)](https://cloud.google.com/pubsub)<br>
[![MySQL](https://img.shields.io/badge/MySQL-%2300f.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)<br>
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)<br>
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-%23FCA121.svg?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)<br>
[![DNSTwist](https://img.shields.io/badge/DNSTwist-%23006CBC.svg?logo=dns&logoColor=white)](https://github.com/elceef/dnstwist)<br>
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-%23FF4154.svg?logo=react-query&logoColor=white)](https://tanstack.com/query/)<br>
[![Radix UI](https://img.shields.io/badge/Radix%20UI-%23161618.svg?logo=radix-ui&logoColor=white)](https://www.radix-ui.com/)<br>

<br>

## Troubleshooting 🔨

1. Database Connection Issues
   - Verify MySQL container is running
   - Check Docker network connectivity

2. Pub/Sub Emulator Issues
   - Verify emulator container is running
   - Ensure proper port configuration

## License ⚖️

This software is licensed under the Apache License, Version 2.0 (see [LICENSE.md](https://github.com/AndrewPBerg/Fuzzify/blob/master/LICENSE.md))

