---
phase: 17-kas-talang-layout-fix
plan: 03
subsystem: ui
tags: [card-redesign, accordion, animation, motion, mobile, talang]

requires:
  - phase: 17-kas-talang-layout-fix/17-02
    provides: expandedId accordion pattern + AnimatePresence — direplikasi ke Talang.tsx

provides:
  - expandedId accordion pattern di Talang.tsx (konsisten dengan Kas.tsx)
  - 2-row col1: tanggal row 1, akun tag row 2 (tanpa icon di card summary)
  - animated expand area dengan AnimatePresence (height 0→auto)

affects: []

tech-stack:
  added: [motion/react (AnimatePresence, motion.div) — sudah ada di codebase, baru dipakai di Talang.tsx]
  patterns:
    - expandedId accordion: useState<string|null>(null), toggle on card click, setExpandedId(null) di handleStartEdit
    - ChevronDown rotation via motion.div animate={{ rotate: expanded ? 180 : 0 }}
    - Expand area: col-start-1 col-end-4 span full-width di CSS Grid
    - e.stopPropagation() pada action buttons agar klik tidak bubble ke card onClick
    - Guard: if (editingId === t.id) return — cegah expand saat card sedang di-edit

key-files:
  modified:
    - src/pages/Talang.tsx

key-decisions:
  - "Col1 Talang: 2-row bukan rowspan-2 — row 1 = tanggal (dd/MM), row 2 = akun badge"
  - "Icon jenis (ArrowUpRight/Down/Left) dipindah ke expanded area bukan di card summary"
  - "Keterangan tampil di expanded hanya jika jenis bukan Transfer (Transfer sudah cukup dari keterangan row 1)"

patterns-established:
  - "expandedId pattern seragam di Kas.tsx dan Talang.tsx — konsisten di seluruh transaction pages"
  - "Card summary Talang: tanggal (kiri atas), akun badge (kiri bawah), keterangan (kanan atas), nominal (kanan bawah), chevron"

duration: ~10min
started: 2026-06-14T00:00:00Z
completed: 2026-06-14T00:00:00Z
---

# Phase 17 Plan 03: Talang Card Redesign

**Card transaksi Dana Talang didesain ulang dengan 2-row col1 (tanggal + akun tag) + expandedId accordion — pola identik dengan Kas.tsx dari 17-02, dengan penyesuaian col1 Talang-specific.**

## Performance

| Metric | Value |
|--------|-------|
| Duration | ~10 menit |
| Tasks | 2 auto + 1 checkpoint (approved) |
| Files modified | 1 (Talang.tsx) |
| tsc --noEmit | Clean (0 errors) |
| Checkpoint | human-verify ✅ approved |

## Acceptance Criteria Results

| Criterion | Status | Notes |
|-----------|--------|-------|
| AC-1: Kolom 1 card menjadi 2-row (tanggal + akun tag) | Pass | Row 1 = tanggal dd/MM, row 2 = akun badge berwarna; icon jenis tidak tampil di summary |
| AC-2: Card clickable — expand/collapse accordion | Pass | AnimatePresence height 0→auto, ChevronDown rotasi 180°; guard editingId |
| AC-3: Expanded area menampilkan detail + tombol aksi | Pass | Jenis badge + icon, unit/akun_tujuan, tanggal EEEE, keterangan full, Ubah+Hapus (Bendahara) |

## Accomplishments

- Card summary Talang sekarang bersih: hanya tanggal + akun tag (kiri), keterangan + nominal + chevron (kanan) — lebih scannable dari 3-row sebelumnya
- Expanded area menampilkan semua detail relevan: jenis badge dengan icon, unit (Baru) atau akun tujuan (Transfer), keterangan lengkap, tanggal EEEE, tombol Ubah/Hapus
- Pattern expandedId accordion seragam di Kas.tsx dan Talang.tsx — UX konsisten di kedua halaman transaksi
- handleStartEdit selalu collapse card sebelum buka form (tidak ada dual state expand+edit)

## Files Created/Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/pages/Talang.tsx` | Modified | Import ChevronDown + motion/react; expandedId state; setExpandedId(null) di handleStartEdit; card grid redesign 2-row col1 + AnimatePresence expand |

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Col1 = 2-row bukan rowspan-2 | Talang butuh dua info di col1 (tanggal + akun); Kas cukup 1 elemen (tanggal saja) | Tampilan col1 lebih padat tapi informatif |
| Icon jenis hanya di expanded | Card summary cukup dengan warna nominal (violet/brand-500); icon redundant | Summary lebih clean, expanded tetap informatif |
| Keterangan di expanded skip untuk Transfer | Transfer sudah tampilkan "Transfer: X → Y" di summary row 1; repeat di expanded redundant | Expanded Transfer lebih compact |

## Deviations from Plan

None — plan dieksekusi persis sebagaimana tertulis. Checkpoint human-verify approved tanpa issue.

## Issues Encountered

None.

## Next Phase Readiness

Phase 17 complete — semua 3 plan selesai.

**Ready:**
- Kas Rekap dan Dana Talang keduanya memiliki card design yang konsisten (tanggal-first + expand accordion)
- `motion/react` sekarang dipakai di dua halaman transaksi — pattern established

**Concerns:** None

**Blockers:** None

---
*Phase: 17-kas-talang-layout-fix, Plan: 03*
*Completed: 2026-06-14*
