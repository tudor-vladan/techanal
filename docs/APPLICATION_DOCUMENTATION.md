# AI Trading Analysis Application - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Frontend Components](#frontend-components)
7. [Backend Services](#backend-services)
8. [Configuration](#configuration)
9. [Development Guide](#development-guide)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

## Overview

### What is TechAnal?
TechAnal este o aplicație locală de analiză AI pentru trading charts care folosește computer vision și natural language processing pentru a analiza screenshot-uri de chart-uri și a genera semnale de trading bazate pe prompt-uri personalizate ale utilizatorului.

### Key Features
- **Local AI Processing**: Toate datele rămân pe computerul utilizatorului
- **Custom Prompt Engine**: Criterii de analiză personalizate
- **Multi-Asset Support**: Forex, stocks, commodities, crypto
- **Real-time Analysis**: Răspuns în sub 2 secunde
- **Pattern Recognition**: Detectare automată de pattern-uri tehnice
- **Signal Generation**: Recomandări Buy/Sell/Hold cu niveluri de încredere

### Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + ShadCN
- **Backend**: Node.js + Hono + Drizzle ORM
- **Database**: PostgreSQL (local development cu embedded postgres)
- **AI**: Computer Vision + Pattern Recognition
- **Authentication**: Firebase Auth
- **Deployment**: Docker + Docker Compose

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Hono API)    │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Firebase      │    │   AI Engine     │    │   File Storage  │
│   Auth          │    │   (CV + ML)     │    │   (Local)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Project Structure
```
techAnal/
├── ui/                          # Frontend React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Application pages
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility functions
│   │   └── types/               # TypeScript type definitions
│   ├── public/                  # Static assets
│   └── package.json
├── server/                      # Backend API server
│   ├── src/
│   │   ├── api.ts              # Main API routes
│   │   ├── lib/                # Core services
│   │   ├── middleware/         # API middleware
│   │   ├── schema/             # Database schemas
│   │   └── server.ts           # Server entry point
│   ├── drizzle/                 # Database migrations
│   └── package.json
├── database-server/             # Embedded PostgreSQL server
├── docs/                        # Documentation
├── scripts/                     # Development and deployment scripts
└── docker-compose.yml           # Docker configuration
```

## Installation & Setup

### Prerequisites
- Docker Desktop 20.10+
- Node.js 18+
- pnpm 8+
- Git

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd techAnal

# Install dependencies
pnpm install

# Start development environment
pnpm run dev
```

### Environment Variables
Creează un fișier `.env` în rădăcina proiectului:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5502/postgres

# Firebase (pentru authentication)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id

# AI Models (opțional)
OLLAMA_BASE_URL=http://localhost:11434
AI_MODEL_NAME=llama3.1:8b

# Development
NODE_ENV=development
PORT=3000
```

### Docker Setup
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Documentation

### Base URL
- Development (Docker): `http://localhost:5500`
- Development (direct server): `http://localhost:8787`
- Production: configurat prin variabile de mediu

### Authentication
- Header: `Authorization: Bearer <token>`
- Production: Firebase JWT token necesar
- Development: este acceptat și un token simplu bazat pe email (ex: `Bearer dev@example.com`)

### Public Endpoints

#### Health Check
```http
GET /api/v1/health
```
**Response:**
```json
{
  "status": "ok",
  "message": "API is running"
}
```

#### Database Test
```http
GET /api/v1/db-test
```
**Response:**
```json
{
  "message": "Database connection successful!",
  "users": [...],
  "connectionHealthy": true,
  "usingLocalDatabase": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Protected Endpoints

#### Get Current User
```http
GET /api/v1/protected/me
Authorization: Bearer <token>
```
**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Analyze Screenshot
```http
POST /api/v1/protected/analyze-screenshot
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "image": <file>,
  "prompt": "string",
  "assetType": "forex|stocks|crypto|commodities",
  "timeframe": "1m|5m|15m|1h|4h|1d|1w|1M"
}
```
**Response:**
```json
{
  "analysis": {
    "id": "analysis_id",
    "userId": "user_id",
    "imageUrl": "string",
    "prompt": "string",
    "result": {
      "signal": "buy|sell|hold",
      "confidence": 0.85,
      "reasoning": "string",
      "patterns": [...],
      "support": 1.2000,
      "resistance": 1.2200
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Save Custom Prompt
```http
POST /api/v1/protected/save-prompt
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string",
  "content": "string",
  "category": "string"
}
```

#### Get Analysis History
```http
GET /api/v1/protected/analysis-history
Authorization: Bearer <token>
Query Parameters:
  - limit: number (default: 50)
  - offset: number (default: 0)
  - assetType: string (optional)
  - dateFrom: string (ISO date, optional)
  - dateTo: string (ISO date, optional)
```

#### Get/Delete Analysis by ID
```http
GET    /api/v1/protected/analysis/:id
DELETE /api/v1/protected/analysis/:id
Authorization: Bearer <token>
```

Pentru lista completă de endpoints, vezi `docs/API_REFERENCE.md`.

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### User Prompts Table
```sql
CREATE TABLE user_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Trading Analysis Table
```sql
CREATE TABLE trading_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prompt TEXT NOT NULL,
  asset_type VARCHAR(50),
  timeframe VARCHAR(20),
  result JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Recommended Indexes
Pentru performanță în listări/istoric:

```sql
-- trading_analyses (istoric per utilizator, ordonat descrescător după timp)
CREATE INDEX IF NOT EXISTS trading_analyses_user_id_created_at_idx
  ON trading_analyses (user_id, created_at);

-- user_prompts (listare prompturi per utilizator, cele mai recente primele)
CREATE INDEX IF NOT EXISTS user_prompts_user_id_updated_at_idx
  ON user_prompts (user_id, updated_at);
```

### Analysis Feedback Table
```sql
CREATE TABLE analysis_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES trading_analysis(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  was_helpful BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Frontend Components

### Core Components

#### ScreenshotUpload
**Purpose**: Upload și preview pentru screenshot-uri de chart-uri
**Features**:
- Drag & drop support
- File validation
- Image preview
- Progress indicators

**Props**:
```typescript
interface ScreenshotUploadProps {
  onImageSelected: (file: File) => void;
  selectedImage: File | null;
  uploadProgress: UploadProgress | null;
}
```

#### PromptEditor
**Purpose**: Editor pentru prompt-urile personalizate de analiză
**Features**:
- Rich text editing
- Prompt templates
- Save/load functionality
- Category management

**Props**:
```typescript
interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: (prompt: UserPrompt) => void;
  userPrompts: UserPrompt[];
  onLoadPrompt: (promptId: string) => void;
}
```

#### AnalysisResults
**Purpose**: Afișarea rezultatelor analizei AI
**Features**:
- Signal display (Buy/Sell/Hold)
- Confidence indicators
- Pattern visualization
- Support/resistance levels

#### AnalysisHistory
**Purpose**: Istoricul analizelor cu filtrare și căutare
**Features**:
- Pagination
- Advanced filtering
- Search functionality
- Export options

#### SystemMonitor
**Purpose**: Monitorizarea în timp real a sistemului și debugging
**Features**:
- Process monitoring with status indicators
- Resource usage visualization (CPU, Memory, Disk, Network)
- Debug logs with level filtering (info, warning, error, debug)
- Real-time monitoring toggle
- Performance metrics dashboard
- System health indicators

**Props**:
```typescript
interface SystemMonitorProps {
  // Component is self-contained, no external props needed
}

interface ProcessInfo {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  cpu: number;
  memory: number;
  startTime: string;
  uptime: string;
  description: string;
}

interface SystemResources {
  cpu: { usage: number; cores: number; temperature: number };
  memory: { total: number; used: number; available: number; usage: number };
  disk: { total: number; used: number; available: number; usage: number };
  network: { bytesIn: number; bytesOut: number; connections: number };
}

interface DebugLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: string;
  details?: any;
}
```

### Pages

#### Home
**Route**: `/`
**Purpose**: Dashboard principal cu statistici și acces rapid
**Features**:
- Recent analyses
- Quick actions
- Performance metrics

#### TradingAnalysis
**Route**: `/trading-analysis`
**Purpose**: Pagina principală pentru analiza chart-urilor
**Features**:
- Image upload
- Prompt editing
- Analysis execution
- Results display

#### Settings
**Route**: `/settings`
**Purpose**: Configurare aplicație și preferințe utilizator
**Features**:
- Theme selection
- AI model preferences
- Export settings
- Account management

#### SystemMonitor
**Route**: `/system-monitor`
**Purpose**: Monitorizarea proceselor, resurselor și debugging-ul sistemului
**Features**:
- Real-time process monitoring
- System resource usage (CPU, RAM, Disk, Network)
- Debug logs with filtering
- Performance metrics
- Live monitoring toggle
- Process status indicators

## Backend Services

### Core Services

#### Image Processing Service
**File**: `server/src/lib/image-processing-utils.ts`
**Purpose**: Procesarea și validarea imaginilor

**Functions**:
```typescript
validateImage(file: any): Promise<{ width: number; height: number; size: number; format?: string }>
compressImage(buffer: Buffer): Promise<{ buffer: Buffer; info: { size: number; width: number; height: number; format?: string } }>
saveImage(buffer: Buffer, originalName: string, uploadDir?: string): Promise<{ filename: string; filepath: string }>
detectChartPatterns(imageBuffer: Buffer): Promise<{ chartType: string; timeframe: string }>
```

#### AI Analysis Service
**File**: `server/src/lib/ai-analysis.ts`
**Purpose**: Analiza AI a chart-urilor

**Functions**:
```typescript
// Analyze trading screenshot
analyzeTradingScreenshot(
  imageBuffer: Buffer,
  prompt: string,
  context: AnalysisContext
): Promise<AIAnalysisResponse>

// Validate analysis request
validateAnalysisRequest(request: AnalysisRequest): boolean

// Generate trading signals
generateTradingSignals(analysis: ChartAnalysis): TradingSignal[]
```

#### Database Service
**File**: `server/src/lib/db.ts`
**Purpose**: Management-ul conexiunii la baza de date

**Functions**:
```typescript
// Get database connection
getDatabase(url?: string): Promise<Database>

// Test database connectivity
testDatabaseConnection(): Promise<boolean>

// Run database migrations
runMigrations(): Promise<void>
```

### Middleware

#### Authentication Middleware
**File**: `server/src/middleware/auth.ts`
**Purpose**: Validarea token-urilor (Firebase în producție; email token acceptat în dev)

Key behaviors:
- Acceptă `Authorization: Bearer <token>` sau `?token=<...>` pentru SSE
- Dacă token-ul conține `@`, este tratat ca email în dev și se creează/încarcă user-ul
- Altfel, se validează token-ul Firebase și se face upsert în baza de date

## Configuration

### Environment Configuration
**File**: `server/src/lib/env.ts`

**Variables**:
```typescript
interface EnvironmentConfig {
  DATABASE_URL: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_PRIVATE_KEY: string;
  FIREBASE_CLIENT_EMAIL: string;
  NODE_ENV: 'development' | 'production';
  PORT: number;
  AI_MODEL_URL?: string;
}
```

### Database Configuration
**File**: `server/drizzle.config.ts`

**Options**:
```typescript
export default {
  schema: './src/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
};
```

### Frontend Configuration
**File**: `ui/src/lib/firebase.ts`

**Firebase Config**:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
};
```

### API Base URL (UI)
Recomandare: folosește `VITE_API_URL` pentru a configura baza URL a API-ului în UI. Pentru compatibilitate, UI suportă și `VITE_API_BASE_URL`.

```env
# UI
VITE_API_URL=http://localhost:5500
```

### CORS & Upload Limits (Server)
Serverul aplică CORS și compresie pe răspunsuri.

```env
# CORS origin recomandat în producție (evită '*')
CORS_ORIGIN=https://domeniul-tau

# Limită de upload (bytes) – implicit 10MB
MAX_FILE_SIZE=10485760
```

Tipuri de fișiere acceptate pentru upload: `image/png`, `image/jpeg`, `image/webp`.

## Development Guide

### Setting Up Development Environment

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd techAnal
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   ```bash
   cp ui/src/lib/firebase-config.template.json ui/src/lib/firebase-config.json
   # Edit firebase-config.json with your Firebase credentials
   ```

4. **Start Development Servers**
   ```bash
   pnpm run dev
   ```

### Code Style Guidelines

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent code formatting
- **Component Naming**: PascalCase pentru componente
- **File Naming**: kebab-case pentru fișiere

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Database Migrations

```bash
# Generate new migration
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Reset database
pnpm drizzle-kit drop
```

## Deployment

### Production Build

1. **Build Frontend**
   ```bash
   cd ui
   pnpm build
   ```

2. **Build Backend**
   ```bash
   cd server
   pnpm build
   ```

3. **Docker Production Build**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
FIREBASE_PROJECT_ID=your_production_project
FIREBASE_PRIVATE_KEY=your_production_private_key
FIREBASE_CLIENT_EMAIL=your_production_client_email
PORT=3000
```

### Monitoring and Logging

- **Health Checks**: `/health` endpoint
- **Error Logging**: Winston logger
- **Performance Monitoring**: Response time tracking
- **Database Monitoring**: Connection health checks

## Troubleshooting

### Common Issues

#### Database Connection Failed
**Symptoms**: Error 500 la `/api/db-test`
**Solutions**:
1. Verifică dacă PostgreSQL rulează
2. Verifică `DATABASE_URL` în `.env`
3. Verifică firewall settings
4. Restart database server

#### Firebase Authentication Error
**Symptoms**: "Invalid token" la rutele protejate
**Solutions**:
1. Verifică Firebase configuration
2. Verifică token expiration
3. Clear browser cache
4. Re-login user

#### Image Upload Fails
**Symptoms**: Error la upload sau analiză
**Solutions**:
1. Verifică file size limits
2. Verifică file format (PNG, JPG)
3. Verifică storage permissions
4. Check disk space

#### AI Analysis Timeout
**Symptoms**: Analiza durează prea mult
**Solutions**:
1. Verifică AI model availability
2. Reduce image resolution
3. Optimize prompt length
4. Check system resources

### Performance Optimization

#### Frontend
- Lazy load components
- Image compression
- Code splitting
- Bundle optimization

#### Backend
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling

#### AI Processing
- Model quantization
- Batch processing
- GPU acceleration
- Memory management

### Security Best Practices

1. **Authentication**: JWT token validation
2. **Input Validation**: Sanitize all user inputs
3. **File Upload**: Validate file types and sizes
4. **Database**: Use parameterized queries
5. **Environment**: Secure environment variables
6. **HTTPS**: Enable in production

---

**Ultima actualizare**: $(date)
**Versiune**: 1.0.0
**Status**: Development
**Maintainer**: Development Team
