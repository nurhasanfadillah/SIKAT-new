---
phase: 17-kas-talang-layout-fix
topic: Keyboard viewport bug, bottom nav overlap, card layout redesign (Kas & Talang)
depth: standard
confidence: HIGH
created: 2026-06-14
---

# Discovery: Kas & Talang Layout Fix + Card Redesign

**Recommendation:** Gunakan `h-svh` untuk fix keyboard bug, hapus inner scroll `max-h-[500px]` untuk fix bottom nav, gunakan inline expand (accordion) untuk detail view card.

**Confidence:** HIGH — semua fix menggunakan pattern CSS yang sudah divalidasi dan komponen yang sudah ada di codebase.

---

## Objective

Yang perlu dipelajari sebelum planning:
- Root cause mengapa layout naik saat keyboard muncul (edit form)
- Mengapa bottom nav menutupi konten saat scroll mentok
- Pendekatan terbaik untuk detail view pada card yang di-redesign

## Scope

**Include:**
- `Layout.tsx` — outer container height, main area padding, nav position
- `Kas.tsx` — transaction card, inner scroll, form scroll-into-view
- `Talang.tsx` — transaction card, inner scroll, form scroll-into-view
- Card redesign layout grid

**Exclude:**
- Perubahan API / backend
- Form edit itu sendiri (hanya layout wrapper)
- Login page, Dashboard, header

---

## Findings

### Bug 1: Layout naik saat keyboard muncul (edit)

**Lokasi:** `Layout.tsx:38` — inner container, `Layout.tsx:32` — outer wrapper

**Root cause:**
Container menggunakan `h-dvh` (dynamic viewport height). Pada mobile ketika keyboard virtual muncul:
- `dvh` shrinks mengikuti visual viewport yang menyempit
- Inner container `h-dvh` ikut mengecil → seluruh UI naik
- Outer wrapper `min-h-dvh flex items-center justify-center` → ruang kosong di bawah karena container sudah tidak setinggi viewport asli

Ini adalah behavior bawaan `dvh` yang memang designed to track visual viewport. Problemnya: untuk PWA yang mensimulasikan native app, keyboard seharusnya **overlay** konten, bukan **resize** container.

**Option A: `h-svh` (Small Viewport Height)**
- `svh` = viewport height tanpa keyboard (viewport height yang "sudah menyusut" secara statis)
- Keyboard overlay container, container tidak resize
- `svh` didukung Safari 15.4+, Chrome 108+, Firefox 101+ — coverage aman untuk target pengguna
- Container tetap di posisi atas, keyboard overlay bagian bawah

**Option B: JavaScript VisualViewport API lock**
- Listen `visualViewport.resize` → set `--viewport-height` CSS var → pakai sebagai height
- Lebih kompleks, perlu tambah script di App.tsx atau Layout.tsx
- Tidak perlu — `svh` cukup

**Option C: Keep `dvh`, set `items-start` di outer wrapper**
- Outer wrapper tidak center secara vertikal → tidak ada ruang kosong di bawah
- Tapi efek visual "naik" tetap ada ketika keyboard shrink
- Di desktop (md:) layout tetap centered — perlu conditional

**Pilihan: Option A (`svh`)** — simplest, native behavior (keyboard overlay), zero JS.

---

### Bug 2: Bottom nav menutupi konten scroll

**Lokasi:** `Layout.tsx:87` — `<main>` pb-20, `Kas.tsx:709`, `Talang.tsx:1158` — inner scroll containers

**Analisis:**
Main area sudah punya `pb-20` (80px). Nav floating height ~60px + bottom offset 16px = 76px. Secara teori cukup.

**Root cause sebenarnya:** Inner scroll containers di Kas dan Talang:
- `max-h-[500px] overflow-y-auto` (atau `max-h-[300px]` saat form aktif di Talang)
- Ketika list transaksi berada di tengah halaman dan user scroll inner container, item terakhir di inner container bisa berada tepat di posisi nav

**Skenario konkret:**
1. Main area di-scroll ke bawah (pb-20 menciptakan space untuk nav)
2. Inner transaction list ada di viewport
3. User scroll dalam inner container
4. Item terakhir di inner container muncul di posisi yang tepat overlapping nav

