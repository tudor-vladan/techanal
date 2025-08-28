#!/bin/bash

# TechAnal Production Backup and Recovery Script
# This script provides automated backup and recovery for production environment

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
BACKUP_DIR="./backups/production"
BACKUP_RETENTION_DAYS=30
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_NAME="techanal-prod-backup-${BACKUP_TIMESTAMP}"

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
    
    # Check if production environment is running
    if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
        log_error "Production Docker Compose file not found: $DOCKER_COMPOSE_FILE"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create backup directories
create_backup_directories() {
    log "Creating backup directories..."
    
    mkdir -p "$BACKUP_DIR"/{database,uploads,config,logs}
    mkdir -p "$BACKUP_DIR"/database/{postgres,redis}
    mkdir -p "$BACKUP_DIR"/uploads/{images,thumbnails,processed}
    mkdir -p "$BACKUP_DIR"/config/{docker,nginx,monitoring}
    mkdir -p "$BACKUP_DIR"/logs/{server,ui,nginx}
    
    log_success "Backup directories created"
}

# Backup database
backup_database() {
    log "Backing up PostgreSQL database..."
    
    # Create database backup
    docker exec techanal-postgres-prod pg_dump -U techanal_user -d techanal_prod --format=custom --verbose > "$BACKUP_DIR/database/postgres/techanal_prod_${BACKUP_TIMESTAMP}.dump"
    
    if [ $? -eq 0 ]; then
        log_success "PostgreSQL backup created: techanal_prod_${BACKUP_TIMESTAMP}.dump"
    else
        log_error "PostgreSQL backup failed"
        exit 1
    fi
    
    # Backup Redis data (if available)
    if docker exec techanal-redis-prod redis-cli ping &> /dev/null; then
        log "Backing up Redis data..."
        docker exec techanal-redis-prod redis-cli BGSAVE
        sleep 5
        docker cp techanal-redis-prod:/data/dump.rdb "$BACKUP_DIR/database/redis/redis_dump_${BACKUP_TIMESTAMP}.rdb"
        log_success "Redis backup created: redis_dump_${BACKUP_TIMESTAMP}.rdb"
    else
        log_warning "Redis not accessible, skipping Redis backup"
    fi
}

# Backup uploads and data
backup_uploads() {
    log "Backing up uploads and data..."
    
    # Backup uploads directory
    if [ -d "data/uploads/prod" ]; then
        tar -czf "$BACKUP_DIR/uploads/images/uploads_${BACKUP_TIMESTAMP}.tar.gz" -C data/uploads/prod .
        log_success "Uploads backup created: uploads_${BACKUP_TIMESTAMP}.tar.gz"
    else
        log_warning "Uploads directory not found, skipping"
    fi
    
    # Backup thumbnails
    if [ -d "data/thumbnails/prod" ]; then
        tar -czf "$BACKUP_DIR/uploads/thumbnails/thumbnails_${BACKUP_TIMESTAMP}.tar.gz" -C data/thumbnails/prod .
        log_success "Thumbnails backup created: thumbnails_${BACKUP_TIMESTAMP}.tar.gz"
    else
        log_warning "Thumbnails directory not found, skipping"
    fi
    
    # Backup processed files
    if [ -d "data/processed/prod" ]; then
        tar -czf "$BACKUP_DIR/uploads/processed/processed_${BACKUP_TIMESTAMP}.tar.gz" -C data/processed/prod .
        log_success "Processed files backup created: processed_${BACKUP_TIMESTAMP}.tar.gz"
    else
        log_warning "Processed files directory not found, skipping"
    fi
}

