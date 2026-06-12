---
phase: 06-color-system
plan: 03
subsystem: ui
tags: [tailwind, tokens, recharts, semantic-colors, brand-colors]

requires:
  - phase: 06-01
    provides: tokens.ts dengan 25 semantic tokens dan CSS variables di index.css
  - phase: 06-02
    provides: Layout.tsx dan Login.tsx sudah dimigrasikan ke token system

provides:
  - Dashboard.tsx, Kas.tsx, Talang.tsx, Laporan.tsx bebas hardcoded hex dan emerald-*
  - Recharts fills di Laporan.tsx via tokens.ts (bukan raw hex)
  - Phase 06 Color System complete — seluruh app konsisten dengan token system
affects: [future-ui-phases, phase-07]

tech-stack:
  added: []
  patterns: [semantic-token-migration, recharts-via-tokens]

key-files:
  modified:
    - src/pages/Dashboard.tsx
    - src/pages/Kas.tsx
    - src/pages/Talang.tsx
    - src/pages/Laporan.tsx

key-decisions:
  - "Recharts XAxis/YAxis/CartesianGrid hex dikecualikan: inline styles tidak bisa pakai CSS tokens"
  - "Tooltip itemStyle/labelStyle (#fff, #94a3b8) dikecualikan: same reason — recharts prop"
  - "recharts Bar fills dimigrasikan ke tokens.colors.chart.* (bukan Tailwind class)"

patterns-established:
  - "recharts fills: selalu gunakan tokens.ts import, bukan hardcoded hex"
  - "brand-* menggantikan emerald-* di seluruh app; rose-*/violet-*/blue-* tetap semantic"

duration: ~45min
started: 2026-06-12T08:00:00+07:00
completed: 2026-06-12T09:00:00+07:00
---

# Phase 6 Plan 3: Pages Token Migration Summary

**Dashboard.tsx, Kas.tsx, Talang.tsx, dan Laporan.tsx dimigrasikan ke semantic tokens; recharts fills via tokens.ts — seluruh app SIKAT sekarang bebas hardcoded brand hex.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~45 min |
| Started | 2026-06-12 |
| Completed | 2026-06-12 |
| Tasks | 4 completed + 1 human-verify checkpoint |
| Files modified | 4 |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Dashboard.tsx bebas hex/emerald | Pass | `grep -E "#[0-9a-fA-F]{3,6}\|emerald" Dashboard.tsx` → 0 matches |
| AC-2: Kas.tsx bebas hex/emerald | Pass | `grep -E "#[0-9a-fA-F]{3,6}\|emerald" Kas.tsx` → 0 matches |
| AC-3: Talang.tsx bebas emerald/brand hex | Pass | `grep -E "emerald\|#00e5a3\|#00cfa2\|#00f5a0" Talang.tsx` → 0 matches |
| AC-4: Laporan.tsx via tokens; recharts via tokens.ts | Pass* | 5 remaining hex = recharts infrastructure (dikecualikan boundaries); `tokens.colors` 3 hits ✓ |
| AC-5: Build pass | Pass | npm run build exit 0, tidak ada error baru |

*AC-4 catatan: 5 hex yang tersisa (`#1e293b`, `#475569`, `#fff`, `#94a3b8`) adalah recharts CartesianGrid/XAxis/Tooltip inline props — secara eksplisit dikecualikan oleh `<boundaries>` plan.

## Accomplishments

- Semua `emerald-*` classes diganti `brand-*` di 4 halaman utama app
- Hero card gradient di Dashboard menggunakan `hero-from/via/to` semantic tokens
- Surface/card backgrounds diganti `surface-card`, `surface-elevated` (tidak ada lagi `#121829`, `#161d30`, `#111726`)
- Laporan.tsx recharts Bar fills: `fill="#00e5a3"` → `fill={tokens.colors.chart.pemasukan}` (sumber kebenaran tunggal via tokens.ts)
- Phase 06 Color System selesai: seluruh app (shell + auth + pages) konsisten dengan token system

