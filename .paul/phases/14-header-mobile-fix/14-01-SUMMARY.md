---
phase: 14-header-mobile-fix
plan: 01
subsystem: ui
tags: [pwa, mobile, ios, safe-area, tailwind, header]

requires:
  - phase: 06-color-system
    provides: brand-500 (#00e5a3) dan surface-base (#050811) token — dipakai untuk theme_color dan background_color
  - phase: 07-spacing-typography
    provides: type scale text-nano/micro/label/body/value — text-value dipakai menggantikan text-[15px]

provides:
  - PWA theme_color/background_color diperbarui ke brand teal
  - iOS PWA edge-to-edge (viewport-fit=cover + black-translucent)
  - Header safe-area-inset-top padding untuk iPhone notch/Dynamic Island
  - Header flex layout tidak overflow di 360px Android
  - text-[15px] arbitrary dihapus dari Layout.tsx

affects: future-ui-phases

tech-stack:
  added: []
  patterns:
    - "iOS edge-to-edge: viewport-fit=cover + black-translucent + pt-[max(env(safe-area-inset-top),Nrem)]"
    - "Header flex anti-overflow: flex-1 min-w-0 overflow-hidden (left) + flex-shrink-0 (right)"

key-files:
  modified:
    - vite.config.ts
    - index.html
    - src/components/Layout.tsx

key-decisions:
  - "iOS edge-to-edge approach: black-translucent + viewport-fit=cover (vs. default)"
  - "Safe area via Tailwind arbitrary: pt-[max(env(safe-area-inset-top),1.25rem)] — tidak perlu CSS utility baru"

patterns-established:
  - "Safe-area header: pt-[max(env(safe-area-inset-top),1.25rem)] md:pt-9 — min 20px, auto-expand saat ada notch"
  - "flex-1 min-w-0 overflow-hidden pada left group header supaya shrinkable"
  - "flex-shrink-0 pada right group header supaya badge+action selalu visible"

duration: ~10min
started: 2026-06-14T00:00:00Z
completed: 2026-06-14T00:10:00Z
---

# Phase 14 Plan 01: Header Mobile Fix Summary

**5 bug dan inkonsistensi di header mobile diperbaiki: theme_color biru → teal, iOS PWA status bar white → edge-to-edge dark, safe-area-inset-top padding, header flex overflow di 360px Android, dan text-[15px] arbitrary dihapus.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 menit |
| Tasks | 3/3 selesai |
| Files modified | 3 |
| Deviations | 0 |
| TypeScript errors | 0 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Brand colors konsisten di PWA | Pass | theme_color='#00e5a3', background_color='#050811' di vite.config.ts; meta='#00e5a3' di index.html |
| AC-2: iOS PWA status bar dark | Pass | apple-mobile-web-app-status-bar-style='black-translucent' di index.html |
| AC-3: Header safe area | Pass | pt-[max(env(safe-area-inset-top),1.25rem)] md:pt-9 di Layout.tsx |
| AC-4: Header tidak overflow di 360px | Pass | flex-1 min-w-0 overflow-hidden (left group) + flex-shrink-0 (right group) |
| AC-5: Tidak ada arbitrary pixel size di header | Pass | text-[15px] → text-value di SIKAT branding span |

## Accomplishments

- PWA manifest dan meta theme-color sekarang konsisten dengan brand teal (#00e5a3) — terlihat di Android Chrome tab dan PWA splash screen
- iOS PWA install experience diperbaiki: app extend ke full screen (viewport-fit=cover), status bar transparan di atas dark background (black-translucent)
- Header safe-area-inset-top menggunakan CSS `max()` function via Tailwind arbitrary value — otomatis 20px di device tanpa notch, naik sesuai notch/Dynamic Island
- Header layout aman di 360px viewport (umum Redmi/Samsung Galaxy A entry-level di pasar Indonesia)
- SIKAT branding `<SIKAT>` menggunakan text-value (13px) — konsisten dengan type scale Phase 07

## Files Modified

| File | Change | Detail |
|------|--------|--------|
| `vite.config.ts` | Modified | theme_color '#2563EB'→'#00e5a3', background_color '#2563EB'→'#050811' |
| `index.html` | Modified | theme-color '#2563EB'→'#00e5a3', +viewport-fit=cover, status-bar-style default→black-translucent |
| `src/components/Layout.tsx` | Modified | pt-5→pt-[max(env(safe-area-inset-top),1.25rem)], +flex-1 min-w-0 overflow-hidden, +min-w-0 text col, +flex-shrink-0 right group, text-[15px]→text-value |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| iOS edge-to-edge (black-translucent + viewport-fit=cover) | App dark-themed PWA — light status bar sangat janggal; native dark apps semua pakai edge-to-edge | Header perlu safe-area padding (dihandle via Task 2) |
| Safe area via Tailwind arbitrary `pt-[max(...)]` | Tidak perlu utility CSS baru; Tailwind v4 support CSS function dalam arbitrary value | Satu class menangani dua kondisi: ada notch vs tidak |

## Deviations from Plan

None — plan dieksekusi persis seperti ditulis. 0 deviasi, 0 scope additions, 0 deferred items baru.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- Header mobile sekarang production-ready: brand konsisten, iOS native feel, layout aman di semua common viewport widths
- Pattern safe-area header established (`pt-[max(env(safe-area-inset-top),1.25rem)]`) — bisa dipakai future components jika ada fixed elements lain

**Concerns:**
- `env(safe-area-inset-top)` hanya dapat ditest di device fisik iOS atau Safari DevTools device simulation — tidak terlihat di desktop browser (selalu 0 di non-iOS)
- `text-xl` untuk page title h1 (Layout.tsx:83) masih menggunakan standard Tailwind, bukan custom type scale — LOW priority, tidak dimasukkan scope ini

**Blockers:**
- None

---
*Phase: 14-header-mobile-fix, Plan: 01*
*Completed: 2026-06-14*
