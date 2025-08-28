# Trading Screenshot Analysis Feature - Technical Plan

## Feature Description
Implementare unei pagini în care utilizatorii pot încărca screenshot-uri de la platforme de trading pentru a fi analizate de un prompt personalizat. Utilizatorii vor putea să încarce imagini, să introducă criteriile de analiză, și să primească rezultate AI cu recomandări de trading.

## Context
Această funcționalitate se integrează în aplicația existentă care folosește React + Vite + Tailwind + ShadCN pentru frontend, Hono API pentru backend, și PostgreSQL cu Drizzle ORM pentru baza de date. Aplicația are deja autentificare Firebase implementată și o structură de routing funcțională.

## Fisiere și Funcții Care Trebuie Modificate

### 1. Database Schema (Data Layer - Phase 1)
**Fisier:** `server/src/schema/analysis.ts` (nou)
- Tabel `trading_analyses` pentru stocarea analizelor
- Tabel `user_prompts` pentru prompt-urile personalizate ale utilizatorilor
- Relații cu tabelul `users` existent

**Fisier:** `server/drizzle/0001_analysis_tables.sql` (nou)
- Migrație pentru tabelele de analiză

### 2. Backend API (Phase 2A)
**Fisier:** `server/src/api.ts`
- Endpoint `POST /api/analyze-screenshot` pentru procesarea imaginilor
- Endpoint `POST /api/save-prompt` pentru salvarea prompt-urilor
- Endpoint `GET /api/analysis-history` pentru istoricul analizelor
- Endpoint `GET /api/user-prompts` pentru prompt-urile salvate

**Fisier:** `server/src/lib/image-processing.ts` (nou)
- Funcție pentru validarea și procesarea imaginilor
- Funcție pentru compresia imaginilor înainte de analiză
- Funcție pentru detectarea formatului și dimensiunilor

**Fisier:** `server/src/lib/ai-analysis.ts` (nou)
- Funcție pentru trimiterea imaginii și prompt-ului către AI
- Funcție pentru procesarea răspunsului AI
- Funcție pentru generarea recomandărilor de trading

### 3. Frontend Components (Phase 2B)
**Fisier:** `ui/src/pages/TradingAnalysis.tsx` (nou)
- Pagina principală pentru analiza screenshot-urilor
- Componenta de upload cu drag & drop
- Editor pentru prompt-ul personalizat
- Afișarea rezultatelor analizei

**Fisier:** `ui/src/components/ScreenshotUpload.tsx` (nou)
- Componenta de upload cu validare
- Preview-ul imaginii încărcate
- Gestionarea erorilor de upload

**Fisier:** `ui/src/components/PromptEditor.tsx` (nou)
- Editor de text pentru criteriile de analiză
- Template-uri predefinite pentru analize comune
- Salvarea și încărcarea prompt-urilor

**Fisier:** `ui/src/components/AnalysisResults.tsx` (nou)
- Afișarea rezultatelor AI
- Recomandări de trading (Buy/Sell/Hold)
- Niveluri de încredere și explicații

**Fisier:** `ui/src/components/AnalysisHistory.tsx` (nou)
- Istoricul analizelor anterioare
- Filtrare și căutare în istoric
- Compararea rezultatelor

### 4. Routing și Navigation
**Fisier:** `ui/src/App.tsx`
- Adăugarea rutei `/trading-analysis` în sistemul de routing

**Fisier:** `ui/src/components/appSidebar.tsx`
- Adăugarea link-ului către pagina de analiză în sidebar
- Icon-ul și eticheta pentru navigare

### 5. API Communication
**Fisier:** `ui/src/lib/serverComm.ts`
- Funcții pentru comunicarea cu API-ul de analiză
- Gestionarea autentificării pentru endpoint-urile protejate
- Error handling pentru operațiunile de analiză

### 6. Types și Interfaces
**Fisier:** `ui/src/types/analysis.ts` (nou)
- Interfețe TypeScript pentru analize
- Tipuri pentru prompt-uri și rezultate
- Enums pentru status-uri și tipuri de recomandări

## Algoritmi și Logica de Procesare

### 1. Upload și Validare Imagine
```
1. User selectează sau drag & drop imagine
2. Validare format (PNG, JPG, JPEG)
3. Validare dimensiuni (max 10MB, min 100x100px)
4. Compresie imagine dacă este prea mare
5. Generare preview pentru user
6. Pregătire pentru trimitere către AI
```

### 2. Procesare AI și Analiză
```
1. Imaginea și prompt-ul sunt trimise către AI
2. AI analizează screenshot-ul pentru:
   - Pattern-uri tehnice (support/resistance, trend-uri)
   - Indicatori tehnici (RSI, MACD, Bollinger Bands)
   - Contextul pieței (timeframe, asset type)
3. AI generează răspuns bazat pe prompt-ul personalizat
4. Parsing-ul răspunsului AI pentru extragerea:
   - Recomandării (Buy/Sell/Hold)
   - Nivelului de încredere
   - Explicațiilor tehnice
   - Nivelurilor de stop-loss și take-profit
```