# Backup configuration files
backup_config() {
    log "Backing up configuration files..."
    
    # Backup Docker Compose files
    cp "$DOCKER_COMPOSE_FILE" "$BACKUP_DIR/config/docker/"
    cp docker-compose.yml "$BACKUP_DIR/config/docker/" 2>/dev/null || log_warning "Development docker-compose.yml not found"
    
    # Backup Nginx configuration
    if [ -f "ui/nginx.prod.conf" ]; then
        cp ui/nginx.prod.conf "$BACKUP_DIR/config/nginx/"
    fi
    
    # Backup monitoring configuration
    if [ -d "monitoring" ]; then
        cp -r monitoring/* "$BACKUP_DIR/config/monitoring/"
    fi
    
    # Backup environment files
    if [ -f ".env.production" ]; then
        cp .env.production "$BACKUP_DIR/config/docker/"
    fi
    
    # Backup scripts
    if [ -d "scripts" ]; then
        cp -r scripts "$BACKUP_DIR/config/"
    fi
    
    log_success "Configuration backup completed"
}

# Backup logs
backup_logs() {
    log "Backing up application logs..."
    
    # Backup server logs
    if [ -d "data/logs/server/prod" ]; then
        tar -czf "$BACKUP_DIR/logs/server/server_logs_${BACKUP_TIMESTAMP}.tar.gz" -C data/logs/server/prod .
        log_success "Server logs backup created: server_logs_${BACKUP_TIMESTAMP}.tar.gz"
    fi
    
    # Backup UI logs
    if [ -d "data/logs/ui/prod" ]; then
        tar -czf "$BACKUP_DIR/logs/ui/ui_logs_${BACKUP_TIMESTAMP}.tar.gz" -C data/logs/ui/prod .
        log_success "UI logs backup created: ui_logs_${BACKUP_TIMESTAMP}.tar.gz"
    fi
    
    # Backup Nginx logs
    if [ -d "data/logs/nginx/prod" ]; then
        tar -czf "$BACKUP_DIR/logs/nginx/nginx_logs_${BACKUP_TIMESTAMP}.tar.gz" -C data/logs/nginx/prod .
        log_success "Nginx logs backup created: nginx_logs_${BACKUP_TIMESTAMP}.tar.gz"
    fi
}

# Create backup manifest
create_backup_manifest() {
    log "Creating backup manifest..."
    
    manifest_file="$BACKUP_DIR/backup_manifest_${BACKUP_TIMESTAMP}.json"
    
    cat > "$manifest_file" << EOF
{
  "backup_info": {
    "project": "$PROJECT_NAME",
    "environment": "$ENVIRONMENT",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "backup_name": "$BACKUP_NAME",
    "version": "1.0"
  },
  "backup_contents": {
    "database": {
      "postgres": "$(ls -1 "$BACKUP_DIR/database/postgres/" | wc -l) files",
      "redis": "$(ls -1 "$BACKUP_DIR/database/redis/" | wc -l) files"
    },
    "uploads": {
      "images": "$(ls -1 "$BACKUP_DIR/uploads/images/" | wc -l) files",
      "thumbnails": "$(ls -1 "$BACKUP_DIR/uploads/thumbnails/" | wc -l) files",
      "processed": "$(ls -1 "$BACKUP_DIR/uploads/processed/" | wc -l) files"
    },
    "config": {
      "docker": "$(ls -1 "$BACKUP_DIR/config/docker/" | wc -l) files",
      "nginx": "$(ls -1 "$BACKUP_DIR/config/nginx/" | wc -l) files",
      "monitoring": "$(ls -1 "$BACKUP_DIR/config/monitoring/" | wc -l) files"
    },
    "logs": {
      "server": "$(ls -1 "$BACKUP_DIR/logs/server/" | wc -l) files",
      "ui": "$(ls -1 "$BACKUP_DIR/logs/ui/" | wc -l) files",
      "nginx": "$(ls -1 "$BACKUP_DIR/logs/nginx/" | wc -l) files"
    }
  },
  "system_info": {
    "docker_version": "$(docker --version)",
    "docker_compose_version": "$(docker-compose --version)",
    "disk_usage": "$(df -h . | tail -1 | awk '{print $5}')",
    "backup_size": "$(du -sh "$BACKUP_DIR" | awk '{print $1}')"
  }
}
EOF
    
    log_success "Backup manifest created: backup_manifest_${BACKUP_TIMESTAMP}.json"
}

# Compress backup
compress_backup() {
    log "Compressing backup..."
    
    cd "$BACKUP_DIR"
    tar -czf "../${BACKUP_NAME}.tar.gz" .
    cd - > /dev/null
    
    # Calculate backup size
    backup_size=$(du -sh "$BACKUP_DIR/../${BACKUP_NAME}.tar.gz" | awk '{print $1}')
    log_success "Backup compressed: ${BACKUP_NAME}.tar.gz (${backup_size})"
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Remove backups older than retention period
    find "$BACKUP_DIR/.." -name "techanal-prod-backup-*.tar.gz" -mtime +$BACKUP_RETENTION_DAYS -delete
    
    # Count remaining backups
    remaining_backups=$(find "$BACKUP_DIR/.." -name "techanal-prod-backup-*.tar.gz" | wc -l)
    log_success "Old backups cleaned up. Remaining backups: $remaining_backups"
}

# List available backups
list_backups() {
    log "Available backups:"
    echo "=================="
    
    if [ -d "$BACKUP_DIR/.." ]; then
        backups=$(find "$BACKUP_DIR/.." -name "techanal-prod-backup-*.tar.gz" | sort -r)
        
        if [ -n "$backups" ]; then
            for backup in $backups; do
                backup_name=$(basename "$backup")
                backup_size=$(du -sh "$backup" | awk '{print $1}')
                backup_date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$backup")
                echo "📦 $backup_name ($backup_size) - $backup_date"
            done
        else
            log_warning "No backups found"
        fi
    else
        log_warning "Backup directory not found"
    fi
}

# Restore backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        log_error "Backup file not specified"
        echo "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    log "Restoring backup: $backup_file"
    log_warning "This will overwrite current data. Are you sure? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log "Starting backup restoration..."
        
        # Stop services
        log "Stopping production services..."
        docker-compose -f $DOCKER_COMPOSE_FILE down
        
        # Extract backup
        log "Extracting backup..."
        temp_restore_dir="./temp_restore_${BACKUP_TIMESTAMP}"
        mkdir -p "$temp_restore_dir"
        tar -xzf "$backup_file" -C "$temp_restore_dir"
        
        # Restore database
        log "Restoring database..."
        if [ -f "$temp_restore_dir/database/postgres/"*.dump ]; then
            dump_file=$(ls "$temp_restore_dir/database/postgres/"*.dump | head -1)
            docker exec -i techanal-postgres-prod pg_restore -U techanal_user -d techanal_prod --clean --if-exists < "$dump_file"
            log_success "Database restored"
        fi
        
        # Restore uploads
        log "Restoring uploads..."
        if [ -f "$temp_restore_dir/uploads/images/"*.tar.gz ]; then
            tar -xzf "$temp_restore_dir/uploads/images/"*.tar.gz -C data/uploads/prod/
            log_success "Uploads restored"
        fi
        
        # Restore configuration
        log "Restoring configuration..."
        if [ -d "$temp_restore_dir/config" ]; then
            cp -r "$temp_restore_dir/config/"* ./
            log_success "Configuration restored"
        fi
        
        # Cleanup
        rm -rf "$temp_restore_dir"
        
        # Start services
        log "Starting services..."
        docker-compose -f $DOCKER_COMPOSE_FILE up -d
        
        log_success "Backup restoration completed"
    else
        log "Backup restoration cancelled"
    fi
}

# Show backup menu
show_menu() {
    echo ""
    echo "💾 TechAnal Production Backup & Recovery"
    echo "========================================="
    echo "1. Create full backup"
    echo "2. List available backups"
    echo "3. Restore from backup"
    echo "4. Cleanup old backups"
    echo "5. Check backup status"
    echo "0. Exit"
    echo ""
    read -p "Select an option: " choice
}

# Check backup status
check_backup_status() {
    log "Checking backup status..."
    
    # Check backup directory
    if [ -d "$BACKUP_DIR" ]; then
        log_success "Backup directory exists: $BACKUP_DIR"
        
        # Count backups
        backup_count=$(find "$BACKUP_DIR/.." -name "techanal-prod-backup-*.tar.gz" | wc -l)
        log_info "Total backups: $backup_count"
        
        # Check latest backup
        latest_backup=$(find "$BACKUP_DIR/.." -name "techanal-prod-backup-*.tar.gz" | sort -r | head -1)
        if [ -n "$latest_backup" ]; then
            latest_date=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$latest_backup")
            log_info "Latest backup: $latest_date"
        fi
        
        # Check disk space
        backup_dir_size=$(du -sh "$BACKUP_DIR" | awk '{print $1}')
        log_info "Backup directory size: $backup_dir_size"
    else
        log_warning "Backup directory not found: $BACKUP_DIR"
    fi
}

# Create full backup
create_full_backup() {
    log "🚀 Starting full production backup..."
    echo "====================================="
    
    check_prerequisites
    create_backup_directories
    backup_database
    backup_uploads
    backup_config
    backup_logs
    create_backup_manifest
    compress_backup
    cleanup_old_backups
    
    echo ""
    log_success "🎉 Full production backup completed successfully!"
    log "Backup location: $BACKUP_DIR/../${BACKUP_NAME}.tar.gz"
}

# Main function
main() {
    log "🚀 Starting TechAnal Production Backup & Recovery"
    
    # Check if production environment is running
    if ! docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
        log_warning "Production services are not running. Some backup operations may fail."
        log_info "Start services with: ./scripts/deploy-production.sh"
        echo ""
    fi
    
    # Show menu
    while true; do
        show_menu
        
        case $choice in
            1)
                create_full_backup
                ;;
            2)
                list_backups
                ;;
            3)
                echo ""
                read -p "Enter backup file path: " backup_file
                restore_backup "$backup_file"
                ;;
            4)
                cleanup_old_backups
                ;;
            5)
                check_backup_status
                ;;
            0)
                log "Exiting backup & recovery..."
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
        "backup"|"-b")
            create_full_backup
            ;;
        "list"|"-l")
            list_backups
            ;;
        "restore"|"-r")
            restore_backup "$2"
            ;;
        "cleanup"|"-c")
            cleanup_old_backups
            ;;
        "status"|"-s")
            check_backup_status
            ;;
        *)
            echo "Usage: $0 [option]"
            echo "Options:"
            echo "  backup, -b        Create full backup"
            echo "  list, -l          List available backups"
            echo "  restore, -r <file> Restore from backup"
            echo "  cleanup, -c       Cleanup old backups"
            echo "  status, -s        Check backup status"
            echo "  (no args)         Interactive menu"
            exit 1
            ;;
    esac
fi
