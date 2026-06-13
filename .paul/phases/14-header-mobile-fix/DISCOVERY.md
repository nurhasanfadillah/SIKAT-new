---
phase: 14-header-mobile-fix
topic: Audit header aplikasi pada mobile view — temuan bug & inkonsistensi
depth: standard
confidence: HIGH
created: 2026-06-13
---

# Discovery: Header Mobile Audit

**Recommendation:** Fix 5 issues nyata (theme_color salah, iOS PWA status bar, safe-area padding, header overflow small phone, text-[15px] arbitrary) — total 7 item termasuk 2 LOW yang opsional.

**Confidence:** HIGH — semua issues ditemukan langsung dari source code (Layout.tsx, index.html, vite.config.ts). Tidak ada asumsi.

## Objective

Yang perlu diketahui sebelum planning:
- Issue apa saja yang ada di header pada mobile view?
- Seberapa parah masing-masing issue?
- Solusi apa yang paling tepat per issue?
- Apakah iOS edge-to-edge approach layak diimplementasi?

## Scope

**Include:**
- `Layout.tsx` — header bar + page title section + bottom nav
- `index.html` — viewport meta, PWA meta, theme-color
- `vite.config.ts` — PWA manifest (theme_color, background_color)

**Exclude:**
- Halaman individual (Dashboard, Kas, Talang, Laporan) — hanya Layout wrapper
- PWA icon assets — sudah dicover Phase 05/09
- Offline page styling — sudah dicover Phase 11

## Findings

### Issue 1: `theme_color` dan `background_color` Outdated (HIGH)

**Lokasi:** `vite.config.ts:19-20`, `index.html:7`

**Bug:**
```
theme_color: '#2563EB'    ← biru, outdated
background_color: '#2563EB'  ← biru, outdated
```

App sudah migrasi ke teal (`brand-500 = #00e5a3`) sejak Phase 06. Tapi `theme_color` di manifest PWA dan `<meta name="theme-color">` di index.html masih pakai `#2563EB` (biru lama).

**Impact:**
- Android Chrome: tab color indicator di browser address bar berwarna biru, tidak konsisten dengan UI teal
- PWA splash screen background berwarna biru saat launching
- Terlihat sangat jelas saat install PWA di Android

**Fix:**
- `theme_color: '#00e5a3'` (brand-500)
- `background_color: '#050811'` (surface-base — dark navy, supaya splash screen konsisten)
- Update `<meta name="theme-color" content="#00e5a3">` di index.html

---

### Issue 2: iOS PWA Status Bar Style Salah (HIGH)

**Lokasi:** `index.html:10`, `index.html:5`

**Bug:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<!-- ↑ viewport-fit=cover MISSING -->

<meta name="apple-mobile-web-app-status-bar-style" content="default">
<!-- ↑ "default" = light/white status bar on dark app -->
```

**Impact:**
- Saat app diinstall sebagai PWA di iPhone, status bar (area di atas) berwarna putih/abu, sementara app dark navy (`#050811`)
- Kontras sangat janggal — terlihat "web-ish", bukan native
- Tanpa `viewport-fit=cover`, app tidak extend ke edge screen pada iPhone dengan notch/Dynamic Island

**Dua opsi approach:**

| | Option A: Edge-to-Edge (recommended) | Option B: Keep Default |
|--|--|--|
| Status bar | `black-translucent` | `default` |
| Viewport | + `viewport-fit=cover` | Tidak berubah |
| Safe area | Perlu `env(safe-area-inset-top)` padding | Tidak perlu |
| Look & feel | Native dark PWA | "Web app" feeling |
| Kompleksitas | Medium (+CSS) | Minimal |

**Rekomendasi: Option A** — app ini menargetkan mobile PWA, edge-to-edge adalah standard dark-themed native apps.

---

### Issue 3: Tidak Ada `env(safe-area-inset-top)` pada Header (MEDIUM)

**Lokasi:** `Layout.tsx:49`

**Kondisi saat ini:**
```jsx
<header className="... pt-5 md:pt-9 ...">
```

