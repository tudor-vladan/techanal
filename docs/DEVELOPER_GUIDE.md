# Developer Guide - TechAnal

Acest ghid este destinat dezvoltatorilor care lucrează la aplicația TechAnal și explică cum să folosească documentația și să actualizeze progresul dezvoltării.

## 🚀 Quick Start pentru Dezvoltatori Noi

### 1. Setup Initial
```bash
# Clone repository
git clone <repository-url>
cd techAnal

# Install dependencies
pnpm install

# Setup environment
cp ui/src/lib/firebase-config.template.json ui/src/lib/firebase-config.json
# Edit firebase-config.json cu credențialele tale

# Start development
pnpm run dev
```

### 2. Înțelegerea Proiectului
1. **Citeste [PRODUCT_BRIEF.md](./PRODUCT_BRIEF.md)** - Înțelege ce face aplicația
2. **Verifică [DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md)** - Vezi ce este implementat și ce urmează
3. **Explorează [APPLICATION_DOCUMENTATION.md](./APPLICATION_DOCUMENTATION.md)** - Vezi arhitectura și API-ul

## 📋 Cum să Actualizezi Progresul

### Script Automat de Actualizare
```bash
# Marchează o funcționalitate ca completă
node scripts/update-progress.js "Feature Name" complete

# Marchează o funcționalitate ca în curs
node scripts/update-progress.js "Feature Name" in-progress

# Marchează o funcționalitate ca planificată
node scripts/update-progress.js "Feature Name" planned
```

### Status-uri Disponibile
- `complete` - ✅ COMPLET
- `in-progress` - 🔄 ÎN CURS
- `started` - 🟡 ÎNCEPUT
- `planned` - ❌ ÎN AȘTEPTARE
- `testing` - 🧪 ÎN TESTARE
- `deployed` - 🚀 DEPLOYAT

### Exemple de Utilizare
```bash
# Când finalizezi o funcționalitate
node scripts/update-progress.js "AI Analysis Engine" complete

# Când începi să lucrezi la ceva
node scripts/update-progress.js "Pattern Recognition" started

# Când ești în curs de implementare
node scripts/update-progress.js "Chart Overlay" in-progress

# Când ești în faza de testare
node scripts/update-progress.js "User Testing" testing
```

## 🏗️ Arhitectura Aplicației

### Structura Proiectului
```
techAnal/
├── ui/                    # Frontend React
├── server/                # Backend Hono API
├── database-server/       # Embedded PostgreSQL
├── docs/                  # Documentație
└── scripts/               # Scripturi utilitare
```

### Stack Tehnologic
- **Frontend**: React 18 + Vite + Tailwind + ShadCN
- **Backend**: Node.js + Hono + Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Firebase Auth
- **Deployment**: Docker

## 🔧 Workflow de Dezvoltare

### 1. Începerea unei Funcționalități Noi
```bash
# 1. Verifică prioritatea în DEVELOPMENT_PROGRESS.md
# 2. Citește documentația relevantă
# 3. Creează branch-ul
git checkout -b feature/nume-funcționalitate

# 4. Marchează ca început
node scripts/update-progress.js "Nume Funcționalitate" started
```

### 2. În Timpul Dezvoltării
```bash
# Când ești în curs de implementare
node scripts/update-progress.js "Nume Funcționalitate" in-progress

# Când ești în testare
node scripts/update-progress.js "Nume Funcționalitate" testing
```

### 3. Finalizarea Funcționalității
```bash
# Când ești gata
node scripts/update-progress.js "Nume Funcționalitate" complete

# Commit și push
git add .
git commit -m "feat: implementează Nume Funcționalitate"
git push origin feature/nume-funcționalitate
```

## 📚 Documentația Tehnică

### API Endpoints
Toate endpoint-urile sunt documentate în [APPLICATION_DOCUMENTATION.md](./APPLICATION_DOCUMENTATION.md):

```typescript
// Exemplu de utilizare
const response = await fetch('/api/analyze-chart', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  },
  body: formData
});
```

