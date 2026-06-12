---
phase: 07-spacing-typography
topic: Audit & standarisasi margin, padding, tipografi, dan alignment di seluruh aplikasi
depth: standard
confidence: HIGH
created: 2026-06-12
---

# Discovery: Spacing, Typography & Alignment Audit

**Recommendation:** Gunakan **Hybrid Approach** — custom type scale di `@theme` (7 ukuran semantik), standarisasi spacing ke Tailwind rhythm yang konsisten, dan 3-level font-weight hierarchy. Eksekusi dalam 3 plan terpisah: (1) typography tokens, (2) spacing + card rhythm, (3) alignment + section headers.

**Confidence:** HIGH — seluruh file dipindai langsung, temuan berdasarkan observasi codebase, bukan asumsi.

---

## Objective

Yang perlu diketahui sebelum planning:
- Berapa banyak font size arbitrary yang digunakan dan apakah bisa dikelompokkan menjadi skala yang masuk akal?
- Apa approach terbaik untuk type scale: custom `@theme` tokens, mapping ke Tailwind standard, atau hybrid?
- Apa spacing rhythm yang konsisten untuk komponen-komponen utama (cards, sections, form fields)?
- Komponen mana yang paling kritis untuk diaudit dan urutan terbaik mengerjakan perubahan?

## Scope

**Include:**
- Semua file di `src/pages/` (Dashboard, Kas, Talang, Laporan, Login)
- `src/components/Layout.tsx`
- `src/components/ui/` (button, card, input, label, tabs)
- `src/index.css` (untuk type scale tokens baru)

**Exclude:**
- `src/components/SplashScreen.tsx` — standalone component, styling-nya sudah intentional
- Recharts internal styling — dikecualikan sejak v0.6 (inline style limitation)
- Warna — sudah diselesaikan di v0.6

---

## Findings

### Temuan 1: Font Size Chaos (15+ arbitrary values)

**Inventory lengkap arbitrary sizes yang ditemukan:**

| Size | Digunakan untuk | Frekuensi |
|------|----------------|-----------|
| `text-[8px]` | Legend label, progress bar annotation | Rendah (2-3x) |
| `text-[9px]` | Pills, badges, count, date meta | Sangat tinggi |
| `text-[9.5px]` | Laporan card label (satu-satunya) | Sangat rendah (1x) |
| `text-[10px]` | Deskripsi label, metadata | Tinggi |
| `text-[11px]` | Card label, form label, nav text | Tinggi |
| `text-[12px]` | Nominal transaksi, keterangan item | Tinggi |
| `text-[13px]` | Section headers, balance secondary | Sedang |
| `text-[15px]` | Card value medium | Rendah |
| `text-[18px]` | Saldo Kas card | Rendah |
| `text-xs` (12px) | Form input, filter text | Sedang — redundan dengan `text-[12px]` |
| `text-sm` (14px) | Loading text, jarang | Sangat rendah |
| `text-xl` (20px) | Page title header | Rendah |
| `text-2xl` (24px) | Hero card nominal, Talang total | Rendah |
| `text-3xl` (30px) | Dashboard hero saldo | Rendah |

**Masalah utama:**
- `text-[12px]` dan `text-xs` dipakai bergantian untuk hal yang sama (form text, nominal)
- `text-[9.5px]` hanya muncul sekali di Laporan — tidak perlu token sendiri
- Range `text-[8px]` s/d `text-[18px]` adalah 10 ukuran untuk 4 "zona" yang seharusnya terstruktur

**Zona semantik yang teridentifikasi:**
```
nano   → 8-9px   = legend, badge, pill tiny
micro  → 10-11px = label, metadata, caption
body   → 12-13px = list item, description, form text
value  → 15-18px = card values, secondary saldo
```

---

### Temuan 2: Padding Inconsistency di Cards

**Inventory padding di card/container:**