### 3. Salvarea și Gestionarea Istoricului
```
1. Rezultatul analizei este salvat în baza de date
2. Asocierea cu user-ul autentificat
3. Indexarea pentru căutare rapidă
4. Gestionarea limitelor de stocare per user
5. Backup automat pentru datele importante
```

## Faze de Implementare

### Phase 1: Data Layer (1-2 zile)
- Crearea schemei de baza de date pentru analize
- Implementarea migrațiilor Drizzle
- Testarea conectivității cu baza de date

### Phase 2A: Backend API (2-3 zile)
- Implementarea endpoint-urilor pentru analiză
- Logica de procesare a imaginilor
- Integrarea cu sistemul de autentificare existent
- Testarea API-urilor cu Postman/Thunder Client

### Phase 2B: Frontend UI (3-4 zile)
- Crearea componentelor de upload și editor
- Implementarea paginii principale de analiză
- Integrarea cu sistemul de routing existent
- Styling-ul cu Tailwind și ShadCN

### Phase 3: Integration și Testing (1-2 zile)
- Integrarea frontend cu backend
- Testarea fluxului complet de analiză
- Optimizarea performanței
- Fixarea bug-urilor și edge case-urilor

## Dependințe Externe

### 1. AI Service Integration
- Serviciu AI pentru analiza imaginilor (Ollama local sau API extern)
- Model specializat pentru analiza chart-urilor de trading
- API key și configurare pentru serviciul AI

### 2. Image Processing Libraries
- `sharp` sau `jimp` pentru procesarea imaginilor pe backend
- `react-dropzone` pentru drag & drop în frontend
- `canvas` API pentru manipularea imaginilor în browser

### 3. ShadCN Components
- `textarea` pentru editorul de prompt
- `card` pentru afișarea rezultatelor
- `progress` pentru indicatorii de loading
- `tabs` pentru organizarea conținutului

## Considerații de Securitate

### 1. File Upload Security
- Validarea strictă a tipurilor de fișiere
- Scanare pentru malware în imaginile încărcate
- Limitarea dimensiunilor fișierelor
- Sanitizarea numelor de fișiere

### 2. AI Prompt Security
- Validarea și sanitizarea prompt-urilor
- Prevenirea prompt injection attacks
- Rate limiting pentru analize
- Logging pentru audit și debugging

### 3. Data Privacy
- Criptarea imaginilor în stocare
- Expirarea automată a datelor vechi
- Controlul accesului la istoricul personal
- Conformitate cu GDPR și alte regulamente

## Metrici de Performanță

### 1. Upload și Procesare
- Timp de upload: <5 secunde pentru imagini <5MB
- Timp de analiză AI: <30 secunde
- Rata de succes pentru analize: >95%

### 2. User Experience
- Responsivitate UI: <100ms pentru interacțiuni
- Loading states clare și informative
- Error handling prietenos
- Feedback vizual pentru toate acțiunile

### 3. Scalabilitate
- Suport pentru multiple analize simultane
- Caching pentru prompt-uri frecvente
- Optimizarea bazei de date pentru query-uri complexe
- Gestionarea memoriei pentru procesarea imaginilor

## Testing Strategy

### 1. Unit Tests
- Testarea funcțiilor de procesare a imaginilor
- Validarea schemei de baza de date
- Testarea componentelor React individuale

### 2. Integration Tests
- Testarea fluxului complet de analiză
- Verificarea comunicării frontend-backend
- Testarea autentificării și autorizării

### 3. User Acceptance Tests
- Testarea cu screenshot-uri reale de trading
- Verificarea acurateței analizelor AI
- Testarea experienței utilizatorului end-to-end

## Deployment și Monitorizare

### 1. Environment Variables
- `AI_SERVICE_API_KEY` pentru serviciul AI
- `MAX_FILE_SIZE` pentru limitarea upload-urilor
- `AI_ANALYSIS_TIMEOUT` pentru timeout-ul analizelor
- `STORAGE_RETENTION_DAYS` pentru retenția datelor

### 2. Monitoring
- Logging pentru toate operațiunile de analiză
- Metrici pentru performanța AI
- Alerting pentru erori și timeout-uri
- Dashboard pentru utilizarea funcționalității

### 3. Backup și Recovery
- Backup automat al bazei de date
- Backup al fișierelor de configurare
- Plan de recovery pentru scenarii de dezastru
- Testarea procedurilor de backup

## Riscuri și Mitigări

### 1. AI Service Reliability
- **Risc:** Serviciul AI poate fi indisponibil
- **Mitigare:** Fallback la analiză locală, retry logic, user notification

### 2. Performance Issues
- **Risc:** Analizele pot fi lente pentru imagini mari
- **Mitigare:** Compresie automată, progress indicators, timeout handling

### 3. Data Storage
- **Risc:** Baza de date poate crește rapid
- **Mitigare:** Politici de retenție, cleanup automat, monitoring storage usage

## Next Steps

1. **Confirmare Requirements:** Validarea detaliilor cu utilizatorul
2. **Setup Development Environment:** Pregătirea bazei de date și dependințelor
3. **Implementare Data Layer:** Crearea schemei și migrațiilor
4. **Development Iterativ:** Implementarea pe faze cu testing continuu
5. **Integration Testing:** Testarea fluxului complet
6. **Deployment:** Lansarea în producție cu monitoring