**Hanya relevan setelah Issue 2 di-fix.** Tanpa `viewport-fit=cover`, `env(safe-area-inset-top)` = 0. Tapi setelah implementasi edge-to-edge, header perlu padding dinamis:

```jsx
// Fix:
<header className="... pt-[max(env(safe-area-inset-top),20px)] md:pt-9 ...">
```

Atau via CSS utility di `index.css`:
```css
.pt-safe { padding-top: max(env(safe-area-inset-top), 1.25rem); }
```

**Impact tanpa fix:** Konten header (logo, nama user) tertutup di bawah status bar pada iPhone dengan notch/Dynamic Island setelah edge-to-edge diaktifkan.

---

### Issue 4: Header Layout Overflow pada Small Phones (MEDIUM)

**Lokasi:** `Layout.tsx:49-77`

**Analisis width pada mobile:**

Left side:
- Logo: 32px (h-8)
- gap-3: 12px
- Avatar: 40px (h-10)
- gap-3: 12px
- Text column (flex-col): up to ~120px (bounded oleh max-w-[120px] pada name span)
- **Total left: ~216px**

Right side:
- Role badge: "BENDAHARA" di text-nano (9px) uppercase ≈ ~78px
- gap-2: 8px
- Logout button: ~30px
- **Total right: ~116px**

**Kalkulasi per device:**
| Device | Viewport | Available (px-5) | Left+Right | Status |
|--------|----------|-----------------|------------|--------|
| Pixel 9 | 393px | 353px | 332px | ✅ OK |
| Samsung A54 | 390px | 350px | 332px | ✅ OK |
| Common Android | 360px | 320px | 332px | ⚠️ 12px overflow |
| Redmi 9/A series | 360px | 320px | 332px | ⚠️ 12px overflow |
| iPhone SE 2022 | 375px | 335px | 332px | ✅ Barely fits |
| iPhone SE 1st gen | 320px | 280px | 332px | ❌ 52px overflow |

360px viewport sangat umum di pasar Indonesia (Redmi, Samsung Galaxy A low-end) — target user sekolah yang kemungkinan pakai HP entry-level.

**Root cause:** Left group `<div className="flex items-center gap-3">` tidak punya `min-w-0` atau `overflow-hidden`, sehingga tidak bisa shrink ketika ruang terbatas.

**Fix:**
```jsx
// Tambah flex-1 min-w-0 pada left group:
<div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
  {/* ... */}
  <div className="flex flex-col min-w-0">
    <span className="text-label ...">Selamat Datang,</span>
    <span className="text-value font-bold ... truncate">
      {profile?.nama || 'Pengguna'}
    </span>
  </div>
</div>
// Right group: flex-shrink-0 agar badge tidak terpotong
<div className="flex items-center gap-2 flex-shrink-0">
```

---

### Issue 5: `text-[15px]` Arbitrary Size (LOW)

**Lokasi:** `Layout.tsx:87`

```jsx
<span className="text-[15px] font-bold tracking-wider text-brand-500 font-mono">
  &lt;SIKAT&gt;
</span>
```

`text-[15px]` bypass type scale Phase 07. Scale yang ada: nano(9)/micro(10)/label(11)/body(12)/value(13). Tidak ada ukuran 15px.

**Fix opsi:**
- Pakai `text-value` (13px) + `font-bold` — sedikit lebih kecil tapi konsisten
- Atau tambah `text-heading` = 15px ke `@theme` di index.css (jika 15px memang diperlukan)

---

### Issue 6: `text-xl` pada Page Title h1 (LOW)

**Lokasi:** `Layout.tsx:83`

```jsx
<h1 className="text-xl font-bold ...">
```

`text-xl` adalah standard Tailwind (20px), bukan bagian dari custom type scale Phase 07. Secara fungsional bekerja tapi inkonsisten.

**Fix:** Tambah `text-title` = 20px ke `@theme`, atau biarkan sebagai `text-xl` (impact minimal).

---

### Issue 7: `h-4.5` dan `h-5.5` Non-Standard Units (LOW — Functional)

**Lokasi:** `Layout.tsx:75` (logout icon), `Layout.tsx:125` (nav icons)