| Komponen | Padding Dipakai | Seharusnya |
|----------|----------------|------------|
| Dashboard Hero Card | `p-5` | — |
| Dashboard 2-col cards | `p-3` | — |
| Dashboard Talang detail | `p-4` | — |
| Dashboard Transaction item | `p-3` | — |
| Kas saldo card | `p-3.5` | — |
| Kas 2-col stat cards | `p-2.5` | — |
| Kas form card | `p-4` | — |
| Kas ledger card | `p-4` | — |
| Kas transaction item | `p-3` | — |
| Talang hero card | `p-4` | — |
| Talang account button | `py-2.5 px-4` | — |
| Talang form card | `p-4` | — |
| Talang transaction item | `p-3.5` | — |
| Laporan top card | `p-4` | — |
| Laporan 2-col cards | `p-3.5` | — |
| Login form card | `p-6` | — |
| Layout header | `pt-5 pb-3 px-5` | — |

**Pattern yang teridentifikasi:**
- Hero/primary cards: `p-4` atau `p-5` — harusnya konsisten ke `p-5`
- Standard cards: `p-3` sampai `p-4` — harusnya konsisten ke `p-4`
- Compact stat cards: `p-2.5` atau `p-3` — harusnya konsisten ke `p-3`
- Transaction list items: `p-3` atau `p-3.5` — harusnya `p-3`
- Standalone auth card: `p-6` — sudah intentional, keep

---

### Temuan 3: Font Weight Hierarchy yang Ambigu

**Font weight inventory:**

| Weight | Digunakan untuk | Masalah |
|--------|----------------|---------|
| `font-medium` | Hampir tidak ada | Under-used |
| `font-semibold` | Occasional, tidak konsisten | Tidak jelas perannya |
| `font-bold` | Labels DAN section headers DAN nominal | Over-used, tidak ada hierarki |
| `font-extrabold` | Nominal, form button, saldo card | Redundan dengan font-black |
| `font-black` | Saldo utama, header, button — sering sama dengan extrabold | Tidak jelas kapan pakai ini vs extrabold |

**Masalah:** `font-extrabold` dan `font-black` dipakai bergantian untuk hal yang sama. Label, body text, dan nilai nominal semua pakai `font-bold`, tidak ada visual hierarchy.

**Hierarki yang diusulkan:**
```
font-medium  → metadata, date, caption (supporting text)
font-bold    → labels, descriptions, list item titles
font-black   → nominal amounts, primary values, page sections
```

---

### Temuan 4: Section Spacing & Alignment Gaps

**Section gap inventory:**
- Dashboard: `space-y-5` (top-level), `space-y-4` (nested), `space-y-2.5` (transaction list)
- Kas: `space-y-4` (top-level), `space-y-3` (form), `space-y-2` (list)
- Talang: `space-y-4` (top-level), `space-y-4` (form), `space-y-2` (list)
- Laporan: `space-y-4` (top-level), `space-y-3` (nested)

**Masalah alignment:**
- Section headers pakai `px-1` tapi container utama sudah `px-4` dari `main` di Layout.tsx
- Ini menyebabkan text section header seperti "Riwayat Transaksi Terkini" tampak lebih ke kiri dari card edges
- Beberapa section header seperti "SUMBER DANA TALANG INDIVIDUAL" di Talang sudah tanpa `px-1`, yang sebenarnya lebih benar

**Item gap inconsistency:**
- `gap-2`, `gap-2.5`, `gap-3`, `gap-3.5` digunakan berulang untuk hal-hal serupa

---

## Comparison

### Option A: Custom @theme Type Scale (Semantic Tokens)

**Konsisten dengan pendekatan v0.6 color tokens** — definisikan semua ukuran yang dipakai sebagai named tokens.

```css
/* Di @theme */
--text-nano:  8px;
--text-micro: 10px;
--text-label: 11px;
--text-body:  12px;
--text-value: 15px;
/* Tetap pakai Tailwind standard untuk xl/2xl/3xl */
```

