---
phase: 06-color-system
plan: 02
subsystem: ui
tags: [tailwind, design-tokens, wcag, dark-theme, layout, auth]

requires:
  - phase: 06-color-system plan 01
    provides: 25 semantic color tokens (@theme), bg-brand-*, surface-*, grd-*, text-* utilities

provides:
  - Layout.tsx — bebas inline hex; nav active/inactive pakai brand-* tokens; WCAG nav label fix
  - Login.tsx — bebas inline hex dan emerald-*; focus ring solid; submit button pakai brand-* tokens

affects: [06-03, pages yang render di dalam Layout.tsx]

tech-stack:
  added: []
  patterns:
    - "bg-surface-app untuk halaman root (bukan bg-[#060a13])"
    - "bg-surface-panel untuk card/panel container (bukan bg-[#0c1221])"
    - "bg-surface-nav untuk bottom tab bar (bukan bg-[#121a2e])"
    - "from-grd-start to-grd-end untuk avatar gradient"
    - "text-text-secondary untuk inactive nav label (WCAG AAA 7.81:1)"
    - "focus:border-brand-500 solid — tanpa opacity modifier"

key-files:
  modified: [src/components/Layout.tsx, src/pages/Login.tsx]

key-decisions:
  - "text-surface-panel sebagai warna teks di avatar — hex #0c1221 adalah bg-surface-panel"
  - "violet-500 valid substitution untuk #a855f7 — nilai identik"
  - "border-white/15 untuk input border di Login — WCAG improvement dari white/5"

patterns-established:
  - "Inactive nav label: text-text-secondary (slate-400), bukan text-slate-500 — WCAG compliant"
  - "Focus ring: focus:border-brand-500 solid (tanpa opacity modifier)"
  - "Role badge: bg-brand-500/10 text-brand-300 border-brand-500/20"

duration: ~15min
started: 2026-06-12T00:00:00Z
completed: 2026-06-12T00:00:00Z
---

# Phase 06 Plan 02: Layout + Login Migration Summary

**Layout.tsx dan Login.tsx dimigrasikan penuh ke semantic tokens — 19 hardcoded hex values dihapus, emerald-* diganti brand-*, 2 WCAG violations diperbaiki.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~15 menit |
| Tasks | 2/2 completed + checkpoint approved |
| Files modified | 2 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Layout.tsx Bebas Inline Hex | **PASS** | grep kosong — 0 hex values tersisa |
| AC-2: Login.tsx Bebas Inline Hex dan emerald-* | **PASS** | grep kosong — 0 hex, 0 emerald-* tersisa |
| AC-3: WCAG Nav Label Fix | **PASS** | text-slate-500 → text-text-secondary (slate-400, 7.81:1 vs bg-surface-nav) |
| AC-4: Focus Ring Login Fix | **PASS** | focus:border-emerald-500/50 → focus:border-brand-500 solid |

## Accomplishments

- **Layout.tsx bersih**: 14 hardcoded hex + 6 emerald-* class diganti — outer wrapper, blur orbs, device container, camera notch, header, avatar gradient, role badge, nav title, SIKAT tag, bottom nav bar, nav active/inactive states, active dot indicator
- **Login.tsx bersih**: 5 hardcoded hex + 1 emerald-* class diganti — outer wrapper, blur orbs, card wrapper, avatar gradient, semua 3 input overrides, submit button, toggle link
- **WCAG upgrade**: Nav inactive label naik dari 4.21:1 (WCAG FAIL) ke 7.81:1 (AAA); focus ring opacity dihapus untuk solid visibility
- **Visual verified**: Checkpoint approved — tidak ada layout shift atau broken visual

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/components/Layout.tsx` | Modified | Semua 14 hex + emerald-* → semantic tokens; WCAG nav label fix |
| `src/pages/Login.tsx` | Modified | Semua 5 hex + emerald-* → semantic tokens; focus ring WCAG fix |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| `text-surface-panel` untuk teks avatar | `#0c1221` identik dengan `--color-surface-panel` | Konsisten, tidak perlu token baru |
| `border-white/15` di input (bukan white/5) | WCAG SC 1.4.11: border lebih visible | Input border accessible di bg-surface-panel |
| violet-500 untuk blur orb ungu | `#a855f7` = Tailwind violet-500 — nilai identik | Tidak butuh custom token untuk dekoratif |

## Deviations from Plan

Tidak ada — plan dieksekusi persis seperti yang dispecifikasikan.

## Issues Encountered

Tidak ada.

## Next Phase Readiness

**Ready:**
- Shell aplikasi (Layout.tsx) konsisten dengan token system — semua halaman yang render di dalamnya dapat menggunakan token yang sama
- Login.tsx entry point fully tokenized — auth layer konsisten
- Pattern untuk page migration sudah jelas: bg-surface-app root, bg-surface-panel containers, brand-* untuk CTA

**Concerns:**
- `border-white/5` masih dipakai di Layout.tsx untuk divider dan ring — WCAG SC 1.4.11 concern tapi bukan fungsional border (dekoratif)
- Pages (Dashboard, Kas, Talang, Laporan) masih mengandung hardcoded hex dan emerald-* — akan ditangani di Plan 06-03

**Blockers:**
- None — siap untuk Plan 06-03

---
*Phase: 06-color-system, Plan: 02*
*Completed: 2026-06-12*
