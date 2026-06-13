# ROADMAP — SIKAT-new

## Milestone v0.1 — Codebase Cleanup ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 01 — Firebase Cleanup ✅
**Status:** Complete (2026-06-12) | **Plans:** 1/1
- firebase@12.14.0 diuninstall (69 packages removed)
- firebase-applet-config.json, firebase-blueprint.json, firestore.rules dihapus
- .paul/codebase docs diperbarui

---

## Milestone v0.2 — Unused Dependencies Cleanup ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 02 — Unused Dependencies Cleanup ✅
**Status:** Complete (2026-06-12) | **Plans:** 1/1
- better-auth, better-sqlite3, @google/genai, @types/better-sqlite3 diuninstall (93 packages)
- .env.example dibersihkan dan DATABASE_URL disanitasi
- INTEGRATIONS.md diperbarui

---

## Milestone v0.3 — PWA + Deploy to Vercel ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 03 — PWA + Vercel Deploy ✅
**Status:** Complete (2026-06-12) | **Plans:** 2/2
- Plan 03-01: Vercel Deploy — server.ts refactor, api-handler.ts, vercel.json, live di https://sikat-new.vercel.app
- Plan 03-02: PWA Implementation — vite-plugin-pwa, service worker, manifest, icons, offline support

---

## Milestone v0.4 — Security Fixes ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 04 — Token Security ✅
**Status:** Complete (2026-06-12) | **Plans:** 1/1
- Plan 04-01: `Math.random()` → `crypto.randomBytes` di 7 lokasi (session tokens + entity IDs) di server.ts

---

## Milestone v0.6 — Color System ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 06 — Color System ✅
**Status:** Complete (2026-06-12) | **Plans:** 3/3
- Plan 06-01: 25 semantic tokens (@theme Tailwind v4) + 5 UI components + SplashScreen migrated
- Plan 06-02: Layout.tsx + Login.tsx — 19 hex/emerald-* removed; 2 WCAG violations fixed
- Plan 06-03: Dashboard, Kas, Talang, Laporan — semua emerald-*/hex → brand-*; recharts via tokens.ts

---

## Milestone v0.7 — Spacing & Typography Polish ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 07 — Spacing, Typography & Alignment ✅
**Status:** Complete (2026-06-12) | **Plans:** 3/3
- Plan 07-01: 5 custom text utilities (@theme) + 177 arbitrary font-size → semantic class
- Plan 07-02: Card padding 3-tier (p-5/p-4/p-3) + space-y-4 seragam + gap-3 stat grids
- Plan 07-03: font-extrabold→black (24×) + px-1 section headers dihapus (4×)

---

## Milestone v0.5 — Design Polish ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 05 — PWA Icons + Splash Screen ✅
**Status:** Complete (2026-06-12) | **Plans:** 2/2
- Plan 05-01: SVG icon design + @vite-pwa/assets-generator setup + manifest/index.html update
- Plan 05-02: React SplashScreen component (Framer Motion) + App.tsx integration

---

## Milestone v0.8 — Logo & Branding Polish ✅

**Status:** Complete (2026-06-13)
**Progress:** 1/1 phases complete — 100%

### Phase 08 — Logo & Branding ✅
**Status:** Complete (2026-06-13) | **Plans:** 1/1
- Plan 08-01: Logo di header Layout + Login, SplashScreen SVG redesign, logo-mono.svg, favicon auto-generate, Apple Touch verification

---

## Milestone v0.9 — PWA Installation Polish ✅

**Status:** Complete (2026-06-13)
**Progress:** 1/1 phases complete — 100%

### Phase 09 — PWA Installation Polish ✅
**Status:** Complete (2026-06-13) | **Plans:** 2/2
- Plan 09-01: Custom install prompt dengan `beforeinstallprompt` + `useRegisterSW` + offline fallback page + update notification toast
- Plan 09-02: Manifest categories + favicon consolidation + INTEGRATIONS.md PWA section
- Plan 09-02: Manifest enhancements (categories, screenshots) + favicon consolidation + INTEGRATIONS.md PWA section

---

## Milestone v0.10 — Vercel Deployment Fix ✅

**Status:** Complete (2026-06-13)
**Progress:** 1/1 phases complete — 100%

### Phase 10 — API Routing Fix ✅
**Status:** Complete (2026-06-13) | **Plans:** 1/1
- Plan 10-01: Split routing (`routes` + `outputDirectory:dist`): `/api/*` → serverless function, static via CDN, SPA fallback
- api-handler.ts dibersihkan dari express.static/sendFile — function murni API-only

---

---

## Milestone v0.11 — Offline UX Fix ✅

**Status:** Complete (2026-06-13)
**Progress:** 1/1 phases complete — 100%

### Phase 11 — Offline UX Fix ✅
**Status:** Complete (2026-06-13) | **Plans:** 1/1
- Plan 11-01: auto-reconnect (`window.online`) + tombol "Coba Lagi" di offline.html + ReloadPrompt z-index z-30→z-50

---

---

## Milestone v0.12 — Dashboard UI Polish ✅

**Status:** Complete (2026-06-13)
**Progress:** 1/1 phases complete — 100%

### Phase 12 — Dashboard UI Polish ✅
**Status:** Complete (2026-06-13) | **Plans:** 1/1
- Plan 12-01: 5 bug fungsional (progress bar edge case, warna Pelunasan, truncation account cards + metadata) + 4 polish (break-words, spinner track, min-height, aria-hidden) — 0 deviasi

---

*Last updated: 2026-06-13 — Milestone v0.12 complete*
