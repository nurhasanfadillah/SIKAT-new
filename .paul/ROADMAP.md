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

---

## Milestone v0.4 — Security Fixes ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 04 — Token Security ✅
**Status:** Complete (2026-06-12) | **Plans:** 1/1
- Plan 04-01: `Math.random()` → `crypto.randomBytes` di 7 lokasi (session tokens + entity IDs) di server.ts
