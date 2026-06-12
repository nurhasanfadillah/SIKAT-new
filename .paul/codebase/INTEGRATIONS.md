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
  - Token format: `tok_` + `crypto.randomBytes(32).toString('hex')` (fixed from Math.random)

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
- **Vercel** — serverless deployment
  - Config: `vercel.json` rewrites all `/api/*` to serverless handler
  - Handler: `api/index.js` (30s max duration)
  - Build: `npm run vercel-build`
  - Static SPA served from `dist/`

**CI Pipeline:**
- Not detected (no `.github/workflows/`, no CI config files)

## PWA (Progressive Web App)

**Plugin:** vite-plugin-pwa v1.3.0 (generateSW strategy)

**Service Worker:**
- Auto-generated via Workbox at build time (`dist/sw.js`)
- `registerType: 'autoUpdate'` — automatic updates without user prompt
- Precache: 21 entries (all JS/CSS/HTML/icons)
- Runtime cache: `NetworkFirst` for `/api/*` (10s timeout, 50 entries, 300s TTL)

**Offline Support:**
- `navigateFallback: '/offline.html'` — branded fallback page when network unavailable
- Allowlist excludes `/api/*` from navigation interception

**Manifest:**
- `manifest.webmanifest` generated at build, injected into index.html
- `display: standalone` — native app experience
- Theme/bg color: `#2563EB` (brand blue)
- Categories: finance, education, productivity

**Icons:**
- Generated from `public/logo.svg` via `@vite-pwa/assets-generator` (`minimal2023Preset`)
- Sizes: 64x64, 192x192, 512x512 (standard) + 512x512 (maskable)
- Apple Touch: 180x180

**UX Components:**
- **SplashScreen** (`src/components/SplashScreen.tsx`) — Framer Motion, 2.5s display, renders before AuthProvider
- **ReloadPrompt** (`src/components/ReloadPrompt.tsx`) — toast "Versi baru tersedia" via `useRegisterSW`
- **InstallPrompt** (`src/components/InstallPrompt.tsx`) — floating install button via `beforeinstallprompt`

**Build Script:** `npm run pwa:assets` regenerates all PWA icon sizes from source SVG.

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
