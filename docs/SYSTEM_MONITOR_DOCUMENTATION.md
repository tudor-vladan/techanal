# System Monitor - Documentație Completă

## Overview

System Monitor este o pagină dedicată monitorizării în timp real a sistemului, care oferă vizibilitate completă asupra proceselor, resurselor și debugging-ului aplicației TechAnal. Aceasta include funcționalități avansate precum grafice interactive, sistem de alert-uri inteligent și generare de rapoarte.

## Funcționalități Cheie

### 1. Monitorizarea Proceselor
- **Status Tracking**: Monitorizează statusul tuturor proceselor (running, stopped, error)
- **Resource Usage**: Afișează utilizarea CPU și RAM pentru fiecare proces
- **Uptime Monitoring**: Urmărește timpul de funcționare al proceselor
- **Process Details**: Informații detaliate despre fiecare proces

### 2. Monitorizarea Resurselor
- **CPU Monitoring**: 
  - Utilizarea totală în procente
  - Numărul de core-uri
  - Temperatura procesorului
- **Memory Monitoring**:
  - RAM total, utilizat și disponibil
  - Procentul de utilizare
  - Vizualizare cu progress bar
- **Disk Monitoring**:
  - Spațiul total, utilizat și disponibil
  - Procentul de utilizare
  - Formatare automată (Bytes, KB, MB, GB)
- **Network Monitoring**:
  - Conexiuni active
  - Bytes transferați (in/out)

### 3. Grafice Interactive în Timp Real
- **CPU Trend Charts**: Grafice de tip Area pentru utilizarea CPU
- **Memory Usage Charts**: Grafice de tip Line pentru utilizarea memoriei
- **Disk & Network Charts**: Grafice de tip Bar și Line pentru comparații
- **Trend Analysis**: Detectare automată a trend-urilor (crescător, descrescător, stabil)
- **Real-time Updates**: Actualizare automată la fiecare 5 secunde
- **Responsive Design**: Grafice adaptate pentru toate dimensiunile de ecran

### 4. Sistem de Alert-uri Inteligent
- **Threshold Management**: Configurare personalizabilă pentru pragurile de alertă
- **Automatic Detection**: Detectare automată a problemelor de performanță
- **Alert Levels**: Critical, Warning, Info, Success cu coduri de culoare
- **Auto-resolution**: Alert-uri care se rezolvă automat când problema dispare
- **Acknowledgment System**: Sistem de confirmare pentru alert-uri
- **Statistics Dashboard**: Sumar vizual al alert-urilor active

### 5. Debug Logs
- **Log Levels**: info, warning, error, debug
- **Source Tracking**: Identifică sursa fiecărui log
- **Timestamp**: Timpul exact al fiecărui eveniment
- **Details Expansion**: Detalii suplimentare expandabile
- **Color Coding**: Coduri de culoare pentru diferitele niveluri

### 6. Generare de Rapoarte
- **Multiple Formats**: Export în PDF, CSV, JSON
- **Customizable Content**: Selectare conținut (grafice, alert-uri, procese)
- **Date Range Selection**: Intervale predefinite sau personalizate
- **Report Types**: Performanță, Procese, Alert-uri, Comprehensiv
- **Preview System**: Previzualizare configurație înainte de generare

### 7. Real-time Monitoring
- **Live Updates**: Actualizare automată la fiecare 5 secunde
- **Toggle Control**: Pornește/oprește monitorizarea în timp real
- **Manual Refresh**: Buton de refresh manual
- **Status Indicator**: Indicator vizual pentru monitorizarea activă

## Interfața Utilizator

### Header Section
- **Title**: "System Monitor" cu iconița Activity
- **Description**: Explicație scurtă despre funcționalitate
- **Control Buttons**: 
  - Toggle pentru monitorizarea în timp real
  - Buton de refresh manual

### System Overview Cards
4 card-uri care afișează metricile principale:
1. **CPU Usage**: Procentul de utilizare cu detalii despre core-uri și temperatură
2. **Memory Usage**: Utilizarea RAM cu progress bar
3. **Disk Usage**: Utilizarea discului cu formatare automată
4. **Network**: Conexiuni active și trafic

