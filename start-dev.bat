@echo off
REM Wardrobe AI Enhanced - Development Startup Script for Windows

echo 🚀 Starting Wardrobe AI Enhanced Development Environment

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm and try again.
    pause
    exit /b 1
)

echo [INFO] Dependencies check completed ✅

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies ❌
        pause
        exit /b 1
    )
    echo [INFO] Frontend dependencies installed ✅
) else (
    echo [INFO] Frontend dependencies already installed ✅
)

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
cd backend
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies ❌
        pause
        exit /b 1
    )
    echo [INFO] Backend dependencies installed ✅
) else (
    echo [INFO] Backend dependencies already installed ✅
)
cd ..

REM Setup environment files
echo [INFO] Setting up environment files...
if not exist ".env.local" (
    copy ".env.frontend.example" ".env.local"
    echo [INFO] Created .env.local from template
)

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo [INFO] Created backend\.env from template
)

echo [INFO] Environment files setup completed ✅

REM Generate Prisma client
echo [INFO] Setting up database...
cd backend
call npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Failed to generate Prisma client ❌
    pause
    exit /b 1
)
echo [INFO] Prisma client generated ✅
cd ..

REM Start development servers
echo [INFO] Starting development servers...

REM Check if Docker is available
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Starting services with Docker Compose...
    docker-compose -f docker-compose.dev.yml up -d postgres redis minio
    timeout /t 10 /nobreak >nul
    echo [INFO] Database and cache services started ✅
) else (
    echo [WARNING] Docker not available. Please start PostgreSQL and Redis manually.
)

echo [INFO] Starting backend and frontend servers...
call npm run start:full

echo 🎉 Development environment is ready!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3001
echo Database Admin: http://localhost:5432
echo Redis: http://localhost:6379
echo MinIO Storage: http://localhost:9001

pause
