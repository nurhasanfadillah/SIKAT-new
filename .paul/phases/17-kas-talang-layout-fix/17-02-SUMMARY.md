---
phase: 17-kas-talang-layout-fix
plan: 02
subsystem: ui
tags: [card-redesign, accordion, animation, motion, mobile, kas]

requires:
  - phase: 17-kas-talang-layout-fix/17-01
    provides: outer scroll single context (no inner max-h) — card expand sekarang bisa grow tanpa constraint

provides:
  - expandedId accordion pattern (satu card expand sekaligus)
  - tanggal-first 2-row card grid untuk Kas Rekap
  - animated expand area dengan AnimatePresence (height 0→auto)

affects: [17-03-talang-card-redesign]

tech-stack:
  added: [motion/react (AnimatePresence, motion.div) — sudah ada di codebase, baru dipakai di Kas.tsx]
  patterns:
    - expandedId accordion: useState<string|null>(null), toggle on card click, reset on handleStartEdit
    - ChevronDown rotation via motion.div animate={{ rotate: expanded ? 180 : 0 }}
    - Expand area: col-start-1 col-end-4 span full-width di CSS Grid
    - e.stopPropagation() pada action buttons agar klik tidak bubble ke card onClick

key-files:
  modified:
    - src/pages/Kas.tsx

key-decisions:
  - "expandedId accordion: hanya satu card expand sekaligus — UX lebih predictable"
  - "Edit/Delete dipindah ke expanded area — card summary lebih bersih (tanggal + keterangan + nominal only)"
  - "setExpandedId(null) di handleStartEdit — tidak ada dual-state (expand + edit bersamaan)"
  - "TrendingUp/Down dipindah ke expanded badge jenis — bukan di card summary"

patterns-established:
  - "expandedId pattern siap direplikasi ke Talang.tsx di 17-03"
  - "Card grid 2-row: col1 rowspan-2 = tanggal, col2+3 row1 = keterangan, col2 row2 = nominal, col3 row2 = chevron"
  - "motion.div rotate chevron: animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}"

duration: ~15min
started: 2026-06-14T00:00:00Z
completed: 2026-06-14T00:00:00Z
---

# Phase 17 Plan 02: Kas Rekap Card Redesign

**Card transaksi Kas Rekap didesain ulang dengan tanggal-first 2-row grid + expandedId accordion — detail (jenis, sumber/kategori, edit/delete) tersembunyi di expanded area yang muncul saat card diklik.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~15 menit |
| Tasks | 2 auto + 1 checkpoint (approved) |
| Files modified | 1 (Kas.tsx) |
| tsc --noEmit | Clean (0 errors) |
| Checkpoint | human-verify ✅ approved |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Tanggal sebagai primary element kolom kiri | Pass | Col 1 rowspan-2: MMM + dd, bg-white/5 rounded-xl |
| AC-2: Card expand accordion saat diklik | Pass | AnimatePresence height 0→auto, ChevronDown rotasi 180° |
| AC-3: Expand + edit tidak konflik | Pass | Guard `if (editingId === t.id) return`, `setExpandedId(null)` di handleStartEdit |

## Accomplishments

- Card summary sekarang hanya tampilkan 3 elemen: tanggal (kiri), keterangan (kanan atas), nominal (kanan bawah) — jauh lebih clean dari sebelumnya
- Expanded area menampilkan detail lengkap: badge jenis + icon, sumber/kategori, tanggal EEEE format, tombol Ubah+Hapus (Bendahara only)
- Pattern `expandedId` siap direplikasi ke Talang.tsx untuk plan 17-03 tanpa perubahan konsep

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/pages/Kas.tsx` | Modified | Import ChevronDown + motion/react; expandedId state; card grid redesign + AnimatePresence expand |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Accordion (satu expand sekaligus) | UX predictable; tidak perlu track array expandedIds | Simple state, tidak ada edge case multiple expanded |
| Edit/Delete di expanded area | Card summary lebih bersih; tombol tidak memenuhi ruang card | Tambah satu klik untuk edit/delete — acceptable trade-off |
| `setExpandedId(null)` di handleStartEdit | Jangan ada expand + edit bersamaan — dua highlight state bisa confusing | Form terbuka selalu dalam keadaan card collapse |
| TrendingUp/Down hanya di expanded badge | Icon sudah redundant dengan warna nominal (brand/rose) | Card lebih visual minimal, warna cukup sebagai sinyal |

## Deviations from Plan

None — plan dieksekusi persis sebagaimana tertulis. Checkpoint human-verify approved tanpa issue.

## Issues Encountered

None.

## Next Phase Readiness

**Ready:**
- `expandedId` pattern terdokumentasi lengkap — 17-03 tinggal replikasi ke Talang.tsx dengan modifikasi kolom 1 (tanggal row 1, akun tag row 2)
- `motion/react` sudah ter-import di Kas.tsx; Talang.tsx perlu ditambahkan juga

**Concerns:**
- Talang.tsx punya kolom 1 yang berbeda: baris 1 = tanggal, baris 2 = akun tag (bukan rowspan-2) — perlu perhatian di 17-03
- `scrollIntoView` di Talang.tsx handleStartEdit perlu dicek konsistensi setelah expand collapse

**Blockers:** None

---
*Phase: 17-kas-talang-layout-fix, Plan: 02*
*Completed: 2026-06-14*