### Tab Navigation
5 tab-uri principale:
1. **Procese**: Lista tuturor proceselor cu status și resurse
2. **Resurse**: Detalii detaliate despre CPU, RAM, Disk și Network
3. **Grafice**: Grafice interactive cu trend-uri în timp real
4. **Rapoarte**: Configurare și generare de rapoarte
5. **Debug Logs**: Log-urile de debugging cu filtrare

## Componente Avansate

### SystemCharts
Componentă pentru grafice interactive cu următoarele caracteristici:
- **Trend Detection**: Analiză automată a trend-urilor
- **Multiple Chart Types**: Area, Line, Bar charts
- **Real-time Data**: Actualizare continuă cu date simulate
- **Responsive Design**: Adaptare automată la dimensiunea ecranului
- **Interactive Tooltips**: Informații detaliate la hover

### SystemAlerts
Sistem inteligent de alert-uri cu:
- **Configurable Thresholds**: Praguri personalizabile pentru fiecare metrică
- **Smart Detection**: Detectare automată bazată pe resursele curente
- **Alert Management**: Acknowledgment și dismiss pentru alert-uri
- **Statistics Dashboard**: Sumar vizual al alert-urilor active
- **Auto-resolution**: Alert-uri care se rezolvă automat

### SystemReports
Sistem de generare rapoarte cu:
- **Multiple Export Formats**: PDF, CSV, JSON
- **Content Selection**: Selectare conținut inclus în raport
- **Date Range Options**: Intervale predefinite sau personalizate
- **Report Types**: Diferite tipuri de rapoarte specializate
- **Configuration Preview**: Previzualizare configurație înainte de generare

## Structura Datelor

### ProcessInfo Interface
```typescript
interface ProcessInfo {
  id: string;                    // ID-ul unic al procesului
  name: string;                  // Numele procesului
  status: 'running' | 'stopped' | 'error';  // Statusul curent
  cpu: number;                   // Utilizarea CPU în procente
  memory: number;                // Utilizarea RAM în MB
  startTime: string;             // Timpul de pornire
  uptime: string;                // Timpul de funcționare
  description: string;           // Descrierea procesului
}
```

### SystemResources Interface
```typescript
interface SystemResources {
  cpu: {
    usage: number;               // Utilizarea totală CPU
    cores: number;               // Numărul de core-uri
    temperature: number;         // Temperatura în grade Celsius
  };
  memory: {
    total: number;               // RAM total în MB
    used: number;                // RAM utilizat în MB
    available: number;           // RAM disponibil în MB
    usage: number;               // Procentul de utilizare
  };
  disk: {
    total: number;               // Spațiul total în MB
    used: number;                // Spațiul utilizat în MB
    available: number;           // Spațiul disponibil în MB
    usage: number;               // Procentul de utilizare
  };
  network: {
    bytesIn: number;             // Bytes primiți
    bytesOut: number;            // Bytes transmiși
    connections: number;         // Conexiuni active
  };
}
```

### ChartDataPoint Interface
```typescript
interface ChartDataPoint {
  timestamp: string;             // Timpul măsurării
  cpu: number;                   // Utilizarea CPU în procente
  memory: number;                // Utilizarea memoriei în procente
  disk: number;                  // Utilizarea discului în procente
  network: number;               // Activitatea de rețea în procente
}
```

### SystemAlert Interface
```typescript
interface SystemAlert {
  id: string;                    // ID-ul unic al alert-ului
  type: 'critical' | 'warning' | 'info' | 'success';  // Tipul alert-ului
  title: string;                 // Titlul alert-ului
  message: string;               // Mesajul descriptiv
  timestamp: string;             // Timpul generării
  source: string;                // Sursa alert-ului
  isAcknowledged: boolean;       // Dacă alert-ul a fost confirmat
  threshold?: number;            // Pragul care a fost depășit
  currentValue?: number;         // Valoarea curentă
}
```

### DebugLog Interface
```typescript
interface DebugLog {
  id: string;                    // ID-ul unic al log-ului
  timestamp: string;             // Timpul evenimentului
  level: 'info' | 'warning' | 'error' | 'debug';  // Nivelul log-ului
  message: string;               // Mesajul principal
  source: string;                // Sursa log-ului
  details?: any;                 // Detalii suplimentare (opțional)
}
```

## Implementare Tehnică

### State Management
- **useState** pentru starea locală a componentelor
- **useEffect** pentru inițializarea datelor și side effects
- **useInterval** pentru actualizările în timp real
- **Local State** pentru configurații și preferințe

