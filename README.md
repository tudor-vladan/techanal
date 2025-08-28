# TechAnal - AI Trading Analysis Application

O aplicație locală de analiză AI pentru trading charts care folosește computer vision și natural language processing pentru a analiza screenshot-uri de chart-uri și a genera semnale de trading bazate pe prompt-uri personalizate ale utilizatorului.

## 🚀 Quick Start

```bash
# Clone repository
git clone <repository-url>
cd techAnal

# Install dependencies
pnpm install

# Setup environment
cp ui/src/lib/firebase-config.template.json ui/src/lib/firebase-config.json
# Edit firebase-config.json cu credențialele tale

# Start development environment
pnpm run dev
```

## 🐳 Docker Deployment

> 📖 **Ghid Complet Docker**: [docs/DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md)

### **Quick Start cu Docker**
```bash
# Pornește aplicația completă cu Docker
make dev

# Sau folosind scriptul direct
./scripts/docker-start.sh
```

### 🔎 Smoke Test (Docker)
```bash
# 1) UI
open http://localhost:5501

# 2) API Health
curl http://localhost:5500/api/v1/health

# 3) Protected AI Stats (dev token = email)
curl -H "Authorization: Bearer dev@example.com" http://localhost:5500/api/v1/protected/ai-engine-stats

# 4) Analyze (folosește un PNG existent)
curl -X POST -H "Authorization: Bearer dev@example.com" \
  -F "image=@./test-image.png" \
  -F "prompt=Analizeaza nivelurile cheie si recomandari." \
  http://localhost:5500/api/v1/protected/analyze-screenshot

# 5) History
curl -H "Authorization: Bearer dev@example.com" http://localhost:5500/api/v1/protected/analysis-history

# 6) Imagine încărcată
# Deschide în browser: http://localhost:5500/api/v1/uploads/<filename>
```

#### Teste suplimentare (Public)
```bash
# AI Engine – test rapid de performanță sintetica
curl http://localhost:5500/api/v1/ai-performance-test | jq .

# Chart analysis demo (mock)
curl http://localhost:5500/api/v1/chart-analysis-test | jq .

# Test integrare completă (db + ai + perf)
curl http://localhost:5500/api/v1/integration-test | jq .

# Benchmark end-to-end al motorului AI
curl http://localhost:5500/api/v1/ai-engine-performance | jq .
```

### **Comenzi Docker Utile**
```bash
# Development
make dev              # Pornește în development
make dev-build        # Construiește și pornește
make stop             # Oprește toate containerele
make logs             # Afișează log-urile
make status           # Statusul serviciilor

# Production
make prod             # Pornește în producție
make prod-build       # Construiește și pornește în producție
make clean            # Oprește și șterge tot

# Ajutor
make help             # Afișează toate comenzile
```

### **Porturi Docker**
- **Frontend (UI)**: http://localhost:5501
- **Backend (API)**: http://localhost:5500
- **Database**: localhost:5502
- **Firebase Auth**: http://localhost:5503 / UI: http://localhost:5504

### **Configurare Variabile de Mediu**
```bash
# Copiază template-ul
cp env.example .env

# Editează .env cu valorile tale
nano .env
```

Chei relevante:
```bash
# UI
VITE_API_URL=http://localhost:5500          # Recomandat pentru UI (în prod: https://domeniul-tau)

# Server
CORS_ORIGIN=http://localhost:5501            # În prod: https://domeniul-tau (evită '*')
MAX_FILE_SIZE=10485760                       # Limită upload (bytes) – implicit 10MB
```
Note:
- În development, rutele protejate acceptă `Authorization: Bearer <email>` (ex: `dev@example.com`).
- Serverul comprimă automat răspunsurile (gzip/br) și aplică CORS strict controlat de `CORS_ORIGIN`.

### **Servicii Docker**
- **PostgreSQL**: Baza de date principală
- **Server**: Backend Hono API
- **UI**: Frontend React + Vite
- **Firebase**: Emulator pentru autentificare

## 📚 Documentație Completă

### **📋 Pentru Dezvoltatori Noi**
- **[docs/README.md](docs/README.md)** - Structura documentației și cum să o folosești
- **[docs/HOW_TO_USE.md](docs/HOW_TO_USE.md)** - Ghid pas cu pas pentru utilizarea documentației
- **[docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)** - Workflow complet de dezvoltare

### **📊 Pentru Monitorizarea Progresului**
- **[docs/DEVELOPMENT_PROGRESS.md](docs/DEVELOPMENT_PROGRESS.md)** - Planul de dezvoltare cu status-ul actual al fiecărei funcționalități
- **[docs/SUMMARY.md](docs/SUMMARY.md)** - Sumar complet al documentației și status-ului proiectului

