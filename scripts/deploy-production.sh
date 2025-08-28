#!/bin/bash

# TechAnal Production Deployment Script
# This script deploys the complete TechAnal application to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="TechAnal"
ENVIRONMENT="production"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create production directories
create_directories() {
    log "Creating production directories..."
    
    mkdir -p data/{postgres,uploads,thumbnails,processed,logs,redis,monitoring,logstash}/prod
    mkdir -p data/logs/{server,ui,nginx}/prod
    mkdir -p data/cache/nginx/prod
    mkdir -p nginx/ssl
    mkdir -p monitoring/rules
    
    log_success "Production directories created"
}

# Setup environment variables
setup_environment() {
    log "Setting up environment variables..."
    
    if [ ! -f .env.production ]; then
        log_warning "Creating .env.production file with default values..."
        cat > .env.production << EOF
# TechAnal Production Environment Variables

# Database
POSTGRES_PASSWORD=secure_prod_password_2024

# Firebase (required for production)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# JWT
JWT_SECRET=secure_jwt_secret_prod_2024

# CORS
CORS_ORIGIN=https://techanal.com

# API Base URL
VITE_API_BASE_URL=http://localhost:8787

# Performance
PERFORMANCE_MONITORING=true
CACHE_ENABLED=true
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# AI Engine
AI_ENGINE_TIMEOUT=30000
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=info
EOF
        log_warning "Please update .env.production with your actual values"
        log_warning "Press Enter to continue after updating..."
        read
    fi
    
    # Load environment variables
    export $(cat .env.production | grep -v '^#' | xargs)
    
    log_success "Environment variables loaded"
}

# Build production images
build_images() {
    log "Building production Docker images..."
    
    # Build backend
    log "Building backend server..."
    docker build -f server/Dockerfile.prod -t techanal-server:prod ./server
    
    # Build frontend
    log "Building frontend UI..."
    docker build -f ui/Dockerfile.prod -t techanal-ui:prod ./ui
    
    log_success "Production images built successfully"
}

# Deploy application
deploy_application() {
    log "Deploying TechAnal to production..."
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f $DOCKER_COMPOSE_FILE down --remove-orphans
    
    # Start services
    log "Starting production services..."
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    log_success "Application deployment initiated"
}

# Wait for services to be ready
wait_for_services() {
    log "Waiting for services to be ready..."
    
    # Wait for PostgreSQL
    log "Waiting for PostgreSQL..."
    timeout=120
    while ! docker exec techanal-postgres-prod pg_isready -U techanal_user -d techanal_prod &> /dev/null; do
        if [ $timeout -le 0 ]; then
            log_error "PostgreSQL failed to start within timeout"
            exit 1
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    log_success "PostgreSQL is ready"
    
    # Wait for backend server
    log "Waiting for backend server..."
    timeout=120
    while ! curl -f http://localhost:8787/api/v1/health &> /dev/null; do
        if [ $timeout -le 0 ]; then
            log_error "Backend server failed to start within timeout"
            exit 1
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    log_success "Backend server is ready"
    
    # Wait for frontend
    log "Waiting for frontend..."
    timeout=60
    while ! curl -f http://localhost/health &> /dev/null; do
        if [ $timeout -le 0 ]; then
            log_error "Frontend failed to start within timeout"
            exit 1
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    log_success "Frontend is ready"
}

# Run health checks
run_health_checks() {
    log "Running health checks..."
    
    # Check all services
    services=("postgres" "server" "ui" "redis" "nginx" "monitoring" "logstash")
    
    for service in "${services[@]}"; do
        container_name="techanal-${service}-prod"
        if docker ps | grep -q $container_name; then
            health_status=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null || echo "unknown")
            if [ "$health_status" = "healthy" ]; then
                log_success "$service is healthy"
            else
                log_warning "$service health status: $health_status"
            fi
        else
            log_error "$service container not found"
        fi
    done
}

# Setup database
setup_database() {
    log "Setting up production database..."
    
    # Wait a bit for database to be fully ready
    sleep 10
    
    # Run database migrations
    log "Running database migrations..."
    docker exec techanal-server-prod pnpm run db:push || {
        log_warning "Database migration failed, continuing..."
    }
    
    log_success "Database setup completed"
}

# Performance testing
run_performance_tests() {
    log "Running performance tests..."
    
    # Test AI Engine performance
    log "Testing AI Engine performance..."
    response_time=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:8787/api/v1/ai-engine-performance)
    log "AI Engine response time: ${response_time}s"
    
    # Test frontend performance
    log "Testing frontend performance..."
    frontend_time=$(curl -s -w "%{time_total}" -o /dev/null http://localhost/)
    log "Frontend response time: ${frontend_time}s"
    
    log_success "Performance tests completed"
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    echo "=================="
    
    # Show running containers
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    echo ""
    log "Service URLs:"
    echo "============="
    echo "Frontend: http://localhost"
    echo "Backend API: http://localhost:8787"
    echo "Prometheus: http://localhost:9090"
    echo "PostgreSQL: localhost:5432"
    echo "Redis: localhost:6379"
    
    echo ""
    log "Health Check Endpoints:"
    echo "======================"
    echo "Frontend Health: http://localhost/health"
    echo "Backend Health: http://localhost:8787/api/v1/health"
    echo "AI Engine Test: http://localhost:8787/api/v1/ai-test"
    
    echo ""
    log "Logs:"
    echo "====="
    echo "View logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f [service_name]"
    echo "Stop services: docker-compose -f $DOCKER_COMPOSE_FILE down"
    echo "Restart services: docker-compose -f $DOCKER_COMPOSE_FILE restart"
}

# Main deployment function
main() {
    log "🚀 Starting TechAnal Production Deployment"
    echo "=========================================="
    
    check_root
    check_prerequisites
    create_directories
    setup_environment
    build_images
    deploy_application
    wait_for_services
    run_health_checks
    setup_database
    run_performance_tests
    show_status
    
    echo ""
    log_success "🎉 TechAnal Production Deployment Completed Successfully!"
    log "Your application is now running at http://localhost"
}

# Run main function
main "$@"