### Data Flow
1. **Initialization**: Încarcă datele mock la montarea componentelor
2. **Real-time Updates**: Actualizează datele la fiecare 5 secunde când monitorizarea este activă
3. **Chart Data Generation**: Generează date simulate pentru grafice
4. **Alert Generation**: Detectează și generează alert-uri bazate pe praguri
5. **Manual Refresh**: Permite actualizarea manuală a datelor

### Performance Considerations
- **Efficient Rendering**: Folosește React.memo pentru optimizarea re-renderizării
- **Interval Management**: Curăță interval-ul când componentele sunt demontate
- **Data Formatting**: Funcții utilitare pentru formatarea datelor (bytes, memory)
- **Chart Optimization**: Limitează numărul de puncte de date pentru performanță
- **Lazy Loading**: Încarcă componentele doar când sunt necesare

### Dependințe Externe
- **Recharts**: Librărie pentru grafice interactive
- **Lucide React**: Iconițe moderne și responsive
- **ShadCN UI**: Componente UI pre-built și stilizate
- **Tailwind CSS**: Framework CSS pentru design responsive

## Utilizare

### Accesare
1. Navighează la `/system-monitor` în aplicație
2. Sau folosește link-ul din sidebar-ul principal

### Monitorizarea în Timp Real
1. Apasă butonul "Pornește Monitorizarea"
2. Datele se vor actualiza automat la fiecare 5 secunde
3. Indicatorul verde va arăta că monitorizarea este activă
4. Apasă "Oprește Monitorizarea" pentru a opri actualizările automate

### Navigarea între Tab-uri
- **Procese**: Vezi toate procesele active cu status și resurse
- **Resurse**: Analizează utilizarea detaliată a sistemului
- **Grafice**: Explorează trend-urile cu grafice interactive
- **Rapoarte**: Configurează și generează rapoarte personalizate
- **Debug Logs**: Verifică log-urile de debugging cu filtrare

### Configurarea Alert-urilor
1. Navighează la tab-ul "Grafice"
2. Apasă butonul "Settings" din secțiunea System Alerts
3. Configurează pragurile pentru CPU, Memory, Disk și Network
4. Alert-urile se vor genera automat când pragurile sunt depășite

### Generarea de Rapoarte
1. Navighează la tab-ul "Rapoarte"
2. Configurează tipul, formatul și intervalul temporal
3. Selectează conținutul dorit (grafice, alert-uri, procese)
4. Apasă "Generează Raport" și așteaptă finalizarea
5. Raportul se va descărca automat

### Interpretarea Datelor
- **CPU > 80%**: Utilizare ridicată - monitorizează pentru performanță
- **Memory > 90%**: RAM aproape epuizat - consideră restart
- **Disk > 95%**: Spațiu aproape epuizat - curăță fișiere
- **Error Logs**: Verifică log-urile de eroare pentru probleme
- **Trend Analysis**: Monitorizează direcția trend-urilor pentru predicții

## Integrare cu Sistemul

### Routing
- **Route**: `/system-monitor`
- **Component**: `SystemMonitor` din `ui/src/pages/SystemMonitor.tsx`
- **Navigation**: Adăugat în sidebar-ul principal

### Dependințe
- **UI Components**: Card, Progress, Badge, Tabs, Select, Input din ShadCN
- **Charts**: Recharts pentru grafice interactive
- **Icons**: Lucide React pentru iconițe
- **Styling**: Tailwind CSS pentru design responsive

### API Integration
- **Current**: Folosește date mock pentru demonstrație
- **Future**: Integrare cu backend API pentru date reale
- **Endpoints**: `/api/system/processes`, `/api/system/resources`, `/api/system/logs`

## Extensibilitate

### Adăugarea de Metrici Noi
1. Extinde `SystemResources` interface
2. Adaugă card-ul corespunzător în UI
3. Actualizează logica de formatare
4. Integrează cu sistemul de alert-uri

### Adăugarea de Procese Noi
1. Extinde `ProcessInfo` interface
2. Adaugă procesul în lista de procese
3. Implementează logica de status
4. Actualizează monitorizarea

### Custom Chart Types
1. Extinde `ChartDataPoint` interface
2. Adaugă tipul de chart în `SystemCharts`
3. Implementează logica de trend detection
4. Actualizează tooltip-urile și legendele

