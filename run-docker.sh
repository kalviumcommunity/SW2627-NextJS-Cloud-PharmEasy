#!/bin/bash

# Exit on error
set -e

echo "=== PharmEasy Auto-Refill Docker Orchestration Tool ==="

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo "Error: docker is not installed. Please install Docker first." >&2
  exit 1
fi

# Check if Docker Compose is installed
if ! [ -x "$(command -v docker-compose)" ] && ! docker compose version &> /dev/null; then
  echo "Error: docker-compose is not installed." >&2
  exit 1
fi

# Define command-to-compose mapping
COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
  COMPOSE_CMD="docker-compose"
fi

# Show menu/help
show_help() {
  echo "Usage: ./run-docker.sh [command]"
  echo ""
  echo "Commands:"
  echo "  up         Start database and Next.js app in the background"
  echo "  down       Stop containers and keep database data"
  echo "  clean      Stop containers and delete database data (volumes)"
  echo "  build      Build or rebuild the services"
  echo "  logs       View output logs from containers"
  echo "  status     Check container statuses"
  echo "  help       Show this help message"
}

case "$1" in
  up)
    echo "Starting services in background..."
    $COMPOSE_CMD up -d
    echo "Services started successfully!"
    echo "NextJS App is running at http://localhost:3000"
    ;;
  down)
    echo "Stopping services..."
    $COMPOSE_CMD down
    echo "Services stopped successfully."
    ;;
  clean)
    echo "WARNING: This will delete all persistent data in PostgreSQL."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Cleaning up containers and volumes..."
      $COMPOSE_CMD down -v
      echo "Cleaned up successfully."
    else
      echo "Operation cancelled."
    fi
    ;;
  build)
    echo "Building services..."
    $COMPOSE_CMD build
    echo "Build completed."
    ;;
  logs)
    echo "Showing logs (press Ctrl+C to exit)..."
    $COMPOSE_CMD logs -f
    ;;
  status)
    $COMPOSE_CMD ps
    ;;
  *)
    show_help
    ;;
esac
