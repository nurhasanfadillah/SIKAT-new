---
phase: 06-color-system
plan: 01
subsystem: ui
tags: [tailwind, design-tokens, css-variables, wcag, dark-theme]

requires: []
provides:
  - 25 semantic color tokens di src/index.css (@theme)
  - src/lib/tokens.ts — JS constants untuk recharts dan Framer Motion
  - button, input, tabs, card — dimigrasikan ke dark tokens
  - SplashScreen — on-brand (bg-surface-base, text-brand-300)
affects: [06-02, 06-03, semua file yang import ui components]

tech-stack:
  added: []
  patterns:
    - "Token naming: --color-{category}-{role} (brand-500, surface-card, text-primary)"
    - "Gradient utilities via @theme: from-hero-from via-hero-via to-hero-to"
    - "JS-facing chart colors via src/lib/tokens.ts, bukan CSS variables"

key-files:
  created: [src/lib/tokens.ts]
  modified: [src/index.css, src/components/ui/button.tsx, src/components/ui/input.tsx, src/components/ui/tabs.tsx, src/components/ui/card.tsx, src/components/SplashScreen.tsx]

key-decisions:
  - "Pure @theme (bukan three-layer) — SIKAT dark-only, tidak butuh light/dark toggle"
  - "border-slate-500 untuk input border — WCAG SC 1.4.11 ≥ 3:1 pada bg-surface-card"
  - "text-text-secondary (slate-400) menggantikan text-text-muted (slate-500) di CardDescription — WCAG fix"
  - "SplashScreen: bg-surface-base (gelap) bukan bg-brand-500 (cerah) — konsisten dengan dark theme"

patterns-established:
  - "Gunakan bg-brand-500 untuk CTA primary, bukan bg-emerald-*"
  - "Gunakan bg-surface-card untuk elevated containers"
  - "Focus ring: ring-brand-500 solid (tanpa opacity modifier) — WCAG compliant"
  - "Tidak ada bg-white atau bg-slate-100 di UI components"

duration: ~20min
started: 2026-06-12T00:00:00Z
completed: 2026-06-12T00:00:00Z
---

# Phase 06 Plan 01: Token Foundation + UI Components Summary

**25 semantic color tokens didefinisikan di @theme Tailwind v4, 5 UI components + SplashScreen dimigrasikan dari light-mode hardcodes ke dark token utilities.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~20 menit |
| Tasks | 2/2 completed + checkpoint approved |
| Files modified | 6 |
| Files created | 1 (tokens.ts) |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Token Utilities Tersedia | **PASS** | `npm run build` sukses; 25 tokens di @theme auto-generate utilities |
| AC-2: UI Components Render di Dark Theme | **PASS** | Visual approved — button teal, input border visible, tabs/card gelap |
| AC-3: SplashScreen On-Brand | **PASS** | bg-surface-base + text-brand-300 verified |
| AC-4: No WCAG Regressions | **PASS** | border-slate-500 pada bg-surface-card ≈ 3.6:1 (≥ 3:1 SC 1.4.11) |

## Accomplishments

- **Token system**: 25 color tokens terdefinisikan dalam satu `@theme` block — brand (3), surface (7), gradient (5), status (4), text (4), plus gradient primitives
- **UI components bersih**: Tidak ada `bg-white`, `bg-slate-100`, `border-slate-300`, `ring-ring`, atau `ring-offset-background` tersisa
- **WCAG upgrade otomatis**: CardDescription naik dari `text-slate-500` (4.21:1 — GAGAL) ke `text-text-secondary` (7.81:1 — AAA)
- **SplashScreen fixed**: `bg-blue-600` off-brand diganti ke `bg-surface-base` dark

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/index.css` | Modified | Tambah 25 color tokens ke `@theme`; body pakai CSS variables |
| `src/lib/tokens.ts` | Created | JS constants untuk recharts fills dan Framer Motion inline styles |
| `src/components/ui/button.tsx` | Modified | Semua variants ke dark tokens; base class ring tokens fixed |
| `src/components/ui/input.tsx` | Modified | `bg-white border-slate-300` → `bg-surface-card border-slate-500` |
| `src/components/ui/tabs.tsx` | Modified | `bg-slate-100 ring-offset-white` → dark equivalents |
| `src/components/ui/card.tsx` | Modified | `bg-white text-slate-950` → `bg-surface-card text-text-primary` |
| `src/components/SplashScreen.tsx` | Modified | `bg-blue-600 text-blue-200` → `bg-surface-base text-brand-300` |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Pure `@theme` (tanpa three-layer system) | SIKAT dark-only — tidak butuh `:root`/`.dark` toggle | Plan 06-02/03 hanya perlu referensi token names |
| `border-slate-500` untuk input | WCAG SC 1.4.11: ≥ 3:1 pada bg-surface-card | Input border sekarang accessible |
| `text-text-secondary` di CardDescription | Upgrade dari slate-500 (WCAG FAIL 4.21:1) ke slate-400 (7.81:1) | WCAG fix sekaligus migrasi |
| `bg-surface-base` di SplashScreen (bukan `bg-brand-500`) | Konsistensi dengan dark theme — transisi splash → app lebih mulus | Brand accent tetap terlihat via text-brand-300 |

## Deviations from Plan

Tidak ada — plan dieksekusi persis seperti yang dispecifikasikan.

## Issues Encountered

Tidak ada.

## Next Phase Readiness

**Ready:**
- Semua token tersedia sebagai Tailwind utilities (`bg-brand-500`, `bg-surface-card`, dll.)
- `tokens.ts` siap diimport di Laporan.tsx untuk recharts fills
- UI component layer konsisten — Plan 06-02 bisa langsung pakai token names

**Concerns:**
- `border-white/5` dan `border-white/10` masih dipakai di Layout.tsx dan pages — WCAG SC 1.4.11 violations yang akan ditangani di Plan 06-02/03
- `text-slate-500` sebagai teks fungsional masih ada di beberapa pages — akan ditangani di 06-03

**Blockers:**
- None — siap untuk Plan 06-02

---
*Phase: 06-color-system, Plan: 01*
*Completed: 2026-06-12*
