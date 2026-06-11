---
phase: 03-pwa-vercel-deploy
plan: 02
subsystem: infra
tags: [pwa, vite-plugin-pwa, workbox, service-worker, offline, installable]

requires:
  - phase: 03-01
    provides: App live di Vercel (sikat-new.vercel.app) — dibutuhkan untuk PWA verification
provides:
  - Service worker (sw.js) dengan Workbox offline caching
  - manifest.webmanifest dengan 3 icons (192, 512, maskable)
  - App installable sebagai PWA di Chrome/Edge
  - Offline support: static assets cached, API calls network-first
affects: [v0.4-security]

tech-stack:
  added:
    - vite-plugin-pwa@^1.3.0 (devDependency)
    - workbox (transitive, via vite-plugin-pwa)
  patterns:
    - "generateSW mode: Workbox auto-generates service worker dari glob patterns"
    - "NetworkFirst untuk /api/*: API tidak pernah served dari cache sebagai primary"
    - "autoUpdate registerType: SW update otomatis tanpa prompt ke user"

key-files:
  created:
    - public/pwa-192x192.png
    - public/pwa-512x512.png
    - public/pwa-maskable-512x512.png
    - scripts/generate-icons.mjs
  modified:
    - vite.config.ts
    - index.html
    - package.json

key-decisions:
  - "Icons dibuat via Node.js + built-in zlib (solid color PNG, #2563EB) — tidak perlu canvas/sharp"
  - "manifest.json lama di public/ dibiarkan ada tapi link-nya dihapus dari index.html"
  - "devOptions.enabled: false — SW tidak aktif saat development, hanya production"

patterns-established:
  - "Workbox globPatterns mencakup js,css,html,ico,png,svg,woff,woff2 — semua static assets"
  - "runtimeCaching: /api/* → NetworkFirst dengan 10s timeout, 50 entries max, 5 min TTL"

duration: ~20min
started: 2026-06-12T00:30:00Z
completed: 2026-06-12T00:50:00Z
---

# Phase 03 Plan 02: PWA Implementation Summary

**PWA aktif di sikat-new.vercel.app — app installable, service worker terdaftar, static assets ter-cache offline.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~20 min |
| Tasks | 2/2 completed + checkpoint approved |
| Files modified | 6 |
| Precache entries | 11 (naik dari 5 sebelum icons) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: App installable sebagai PWA | Pass | User confirmed install prompt muncul dan app terinstall |
| AC-2: Static assets ter-cache untuk offline | Pass | User confirmed halaman login tampil saat offline |
| AC-3: API calls tetap network-first | Pass | workbox runtimeCaching /api/* → NetworkFirst dikonfigurasi |

## Accomplishments

- SIKAT kini dapat diinstall sebagai app di desktop dan homescreen mobile
- Service worker aktif dengan Workbox: 11 static assets di-precache (~961 KB)
- Offline UX: halaman login tetap accessible tanpa koneksi internet
- API calls selalu ke network dahulu — tidak ada stale data di-serve dari cache

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `vite.config.ts` | Modified | Tambah VitePWA plugin dengan manifest + workbox config |
| `index.html` | Modified | Hapus manifest.json link lama; tambah PWA meta tags (theme-color, apple-touch-icon) |
| `public/pwa-192x192.png` | Created | PWA icon 192×192 (placeholder solid blue #2563EB) |
| `public/pwa-512x512.png` | Created | PWA icon 512×512 (placeholder) |
| `public/pwa-maskable-512x512.png` | Created | PWA maskable icon 512×512 |
| `package.json` | Modified | vite-plugin-pwa ditambahkan ke devDependencies |
| `scripts/generate-icons.mjs` | Created | Script generate PNG via built-in zlib |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Icon generator via Node.js + zlib built-in | canvas/sharp tidak tersedia; fetch ke placeholder service tidak reliable; zlib pure Node.js selalu tersedia | Icons valid PNG, file kecil, tidak perlu dependency tambahan |
| Hapus `<link rel="manifest" href="/manifest.json">` dari index.html | Dua manifest links = browser gunakan yang pertama (manifest.json lama yang minimal); VitePWA inject manifest.webmanifest yang lebih lengkap | dist/index.html kini hanya punya satu manifest link yang benar |
| devOptions.enabled: false | SW di dev mode sering menyebabkan caching issues saat development | Development tidak terganggu SW; production tetap dapat PWA |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Auto-fixed | 1 | Fix konflik manifest link — diperlukan |
| Approach deviation | 1 | Icon generation via zlib, fungsional identik |

### Auto-fixed Issues

**1. Duplikat manifest link di index.html**
- **Found during:** Task 2 (update index.html) — verifikasi dist/index.html
- **Issue:** index.html sudah punya `<link rel="manifest" href="/manifest.json">` dari sebelumnya; VitePWA inject manifest.webmanifest → dua manifest links di HTML
- **Fix:** Hapus link manifest.json lama dari index.html source
- **Verification:** `grep "manifest" dist/index.html` hanya tampilkan satu link (manifest.webmanifest)

### Approach Deviation

**1. Icon generation: fetch/canvas/sharp → Node.js + zlib built-in**
- **Plan spec:** Script dengan canvas API, sharp, atau fetch ke placeholder service
- **Implementasi:** `scripts/generate-icons.mjs` menggunakan `deflateSync` dari zlib built-in Node.js untuk generate valid solid-color PNG
- **Alasan:** Lebih reliable, tidak perlu network/tool eksternal, selalu tersedia
- **Impact:** Icons placeholder biru (#2563EB), valid PNG format, dapat diganti icon final di v0.4+

## Next Phase Readiness

**Ready:**
- v0.3 milestone selesai — SIKAT accessible publik di https://sikat-new.vercel.app dengan PWA support
- Foundation siap untuk v0.4 Security Fixes

**Concerns:**
- Icon placeholder (solid blue) — desain final perlu dibuat sebelum public launch yang sesungguhnya
- Build script jalankan `vercel-build` dua kali (inefficient) — bisa di-optimize di v0.4

**Blockers:**
- None — v0.3 complete, v0.4 Security Fixes siap di-plan

---
*Phase: 03-pwa-vercel-deploy, Plan: 02*
*Completed: 2026-06-12*