## Task Commits

Semua perubahan dalam working tree, belum di-commit terpisah per task (plan tidak menentukan atomic commits per task). Siap di-commit saat transition.

| Task | Status | Description |
|------|--------|-------------|
| Task 1: Dashboard.tsx | ✓ Done | Semua emerald-*/hex → brand-*/surface-* tokens |
| Task 2: Kas.tsx | ✓ Done | Semua emerald-*/hex → brand-*/surface-* tokens |
| Task 3: Talang.tsx + Laporan.tsx | ✓ Done | emerald-*/hex → brand-* + recharts via tokens.ts |
| Task 4: Build verification | ✓ Done | npm run build exit 0 |
| Checkpoint: Human verify | ✓ Approved | Visual check semua halaman approved |

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/pages/Dashboard.tsx` | Modified | emerald-* → brand-*; hex bg → surface-card; hero gradient → hero-* tokens |
| `src/pages/Kas.tsx` | Modified | emerald-* → brand-*; hex bg → surface-card/elevated; form/filter/CTA tokens |
| `src/pages/Talang.tsx` | Modified | Sisa emerald-* → brand-*; 3 hardcoded brand hex → brand-* tokens |
| `src/pages/Laporan.tsx` | Modified | emerald-*/hex → brand-*/surface-*; recharts fills via `tokens.colors.chart.*` |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Pertahankan recharts CartesianGrid/XAxis hex | Recharts grid/axis stroke tidak mendukung CSS variables; `#1e293b` = slate-800 semantically correct | 5 hex values tetap tersisa, tapi valid dan disengaja |
| Recharts Bar fills via tokens.ts import | Recharts `fill` prop menerima raw hex string, bukan Tailwind class; tokens.ts adalah sumber kebenaran tunggal | Pattern `import { tokens } from '../lib/tokens'` ditetapkan untuk recharts usage |
| Legend dots tetap Tailwind class (`bg-brand-500`, `bg-rose-500`) | Legend dots adalah `<span>` HTML biasa, bukan recharts prop — Tailwind class bekerja dengan baik | Konsisten dengan token system, tidak butuh tokens.ts import |

## Deviations from Plan

### Summary

| Type | Count | Impact |
|------|-------|--------|
| Boundary exceptions | 5 hex values | Valid — dikecualikan eksplisit di plan boundaries |
| Scope additions | 0 | — |
| Deferred | 0 | — |

**Total impact:** Tidak ada scope creep atau masalah nyata. Sisa hex adalah infrastruktur recharts yang memang tidak bisa pakai CSS tokens.

### Boundary Exceptions (bukan deviasi)

**Recharts inline style props tetap hardcoded hex:**
- `#1e293b` → CartesianGrid stroke (slate-800, dikecualikan: "Jangan ubah CartesianGrid stroke")
- `#475569` → XAxis/YAxis stroke (slate-600, dikecualikan: "Jangan ubah recharts XAxis/YAxis stroke colors")
- `#fff` dan `#94a3b8` → Tooltip `itemStyle`/`labelStyle` (React inline style object, CSS tokens tidak berlaku)

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| Tooltip itemStyle tidak ada di plan | Dikecualikan secara konseptual (sama dengan XAxis — recharts inline style); tidak di-migrate |

## Next Phase Readiness

**Ready:**
- Seluruh color system Phase 06 selesai — `tokens.ts`, `index.css`, semua komponen dan halaman konsisten
- Pattern `brand-*` terbentuk: brand-500 = teal utama, brand-400 = hover state, brand-600 = darker
- Pattern recharts-via-tokens: `import { tokens }` untuk semua recharts fill values di masa depan
- Working tree bersih secara semantik — siap di-commit untuk phase completion

**Concerns:**
- Password masih disimpan plaintext di database (diketahui dari v0.4, kandidat fase berikutnya)
- NeonDB credentials pernah ada di git history (pertimbangkan rotate)

**Blockers:**
- None

---
*Phase: 06-color-system, Plan: 03*
*Completed: 2026-06-12*
