---
phase: 03-pwa-vercel-deploy
plan: 01
subsystem: infra
tags: [vercel, express, serverless, postgresql, neondb, deployment]

requires: []
provides:
  - Express app sebagai Vercel serverless function (api/index.js)
  - server.ts refactored: createApp() exportable tanpa side effects
  - DATABASE_URL wajib dari environment variable
  - App live di https://sikat-new.vercel.app
affects: [03-02-pwa, v0.4-security]

tech-stack:
  added: []
  patterns:
    - "App factory pattern: createApp() returns { app, pool } tanpa side effects"
    - "Serverless adapter: api-handler.ts di-bundle ke api/index.js via esbuild"
    - "Conditional server start: if (!process.env.VERCEL) startServer()"

key-files:
  created:
    - api-handler.ts
    - api/index.js
    - vercel.json
  modified:
    - server.ts
    - package.json

key-decisions:
  - "api-handler.ts (root) dikompilasi ke api/index.js via esbuild (bukan api/index.ts langsung)"
  - "esbuild --packages=external memastikan node_modules tidak di-bundle ke serverless function"

patterns-established:
  - "createApp() adalah pure factory — tidak ada listen(), initDatabase(), atau Vite di dalam-nya"
  - "initDatabase dan seedDefaultUser di-call sekali via singleton pattern di api-handler.ts"

duration: ~30min
started: 2026-06-12T00:00:00Z
completed: 2026-06-12T00:30:00Z
---

# Phase 03 Plan 01: Vercel Deploy Summary

**Express + PostgreSQL app di-deploy ke Vercel serverless via app factory pattern dan esbuild pre-bundling.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~30 min |
| Tasks | 2/2 completed + checkpoint resolved |
| Files modified | 5 |
| Deploy | Sukses (1 attempt) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: createApp() dapat diimport tanpa side effects | Pass | api-handler.ts import createApp() tanpa trigger listen/initDB/Vite |
| AC-2: DATABASE_URL wajib dari env var | Pass | server.ts throw Error jika DATABASE_URL tidak di-set |
| AC-3: Local development tetap berjalan | Pass | npm run lint (tsc --noEmit) clean; startServer() tetap berjalan jika tidak ada VERCEL env |
| AC-4: App dapat di-deploy dan diakses via Vercel | Pass | https://sikat-new.vercel.app live; /api/user/profile → 401; /api/auth/login → token |

## Accomplishments

- App SIKAT sekarang accessible publik di https://sikat-new.vercel.app
- server.ts direfactor ke app factory pattern — `createApp()` pure, `startServer()` terpisah
- Hardcoded DATABASE_URL dihapus dari server.ts (security improvement, v0.4 concern resolved early)
- Vercel serverless handler via esbuild pre-bundling — tidak perlu Vercel untuk compile TypeScript

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `server.ts` | Modified | Refactor: createApp() factory, DATABASE_URL env-only, conditional startServer() |
| `api-handler.ts` | Created | Sumber TypeScript untuk Vercel serverless handler |
| `api/index.js` | Created | Compiled bundle dari api-handler.ts via esbuild |
| `vercel.json` | Created | Routing semua request ke /api handler |
| `package.json` | Modified | Tambah vercel-build script; update build command untuk bundle api-handler.ts |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| api-handler.ts di root → dikompilasi ke api/index.js | Vercel lebih reliable dengan JS bundle pre-compiled daripada TypeScript source; esbuild sudah ada di devDependencies | api/index.js adalah artifact build, bukan source |
| esbuild --packages=external untuk serverless bundle | Node modules tersedia di Vercel runtime; tidak perlu di-bundle ke function untuk menghindari cold start besar | api/index.js ~31KB, fast cold start |
| Singleton pattern di api-handler.ts (`let app = null`) | initDatabase dan seedDefaultUser hanya boleh dipanggil sekali per instance; Vercel dapat reuse function instance | Database tidak di-init ulang di setiap request |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 0 | — |
| Scope additions | 0 | — |
| Approach deviation | 1 | Fungsional identik |

### Approach Deviation

**1. File naming: api/index.ts → api-handler.ts + api/index.js**
- **Plan spec:** Buat `api/index.ts` sebagai TypeScript source di dalam direktori `api/`
- **Implementasi:** `api-handler.ts` di root, dikompilasi ke `api/index.js` via esbuild
- **Alasan:** esbuild build step sudah ada di npm scripts; pre-bundling lebih compatible dengan Vercel daripada TypeScript source langsung
- **Impact:** Tidak ada — Vercel memanggil `api/index.js` yang sama, fungsi identik

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| DATABASE_URL hanya di-set untuk Production di Vercel Dashboard | Cukup untuk initial deploy; Preview/Development bisa ditambah nanti jika dibutuhkan |

## Next Phase Readiness

**Ready:**
- App live di Vercel — Plan 03-02 (PWA) bisa langsung deploy setelah implementasi
- createApp() exportable — Plan 03-02 tidak perlu menyentuh server.ts
- vercel.json sudah ada — Plan 03-02 cukup tambah build output PWA assets

**Concerns:**
- Build script menjalankan `vercel-build` dua kali di Vercel (sekali di `build`, sekali di `vercel-build`) — tidak menyebabkan error tapi inefficient; bisa di-optimize di v0.4
- Chunk size warning dari Vite (901KB) — untuk MVP masih acceptable, optimasi bisa di-defer

**Blockers:**
- None — Plan 03-02 (PWA) siap di-execute

---
*Phase: 03-pwa-vercel-deploy, Plan: 01*
*Completed: 2026-06-12*