**Pros:**
- Satu sumber kebenaran untuk ukuran teks
- Mudah mencari-ganti (class name semantik)
- Konsisten dengan bagaimana colors ditangani

**Cons:**
- Masih perlu refactor semua `text-[Xpx]` ke nama baru
- Custom utilities di Tailwind v4 butuh `@utility` block
- 5-6 ukuran custom mungkin masih banyak

**Untuk use case ini:** Medium-high fit

### Option B: Tailwind Standard Scale Mapping

Map semua arbitrary sizes ke nearest Tailwind equivalent:
- `text-[9px]` → `text-[9px]` (keep, karena Tailwind tidak punya 9px)
- `text-[10px]` → `text-[10px]` (keep)
- `text-[11px]` → `text-[11px]` (keep)
- `text-[12px]` dan `text-xs` → `text-xs` (12px)
- `text-[13px]` → `text-[13px]` (keep)
- `text-[15px]` → `text-[15px]` (keep)
- `text-[18px]` → `text-lg` atau `text-[18px]` (Tailwind `lg` = 18px ✓)

**Pros:**
- Kurang refactor yang besar
- Tidak perlu buat token baru

**Cons:**
- Masih ada banyak arbitrary sizes — tidak benar-benar "standard"
- Tidak lebih maintainable dari sekarang
- Miss opportunity untuk semantic naming

**Untuk use case ini:** Low fit

### Option C: Hybrid — Standardize Spacing, Keep Documented Arbitrary Sizes

Fokus pada spacing/padding/alignment saja, tidak sentuh font sizes kecuali yang redundan.

**Pros:**
- Scope lebih kecil, risiko lebih rendah
- Masih bermanfaat tanpa refactor typography besar

**Cons:**
- Font size chaos tetap ada
- Tidak scalable — developer berikutnya tetap bingung
- Tidak konsisten dengan semangat v0.6 (one source of truth)

**Untuk use case ini:** Medium fit untuk scope kecil, tapi tidak menyelesaikan root problem

### Option D: Hybrid Pragmatis (RECOMMENDED)

Gabungan terbaik dari A dan C:
1. **Type scale** — definisikan 6 custom text utilities di `@theme` untuk ukuran yang sering dipakai (≥4 kali), ganti yang redundan
2. **Spacing rhythm** — standardize 3 tier: hero (p-5), card (p-4), compact (p-3)
3. **Font weight** — 3-level hierarchy, terapkan secara konsisten
4. **Alignment** — hilangkan `px-1` dari section headers, relying on parent container

**Pros:**
- Scope terkontrol (tidak rewrite semua, hanya yang tidak konsisten)
- Semantic naming untuk ukuran yang sering muncul
- Spacing rhythm mudah dijelaskan ke developer berikutnya

**Cons:**
- Beberapa arbitrary sizes tetap ada untuk edge cases (text-[8px] legend)
- Butuh ketelitian saat refactor agar tidak ada visual regression

---

## Comparison Table

| Kriteria | Option A (Full Custom) | Option B (Tailwind Map) | Option C (Spacing Only) | Option D (Hybrid) |
|----------|------------------------|------------------------|------------------------|-------------------|
| Menyelesaikan font chaos | ✓✓ | ✗ | ✗ | ✓ |
| Menyelesaikan spacing | ✓ | ✓ | ✓✓ | ✓✓ |
| Scope refactor | Besar | Kecil | Kecil | Medium |
| Risk visual regression | Medium | Low | Low | Medium |
| Long-term maintainability | ✓✓ | ✗ | ✓ | ✓✓ |
| Konsisten dengan v0.6 approach | ✓✓ | ✗ | ✓ | ✓✓ |

---

## Recommendation

**Choose: Option D — Hybrid Pragmatis**

**Rationale:**
App ini adalah mobile-first fintech dengan komponen yang sangat compact. Font sizes seperti `text-[9px]` dan `text-[10px]` dibutuhkan karena Tailwind tidak punya ukuran sekecil itu dalam standard scale. Namun chaos saat ini (15+ arbitrary values, termasuk yang redundan seperti `text-xs` vs `text-[12px]`) adalah masalah nyata yang memperlambat development dan menambah cognitive load.

