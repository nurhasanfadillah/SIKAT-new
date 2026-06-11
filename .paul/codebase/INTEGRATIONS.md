# External Integrations

**Analysis Date:** 2026-06-12

## APIs & External Services

**AI/ML:**
- Google Gemini API - Listed in dependencies (`@google/genai` 2.4.0)
  - SDK/Client: `@google/genai` npm package
  - Auth: `GEMINI_API_KEY` env var — `.env.example`
  - Status: **Not actively used** — no Gemini calls found in codebase

**External APIs not detected:**
- No payment processing (Stripe, Midtrans, etc.)
- No email service (SendGrid, Mailgun, etc.)
- No SMS/messaging (Twilio, etc.)
- No analytics (Mixpanel, Google Analytics, etc.)
- No file storage (AWS S3, Google Cloud Storage, etc.)

## Data Storage

**Databases:**
- PostgreSQL via NeonDB (serverless PostgreSQL)
  - Connection: `DATABASE_URL` env var — `.env.example`
  - Fallback: Hardcoded connection string in `server.ts` (security concern — see CONCERNS.md)
  - Client: `pg` 8.21.0 with connection pooling (`Pool`)
  - Migrations: Inline `CREATE TABLE IF NOT EXISTS` on server startup in `server.ts`
  - Tables:
    - `app_users` — User accounts (email, password, name, role)
    - `app_sessions` — Session tokens (token, user_id, expires_at)
    - `transaksi_kas` — School cash transactions
    - `transaksi_talang` — Loan account transactions

**Caching:**
- None (all reads hit PostgreSQL directly)

## Authentication & Identity

**Auth Provider:**
- Custom implementation in `server.ts` — NOT using Better Auth despite it being in dependencies
  - Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`
  - Token storage: `app_sessions` PostgreSQL table
  - Client storage: `localStorage` key `sikat_session_token` — `src/lib/auth-client.ts`
  - Session duration: 30 days (hardcoded)
  - Token format: `tok_` + `Math.random().toString(36)` (insecure — see CONCERNS.md)

**OAuth Integrations:**
- None

## Monitoring & Observability

**Error Tracking:**
- None (console.log/console.error only)

**Analytics:**
- None

**Logs:**
- stdout/stderr only via console methods

## CI/CD & Deployment

**Hosting:**
- Google AI Studio — App ID `3f1a33de-9427-4e85-a5ba-c581657719b7`
  - View URL: configured in `metadata.json`
  - Deployment: Managed by AI Studio platform

**CI Pipeline:**
- Not detected (no `.github/workflows/`, no CI config files)

## Environment Configuration

**Development:**
- Required env vars: `DATABASE_URL`
- Optional: `GEMINI_API_KEY`, `APP_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Secrets location: `.env` file (gitignored)
- Template: `.env.example`
- Note: `server.ts` falls back to hardcoded DATABASE_URL if env not set

**Production:**
- Environment managed by Google AI Studio deployment platform

## Firebase (Present But Inactive)

Firebase is configured but not used for data operations — all data uses PostgreSQL:
- Config: `firebase-applet-config.json` (project `gen-lang-client-0660753479`)
- Blueprint: `firebase-blueprint.json` (Firestore schema definitions)
- Rules: `firestore.rules` (security rules for Firestore)
- Package: `firebase` 12.14.0 in `package.json`
- Status: **Configuration remnant** — PostgreSQL is the active database

## Unused Dependencies (Present in package.json)

- `firebase` 12.14.0 — Config files present but no runtime Firebase calls
- `better-auth` 1.6.16 — Custom auth implemented instead
- `better-sqlite3` 12.10.0 — PostgreSQL used, not SQLite
- `@google/genai` 2.4.0 — No Gemini calls in codebase

---

*Integration audit: 2026-06-12*
*Update when adding/removing external services*
