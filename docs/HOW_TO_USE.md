# 📖 Cum să Folosești Documentația TechAnal

## 🎯 Scopul Acestui Ghid

Acest fișier explică pas cu pas cum să folosești documentația TechAnal și cum să actualizezi progresul dezvoltării.

## 🚀 Pentru Dezvoltatori Noi

### 1. **Primul Pas - Înțelegerea Proiectului**
```bash
# 1. Citește README.md din docs/
# 2. Citește PRODUCT_BRIEF.md pentru a înțelege ce face aplicația
# 3. Verifică DEVELOPMENT_PROGRESS.md pentru status-ul actual
```

### 2. **Setup Development Environment**
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

### 3. **Înțelegerea Arhitecturii**
- Citește `APPLICATION_DOCUMENTATION.md` pentru detalii tehnice
- Explorează `DEVELOPER_GUIDE.md` pentru workflow-ul de dezvoltare
- Verifică `SUMMARY.md` pentru o privire de ansamblu

## 📋 Cum să Actualizezi Progresul

### **Script Automat de Actualizare**

Scriptul `scripts/update-progress.js` actualizează automat:
- ✅ Status-ul funcționalităților
- 📅 Data ultimei modificări  
- 📊 Procentajul de completare

### **Utilizare Basic**
```bash
# Din rădăcina proiectului
node scripts/update-progress.js "Nume Funcționalitate" status
```

### **Status-uri Disponibile**
- `complete` → ✅ COMPLET
- `in-progress` → 🔄 ÎN CURS
- `started` → 🟡 ÎNCEPUT
- `planned` → ❌ ÎN AȘTEPTARE
- `testing` → 🧪 ÎN TESTARE
- `deployed` → 🚀 DEPLOYAT

### **Exemple Practice**

#### Când Începi o Funcționalitate Nouă
```bash
# Marchează ca început
node scripts/update-progress.js "Pattern Recognition" started
```

#### Când Ești în Curs de Implementare
```bash
# Marchează ca în curs
node scripts/update-progress.js "AI Analysis Engine" in-progress
```

#### Când Finalizezi o Funcționalitate
```bash
# Marchează ca completă
node scripts/update-progress.js "Chart Overlay" complete
```

#### Când Ești în Faza de Testare
```bash
# Marchează ca în testare
node scripts/update-progress.js "User Testing" testing
```

## 🔍 Cum să Găsești Funcționalitățile

### **Verifică Numele Exact**
Scriptul caută funcționalitățile cu numele exact din fișierul `DEVELOPMENT_PROGRESS.md`.

### **Exemple de Nume Corecte**
```bash
# ✅ Corecte
"Pattern Recognition"
"Signal Generation"
"Chart Area Detection"
"Custom Prompt Processing"
"Real-time Processing"
"Responsive Design"

# ❌ Greșite
"pattern recognition"        # lowercase
"Pattern recognition"        # fără majusculă
"PatternRecognition"        # camelCase
"pattern-recognition"       # kebab-case
```

### **Cum să Verifici Numele Corect**
```bash
# Caută în fișierul de progres
grep -i "pattern" docs/DEVELOPMENT_PROGRESS.md

# Sau folosește scriptul cu --help
node scripts/update-progress.js --help
```

## 🔧 Workflow Complet de Dezvoltare

### **1. Începerea unei Funcționalități**
```bash
# 1. Verifică prioritatea în DEVELOPMENT_PROGRESS.md
# 2. Citește documentația relevantă
# 3. Creează branch-ul
git checkout -b feature/nume-funcționalitate

# 4. Marchează ca început
node scripts/update-progress.js "Nume Funcționalitate" started
```

### **2. În Timpul Dezvoltării**
```bash
# Când ești în curs de implementare
node scripts/update-progress.js "Nume Funcționalitate" in-progress

# Când ești în testare
node scripts/update-progress.js "Nume Funcționalitate" testing
```

### **3. Finalizarea Funcționalității**
```bash
# Când ești gata
node scripts/update-progress.js "Nume Funcționalitate" complete

# Commit și push
git add .
git commit -m "feat: implementează Nume Funcționalitate"
git push origin feature/nume-funcționalitate
```

## 📚 Documentația Tehnică

### **Când să Citești Ce**

#### **Pentru Setup și Arhitectură**
- `APPLICATION_DOCUMENTATION.md` - Arhitectura completă
- `DEVELOPER_GUIDE.md` - Workflow și practici

