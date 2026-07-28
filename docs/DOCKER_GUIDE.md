# Dockerization Guide

This guide details the Docker setup for the PharmEasy Auto-Refill application. The project is fully containerized, linking the Next.js app and the PostgreSQL database.

## Architecture

We use a two-service Docker Compose architecture:
1. **`db`**: A PostgreSQL 15 database instance using the official lightweight alpine image.
2. **`web`**: A Next.js multi-stage build containing:
   - Dependency caching
   - Prisma schema client generation for the container environment
   - Standard Next.js server production bundle
   - Runs as a secure non-root `nextjs` user

---

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

---

## Getting Started

You can use the helper scripts in the root directory to manage your environment.

### Using the Helper Scripts

On macOS / Linux / Git Bash / WSL:
```bash
chmod +x run-docker.sh

# Start the environment
./run-docker.sh up

# View active logs
./run-docker.sh logs

# Tear down the environment
./run-docker.sh down

# Delete database volumes (fresh start)
./run-docker.sh clean
```

On Windows (Command Prompt):
```cmd
# Start the environment
run-docker.bat up

# View active logs
run-docker.bat logs

# Tear down the environment
run-docker.bat down

# Delete database volumes (fresh start)
run-docker.bat clean
```

---

## Configuration

Environment variables are passed to Docker via the `environment` keys inside `docker-compose.yml`.

### Connecting locally
To run the database in docker but run the Next.js application locally (outside Docker), use the following configuration in your local `.env`:
```ini
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/pharmeasy?schema=public"
```

To run both inside Docker Compose, the database host name is defined as `db` (which is resolved automatically by Docker networking):
```ini
DATABASE_URL="postgresql://postgres:postgrespassword@db:5432/pharmeasy?schema=public"
```

---

## Troubleshooting

### Port Conflicts
If you already have a local PostgreSQL instance running on your host machine on port `5432`, stop it first:
- **Windows**: Stop the service in `services.msc` or run `net stop postgresql-x64-15`.
- **macOS**: Run `brew services stop postgresql`.

### Refreshing Schema
If the Prisma schema changes:
1. Run `./run-docker.sh build` to rebuild the Next.js image.
2. Run `./run-docker.sh up` to restart and auto-apply migrations with `npx prisma db push`.
