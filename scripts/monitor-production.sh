#!/bin/bash

# TechAnal Production Monitoring Script
# This script provides real-time monitoring and alerting for production environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="TechAnal"
ENVIRONMENT="production"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
MONITORING_INTERVAL=30  # seconds
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90

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

log_info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Check if services are running
check_services_status() {
    log "Checking services status..."
    
    services=("postgres" "server" "ui" "redis" "nginx" "monitoring" "logstash")
    
    for service in "${services[@]}"; do
        container_name="techanal-${service}-prod"
        if docker ps | grep -q $container_name; then
            status=$(docker inspect --format='{{.State.Status}}' $container_name 2>/dev/null)
            health=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null || echo "no-health-check")
            
            if [ "$status" = "running" ]; then
                if [ "$health" = "healthy" ] || [ "$health" = "no-health-check" ]; then
                    log_success "$service: $status ($health)"
                else
                    log_warning "$service: $status ($health)"
                fi
            else
                log_error "$service: $status"
            fi
        else
            log_error "$service: not running"
        fi
    done
}

# Check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # CPU usage
    cpu_usage=$(top -l 1 | grep "CPU usage" | awk '{print $3}' | sed 's/%//')
    if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        log_warning "CPU usage: ${cpu_usage}% (threshold: ${ALERT_THRESHOLD_CPU}%)"
    else
        log_success "CPU usage: ${cpu_usage}%"
    fi
    
    # Memory usage
    memory_info=$(vm_stat | grep "Pages free" | awk '{print $3}' | sed 's/\.//')
    total_memory=$(sysctl hw.memsize | awk '{print $2}')
    free_memory=$((memory_info * 4096))
    used_memory=$((total_memory - free_memory))
    memory_usage=$((used_memory * 100 / total_memory))
    
    if [ $memory_usage -gt $ALERT_THRESHOLD_MEMORY ]; then
        log_warning "Memory usage: ${memory_usage}% (threshold: ${ALERT_THRESHOLD_MEMORY}%)"
    else
        log_success "Memory usage: ${memory_usage}%"
    fi
    
    # Disk usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ $disk_usage -gt $ALERT_THRESHOLD_DISK ]; then
        log_warning "Disk usage: ${disk_usage}% (threshold: ${ALERT_THRESHOLD_DISK}%)"
    else
        log_success "Disk usage: ${disk_usage}%"
    fi
}

