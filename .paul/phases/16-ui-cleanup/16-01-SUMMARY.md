---
phase: 16-ui-cleanup
plan: 01
subsystem: ui
tags: [react, dashboard, navigation, recharts, cleanup]

requires:
  - phase: 12-dashboard-ui-polish
    provides: Dashboard UI yang dipolish sebagai base untuk perubahan ini

provides:
  - Dashboard tanpa card Rincian Per Akun Talang
  - Navigasi 3-item (tanpa Laporan)
  - recharts diuninstall dari dependencies

affects: []

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - src/pages/Dashboard.tsx
    - src/App.tsx
    - src/components/Layout.tsx
  deleted:
    - src/pages/Laporan.tsx

key-decisions:
  - "Hapus Laporan.tsx sepenuhnya — informasi redundan, sudah cukup di halaman lain"
  - "Hapus recharts sekaligus — hanya dipakai Laporan.tsx, 39 packages removed"

patterns-established: []

duration: ~10min
started: 2026-06-14T00:00:00Z
completed: 2026-06-14T00:00:00Z
---

# Phase 16 Plan 01: UI Cleanup Summary

**Hapus card "Rincian Per Akun Talang" dari Dashboard, hapus halaman Laporan beserta route/nav, uninstall recharts (39 packages removed).**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 min |
| Tasks | 3/3 completed |
| Files modified | 3 modified, 1 deleted |
| Packages removed | 39 (recharts + dependencies) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Rincian Per Akun Talang dihapus dari Dashboard | Pass | Card dihapus, kalkulasi `talangBalances` tetap utuh untuk mini stats |
| AC-2: Halaman Laporan tidak bisa diakses | Pass | File deleted, route `/laporan` dihapus dari App.tsx, nav item dihapus dari Layout.tsx |
| AC-3: recharts tidak ada di dependencies | Pass | `npm ls recharts` → `(empty)`, `tsc --noEmit` clean |

## Accomplishments

- Card "Rincian Per Akun Talang" dihapus dari Dashboard; hero card + mini stats + recent transactions tetap intact
- Halaman Laporan (Laporan.tsx) dihapus sepenuhnya — route, nav item, dan import dibersihkan
- Bottom nav tersisa 3 item: Beranda · Kas Rekap · Dana Talang
- recharts di-uninstall (39 packages); build TypeScript clean tanpa error

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/pages/Dashboard.tsx` | Modified | Hapus Rincian Per Akun Talang card + inner space-y-4 wrapper |
| `src/pages/Laporan.tsx` | Deleted | Hapus halaman Laporan sepenuhnya |
| `src/App.tsx` | Modified | Hapus import Laporan + Route `/laporan` |
| `src/components/Layout.tsx` | Modified | Hapus nav item Laporan, BarChart2 import, case '/laporan' di getPageTitle |
| `package.json` | Modified | recharts di-uninstall (npm uninstall recharts) |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Hapus recharts sepenuhnya | Hanya dipakai Laporan.tsx; setelah halaman dihapus, dependency menjadi dead weight | 39 packages removed, bundle lebih ringan |
| Pertahankan kalkulasi `talangBalances` di Dashboard | Masih dipakai untuk `totalTalangAktif`, `saldoBersih`, `talangPct`, `saldoPct` di mini stats cards | Mini stats tetap akurat |

## Deviations from Plan

None — plan dieksekusi tepat sesuai spesifikasi, tanpa deviasi.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- Dashboard layout lebih ringkas: hero + mini stats + recent transactions
- Nav bar 3-item lebih clean dan fokus
- No orphan dependencies

**Concerns:**
- `src/components/ui/tabs.tsx` kini unused (hanya dipakai Laporan.tsx) — biarkan, bukan blocker
- `format` dari `date-fns` di Dashboard.tsx sudah unused sebelum phase ini — bukan scope, bukan blocker

**Blockers:** None

---
*Phase: 16-ui-cleanup, Plan: 01*
*Completed: 2026-06-14*
