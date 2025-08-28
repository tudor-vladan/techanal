# 🐳 Docker Guide pentru TechAnal

Acest ghid explică cum să folosești Docker pentru a rula aplicația TechAnal în development și producție.

## 📋 Cerințe

- Docker Desktop instalat și pornit
- Docker Compose (inclus cu Docker Desktop)
- Git (pentru a clona repository-ul)

## 🚀 Quick Start

### **Development Mode**
```bash
# Pornește aplicația completă
make dev

# Sau folosind scriptul direct
./scripts/docker-start.sh
```

### **Production Mode**
```bash
# Pornește în producție
make prod

# Sau folosind scriptul direct
./scripts/docker-prod.sh
```

## 🔧 Comenzi Utile

### **Development**
```bash
make dev              # Pornește în development
make dev-build        # Construiește și pornește
make stop             # Oprește toate containerele
make logs             # Afișează log-urile
make status           # Statusul serviciilor
make restart          # Restart development
```

### **Production**
```bash
make prod             # Pornește în producție
make prod-build       # Construiește și pornește în producție
make logs-prod        # Log-uri din producție
make restart-prod     # Restart producție
```

### **Management**
```bash
make clean            # Cleanup normal
make clean-all        # Cleanup complet
make help             # Ajutor
```

## 🌐 Porturi și Servicii

### **Development Ports**
- **Frontend (UI)**: http://localhost:5501
- **Backend (API)**: http://localhost:5500
- **Database**: localhost:5502
- **Firebase Auth**: http://localhost:5503 (UI: http://localhost:5504)

### **Production Ports**
- **Frontend (UI)**: http://localhost (port 80)
- **Backend (API)**: http://localhost:8787 (sau mapat de reverse proxy)
- **Database**: localhost:5432

### **Servicii Docker**
- **PostgreSQL**: Baza de date principală
- **Server**: Backend Hono API
- **UI**: Frontend React + Vite
- **Firebase**: Emulator pentru autentificare (development)

Autentificare:
- Development: `Authorization: Bearer <email>`
- Production: token Firebase JWT

## 📦 Uploads & API Config

### Uploads Volume
- Development compose already mounts `./uploads:/app/uploads` for the server.
- Ensure the host `uploads/` directory exists to persist files.

### Serving Uploaded Images
- Backend serves images at `GET /api/v1/uploads/:filename`.
- UI normalizes DB `imageUrl` beginning with `/uploads/...` to absolute using `VITE_API_URL`.

### Environment Variables
- UI: set `VITE_API_URL` (e.g., `http://localhost:5500` in dev). UI accepts legacy `VITE_API_BASE_URL` as fallback.
- Server: `UPLOAD_DIR=uploads` (default), `DATABASE_URL` if using external DB.
- Production: configure Firebase (`FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`) and `CORS_ORIGIN`.
  - `CORS_ORIGIN`: recommended to your UI origin (e.g., `https://techanal.com`).
  - `MAX_FILE_SIZE`: upload size limit in bytes (default 10485760 = 10MB).
  - vezi și `env.example` pentru toate cheile relevante

### Quick Test
```bash
# Health
curl http://localhost:5500/api/v1/health
# Protected stats (dev token = email)
curl -H "Authorization: Bearer you@example.com" http://localhost:5500/api/v1/protected/ai-engine-stats
# Analyze sample
curl -X POST -H "Authorization: Bearer you@example.com" \
  -F "image=@test-image.png" -F "prompt=Analyze this chart" \
  http://localhost:5500/api/v1/protected/analyze-screenshot
```

## ⚙️ Configurare

### **1. Variabile de Mediu**
```bash
# Copiază template-ul
cp env.example .env

# Editează .env cu valorile tale
nano .env
```

### **2. Configurare Firebase**
Pentru development, Firebase emulatorul rulează automat.
Pentru producție, configurează credențialele Firebase în `.env`.

### **3. Configurare AI Provider**
În `.env`, setează:
- `AI_PROVIDER`: openai, anthropic, sau mock
- `AI_API_KEY`: cheia ta API
- `AI_MODEL`: modelul AI preferat

## 🏗️ Structura Docker

### **Development (`docker-compose.yml`)**
- Hot-reload pentru development
- Volume mounts pentru cod sursă
- Firebase emulator
- Porturi separate pentru fiecare serviciu

### **Production (`docker-compose.prod.yml`)**
- Build-uri optimizate
- Nginx pentru frontend
- Restart policies
- Porturi standard (80, 3000, 5432)

### **Dockerfile-uri**
- `Dockerfile.dev`: Pentru development cu hot-reload
- `Dockerfile.prod`: Pentru producție optimizată

## 📊 Monitorizare

### **Status Servicii**
```bash
make status
```

System Monitor în UI:
- Pagină: `/system-monitor`
- Interoghează rutele: `/api/system/processes`, `/resources`, `/logs`, `/metrics` (auth necesar)

API-uri detaliate: vezi `docs/API_REFERENCE.md`.

### **Log-uri în Timp Real**
```bash
# Development
make logs

# Production
make logs-prod
```

### **Log-uri Specifice**
```bash
# UI logs
docker-compose logs -f ui

# Server logs
docker-compose logs -f server

# Database logs
docker-compose logs -f postgres
```

## 🧹 Cleanup

### **Cleanup Normal**
```bash
make clean
```
- Oprește containerele
- Șterge containerele oprite
- Șterge imagini nefolosite
- Șterge volumele nefolosite

### **Cleanup Complet**
```bash
make clean-all
```
- Cleanup normal +
- Șterge toate imaginile
- Șterge toate volumele
- Cleanup complet sistem

## 🚨 Troubleshooting

### **Docker nu rulează**
```bash
# Verifică Docker Desktop
docker info

# Verifică configurația
./scripts/docker-check.sh
```

### **Porturi ocupate**
```bash
# Verifică ce folosește porturile
lsof -i :5500
lsof -i :5501
lsof -i :5502

# Oprește serviciile
make stop
```

### **Probleme cu build-ul**
```bash
# Cleanup complet
make clean-all

# Rebuild
make dev-build
```

### **Probleme cu baza de date**
```bash
# Verifică statusul
docker-compose ps postgres

# Verifică log-urile
docker-compose logs postgres

# Restart serviciul
docker-compose restart postgres
```

## 🔒 Securitate

### **Development**
- Firebase emulator local
- Baza de date locală
- Porturi separate pentru fiecare serviciu

### **Production**
- Credențiale reale Firebase
- Baza de date securizată
- Headers de securitate în Nginx
- Restart policies

## 📚 Resurse Adiționale

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)

## 🤝 Suport

Dacă întâmpini probleme:
1. Verifică configurația cu `./scripts/docker-check.sh`
2. Citește log-urile cu `make logs`
3. Verifică statusul cu `make status`
4. Cleanup și rebuild cu `make clean-all && make dev-build`
