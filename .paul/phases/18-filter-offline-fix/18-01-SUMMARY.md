---
phase: 18-filter-offline-fix
plan: 01
subsystem: pwa, ui
tags: [workbox, service-worker, navigateFallback, offline, filter]

requires:
  - phase: 03-pwa-vercel
    provides: vite-plugin-pwa + Workbox generateSW setup yang jadi dasar config ini

provides:
  - Workbox navigateFallback yang benar untuk SPA routing
  - offline.html retry yang navigate ke root (bukan loop)
  - Filter buttons Kas & Talang tanpa count badge

affects: deployment, pwa-behavior

tech-stack:
  added: []
  patterns:
    - navigateFallback ke /index.html untuk SPA — bukan offline page

key-files:
  modified:
    - vite.config.ts
    - public/offline.html
    - src/pages/Kas.tsx
    - src/pages/Talang.tsx

key-decisions:
  - "navigateFallback: '/index.html' — SPA fallback benar; offline.html bukan navigateFallback yang tepat"
  - "navigateFallbackDenylist menggantikan Allowlist — lebih safe, exclude /api/ dan /offline.html"
  - "window.location.href='/' menggantikan reload() — navigate ke root, bukan loop"

patterns-established:
  - "navigateFallback SELALU ke /index.html untuk SPA React; offline handling di React level"

duration: ~15min
started: 2026-06-14T00:00:00Z
completed: 2026-06-14T00:15:00Z
---

# Phase 18 Plan 01: Filter Cleanup + PWA Offline Fix — Summary

**Bug kritis Workbox navigateFallback diperbaiki: SPA routes tidak lagi di-serve offline.html saat online; retry offline.html kini navigate ke root; filter buttons Kas & Talang menjadi label murni tanpa badge count.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~15 menit |
| Tasks | 3/3 completed |
| Files modified | 4 |
| Deviations | 0 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: SPA routes tidak trigger offline page | Pass | navigateFallback → /index.html; denylist exclude /api/ dan /offline.html |
| AC-2: Retry button navigate ke root | Pass | onclick → `window.location.href = '/'` |
| AC-3: Auto-reconnect navigate ke root | Pass | online listener → `window.location.href = '/'` |
| AC-4: Filter Kas tanpa count badge | Pass | 3 const + badge `<span>` dihapus; tsc clean |
| AC-5: Filter Talang tanpa count badge | Pass | 4 const + badge `<span>` dihapus; tsc clean |

## Accomplishments

- **Root cause fix:** `navigateFallback: '/offline.html'` → `'/index.html'` — penyebab utama user tiba-tiba masuk offline page padahal masih online
- **Loop fix:** `window.location.reload()` → `window.location.href = '/'` di dua tempat (button + online listener) — penyebab user tidak bisa kembali ke app
- **Design system alignment:** offline.html background `#0f172a` → `#050811`, tombol `#2563eb` → `#00e5a3` + `color: #050811`
- **UI cleanup:** Hapus 7 const count + 2 badge `<span>` section dari Kas.tsx & Talang.tsx; filter buttons menjadi label murni

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `vite.config.ts` | Modified | navigateFallback + navigateFallbackDenylist fix |
| `public/offline.html` | Modified | Retry logic fix + warna design system |
| `src/pages/Kas.tsx` | Modified | Hapus countAll/countPemasukan/countPengeluaran + badge span |
| `src/pages/Talang.tsx` | Modified | Hapus countAll/countBaru/countPelunasan/countTransfer + badge span |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| navigateFallback → '/index.html' | SPA routing convention yang benar; offline.html sebagai navigateFallback menyebabkan false positives | SPA routes (/kas, /talang) di-serve index.html → React Router handle |
| navigateFallbackDenylist menggantikan Allowlist | Denylist lebih safe — hanya exclude yang tidak boleh (API + offline.html); Allowlist regex lama sudah tidak relevan | /api/* dan /offline.html tidak di-intercept sebagai SPA navigation |
| href='/' bukan reload() | reload() me-loop ke offline.html karena SW intercept URL yang sama | Kembali ke app bekerja dari halaman offline |

## Deviations from Plan

Tidak ada — plan dieksekusi persis sesuai spesifikasi.

## Issues Encountered

Tidak ada.

## Next Phase Readiness

**Ready:**
- PWA service worker config benar untuk production deploy
- Offline recovery path berfungsi
- Filter UI bersih untuk iterasi UI selanjutnya

**Concerns:**
- Perubahan vite.config.ts (Workbox) baru efektif setelah build baru di-deploy ke Vercel (service worker lama akan tetap aktif hingga update)
- User yang masih punya SW lama perlu refresh / clear cache untuk mendapat fix

**Blockers:** Tidak ada

---
*Phase: 18-filter-offline-fix, Plan: 01*
*Completed: 2026-06-14*
