#!/bin/bash

# Wardrobe AI Enhanced - Development Startup Script

echo "🚀 Starting Wardrobe AI Enhanced Development Environment"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some features may not work without Docker."
    fi

    print_status "Dependencies check completed ✅"
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."

    if [ ! -d "node_modules" ]; then
        npm install
        if [ $? -eq 0 ]; then
            print_status "Frontend dependencies installed ✅"
        else
            print_error "Failed to install frontend dependencies ❌"
            exit 1
        fi
    else
        print_status "Frontend dependencies already installed ✅"
    fi
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."

    cd backend
    if [ ! -d "node_modules" ]; then
        npm install
        if [ $? -eq 0 ]; then
            print_status "Backend dependencies installed ✅"
        else
            print_error "Failed to install backend dependencies ❌"
            exit 1
        fi
    else
        print_status "Backend dependencies already installed ✅"
    fi
    cd ..
}

# Setup environment files
setup_env_files() {
    print_status "Setting up environment files..."

    # Frontend env
    if [ ! -f ".env.local" ]; then
        cp .env.frontend.example .env.local
        print_status "Created .env.local from template"
    fi

    # Backend env
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_status "Created backend/.env from template"
    fi

    print_status "Environment files setup completed ✅"
}

# Generate Prisma client
setup_database() {
    print_status "Setting up database..."

    cd backend

    # Generate Prisma client
    npx prisma generate
    if [ $? -eq 0 ]; then
        print_status "Prisma client generated ✅"
    else
        print_error "Failed to generate Prisma client ❌"
    fi

    cd ..
}

# Start development servers
start_development() {
    print_status "Starting development servers..."

    # Start with Docker Compose if available
    if command -v docker-compose &> /dev/null; then
        print_status "Starting services with Docker Compose..."
        docker-compose -f docker-compose.dev.yml up -d postgres redis minio

        # Wait for services to be ready
        sleep 10

        print_status "Database and cache services started ✅"
    else
        print_warning "Docker Compose not available. Please start PostgreSQL and Redis manually."
    fi

    # Start backend and frontend concurrently
    print_status "Starting backend and frontend servers..."
    npm run start:full
}

# Main execution
main() {
    print_status "=== Wardrobe AI Enhanced Development Setup ==="

    check_dependencies
    install_frontend_deps
    install_backend_deps
    setup_env_files
    setup_database
    start_development

    print_status "🎉 Development environment is ready!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend API: http://localhost:3001"
    print_status "Database Admin: http://localhost:5432"
    print_status "Redis: http://localhost:6379"
    print_status "MinIO Storage: http://localhost:9001"
}

# Run main function
main
