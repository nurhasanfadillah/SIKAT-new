---
phase: 10-api-routing-fix
plan: 01
subsystem: infra
tags: [vercel, express, routing, deployment, serverless]

requires:
  - phase: 03-vercel-deployment
    provides: initial Vercel setup (api-handler.ts, vercel.json baseline)

provides:
  - vercel.json dengan split routing (API → function, static → CDN, SPA fallback)
  - api-handler.ts murni API-only (tanpa static file serving)

affects: [deployment, production-stability]

tech-stack:
  added: []
  patterns: ["Split routing: /api/* → serverless function, static via outputDirectory CDN"]

key-files:
  modified: [vercel.json, api-handler.ts]

key-decisions:
  - "routes (bukan rewrites): rewrites tidak override Vercel API file detection"
  - "outputDirectory:dist + handle:filesystem: CDN melayani static assets langsung"
  - "Hapus express.static dari function: dist/ tidak accessible dari serverless context"

patterns-established:
  - "Serverless function = API-only. Static files = CDN responsibility, bukan function."

duration: ~5min
started: 2026-06-13T00:00:00Z
completed: 2026-06-13T00:00:00Z
---

# Phase 10 Plan 01: API Routing Fix Summary

**Split routing Vercel diperbaiki: `/api/*` ke serverless function, static assets via CDN, SPA fallback — menyelesaikan konflik antara DB connection overwhelm dan static file crash.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~5 menit |
| Tasks | 2 completed |
| Files modified | 2 |
| Qualify results | PASS / PASS |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: API Routes Berfungsi di Production | Ready* | Routing `/api/*` → function dikonfigurasi. Verifikasi final perlu deploy production. |
| AC-2: Static Files via Vercel CDN | Ready* | `outputDirectory:dist` + `handle:filesystem` — CDN melayani static assets. |
| AC-3: SPA Navigation Berfungsi | Ready* | SPA fallback `/(.*) → /index.html` di-routing oleh Vercel. |

*Ready = konfigurasi code sudah benar; verifikasi akhir membutuhkan deployment ke Vercel production.

## Accomplishments

- `vercel.json` diganti dari single catch-all `rewrites` ke 3-entry split `routes` dengan `outputDirectory: dist`
- `api-handler.ts` dibersihkan dari dead code: `import path`, `distPath`, `express.static()`, `sendFile()` catch-all — function sekarang murni API-handler
- Root cause dua masalah yang saling bertentangan (DB overwhelm vs static crash) diselesaikan sekaligus dengan arsitektur yang benar

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `vercel.json` | Modified | Split routing: `/api/*` → function, filesystem → CDN, `/(.*)`→ SPA fallback |
| `api-handler.ts` | Modified | Hapus static file serving — function murni API-only |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Gunakan `routes` bukan `rewrites` | `rewrites` tidak override Vercel pengecekan file API; routes lebih eksplisit | Routing lebih predictable |
| `handle:filesystem` sebagai middle entry | Vercel CDN cek `dist/` untuk static files sebelum fallback SPA | Static assets tidak masuk ke function |
| Hapus `express.static` dari function | `dist/` tidak tersedia di serverless context dengan `outputDirectory: dist` | Tidak ada crash karena path tidak ditemukan |

## Deviations from Plan

None — plan dieksekusi sesuai spec.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- Deployment config benar secara struktural
- Function entry point bersih, tidak ada dead code
- `DATABASE_URL` masih perlu dikonfigurasi di Vercel dashboard (environment variable) — sudah di-noted di STATE.md sejak fase sebelumnya

**Concerns:**
- Verifikasi production membutuhkan actual deployment ke Vercel (deploy, cek API, cek static, cek SPA navigation)
- `DATABASE_URL` di Vercel dashboard harus dikonfirmasi sebelum testing production

**Blockers:**
- None untuk code. Deploy + test production = human verification step.

---
*Phase: 10-api-routing-fix, Plan: 01*
*Completed: 2026-06-13*
