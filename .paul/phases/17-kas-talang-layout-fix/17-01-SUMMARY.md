---
phase: 17-kas-talang-layout-fix
plan: 01
subsystem: ui
tags: [layout, mobile, viewport, pwa, tailwind]

requires:
  - phase: 14-header-mobile-fix
    provides: safe-area-inset handling di Layout.tsx header

provides:
  - h-svh container (keyboard tidak resize viewport)
  - outer scroll tanpa inner max-h constraint di Kas.tsx dan Talang.tsx

affects: [17-02-kas-card-redesign, 17-03-talang-card-redesign]

tech-stack:
  added: []
  patterns: [svh untuk keyboard-safe container, outer scroll sebagai single scroll context]

key-files:
  modified:
    - src/components/Layout.tsx
    - src/pages/Kas.tsx
    - src/pages/Talang.tsx

key-decisions:
  - "svh bukan dvh: keyboard overlay bukan resize — container tidak bergerak"
  - "Hapus inner scroll constraint: outer main pb-20 cukup clearance untuk floating nav"

patterns-established:
  - "Container height: h-svh di mobile, md:h-[860px] di desktop"
  - "Scroll context: satu outer main overflow-y-auto, tidak ada nested overflow di page content"

duration: ~5min
started: 2026-06-14T00:00:00Z
completed: 2026-06-14T00:00:00Z
---

# Phase 17 Plan 01: Keyboard Viewport + Bottom Nav Overlap Bug Fixes

**`h-dvh`→`h-svh` di Layout.tsx + hapus `max-h-[500px] overflow-y-auto` dari Kas.tsx dan Talang.tsx — dua bug mobile UX teratasi tanpa perubahan visual.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~5 menit |
| Tasks | 3 completed |
| Files modified | 3 |
| tsc --noEmit | Clean (0 errors) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Keyboard tidak resize container | Pass | `svh` = small viewport height, fixed tanpa keyboard |
| AC-2: Last item Kas Rekap visible di atas nav | Pass | Outer `pb-20` (80px) > floating nav height (~76px) |
| AC-3: Last item Dana Talang visible di atas nav | Pass | Sama, termasuk saat form edit aktif |

## Accomplishments

- Keyboard virtual overlay container dari bawah (bukan shrink) — native-app behavior di mobile PWA
- Transaction list di Kas dan Talang sekarang punya single outer scroll context — lebih konsisten dan predictable
- Conditional template literal di Talang.tsx (`${showForm ? 'max-h-[300px]' : 'max-h-[500px]'}`) dihapus — layout tidak lagi bergantung pada JS state untuk scroll area

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/components/Layout.tsx` | Modified | `min-h-dvh`→`min-h-svh` (line 32), `h-dvh`→`h-svh` (line 38) |
| `src/pages/Kas.tsx` | Modified | Hapus `max-h-[500px] overflow-y-auto` dari list wrapper (line 709) |
| `src/pages/Talang.tsx` | Modified | Hapus conditional max-h template literal, ganti static string (line 1158) |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `svh` bukan `dvh` | `dvh` = dynamic viewport (resize saat keyboard muncul), `svh` = small/stable viewport (keyboard tidak mengubah nilai ini) | Container tidak bergerak saat keyboard virtual tampil |
| Hapus inner scroll sepenuhnya | Outer `<main className="flex-1 overflow-y-auto ... pb-20">` sudah menjadi single scroll context; inner scroll menciptakan scroll-in-scroll yang confusing | Semua scroll di page ditangani satu context, last item selalu visible |

## Deviations from Plan

None — plan dieksekusi persis sebagaimana tertulis.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- Layout baseline stabil — `svh` + single scroll context siap untuk card redesign
- 17-02 dan 17-03 bisa langsung tackle card layout tanpa khawatir scroll bug

**Concerns:**
- `scrollIntoView` di handleStartEdit masih valid (target element ada di outer scroll context) — tapi perlu diverifikasi saat 17-02/17-03 mengubah card structure

**Blockers:** None

---
*Phase: 17-kas-talang-layout-fix, Plan: 01*
*Completed: 2026-06-14*
