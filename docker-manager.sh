#!/bin/bash

# Docker Manager Script for TechAnal
# Usage: ./docker-manager.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop first."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed or not in PATH."
        exit 1
    fi
}

# Function to start development environment
start_dev() {
    print_status "Starting development environment..."
    check_docker
    check_docker_compose
    
    # Create necessary directories if they don't exist
    mkdir -p data/postgres data/firebase-emulator uploads processed thumbnails
    
    # Start services
    docker-compose up -d
    
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  - Frontend: http://localhost:5501"
    echo "  - Backend API: http://localhost:5500"
    echo "  - PostgreSQL: localhost:5502"
    echo "  - Firebase Auth: localhost:5503"
    echo "  - Firebase UI: http://localhost:5504"
}

# Function to stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    docker-compose down
    print_success "Development environment stopped!"
}

# Function to start production environment
start_prod() {
    print_status "Starting production environment..."
    check_docker
    check_docker_compose
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        print_warning "No .env file found. Creating example .env file..."
        cat > .env << EOF
# Production Environment Variables
POSTGRES_PASSWORD=your_secure_password_here
FIREBASE_PROJECT_ID=your_firebase_project_id
AI_PROVIDER=mock
AI_API_KEY=your_ai_api_key_here
AI_MODEL=gpt-4-vision-preview
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
EOF
        print_warning "Please edit .env file with your actual values before starting production."
        exit 1
    fi
    
    # Create necessary directories
    mkdir -p uploads processed thumbnails
    
    # Start production services
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "Production environment started!"
    print_status "Services available at:"
    echo "  - Frontend: http://localhost"
    echo "  - Backend API: http://localhost:3000"
    echo "  - PostgreSQL: localhost:5432"
}

# Function to stop production environment
stop_prod() {
    print_status "Stopping production environment..."
    docker-compose -f docker-compose.prod.yml down
    print_success "Production environment stopped!"
}

# Function to show logs
show_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for service: $service"
        docker-compose logs -f "$service"
    fi
}

# Function to rebuild and restart
rebuild() {
    print_status "Rebuilding and restarting services..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    print_success "Services rebuilt and restarted!"
}

# Function to clean up
cleanup() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker environment..."
        docker-compose down -v --rmi all
        docker system prune -f
        print_success "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Function to show status
status() {
    print_status "Docker environment status:"
    docker-compose ps
}

# Function to show help
show_help() {
    echo "Docker Manager Script for TechAnal"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start-dev     Start development environment"
    echo "  stop-dev      Stop development environment"
    echo "  start-prod    Start production environment"
    echo "  stop-prod     Stop production environment"
    echo "  logs [service] Show logs (all services or specific service)"
    echo "  rebuild       Rebuild and restart services"
    echo "  cleanup       Remove all containers, volumes, and images"
    echo "  status        Show status of services"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start-dev"
    echo "  $0 logs server"
    echo "  $0 rebuild"
}

# Main script logic
case "${1:-help}" in
    "start-dev")
        start_dev
        ;;
    "stop-dev")
        stop_dev
        ;;
    "start-prod")
        start_prod
        ;;
    "stop-prod")
        stop_prod
        ;;
    "logs")
        show_logs "$2"
        ;;
    "rebuild")
        rebuild
        ;;
    "cleanup")
        cleanup
        ;;
    "status")
        status
        ;;
    "help"|*)
        show_help
        ;;
esac
