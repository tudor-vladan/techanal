# API Reference

## Base URLs

- Development (Docker): `http://localhost:5500`
- Development (direct server): `http://localhost:8787`
- Production: configured via environment variables

Notes:
- All API endpoints use the `/api` prefix with versioning where applicable.
- Most business endpoints are under `/api/v1`.

## Authentication

- Header: `Authorization: Bearer <token>`
- Production: Firebase JWT token required
- Development: simple email token is accepted (e.g., `Bearer dev@example.com`)

## Public Endpoints (no auth)

- GET `/` → API status
- GET `/api/v1/health` → API health
- POST `/api/v1/logs/ingest` → Ingest custom logs
- GET `/api/v1/ai-test` → AI engine basic health/info
- GET `/api/v1/ai-performance-test` → Synthetic AI performance test
- GET `/api/v1/chart-analysis-test` → Synthetic chart analysis demo
- GET `/api/v1/integration-test` → Synthetic end-to-end test
- GET `/api/v1/ai-engine-performance` → Full AI processing benchmark
- GET `/api/v1/db-test` → Database connectivity test
- GET `/api/v1/uploads/:path` → Serve uploaded files

Notes:
- Responses are compressed (gzip/br) automatically when supported by the client.
- Upload validation: `image/png`, `image/jpeg`, `image/webp` are accepted; default `MAX_FILE_SIZE` is 10MB (configurable via env).

## Protected Endpoints (auth required)

Prefix: `/api/v1/protected`

- GET `/me`
  - Returns authenticated user

- GET `/ai-engine-stats`
  - AI engine health, stats, configuration

- GET `/ai-service-status`
  - Status of AI analysis service

- POST `/analyze-screenshot`
  - Content-Type: `multipart/form-data`
  - Fields:
    - `image`: file (required)
    - `prompt`: string (required)
  - Returns normalized AI analysis with metadata and processing time

- POST `/save-prompt`
  - Body (JSON): `{ name: string, content: string, description?: string, isDefault?: boolean, isPublic?: boolean, tags?: string[] }`
  - Saves a user prompt template

- GET `/analysis-history`
  - Returns recent analyses for the authenticated user

- GET `/analysis/:id`
  - Returns a specific analysis by ID (must belong to the user)

- DELETE `/analysis/:id`
  - Deletes a specific analysis (must belong to the user)

- GET `/user-prompts`
  - Lists saved prompts for the authenticated user

## System Monitoring Endpoints (auth required)

Prefix: `/api/system`

- GET `/processes` → High-level process list (app services + top system processes)
- GET `/resources` → CPU, memory, disk, and network snapshot
- GET `/logs` → Recent application/system logs (aggregated)
- GET `/logs/stream` → Server-Sent Events stream with live logs
- GET `/metrics` → Basic server metrics (uptime, response time)

## Environment Variables (relevant to API)

- `PORT` (default 8787 inside server container)
- `UPLOAD_DIR` (default `uploads`)
- `DATABASE_URL` (PostgreSQL connection)
- `FIREBASE_PROJECT_ID` (required in production)
- AI-related: `AI_PROVIDER`, `AI_API_KEY`, `AI_TIMEOUT`, `AI_MAX_TOKENS`, etc.
- `CORS_ORIGIN` (recommended in production; controls allowed origin for CORS)
- `MAX_FILE_SIZE` (bytes; default 10485760)

## Quick Smoke Tests

Using a dev email token:

```bash
# Health
curl http://localhost:5500/api/v1/health

# AI engine stats (protected)
curl -H "Authorization: Bearer dev@example.com" \
  http://localhost:5500/api/v1/protected/ai-engine-stats

# Analyze a PNG image
curl -X POST -H "Authorization: Bearer dev@example.com" \
  -F "image=@./test-image.png" \
  -F "prompt=Analizeaza nivelurile cheie si recomandari." \
  http://localhost:5500/api/v1/protected/analyze-screenshot

# History
curl -H "Authorization: Bearer dev@example.com" \
  http://localhost:5500/api/v1/protected/analysis-history
```