**Option A: Hapus `max-h-[500px]`, andalkan outer main scroll**
- Transaction list mengalir natural ke bawah
- Outer `<main overflow-y-auto pb-20>` yang scroll
- Satu scroll container → tidak ada nested scroll confusion
- Tidak perlu scroll behavior workaround
- **Perlu adjust**: `scrollIntoView` pada handleStartEdit masih valid (scroll ke form, bukan ke dalam inner container)

**Option B: Tambah padding-bottom di inner container**
- `pb-24` atau lebih pada inner scroll container
- Tapi nested scroll tetap ada, dan max-h masih terlalu terbatas

**Pilihan: Option A** — hapus inner scroll, biarkan outer main yang scroll. Pattern lebih bersih.

---

### Feature: Card layout baru Kas Rekap

**Target layout:**
```
grid 2 baris × 3 kolom:

Baris 1: [Tanggal rowspan-2] [Keterangan      col2+3 merged]
Baris 2: [Tanggal rowspan-2] [Nominal right   ] [Action btn ]
```

**Data yang tampil di card:** Tanggal, Keterangan, Nominal
**Data yang TIDAK tampil di card (perlu detail view):** Jenis (Pemasukan/Pengeluaran), Sumber Dana/Kategori

**Detail view options saat klik:**

**Option A: Inline expand (accordion)**
- Card mengembang ke bawah menampilkan detail + action buttons
- State: `expandedId` per card
- Pro: tidak perlu komponen baru, UX flow tetap di list
- Con: list menjadi panjang ketika banyak yang expand (tapi hanya satu yang expand sekaligus)

**Option B: Bottom sheet modal**
- Klik card → modal dari bawah (slide up) dengan detail lengkap + edit/delete
- Pro: lebih native feel, tidak mengganggu list
- Con: perlu buat komponen bottom sheet, atau reuse FeedbackContext modal
- FeedbackContext sudah ada `confirm()` tapi itu modal confirmation, bukan detail panel

**Option C: Satu tombol detail (info icon)**
- Column 3 row 2 = icon info/chevron-right
- Klik → expand inline atau bottom sheet
- Edit/Delete tetap tersembunyi di dalam detail view

**Pilihan: Option A (inline expand)**
- Sudah ada pattern `editingId` yang highlight card aktif
- Tambah `expandedId` state → klik card toggle expand
- Detail expanded: tampil semua info (jenis, sumber/kategori, full date) + edit/delete buttons (jika isBendahara)
- Column 3 row 2: satu icon `ChevronDown/Up` sebagai toggle → rotasi saat expanded

**Catatan icon Jenis:** Icon TrendingUp/TrendingDown dipindah ke dalam detail expanded area (sebagai indikator jenis pemasukan/pengeluaran, masih berguna tapi tidak perlu di card summary).

---

### Feature: Card layout baru Dana Talang

**Target layout:**
```
grid 2 baris × 3 kolom:

Baris 1: [Tanggal        ] [Keterangan      col2+3 merged]
Baris 2: [Akun Talang    ] [Nominal right   ] [Action btn ]
```

**Berbeda dengan Kas:** Kolom 1 TIDAK rowspan — baris 1 = tanggal card, baris 2 = akun tag.

**Detail yang ada saat ini sudah lebih kaya:** Unit, Jenis (Baru/Pelunasan/Transfer), Akun Tujuan (untuk Transfer).

**Detail view:** Sama dengan Kas — inline expand dengan `expandedId` state.

**Action button:** Column 3 row 2 = icon chevron toggle untuk expand/collapse detail + edit/delete muncul di expanded area.

---

## Comparison

| Kriteria | Option A (Rekomendasi) | Option B (Alternatif) |
|---|---|---|
| **Keyboard bug** | `h-svh` — container tidak resize | JS VisualViewport API |
| Kompleksitas | Rendah (1 class change) | Tinggi (tambah JS) |
| Browser support | Safari 15.4+ ✓ | Universal ✓ |
| **Bottom nav** | Hapus inner scroll | Tambah padding inner |
| Dampak perubahan | Besar tapi bersih | Minimal tapi incomplete |
| Nested scroll | Hilang (lebih baik) | Tetap ada |
| **Detail view** | Inline expand | Bottom sheet modal |
| Komponen baru | Tidak perlu | Perlu BottomSheet component |
| Animasi | `AnimatePresence` sudah ada | Framer Motion slide-up |
| UX pattern | Standard accordion | Native mobile feel |