### **🏗️ Pentru Arhitectura și Implementare**
- **[docs/APPLICATION_DOCUMENTATION.md](docs/APPLICATION_DOCUMENTATION.md)** - Documentația tehnică completă (API, schema, componente)
- **[docs/API_REFERENCE.md](docs/API_REFERENCE.md)** - Referință completă API (v1 + system)
- **[docs/PRODUCT_BRIEF.md](docs/PRODUCT_BRIEF.md)** - Specificațiile produsului
- **[docs/TRADING_APP_CONSTRUCTION_PLAN.md](docs/TRADING_APP_CONSTRUCTION_PLAN.md)** - Planul original de construcție

## 🔧 Scripturi Utile

### **Actualizare Progres Dezvoltare**
```bash
# Marchează o funcționalitate ca completă
node scripts/update-progress.js "Feature Name" complete

# Marchează o funcționalitate ca în curs
node scripts/update-progress.js "Feature Name" in-progress

# Vezi ajutorul
node scripts/update-progress.js --help
```

### **Status-uri Disponibile**
- `complete` → ✅ COMPLET
- `in-progress` → 🔄 ÎN CURS
- `started` → 🟡 ÎNCEPUT
- `planned` → ❌ ÎN AȘTEPTARE
- `testing` → 🧪 ÎN TESTARE
- `deployed` → 🚀 DEPLOYAT

## 📊 Status Actual al Proiectului

**Status General**: 80% complet

### ✅ **Complet Implementat (Faza 1-2)**
- Infrastructure și setup
- Database schema și API endpoints
- Authentication system
- Basic image processing
- Frontend UI components
- Docker deployment

### 🔄 **În Curs de Dezvoltare (Faza 3)**
- Integration Testing pentru AI Analysis Engine
- Performance Optimization
- User Testing
- Production Deployment

### ❌ **Planificat (Faza 4-6)**
- AI Models training
- Advanced analytics
- Performance optimization
- Production deployment

**Următoarea Milă**: Integration Testing și Performance Optimization pentru AI Analysis Engine

## 🏗️ Arhitectura

```
techAnal/
├── ui/                    # Frontend React + Vite + Tailwind + ShadCN
├── server/                # Backend Hono API + Drizzle ORM
├── database-server/       # Embedded PostgreSQL
├── docs/                  # Documentație completă
└── scripts/               # Scripturi utilitare
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, ShadCN
- **Backend**: Node.js, Hono, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Firebase Auth
- **Deployment**: Docker, Docker Compose
- **Package Manager**: pnpm

## 🎯 Funcționalități Cheie

- **Local AI Processing**: Toate datele rămân pe computerul utilizatorului
- **Custom Prompt Engine**: Criterii de analiză personalizate
- **Multi-Asset Support**: Forex, stocks, commodities, crypto
- **Real-time Analysis**: Răspuns în sub 2 secunde
- **Pattern Recognition**: Detectare automată de pattern-uri tehnice
- **Signal Generation**: Recomandări Buy/Sell/Hold cu niveluri de încredere
- **System Monitoring**: Monitorizare în timp real a proceselor și resurselor

## 🚀 Development

```bash
# Start development
pnpm run dev

# Build production
pnpm run build

# Run tests
pnpm test

# Database migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

## 📝 Contribuția

### **Pentru Dezvoltatori Noi**
1. Citește **[docs/HOW_TO_USE.md](docs/HOW_TO_USE.md)** pentru ghidul complet
2. Verifică **[docs/DEVELOPMENT_PROGRESS.md](docs/DEVELOPMENT_PROGRESS.md)** pentru status-ul actual
3. Explorează **[docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)** pentru workflow-ul de dezvoltare
4. Vezi **[docs/SYSTEM_MONITOR_DOCUMENTATION.md](docs/SYSTEM_MONITOR_DOCUMENTATION.md)** pentru monitorizarea sistemului

### **Pentru Actualizarea Progresului**
```bash
# Când implementezi o funcționalitate nouă
node scripts/update-progress.js "Nume Funcționalitate" complete
```

## 🔍 Troubleshooting

Pentru probleme comune și soluții, verifică:
- **[docs/HOW_TO_USE.md](docs/HOW_TO_USE.md)** - Secțiunea Troubleshooting
- **[docs/APPLICATION_DOCUMENTATION.md](docs/APPLICATION_DOCUMENTATION.md)** - Secțiunea Troubleshooting
- **[docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)** - Secțiunea Debugging

## 📞 Suport

Pentru întrebări despre:
- **Documentație**: Verifică mai întâi folderul `docs/`
- **Implementare**: Citește `docs/APPLICATION_DOCUMENTATION.md`
- **Progres**: Verifică `docs/DEVELOPMENT_PROGRESS.md`
- **Workflow**: Citește `docs/DEVELOPER_GUIDE.md`

## 📄 License

Acest proiect este licențiat sub [LICENSE](LICENSE).

---

**🎯 Scop**: TechAnal să fie o aplicație de analiză AI pentru trading, complet locală, rapidă și precisă.

**📚 Documentație**: Completă și actualizată automat cu fiecare funcționalitate nouă implementată.

**🔄 Status**: Proiect în dezvoltare activă cu 80% complet. 