#### **Pentru API și Endpoints**
- `APPLICATION_DOCUMENTATION.md` - Secțiunea API Documentation
- Verifică `server/src/api.ts` pentru implementarea actuală

#### **Pentru Database și Schema**
- `APPLICATION_DOCUMENTATION.md` - Secțiunea Database Schema
- Verifică `server/src/schema/` pentru definițiile actuale

#### **Pentru Frontend și Componente**
- `APPLICATION_DOCUMENTATION.md` - Secțiunea Frontend Components
- Verifică `ui/src/components/` pentru implementarea actuală

## 🧪 Testing și Quality Assurance

### **Rularea Testelor**
```bash
# Toate testele
pnpm test

# Teste în watch mode
pnpm test:watch

# Teste cu coverage
pnpm test:coverage
```

### **Verificarea Calității**
- Rularea testelor trebuie să treacă
- Cod-ul trebuie să respecte standardele ESLint
- Documentația trebuie actualizată
- Progresul trebuie actualizat cu scriptul

## 🚀 Deployment și Production

### **Development**
```bash
# Start local development
pnpm run dev

# Start cu Docker
docker-compose up -d
```

### **Production**
```bash
# Build & Test
pnpm run grunt

# Docker production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Troubleshooting

### **Probleme Comune cu Scriptul**

#### **"Nu s-a găsit feature-ul"**
```bash
# Soluție: Verifică numele exact
grep -i "nume-funcționalitate" docs/DEVELOPMENT_PROGRESS.md

# Sau folosește --help pentru exemple
node scripts/update-progress.js --help
```

#### **"Status invalid"**
```bash
# Soluție: Folosește unul din status-urile valide
node scripts/update-progress.js --help
# Vezi lista de status-uri disponibile
```

#### **Script-ul nu rulează**
```bash
# Verifică că ești în rădăcina proiectului
pwd
# Ar trebui să fie /path/to/techAnal

# Verifică că fișierul există
ls -la scripts/update-progress.js
```

### **Probleme cu Documentația**

#### **Fișierul nu se actualizează**
- Verifică permisiunile de scriere
- Verifică că fișierul nu este deschis în alt editor
- Verifică că nu există probleme de encoding

#### **Progresul nu se calculează corect**
- Verifică că checkbox-urile sunt în formatul corect `- [ ]` sau `- [x]`
- Verifică că nu există caractere speciale care să interfereze

## 📝 Best Practices

### **Pentru Actualizarea Progresului**
1. **Actualizează imediat** când începi o funcționalitate
2. **Actualizează regulat** când ești în curs de implementare
3. **Actualizează la final** când ești gata
4. **Folosește numele exacte** din fișierul de progres

### **Pentru Documentația**
1. **Menține actualizată** documentația când faci schimbări
2. **Include exemple** pentru funcționalități noi
3. **Verifică consistența** cu restul documentației
4. **Actualizează datele** de modificare

### **Pentru Dezvoltare**
1. **Citește documentația** înainte de a începe
2. **Verifică progresul** pentru a înțelege prioritatea
3. **Actualizează progresul** pe măsură ce lucrezi
4. **Testează funcționalitatea** înainte de a marca ca completă

## 🎯 Următorii Pași

### **Pentru Dezvoltatori Noi**
1. ✅ Citește acest ghid
2. 🔄 Explorează documentația
3. 🚀 Setup development environment
4. 📋 Începe cu o funcționalitate simplă

### **Pentru Dezvoltatori Experienți**
1. 🔍 Verifică status-ul actual în `DEVELOPMENT_PROGRESS.md`
2. 🎯 Alege următoarea funcționalitate de prioritate înaltă
3. 📚 Citește documentația relevantă
4. 🛠️ Implementează și actualizează progresul

### **Pentru Team Leads**
1. 📊 Monitorizează progresul în `DEVELOPMENT_PROGRESS.md`
2. 🎯 Asignează funcționalități bazat pe prioritate
3. 📝 Verifică că documentația este actualizată
4. 🚀 Planifică următoarele milstone-uri

---

**🎯 Scop**: Acest ghid să fie singura sursă de adevăr pentru utilizarea documentației TechAnal.

**📞 Suport**: Pentru întrebări, creează un issue în repository sau verifică `DEVELOPER_GUIDE.md`.

**🔄 Actualizări**: Acest ghid se actualizează automat cu fiecare îmbunătățire a documentației.
