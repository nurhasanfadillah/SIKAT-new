---
phase: 13-kas-rekap-ui-polish
topic: Audit UI halaman Kas Rekap — temuan bug & polish items
depth: standard
confidence: HIGH
created: 2026-06-13
---

# Discovery: Audit UI Halaman Kas Rekap

**Recommendation:** Fix 1 bug kritis (invalid color class) + 4 item konsistensi visual — scope mirip Phase 12 Dashboard Polish.

**Confidence:** HIGH — semua temuan diverifikasi langsung dari Kas.tsx + komparasi Dashboard.tsx.

## Objective

Apa yang perlu diketahui sebelum planning:
- Apakah ada bug fungsional di UI Kas Rekap?
- Di mana inkonsistensi dengan design system (color, typography, spacing)?
- Apakah pattern yang dibentuk di Phase 12 (Dashboard) sudah konsisten di Kas?
- Seberapa besar scope fix yang dibutuhkan?

## Scope

**Include:**
- `src/pages/Kas.tsx` — audit full (809 baris)
- Komparasi pattern vs `Dashboard.tsx` (referensi Phase 12)
- Design system: type scale (`@theme`), color tokens, spacing conventions

**Exclude:**
- Logic bisnis (filter, API calls, date handling)
- Halaman Talang dan Laporan (scope phase tersendiri)
- Perubahan fungsional / penambahan fitur

## Findings

### Temuan 1: `text-rose-450` — Bug Kritis

**Lokasi:** `Kas.tsx:323`

```tsx
<span className="text-value font-bold text-rose-450 leading-tight mt-1 truncate">
  {formatCurrency(pengeluaranBulanIni)}
</span>
```

**Masalah:** `rose-450` bukan shade Tailwind yang valid (hanya ada `rose-400`, `rose-500`, dll). Class ini tidak akan menghasilkan warna apapun — teks "Out (Bulan ini)" akan render putih default, bukan rose.

**Fix:** Ganti `text-rose-450` → `text-rose-400`.

---

### Temuan 2: Warna Nominal Pengeluaran di Transaction List

**Lokasi:** `Kas.tsx:750`

```tsx
<span className={`text-body font-black block ${isPemasukan ? 'text-brand-500' : 'text-slate-100'}`}>
  {isPemasukan ? '+' : '-'}{formatCurrency(t.nominal)}
</span>
```

**Masalah:** Pengeluaran menggunakan `text-slate-100` (netral), padahal Dashboard menggunakan `text-rose-400` untuk transaksi outgoing:

```tsx
// Dashboard.tsx:258-260
isExpense || isTalangPelunasan ? 'text-rose-400' : 'text-slate-100'
```

Prefix `-` sudah ada, tapi warna netral membuat pengeluaran tidak terlihat berbeda secara visual dari teks biasa.

**Fix:** `text-slate-100` → `text-rose-400` untuk Pengeluaran.

---

### Temuan 3: Spinner Track Inconsistency

**Lokasi:** `Kas.tsx:208`

```tsx
// Kas — track hijau (kurang kontras)
<div className="h-10 w-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
```

```tsx
// Dashboard — track putih/10 (lebih baik secara visual)
<div className="h-10 w-10 border-4 border-white/10 border-t-brand-500 rounded-full animate-spin" />
```

**Fix:** `border-brand-500/30` → `border-white/10` agar konsisten dengan Dashboard.

---

### Temuan 4: Empty State Tidak Membedakan "Filter" vs "Kosong"

**Lokasi:** `Kas.tsx:797-800`

```tsx
{filteredKas.length === 0 && (
  <div className="text-center py-10 text-body text-slate-500 border border-dashed border-white/5 rounded-2xl">
    Belum ada transaksi terekam.
  </div>
)}
```

**Masalah:** Pesan yang sama digunakan untuk dua kondisi berbeda:
1. `kas.length === 0` — benar-benar tidak ada data
2. `filteredKas.length === 0 && kas.length > 0` — ada data tapi ter-filter keluar

**Fix:** Bedakan pesan berdasarkan `isAnyFilterActive && kas.length > 0`.

---

### Temuan 5: Aria Decorative Icons di Transaction List

**Lokasi:** `Kas.tsx:728-729`

```tsx
{isPemasukan ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
```

