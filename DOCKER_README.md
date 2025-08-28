# Docker Setup for TechAnal

This document explains how to run TechAnal using Docker containers.

## 🐳 Prerequisites

- **Docker Desktop** installed and running
- **Docker Compose** available (usually comes with Docker Desktop)
- At least **4GB RAM** available for Docker

## 🚀 Quick Start

### 1. Start Development Environment

```bash
# Using the Docker manager script (recommended)
./docker-manager.sh start-dev

# Or manually with Docker Compose
docker-compose up -d
```

### 2. Access the Application

Once started, you can access:
- **Frontend**: http://localhost:5501
- **Backend API**: http://localhost:5500
- **PostgreSQL**: localhost:5502
- **Firebase Auth**: localhost:5503
- **Firebase UI**: http://localhost:5504

## 🛠️ Docker Manager Script

The `docker-manager.sh` script provides easy management of Docker services:

```bash
# Show all available commands
./docker-manager.sh help

# Start development environment
./docker-manager.sh start-dev

# Stop development environment
./docker-manager.sh stop-dev

# View logs
./docker-manager.sh logs
./docker-manager.sh logs server

# Rebuild services
./docker-manager.sh rebuild

# Check status
./docker-manager.sh status

# Clean up everything
./docker-manager.sh cleanup
```

## 🏗️ Development vs Production

### Development Environment (`docker-compose.yml`)

- **Hot reload** for both frontend and backend
- **Volume mounts** for live code changes
- **Firebase emulator** for local authentication
- **Embedded PostgreSQL** database
- **Mock AI service** for testing

### Production Environment (`docker-compose.prod.yml`)

- **Optimized builds** with multi-stage Dockerfiles
- **Nginx** for serving frontend
- **Production-ready** PostgreSQL
- **Environment variables** for configuration
- **Health checks** and restart policies

## 🔧 Configuration

### Environment Variables

For development, the Docker Compose file sets these defaults:
```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/postgres
FIREBASE_PROJECT_ID=demo-project
AI_PROVIDER=mock
AI_TIMEOUT=30000
AI_MAX_TOKENS=1000
```

For production, create a `.env` file:
```env
POSTGRES_PASSWORD=your_secure_password
FIREBASE_PROJECT_ID=your_project_id
AI_PROVIDER=openai
AI_API_KEY=your_api_key
VITE_FIREBASE_API_KEY=your_firebase_key
# ... other variables
```

### Port Configuration

The default ports are:
- **5500**: Backend API
- **5501**: Frontend
- **5502**: PostgreSQL
- **5503**: Firebase Auth
- **5504**: Firebase UI

## 📁 Project Structure

```
techAnal/
├── docker-compose.yml          # Development environment
├── docker-compose.prod.yml     # Production environment
├── docker-manager.sh           # Management script
├── .dockerignore               # Docker build exclusions
├── server/
│   ├── Dockerfile.dev          # Development server
│   └── Dockerfile.prod         # Production server
├── ui/
│   ├── Dockerfile.dev          # Development UI
│   ├── Dockerfile.prod         # Production UI
│   └── nginx.conf              # Nginx configuration
└── data/                       # Persistent data
    ├── postgres/               # Database files
    └── firebase-emulator/      # Auth emulator data
```

## 🔍 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using the ports
   lsof -i :5500-5504
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Permission issues**
   ```bash
   # Make sure the script is executable
   chmod +x docker-manager.sh
   ```

3. **Docker not running**
   ```bash
   # Start Docker Desktop first
   # Then run the script again
   ```

4. **Out of memory**
   ```bash
   # Increase Docker memory limit in Docker Desktop settings
   # Recommended: 4GB minimum
   ```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f ui
docker-compose logs -f postgres

# Using the manager script
./docker-manager.sh logs
./docker-manager.sh logs server
```

### Rebuilding Services

```bash
# Rebuild everything
./docker-manager.sh rebuild

# Or manually
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🧹 Cleanup

### Stop Services
```bash
# Development
./docker-manager.sh stop-dev

# Production
./docker-manager.sh stop-prod
```

### Remove Everything
```bash
# This removes all containers, volumes, and images
./docker-manager.sh cleanup

# Or manually
docker-compose down -v --rmi all
docker system prune -f
```

## 🔄 Updating

When you pull new code changes:

1. **Stop services**: `./docker-manager.sh stop-dev`
2. **Pull changes**: `git pull origin main`
3. **Rebuild**: `./docker-manager.sh rebuild`

## 📊 Monitoring

### Health Checks
- PostgreSQL has built-in health checks
- Services restart automatically on failure
- Use `./docker-manager.sh status` to check service health

### Resource Usage
```bash
# View resource usage
docker stats

# View disk usage
docker system df
```

## 🚀 Production Deployment

For production deployment:

1. **Set up environment variables** in `.env`
2. **Start production services**: `./docker-manager.sh start-prod`
3. **Configure reverse proxy** (nginx, traefik) if needed
4. **Set up monitoring** and logging
5. **Configure backups** for PostgreSQL data

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. View service logs: `./docker-manager.sh logs`
3. Check Docker status: `./docker-manager.sh status`
4. Create an issue in the repository with logs and error details
