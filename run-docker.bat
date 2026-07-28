@echo off
SETLOCAL EnableDelayedExpansion

echo =======================================================
echo PharmEasy Auto-Refill Docker Orchestration Tool (Win)
echo =======================================================

:: Check for Docker
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Error: docker is not installed or not in PATH.
    goto :eof
)

:: Detect correct compose command
docker compose version >nul 2>nul
if %ERRORLEVEL% equ 0 (
    set COMPOSE_CMD=docker compose
) else (
    where docker-compose >nul 2>nul
    if !ERRORLEVEL! equ 0 (
        set COMPOSE_CMD=docker-compose
    ) else (
        echo Error: docker-compose is not installed or not in PATH.
        goto :eof
    )
)

if "%1"=="" goto :help
if "%1"=="up" goto :up
if "%1"=="down" goto :down
if "%1"=="clean" goto :clean
if "%1"=="build" goto :build
if "%1"=="logs" goto :logs
if "%1"=="status" goto :status
goto :help

:up
echo Starting services in background...
%COMPOSE_CMD% up -d
echo Services started successfully!
echo NextJS App is running at http://localhost:3000
goto :eof

:down
echo Stopping services...
%COMPOSE_CMD% down
echo Services stopped successfully.
goto :eof

:clean
echo WARNING: This will delete all persistent data in PostgreSQL.
set /p confirm="Are you sure? (y/N): "
if /I "%confirm%"=="y" (
    echo Cleaning up containers and volumes...
    %COMPOSE_CMD% down -v
    echo Cleaned up successfully.
) else (
    echo Operation cancelled.
)
goto :eof

:build
echo Building services...
%COMPOSE_CMD% build
echo Build completed.
goto :eof

:logs
echo Showing logs (press Ctrl+C to exit)...
%COMPOSE_CMD% logs -f
goto :eof

:status
%COMPOSE_CMD% ps
goto :eof

:help
echo Usage: run-docker.bat [command]
echo.
echo Commands:
echo   up         Start database and NextJS app in the background
echo   down       Stop containers and keep database data
echo   clean      Stop containers and delete database data (volumes)
echo   build      Build or rebuild the services
echo   logs       View output logs from containers
echo   status     Check container statuses
echo   help       Show this help message
goto :eof