### Database Schema
Schema-ul bazei de date este definit în `server/src/schema/` și documentat în [APPLICATION_DOCUMENTATION.md](./APPLICATION_DOCUMENTATION.md).

### Componente Frontend
Toate componentele React sunt documentate cu props și usage examples în [APPLICATION_DOCUMENTATION.md](./APPLICATION_DOCUMENTATION.md).

## 🧪 Testing

### Rularea Testelor
```bash
# Toate testele
pnpm test

# Teste în watch mode
pnpm test:watch

# Teste cu coverage
pnpm test:coverage
```

### Adăugarea de Teste Noi
```typescript
// Exemplu de test pentru o componentă
describe('ScreenshotUpload', () => {
  it('should handle file selection', () => {
    // Test implementation
  });
});
```

## 🚀 Deployment

### Development
```bash
# Start local development
pnpm run dev

# Start cu Docker
docker-compose up -d
```

### Production
```bash
# Build & Test (lint + typecheck + build + tests)
pnpm run grunt

# Docker production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Debugging și Troubleshooting

### Probleme Comune

#### Database Connection
```bash
# Test database connectivity
curl http://localhost:3000/api/db-test
```

#### Firebase Auth
- Verifică `firebase-config.json`
- Verifică environment variables
- Clear browser cache

#### Image Upload
- Verifică file size limits
- Verifică file format (PNG, JPG)
- Verifică storage permissions

### Logs și Monitoring
```bash
# View Docker logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f server
```

## 📝 Contribuția la Documentație

### Când să Actualizezi Documentația
1. **API Changes** - Actualizează [APPLICATION_DOCUMENTATION.md](./APPLICATION_DOCUMENTATION.md)
2. **New Features** - Actualizează [DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md)
3. **Architecture Changes** - Actualizează diagramele și descrierile
4. **Bug Fixes** - Adaugă în troubleshooting section

### Formatul Documentației
- Folosește Markdown
- Include exemple de cod
- Actualizează datele de modificare
- Menține consistența cu restul documentației

## 🎯 Prioritatea Funcționalităților

### 🔴 High Priority (Următoarele 2 săptămâni)
1. **AI Analysis Engine** - Implementarea algoritmilor de pattern recognition
2. **Pattern Recognition** - Detectarea automată de pattern-uri tehnice
3. **Signal Generation** - Generarea de semnale Buy/Sell/Hold

### 🟡 Medium Priority (Următoarele 4 săptămâni)
1. **Technical Indicator Analysis** - RSI, MACD, Bollinger Bands
2. **Chart Overlay** - Suprapunerea analizei AI pe chart
3. **Performance Optimization** - Optimizarea timpului de răspuns

### 🟢 Low Priority (Următoarele 8 săptămâni)
1. **AI Models Training** - Fine-tuning pentru pattern recognition
2. **Advanced Analytics** - Backtesting și performance metrics
3. **Export Functionality** - PDF reports și data export

## 📞 Suport și Comunicare

### Pentru Întrebări
1. Verifică mai întâi această documentație
2. Citește [APPLICATION_DOCUMENTATION.md](./APPLICATION_DOCUMENTATION.md)
3. Verifică [DEVELOPMENT_PROGRESS.md](./DEVELOPMENT_PROGRESS.md)
4. Creează un issue în repository

### Code Review
- Toate PR-urile trebuie revizuite
- Verifică că progresul este actualizat
- Verifică că documentația este actualizată
- Rularea testelor trebuie să treacă

## 🔄 Actualizări Automate

### Script de Progres
Scriptul `scripts/update-progress.js` actualizează automat:
- Status-ul funcționalităților
- Data ultimei modificări
- Procentajul de completare

### Utilizare în CI/CD
```bash
# În pipeline-ul de CI/CD
node scripts/update-progress.js "Feature Name" deployed
```

---

**Ultima actualizare**: $(date)
**Versiune**: 1.0.0
**Pentru întrebări**: Creează un issue în repository