---

## Recommendation

### Phase 17 terdiri dari 3 sub-task:

**17A — Layout Bug Fix (Layout.tsx)**
- Outer: `min-h-dvh` → `min-h-svh`
- Inner container: `h-dvh` → `h-svh`
- Hapus `max-h-[500px]` di Kas.tsx dan `max-h-[300px]`/`max-h-[500px]` di Talang.tsx
- Adjust handleStartEdit: scrollIntoView masih valid, tapi targetnya di dalam `<main>` yang scroll, bukan inner container

**17B — Kas Rekap Card Redesign (Kas.tsx)**
- Grid: `grid-cols-[auto_1fr_auto]` + 2 rows (tidak perlu tambah col)
- Kolom 1 rowspan-2: Tanggal card (`dd/MM`) dengan styling card mini
- Kolom 2+3 row 1: Keterangan
- Kolom 2 row 2: Nominal right-aligned
- Kolom 3 row 2: ChevronDown/Up icon button (toggle expand)
- Expanded state: tampil badge jenis, sumber/kategori, tanggal full, + edit/delete buttons

**17C — Dana Talang Card Redesign (Talang.tsx)**
- Grid: `grid-cols-[auto_1fr_auto]` + 2 rows
- Kolom 1 row 1: Tanggal card (`dd/MM`)
- Kolom 1 row 2: Akun tag (Jisoi/Rakka/Shae)
- Kolom 2+3 row 1: Keterangan
- Kolom 2 row 2: Nominal right-aligned
- Kolom 3 row 2: ChevronDown/Up icon button (toggle expand)
- Expanded state: tampil jenis (Baru/Pelunasan/Transfer), unit, akun tujuan, tanggal full, + edit/delete buttons

**Caveats:**
- `h-svh` fix keyboard, tapi konten di bawah keyboard tidak otomatis accessible → user harus scroll. Ini adalah acceptable trade-off (behavior sama dengan native app).
- Hapus inner scroll container berarti jika ada 100+ transaksi, semua render di DOM. Untuk skala sekolah (< 500 transaksi), ini acceptable. Virtualization belum diperlukan.
- `expandedId` state harus reset saat card di-edit (jangan ada dua state aktif sekaligus)

## Open Questions

- Apakah `expandedId` hanya bisa satu sekaligus (accordion behavior) atau multiple? — Impact: low (rekomendasi: satu sekaligus)
- Apakah detail view juga tampil untuk user non-Bendahara (tanpa edit/delete)? — Impact: medium (rekomendasi: ya, tampil detail saja tanpa action buttons)

---

## Quality Report

**Sources consulted:**
- Layout.tsx (read langsung, 2026-06-14)
- Kas.tsx:700–810 (read langsung, 2026-06-14)
- Talang.tsx:1150–1290 (read langsung, 2026-06-14)
- index.css (read langsung, 2026-06-14)
- MDN Web Docs: svh unit — Safari 15.4+, Chrome 108+, Firefox 101+

**Verification:**
- `h-dvh` di Layout.tsx:38: Verified — ini root cause keyboard resize
- `max-h-[500px]` di Kas.tsx:709: Verified — inner scroll present
- `max-h-[300px]/[500px]` di Talang.tsx:1158: Verified — conditional inner scroll
- `pb-20` di Layout.tsx:87: Verified — ada tapi tidak cukup saat inner scroll overlap nav
- Existing `editingId` pattern: Verified — pattern untuk `expandedId` bisa mengikuti pola sama

**Assumptions (not verified):**
- `svh` support cukup untuk target pengguna (asumsi Android modern + iOS 15.4+)
- Menghapus inner max-h tidak menyebabkan performance issue di data volume saat ini

---
*Discovery completed: 2026-06-14*
*Confidence: HIGH*
*Ready for: /paul:plan 17-kas-talang-layout-fix*