Icon TrendingUp/TrendingDown di dalam container `role="none"` ini bersifat dekoratif — informasi arah sudah conveyed oleh warna dan teks nominal. Harus ditambah `aria-hidden="true"` pada parent container atau icon itu sendiri.

**Fix:** Tambah `aria-hidden="true"` pada div icon container (col-1).

---

### Temuan 6: `text-[18px]` — Arbitrary Size (Diketahui, Bukan Bug)

**Lokasi:** `Kas.tsx:304`, juga ada di `Dashboard.tsx:121,137`

`text-[18px]` digunakan konsisten di Kas dan Dashboard untuk hero currency values. Type scale hanya mendefinisikan hingga `text-value` (13px). Ini adalah gap yang disengaja — 18px adalah ukuran hero yang tidak perlu di-tokenisasi untuk saat ini.

**Status:** NOT a bug — pattern konsisten. Dokumentasi saja.

---

### Temuan 7: `text-sm` di Loading State & Form Heading

**Lokasi:** `Kas.tsx:209` (loading), `Kas.tsx:349` (form heading)

```tsx
<span className="text-sm text-slate-400">Memuat Buku Kas...</span>  // 14px
<h3 className="text-sm font-bold text-brand-500 ...">                // 14px
```

`text-sm` (14px) juga digunakan di `Dashboard.tsx:17` untuk loading text. Tidak ada semantic class untuk 14px di type scale saat ini.

**Status:** Inkonsistensi minor yang berbagi pattern dengan Dashboard. Low priority — biarkan atau tambah `text-sm` sebagai gap yang diketahui.

## Comparison

| Item | Status | Severity | Fix Effort |
|------|--------|----------|------------|
| `text-rose-450` invalid color (Line 323) | Bug | P0 | 1 menit |
| Pengeluaran nominal `text-slate-100` (Line 750) | Inconsistent | P1 | 1 menit |
| Spinner track `border-brand-500/30` (Line 208) | Inconsistent | P1 | 1 menit |
| Empty state pesan tidak spesifik (Line 797) | Polish | P1 | 5 menit |
| Missing `aria-hidden` on icon container (Line 722) | A11y | P2 | 1 menit |
| `text-[18px]` (Line 304) | Known pattern | — | Tidak perlu |
| `text-sm` loading/form (Line 209, 349) | Known gap | P3 | — |

## Recommendation

**Plan 1 plan atomic: "Kas Rekap UI Polish"**

Fix semua P0 + P1 + P2 dalam 1 plan:
1. `text-rose-450` → `text-rose-400` (1 lokasi)
2. Pengeluaran nominal → `text-rose-400` (1 lokasi)
3. Spinner track → `border-white/10` (1 lokasi)
4. Empty state — bedakan filtered vs kosong (1 blok)
5. `aria-hidden="true"` pada icon container col-1 (1 lokasi)

Total: 5 perubahan di 1 file (`Kas.tsx`). Tidak ada dependency eksternal.

**Caveats:**
- Pengeluaran warna `text-rose-400` adalah judgment call — jika dimaksudkan netral, skip item #2
- `text-sm` gaps tidak perlu ditangani kecuali ada type scale update di v0.14+

## Open Questions

- Apakah warna `text-rose-400` untuk nominal Pengeluaran diinginkan atau perlu konfirmasi dari UX? — Impact: low (bisa di-skip jika tidak disetujui)

## Quality Report

**Sources consulted:**
- `src/pages/Kas.tsx` — full read, 2026-06-13
- `src/pages/Dashboard.tsx` — targeted grep untuk pattern comparison, 2026-06-13
- `src/index.css` — @theme type scale, 2026-06-13

**Verification:**
- `text-rose-450` invalid: Verified — Tailwind `rose` scale hanya ada 50/100/200/300/400/500/600/700/800/900/950
- Dashboard spinner pattern: Verified di Dashboard.tsx:16 (`border-white/10`)
- Pengeluaran warna di Dashboard: Verified di Dashboard.tsx:258-260 (`text-rose-400`)
- Type scale 18px: Verified tidak ada token di `index.css` @theme; tapi pattern konsisten di kedua halaman

**Assumptions (not verified):**
- `aria-hidden` pada icon container sudah cukup tanpa perlu `role="img"` atau alt text tambahan — karena informasi conveyed secara tekstual oleh nominal dan warna

---
*Discovery completed: 2026-06-13*
*Confidence: HIGH*
*Ready for: /paul:plan 13-kas-rekap-ui-polish*