# Check Docker resources
check_docker_resources() {
    log "Checking Docker resources..."
    
    # Docker disk usage
    docker_disk=$(docker system df | grep "Total Space" | awk '{print $3}' | sed 's/GB//')
    if (( $(echo "$docker_disk > 10" | bc -l) )); then
        log_warning "Docker disk usage: ${docker_disk}GB (consider cleanup)"
    else
        log_success "Docker disk usage: ${docker_disk}GB"
    fi
    
    # Container resource usage
    log_info "Container resource usage:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Check application health
check_application_health() {
    log "Checking application health..."
    
    # Backend health
    if curl -f http://localhost:8787/api/v1/health &> /dev/null; then
        log_success "Backend API: healthy"
    else
        log_error "Backend API: unhealthy"
    fi
    
    # Frontend health
    if curl -f http://localhost/health &> /dev/null; then
        log_success "Frontend: healthy"
    else
        log_error "Frontend: unhealthy"
    fi
    
    # AI Engine test
    if curl -f http://localhost:8787/api/v1/ai-test &> /dev/null; then
        log_success "AI Engine: accessible"
    else
        log_error "AI Engine: not accessible"
    fi
}

# Check performance metrics
check_performance_metrics() {
    log "Checking performance metrics..."
    
    # AI Engine performance
    response_time=$(curl -s -w "%{time_total}" -o /dev/null http://localhost:8787/api/v1/ai-engine-performance 2>/dev/null || echo "0")
    if (( $(echo "$response_time > 2" | bc -l) )); then
        log_warning "AI Engine response time: ${response_time}s (slow)"
    else
        log_success "AI Engine response time: ${response_time}s"
    fi
    
    # Frontend performance
    frontend_time=$(curl -s -w "%{time_total}" -o /dev/null http://localhost/ 2>/dev/null || echo "0")
    if (( $(echo "$frontend_time > 1" | bc -l) )); then
        log_warning "Frontend response time: ${frontend_time}s (slow)"
    else
        log_success "Frontend response time: ${frontend_time}s"
    fi
    
    # Database performance
    if docker exec techanal-postgres-prod pg_isready -U techanal_user -d techanal_prod &> /dev/null; then
        log_success "Database: responsive"
    else
        log_error "Database: not responsive"
    fi
}

# Check logs for errors
check_logs() {
    log "Checking recent logs for errors..."
    
    # Check for error logs in the last hour
    error_count=$(docker-compose -f $DOCKER_COMPOSE_FILE logs --since=1h 2>&1 | grep -i "error\|exception\|fail" | wc -l)
    
    if [ $error_count -gt 0 ]; then
        log_warning "Found $error_count error/exception/fail entries in logs"
        log_info "Recent errors:"
        docker-compose -f $DOCKER_COMPOSE_FILE logs --since=1h 2>&1 | grep -i "error\|exception\|fail" | tail -5
    else
        log_success "No recent errors found in logs"
    fi
}

# Check monitoring stack
check_monitoring_stack() {
    log "Checking monitoring stack..."
    
    # Prometheus
    if curl -f http://localhost:9090/-/healthy &> /dev/null; then
        log_success "Prometheus: healthy"
    else
        log_warning "Prometheus: not accessible"
    fi
    
    # Logstash
    if docker exec techanal-logstash-prod curl -f http://localhost:9600 &> /dev/null 2>&1; then
        log_success "Logstash: healthy"
    else
        log_warning "Logstash: not accessible"
    fi
}

# Generate performance report
generate_performance_report() {
    log "Generating performance report..."
    
    report_file="production-monitoring-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "TechAnal Production Monitoring Report"
        echo "Generated: $(date)"
        echo "======================================"
        echo ""
        
        echo "Services Status:"
        echo "----------------"
        docker-compose -f $DOCKER_COMPOSE_FILE ps
        
        echo ""
        echo "System Resources:"
        echo "-----------------"
        echo "CPU: $(top -l 1 | grep 'CPU usage' | awk '{print $3}')"
        echo "Memory: $(vm_stat | grep 'Pages free' | awk '{print $3}' | sed 's/\.//') pages free"
        echo "Disk: $(df / | tail -1 | awk '{print $5}') used"
        
        echo ""
        echo "Performance Metrics:"
        echo "-------------------"
        echo "AI Engine Response: $(curl -s -w "%{time_total}" -o /dev/null http://localhost:8787/api/v1/ai-engine-performance 2>/dev/null || echo "N/A")s"
        echo "Frontend Response: $(curl -s -w "%{time_total}" -o /dev/null http://localhost/ 2>/dev/null || echo "N/A")s"
        
        echo ""
        echo "Recent Errors:"
        echo "--------------"
        docker-compose -f $DOCKER_COMPOSE_FILE logs --since=1h 2>&1 | grep -i "error\|exception\|fail" | tail -10
        
    } > "$report_file"
    
    log_success "Performance report generated: $report_file"
}

# Show monitoring menu
show_menu() {
    echo ""
    echo "🔍 TechAnal Production Monitoring"
    echo "=================================="
    echo "1. Check services status"
    echo "2. Check system resources"
    echo "3. Check Docker resources"
    echo "4. Check application health"
    echo "5. Check performance metrics"
    echo "6. Check logs for errors"
    echo "7. Check monitoring stack"
    echo "8. Generate performance report"
    echo "9. Run all checks"
    echo "0. Exit"
    echo ""
    read -p "Select an option: " choice
}

# Run all checks
run_all_checks() {
    log "Running comprehensive system check..."
    echo "===================================="
    
    check_services_status
    echo ""
    check_system_resources
    echo ""
    check_docker_resources
    echo ""
    check_application_health
    echo ""
    check_performance_metrics
    echo ""
    check_logs
    echo ""
    check_monitoring_stack
    echo ""
    
    log_success "Comprehensive check completed"
}

# Continuous monitoring mode
continuous_monitoring() {
    log "Starting continuous monitoring (press Ctrl+C to stop)..."
    echo "Monitoring interval: ${MONITORING_INTERVAL} seconds"
    echo ""
    
    while true; do
        clear
        log "🔄 Continuous Monitoring - $(date)"
        echo "====================================="
        echo ""
        
        check_services_status
        echo ""
        check_system_resources
        echo ""
        check_application_health
        echo ""
        check_performance_metrics
        echo ""
        
        echo ""
        log_info "Next update in ${MONITORING_INTERVAL} seconds... (Ctrl+C to stop)"
        sleep $MONITORING_INTERVAL
    done
}

# Main function
main() {
    log "🚀 Starting TechAnal Production Monitoring"
    
    # Check if production environment is running
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log_error "Production Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
    
    # Check if services are running
    if ! docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
        log_warning "Production services are not running. Start them first with:"
        log_info "  ./scripts/deploy-production.sh"
        echo ""
    fi
    
    # Show menu
    while true; do
        show_menu
        
        case $choice in
            1)
                check_services_status
                ;;
            2)
                check_system_resources
                ;;
            3)
                check_docker_resources
                ;;
            4)
                check_application_health
                ;;
            5)
                check_performance_metrics
                ;;
            6)
                check_logs
                ;;
            7)
                check_monitoring_stack
                ;;
            8)
                generate_performance_report
                ;;
            9)
                run_all_checks
                ;;
            0)
                log "Exiting monitoring..."
                exit 0
                ;;
            *)
                log_error "Invalid option. Please try again."
                ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
}

# Check if script is run with arguments
if [ $# -eq 0 ]; then
    main
else
    case $1 in
        "continuous"|"-c")
            continuous_monitoring
            ;;
        "status"|"-s")
            check_services_status
            ;;
        "health"|"-h")
            check_application_health
            ;;
        "performance"|"-p")
            check_performance_metrics
            ;;
        "report"|"-r")
            generate_performance_report
            ;;
        "all"|"-a")
            run_all_checks
            ;;
        *)
            echo "Usage: $0 [option]"
            echo "Options:"
            echo "  continuous, -c  Start continuous monitoring"
            echo "  status, -s      Check services status"
            echo "  health, -h      Check application health"
            echo "  performance, -p Check performance metrics"
            echo "  report, -r      Generate performance report"
            echo "  all, -a         Run all checks"
            echo "  (no args)       Interactive menu"
            exit 1
            ;;
    esac
fi
