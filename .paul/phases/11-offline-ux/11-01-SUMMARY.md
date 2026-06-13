---
phase: 11-offline-ux
plan: 01
subsystem: ui
tags: [pwa, offline, service-worker, react]

requires: []
provides:
  - offline.html auto-reconnect via window.online event
  - tombol "Coba Lagi" di halaman offline
  - ReloadPrompt toast terlihat di atas navbar

affects: []

tech-stack:
  added: []
  patterns: []

key-files:
  modified:
    - public/offline.html
    - src/components/ReloadPrompt.tsx

key-decisions:
  - "Auto-reload langsung (bukan banner konfirmasi) — simpel dan sesuai untuk mobile PWA"

patterns-established: []

duration: ~5min
started: 2026-06-13T00:00:00Z
completed: 2026-06-13T00:05:00Z
---

# Phase 11 Plan 01: Offline UX Fix — Summary

**offline.html mendapat auto-reconnect listener + tombol "Coba Lagi"; ReloadPrompt z-index diperbaiki dari z-30 ke z-50 sehingga toast tidak tertutup navbar.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~5 min |
| Tasks | 2 completed |
| Files modified | 2 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Auto-reconnect saat koneksi pulih | Pass | `window.addEventListener('online', reload)` — aktif segera saat koneksi tersedia |
| AC-2: Tombol "Coba Lagi" tersedia | Pass | `<button class="retry-btn" onclick="reload()">` dengan styling inline |
| AC-3: ReloadPrompt terlihat di atas navbar | Pass | `z-50` > navbar `z-40` |

## Accomplishments

- `offline.html` kini self-contained: user tidak perlu refresh manual saat koneksi pulih
- Tombol retry tersedia sebagai fallback manual (event `online` bisa delay di beberapa browser)
- ReloadPrompt (update notification + offline ready toast) tidak lagi tertutup navbar — deferred issue dari Phase 09 terselesaikan

## Files Created/Modified

| File | Change | Detail |
|------|--------|--------|
| `public/offline.html` | Modified | Tambah `.retry-btn` CSS + button + script online listener |
| `src/components/ReloadPrompt.tsx` | Modified | `z-30` → `z-50` |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Auto-reload langsung (bukan banner "Koneksi pulih") | Simpel; tidak ada state yang perlu dijaga; sesuai perilaku PWA standar | User langsung kembali ke app saat online |

## Deviations from Plan

None — plan dieksekusi persis seperti yang dispecifikasikan.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- PWA offline UX lengkap: fallback page + auto-reconnect + retry button + SW update toast terlihat

**Concerns:**
- InstallPrompt (fixed bottom-6 right-6 z-40) masih bisa overlap navbar di beberapa layout — belum diaddress (deferred dari Phase 09, bukan scope phase ini)

**Blockers:** None

---
*Phase: 11-offline-ux, Plan: 01*
*Completed: 2026-06-13*