### Custom Alert Rules
1. Extinde `SystemAlert` interface
2. Adaugă logica de detectare în `SystemAlerts`
3. Implementează threshold-uri personalizate
4. Adaugă acțiuni automate pentru alert-uri

### Custom Report Formats
1. Extinde `SystemReport` interface
2. Implementează logica de generare pentru noul format
3. Adaugă opțiuni de configurare în UI
4. Integrează cu sistemul de export

## Troubleshooting

### Probleme Comune

#### Monitorizarea nu pornește
- Verifică dacă componentele sunt montate corect
- Verifică console-ul pentru erori JavaScript
- Asigură-te că nu există conflicte cu alte intervale
- Verifică dacă `isMonitoring` state-ul este setat corect

#### Datele nu se actualizează
- Verifică dacă monitorizarea este activă
- Verifică interval-ul de actualizare (5 secunde)
- Verifică dacă există erori în generarea datelor
- Verifică dacă `chartData` state-ul se actualizează

#### Graficele nu se afișează
- Verifică dacă Recharts este instalat corect
- Verifică dacă `chartData` conține date valide
- Verifică dacă componentele sunt importate corect
- Verifică console-ul pentru erori de rendering

#### Alert-urile nu se generează
- Verifică dacă pragurile sunt configurate corect
- Verifică dacă `resources` prop-ul este transmis corect
- Verifică dacă `isMonitoring` este activ
- Verifică logica de detectare în `SystemAlerts`

#### Rapoartele nu se generează
- Verifică dacă toate câmpurile sunt completate
- Verifică dacă datele sunt transmise corect
- Verifică console-ul pentru erori în generare
- Verifică dacă browser-ul permite download-ul

### Debugging
- Folosește tab-ul "Debug Logs" pentru informații despre sistem
- Verifică console-ul browser-ului pentru erori
- Monitorizează utilizarea resurselor în Developer Tools
- Verifică state-ul componentelor cu React DevTools
- Testează funcționalitățile individual pentru a izola problemele

### Performance Issues
- Reduce frecvența de actualizare pentru grafice
- Implementează virtualizarea pentru liste mari
- Optimizează re-renderizarea componentelor
- Monitorizează utilizarea memoriei în Developer Tools
- Implementează lazy loading pentru componente grele

## Roadmap

### Versiunea Următoare
- [ ] Integrare cu backend API pentru date reale
- [ ] Notificări push pentru evenimente critice
- [ ] Export de rapoarte în PDF cu styling avansat
- [ ] Grafice 3D pentru vizualizări complexe
- [ ] Machine learning pentru predicția problemelor

### Versiuni Viitoare
- [ ] Alert-uri configurabile cu acțiuni automate
- [ ] Dashboard-uri personalizabile și drag & drop
- [ ] Integrare cu sisteme externe de monitoring (Prometheus, Grafana)
- [ ] Anomaly detection cu algoritmi AI
- [ ] Predictive maintenance și health scoring
- [ ] Mobile app pentru monitorizare remote
- [ ] WebSocket pentru actualizări în timp real
- [ ] Multi-tenant support pentru organizații mari

### Integrări Avansate
- [ ] **Cloud Monitoring**: AWS CloudWatch, Azure Monitor, Google Cloud Monitoring
- [ ] **Container Monitoring**: Docker, Kubernetes, Docker Compose
- [ ] **Database Monitoring**: PostgreSQL, MySQL, MongoDB performance metrics
- [ ] **Network Monitoring**: SNMP, NetFlow, packet analysis
- [ ] **Security Monitoring**: Intrusion detection, vulnerability scanning
- [ ] **Application Performance Monitoring**: APM integration, error tracking

## Concluzie

System Monitor oferă o soluție completă și avansată pentru monitorizarea sistemului TechAnal, cu funcționalități moderne precum grafice interactive, alert-uri inteligente și generare de rapoarte. Această componentă devine un instrument esențial pentru dezvoltatori și administratori, oferind vizibilitate completă asupra performanței sistemului și facilitând detectarea și rezolvarea problemelor în timp util.

Cu arhitectura modulară și extensibilă, System Monitor poate fi ușor adaptat pentru a include noi metrici, tipuri de grafice și sisteme de alert-uri, menținând în același timp performanța și ușurința de utilizare.
