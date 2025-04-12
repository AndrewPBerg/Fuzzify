<p align="center">
  <img src="logo.svg" alt="Fuzzify Logo" width="300" style="display:inline-block;">

</p>

<p align="center" style="font-size: 1.25rem; margin-top: 0.5rem; color: white; font-weight: bold; background-color: rgba(0, 0, 0, 0.5); padding: 10px; border-radius: 5px;">
  Secure your domain and monitor domain impersonations
</p>

<p align="center" style="font-size: 1.25rem; margin-top: 0.5rem; color: white; font-weight: bold; background-color: rgba(0, 0, 0, 0.5); padding: 10px; border-radius: 5px;">
  Also see our <a href="https://youtu.be/T0IThoxi1rc">Fuzzify Demo Video</a>
</p>


<p align="center">
  <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License">
  <img src="https://img.shields.io/github/stars/AndrewPBerg/Fuzzify?style=social" alt="GitHub stars">
  <a href="https://fuzzify-jade.vercel.app"><img src="https://img.shields.io/badge/vercel-deployed-brightgreen?logo=vercel" alt="Vercel"></a>

</p>


## ⚠️ **Important Note for ARM Users** ⚠️

The dockerized version of this app uses Debian Linux. However, Google Chrome, which is required for the web scraping functionality that assesses website threats, does not have official releases for Debian on ARM architectures (including Apple M-series chips).
As a workaround, if you are on an ARM-based system, please follow these steps:


### Step 1: Create the Expected Docker Volume
```zsh
docker volume create mysql_data
```
### Step 2: Extract [mysql_data_backup.tar.gz](https://github.com/AndrewPBerg/Fuzzify/blob/master/mysql_data_backup.tar.gz) into local Docker Volumes

> Windows
```ps1
docker run --rm `
  -v mysql_data:/data `
  -v ${PWD}:/backup `
  alpine `
  sh -c "rm -rf /data/* && tar -xzf /backup/mysql_data_backup.tar.gz -C /data"
```

> MacOS/Linux
```zsh
docker run --rm \
  -v mysql_data:/data \
  -v "$(pwd)":/backup \
  alpine \
  sh -c "rm -rf /data/* && tar -xzf /backup/mysql_data_backup.tar.gz -C /data"
```

### Step 3: Build
```zsh
docker-compose up --build
```

> This will allow you to run the application with full functionality, with the exception of the live website threat assessment feature.

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

#### Frontend Technologies 
[![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)<br>
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org/)<br>
[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](https://reactjs.org/)<br>
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)<br>
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-%23FF4154.svg?logo=react-query&logoColor=white)](https://tanstack.com/query/)<br>
[![Radix UI](https://img.shields.io/badge/Radix%20UI-%23161618.svg?logo=radix-ui&logoColor=white)](https://www.radix-ui.com/)<br>

#### Backend Technologies 
[![Python](https://img.shields.io/badge/Python-%2314354C.svg?logo=python&logoColor=white)](https://www.python.org/)<br>
[![Flask](https://img.shields.io/badge/Flask-%23000.svg?logo=flask&logoColor=white)](https://flask.palletsprojects.com/)<br>
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-%23FCA121.svg?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)<br>
[![DNSTwist](https://img.shields.io/badge/DNSTwist-%23006CBC.svg?logo=dns&logoColor=white)](https://github.com/elceef/dnstwist)<br>
[![MySQL](https://img.shields.io/badge/MySQL-%2300f.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)<br>
[![Google Cloud Pub/Sub](https://img.shields.io/badge/Google%20Cloud%20Pub%2FSub-%234285F4.svg?logo=google-cloud&logoColor=white)](https://cloud.google.com/pubsub)<br>

#### Infrastructure & DevOps 
[![Docker](https://img.shields.io/badge/Docker-%230db7ed.svg?logo=docker&logoColor=white)](https://www.docker.com/)<br>

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

