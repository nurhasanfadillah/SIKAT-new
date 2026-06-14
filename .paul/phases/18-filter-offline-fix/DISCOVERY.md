---
phase: 18-filter-offline-fix
topic: PWA offline page terjebak + filter button count badge cleanup
depth: standard
confidence: HIGH
created: 2026-06-14
---

# Discovery: PWA Offline Behavior Fix + Filter Cleanup

**Recommendation:** Ubah `navigateFallback` dari `/offline.html` ke `/index.html` dan fix retry logic di offline.html.

**Confidence:** HIGH — root cause teridentifikasi langsung dari kode; tidak ada library baru yang dibutuhkan.

## Objective

Yang perlu dipahami sebelum planning:
- Mengapa user tiba-tiba masuk ke `offline.html` padahal masih online
- Mengapa user tidak bisa kembali ke app dari `offline.html`
- Pendekatan terbaik untuk fix tanpa breaking existing offline support

## Scope

**Include:**
- `vite.config.ts` — Workbox navigateFallback config
- `public/offline.html` — retry logic + minor warna design system
- `src/pages/Kas.tsx` — hapus count badge dari filter buttons
- `src/pages/Talang.tsx` — hapus count badge dari filter buttons

**Exclude:**
- Redesign offline UX secara keseluruhan
- Penambahan offline caching strategy baru
- Service worker custom file

## Findings

### Bug #1: navigateFallback salah konfigurasi (ROOT CAUSE UTAMA)

**File:** `vite.config.ts:51`
```javascript
navigateFallback: '/offline.html',
```

**Masalah:**
`navigateFallback` di Workbox adalah mekanisme **SPA routing fallback** — bukan offline fallback.

Ketika service worker mengintercept navigation request ke path seperti `/kas` atau `/talang`:
1. Path tersebut tidak ada sebagai file fisik di precache
2. Service worker tidak ketemu di cache → trigger `navigateFallback`
3. User di-serve `offline.html` — **meskipun masih online**

Allowlist `navigateFallbackAllowlist: [/^(?!\/api\/).*/]` mencakup semua path non-API, artinya `/kas`, `/talang`, dll semuanya masuk ke fallback ini.

**Fix:** Ubah ke `/index.html` agar React Router yang menangani routing SPA — bukan `offline.html`.

### Bug #2: Retry logic terjebak loop

**File:** `public/offline.html:49`
```javascript
onclick="window.location.reload()"
```

**Masalah:**
`window.location.reload()` me-reload URL yang sedang aktif — yaitu `offline.html` itu sendiri. Service worker intercept request tersebut, tidak ketemu di precache path navigation yang benar, lalu serve `offline.html` lagi. User terjebak.

**Fix:** Ganti ke `window.location.href = '/'` agar navigate ke root app, bukan reload halaman yang sama.

### Bug #3: `window.online` event di offline.html tidak cukup

**File:** `public/offline.html:51-53`
```javascript
window.addEventListener('online', function() {
  window.location.reload();
});
```

Auto-reconnect juga pakai `reload()` yang sama — akan terjebak loop yang sama.

**Fix:** Ganti ke `window.location.href = '/'`.

### Temuan #4: Filter button count badge (Kas & Talang)

**Kas.tsx baris 223–225 + 526–549:**
- `countAll`, `countPemasukan`, `countPengeluaran` hanya dipakai di filter buttons
- Badge count `<span>` di-render di tiap button

**Talang.tsx baris 341–344 + 922–954:**
- `countAll`, `countBaru`, `countPelunasan`, `countTransfer` hanya dipakai di filter buttons
- Badge count `<span>` di-render di tiap button

**Fix:** Hapus property `count` dari array, hapus `<span>` badge, hapus 4 const count per file.

### Temuan #5: Warna offline.html tidak match design system

**File:** `public/offline.html`
| Element | Sekarang | Seharusnya |
|---------|----------|------------|
| Background body | `#0f172a` (slate-900) | `#050811` (app background) |
| Tombol warna | `#2563eb` (blue-600) | `#00e5a3` (brand-500) |
| Tombol hover | `#1d4ed8` | `#00cc90` |
| Tombol text | `#fff` | `#050811` (text-inverse) |

## Comparison: Pilihan navigateFallback

| Opsi | Behavior | SPA Routing | Offline Handling | Kompleksitas |
|------|----------|-------------|------------------|--------------|
| `/offline.html` (sekarang) | Serve offline.html untuk path non-cache | ❌ Broken | ✅ Ada halaman | Bug aktif |
| `/index.html` | Serve index.html → React Router handle | ✅ Benar | ⚠️ Perlu React offline detection | Low |
| `null` | Navigation failure → browser error | ❌ Error page | ❌ Tidak ada | Minimal |

## Recommendation

**Choose: `navigateFallback: '/index.html'`**

**Rationale:**
- Fix root cause: SPA routing bekerja benar
- `index.html` ada di precache, selalu tersedia offline
- React app sudah bisa detect offline via API call failure
- `offline.html` tetap ada di-serve manual via `window.location.href = '/offline.html'` jika dibutuhkan di masa depan

**Perubahan yang diperlukan:**

1. `vite.config.ts`: `navigateFallback: '/index.html'`
2. `vite.config.ts`: Update `navigateFallbackDenylist` → exclude `/api/` dan `/offline.html` itself
3. `public/offline.html`: Semua `window.location.reload()` → `window.location.href = '/'`
4. `public/offline.html`: Fix warna sesuai design system (#5 di atas)
5. `src/pages/Kas.tsx`: Hapus count badges + 3 const
6. `src/pages/Talang.tsx`: Hapus count badges + 4 const

**Caveats:**
- Dengan `navigateFallback: '/index.html'`, `offline.html` tidak lagi otomatis di-serve. User offline yang navigate ke URL baru akan masuk ke React app, lalu API call fail → perlu error handling di React (sudah ada loading/error state di `useTransactions`)
- Tidak perlu tambah komponen offline baru karena app sudah handle API error

## Open Questions

Tidak ada — discovery menjawab semua pertanyaan teknis.

## Quality Report

**Sources consulted:**
- `vite.config.ts` — konfigurasi Workbox aktif
- `public/offline.html` — retry logic saat ini
- `src/pages/Kas.tsx` — filter button structure
- `src/pages/Talang.tsx` — filter button structure
- Workbox docs (navigateFallback behavior)

**Verification:**
- `navigateFallback: '/offline.html'` terverifikasi sebagai penyebab SPA routing failure
- `window.location.reload()` terverifikasi tidak navigate ke root
- Count variables di Kas.tsx + Talang.tsx terverifikasi hanya dipakai di filter section

**Assumptions (not verified):**
- Tidak ada asumsi kritis — semua root cause ditemukan langsung di kode

---
*Discovery completed: 2026-06-14*
*Confidence: HIGH*
*Ready for: /paul:plan 18-filter-offline-fix*
