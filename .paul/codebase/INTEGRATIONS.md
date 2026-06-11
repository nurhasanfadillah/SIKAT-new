# External Integrations

**Analysis Date:** 2026-06-12

## APIs & External Services

**External APIs not detected:**
- No AI/ML services (active)
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
- Custom implementation in `server.ts`
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
- Optional: `APP_URL`
- Secrets location: `.env` file (gitignored)
- Template: `.env.example`
- Note: `server.ts` falls back to hardcoded DATABASE_URL if env not set

**Production:**
- Environment managed by Google AI Studio deployment platform

---

*Integration audit: 2026-06-12 (updated after v0.2 cleanup)*
*Update when adding/removing external services*
