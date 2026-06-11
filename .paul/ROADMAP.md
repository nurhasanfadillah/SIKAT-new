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

## Milestone v0.6 — Color System (In Progress)

**Status:** In progress
**Progress:** 0/1 phases complete — 0%

### Phase 06 — Color System 🔄
**Status:** Planning | **Plans:** 0/3
- Plan 06-01: Token foundation (@theme) + UI components (button, input, tabs, card, SplashScreen)
- Plan 06-02: Layout.tsx + Login.tsx migration
- Plan 06-03: Pages — Dashboard, Kas, Talang, Laporan + CHART_COLORS

---

## Milestone v0.5 — Design Polish ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 05 — PWA Icons + Splash Screen ✅
**Status:** Complete (2026-06-12) | **Plans:** 2/2
- Plan 05-01: SVG icon design + @vite-pwa/assets-generator setup + manifest/index.html update
- Plan 05-02: React SplashScreen component (Framer Motion) + App.tsx integration