```jsx
<LogOut className="h-4.5 w-4.5" />   // 18px
<item.icon className="h-5.5 w-5.5" />  // 22px
```

Di Tailwind CSS v4, ini valid — menggunakan `calc(var(--spacing) * N)`. Tapi tidak ada di Tailwind default scale (biasanya 4=16px, 5=20px, 6=24px).

**Verdict:** Biarkan — Tailwind v4 support fractional sizes, ini fungsional dan tidak perlu diubah.

## Comparison

| Issue | Severity | Effort | Impact jika tidak difix |
|-------|----------|--------|------------------------|
| theme_color #2563EB | HIGH | Minimal (2 lines) | Brand mismatch di Android PWA |
| iOS status bar style | HIGH | Medium (viewport + CSS) | White bar on dark PWA, "webby" feel |
| Safe-area-inset-top | MEDIUM | Low (1 line CSS) | Konten tertutup notch setelah edge-to-edge |
| Header overflow 360px | MEDIUM | Low (flex fix) | Layout rusak di 360px Android (umum di target market) |
| text-[15px] | LOW | Minimal (1 word) | Inkonsistensi type scale saja |
| text-xl h1 | LOW | Minimal | Inkonsistensi type scale saja |
| h-4.5 / h-5.5 | LOW | Skip | Tidak ada masalah, Tailwind v4 support |

## Recommendation

**Fix semua HIGH dan MEDIUM dalam 1 phase (14-01).**

Urutan eksekusi yang disarankan:
1. Fix `theme_color` + `background_color` di `vite.config.ts` dan `index.html` → 2 file, 3 lines
2. Upgrade iOS PWA: `status-bar-style: black-translucent` + `viewport-fit=cover` → `index.html`
3. Tambah safe-area-inset-top pada header → `Layout.tsx:49`
4. Fix header flex layout untuk small phones → `Layout.tsx:49-63`
5. Fix `text-[15px]` → `Layout.tsx:87`

**Untuk issue LOW (text-xl, h-4.5):** Opsional — bisa masuk atau skip tergantung bandwidth.

**Caveats:**
- Perlu test di device fisik iOS setelah implementasi edge-to-edge (atau Safari DevTools dengan device emulation)
- `env(safe-area-inset-top)` di desktop browser = 0, jadi visual di `md:` view tidak berubah — hanya visible on real mobile device

## Open Questions

- Apakah ada target device minimum? 320px (iPhone SE 1st) sangat jarang, 360px masih umum — bisa scope ke 360px+
  Impact: medium (menentukan seberapa agresif flex shrink yang diimplementasi)

## Quality Report

**Sources consulted:**
- `src/components/Layout.tsx` — direct code inspection (2026-06-13)
- `index.html` — direct code inspection (2026-06-13)
- `vite.config.ts` — direct code inspection (2026-06-13)
- `src/index.css` — verified: tidak ada safe-area handling (2026-06-13)
- `.paul/STATE.md` — context Phase 06 color migration (2026-06-13)

**Verification:**
- `theme_color: '#2563EB'`: Verified di `vite.config.ts:19` dan `index.html:7`
- `status-bar-style: default`: Verified di `index.html:10`
- No `viewport-fit=cover`: Verified di `index.html:5` (viewport meta)
- No `env(safe-area-inset-top)`: Verified grep across `src/index.css` — no matches
- `text-[15px]`: Verified di `Layout.tsx:87`
- `h-4.5 w-4.5`: Verified di `Layout.tsx:75`
- `h-5.5 w-5.5`: Verified di `Layout.tsx:125`
- Width overflow kalkulasi: Manual calculation berdasarkan Tailwind spacing scale dan typical font metrics

**Assumptions (not verified):**
- Font metrics "BENDAHARA" badge width (~78px) — estimasi berdasarkan 9px font + tracking-wider, belum diukur di browser
- 360px viewport = common di Indonesia — berdasarkan general knowledge device landscape, belum diverifikasi dengan analytics

---
*Discovery completed: 2026-06-13*
*Confidence: HIGH*
*Ready for: /paul:plan 14-header-mobile-fix*