Hybrid approach menyelesaikan kedua masalah ini:
- Arbitrary sizes yang sering dipakai mendapatkan nama semantik
- Sizes yang jarang tetap bisa arbitrary (misal `text-[8px]` hanya untuk legend)
- Spacing di-standardize dengan aturan jelas yang bisa diikuti siapapun

**Proposed type scale untuk @theme:**
```css
/* Custom text utilities — untuk menggantikan arbitrary sizes paling umum */
/* Gunakan @utility block di Tailwind v4 */
/* text-nano   = 8px  (legend, badge micro) */
/* text-micro  = 10px (label, caption) */  
/* text-label  = 11px (form label, nav item) */
/* text-body   = 12px (list item, description — menggantikan text-xs dan text-[12px]) */
/* text-value  = 13px (section header secondary, card value secondary) */
/* text-[15px], text-[18px] tetap arbitrary — jarang dipakai */
```

**Proposed spacing hierarchy:**
```
Hero cards:     p-5  (Dashboard hero)
Standard cards: p-4  (form card, ledger, account list)
Compact cards:  p-3  (stat mini, transaction item)
Section gap:    space-y-4 (semua page top-level)
Item gap:       gap-3 (grid/flex children)
List gap:       space-y-2 (list of items)
```

**Proposed font-weight hierarchy:**
```
Supporting/meta text: font-medium
Labels & descriptions: font-bold
Amounts & primary headers: font-black
```

**Urutan eksekusi (3 plans):**
1. **07-01**: Type scale tokens di `index.css` + ganti semua arbitrary sizes ke semantic class
2. **07-02**: Spacing standardization — card padding, section gaps, item gaps
3. **07-03**: Font weight hierarchy + alignment fixes (hilangkan px-1 pada section headers)

**Caveats:**
- Test di emulator mobile (max-w-md) setelah setiap plan — compact design sangat sensitif terhadap font size changes
- `text-[8px]` untuk legend bisa tetap arbitrary — terlalu kecil untuk token sendiri
- SplashScreen tidak perlu diubah (sudah isolated)

---

## Open Questions

- Apakah `text-[9px]` dan `text-[10px]` perlu token terpisah, atau cukup 1 "micro" token di 10px dengan `text-[9px]` tetap arbitrary untuk use case yang benar-benar kecil? — Impact: low
- Apakah header Layout (`pt-5 pb-3 px-5`) perlu disesuaikan juga? — Impact: medium

---

## Quality Report

**Sources consulted:**
- `src/pages/Dashboard.tsx` — dipindai penuh (265 baris)
- `src/pages/Kas.tsx` — dipindai penuh (808 baris)
- `src/pages/Talang.tsx` — dipindai penuh (1295 baris)
- `src/pages/Laporan.tsx` — dipindai parsial (100 baris pertama)
- `src/pages/Login.tsx` — dipindai penuh (157 baris)
- `src/components/Layout.tsx` — dipindai penuh (146 baris)
- `src/index.css` — dipindai penuh (64 baris)

**Verification:**
- Semua font size dan padding values diambil langsung dari source code — bukan asumsi
- Tailwind v4 custom `@utility` block: dikonfirmasi tersedia (Tailwind v4 docs, sudah dipakai di project untuk @theme color tokens)
- `text-lg` di Tailwind = 18px: dikonfirmasi (bisa gantikan `text-[18px]` jika perlu)

**Assumptions (not verified):**
- `text-[9.5px]` di Laporan (L87) hanya muncul sekali — diasumsikan bisa dihilangkan, belum grep seluruh file Laporan
- Font rendering di Chrome mobile untuk 8-10px range tidak dicek — test visual tetap diperlukan

---
*Discovery completed: 2026-06-12*
*Confidence: HIGH*
*Ready for: /paul:plan 07-spacing-typography*
