---
phase: 11-offline-ux
topic: Route ke halaman "Anda sedang offline" — audit & gap analysis
depth: standard
confidence: HIGH
created: 2026-06-13
---

# Discovery: Route ke Halaman "Anda Sedang Offline"

**Recommendation:** Routing mekanisme sudah benar. Gap utama: `offline.html` tidak memiliki auto-reconnect saat koneksi kembali — tambahkan `window.addEventListener('online', ...)` dan tombol "Coba Lagi".

**Confidence:** HIGH — seluruh temuan dapat diverifikasi langsung dari source code.

## Objective

Yang perlu dipahami sebelum perencanaan:
- Apakah routing ke `offline.html` sudah benar secara teknis?
- Apa yang terjadi di setiap skenario (online/offline, SW installed/not)?
- Apa gaps UX yang ada pada halaman offline saat ini?
- Apakah ada konflik antara Vercel routing dan Service Worker routing?

## Scope

**Include:**
- Workbox `navigateFallback` konfigurasi di `vite.config.ts`
- File `public/offline.html` (konten dan UX)
- `vercel.json` routing rules
- `ReloadPrompt.tsx` (SW registration & status)

**Exclude:**
- API caching strategy (sudah benar, NetworkFirst)
- InstallPrompt UX (sudah di-deferred dari state.md)

## Findings

### Alur Routing Offline — 4 Skenario

#### Skenario A: Online, SW belum terinstall (first visit)
1. Browser navigasi ke `/dashboard`
2. Tidak ada SW → request langsung ke Vercel CDN
3. Vercel: `filesystem` → tidak ada `/dashboard` file → `{ "src": "/(.*)", "dest": "/index.html" }` → serve `index.html`
4. React Router render halaman Dashboard
**Status: ✅ Benar**

#### Skenario B: Online, SW sudah terinstall
1. Browser navigasi ke `/dashboard` (navigate request)
2. SW intercept → coba network → berhasil → Vercel serve `index.html`
3. React Router render halaman Dashboard
**Status: ✅ Benar** — NetworkFirst approach untuk navigasi

#### Skenario C: Offline, SW belum terinstall (first offline visit)
1. Browser navigasi ke app
2. Tidak ada SW → browser native error ("Tidak ada koneksi internet")
3. Tidak ada fallback
**Status: ⚠️ Expected** — tidak bisa dihindari; SW harus diinstall saat online dulu

#### Skenario D: Offline, SW sudah terinstall ← SKENARIO UTAMA
1. Browser refresh atau navigasi langsung ke URL
2. SW intercept navigate request
3. Workbox `NavigationRoute` aktif (karena URL match `/^(?!\/api\/).*/`)
4. Network fetch gagal → SW serve `navigateFallback: '/offline.html'` dari precache
5. User melihat halaman "Anda sedang offline"
**Status: ✅ Benar — tapi UX incomplete (lihat Gaps)**

### Analisis `navigateFallback` Configuration

```js
// vite.config.ts
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
  navigateFallback: '/offline.html',             // ← intercept offline navigation
  navigateFallbackAllowlist: [/^(?!\/api\/).*/], // ← exclude /api/* routes
}
```

**`offline.html` di precache:** Ya — matches `**/*.html` di globPatterns ✅  
**`logo.svg` di precache:** Ya — via `includeAssets: ['logo.svg', ...]` ✅  
**API routes dikecualikan:** Ya — `/api/*` tidak trigger navigateFallback ✅

### Gap #1 — Tidak Ada Auto-Reconnect

`offline.html` tidak memiliki mekanisme untuk kembali ke app saat koneksi pulih:

```html
<!-- offline.html saat ini — tidak ada auto-reconnect -->
<body>
  <h1>Anda sedang offline</h1>
  <p>Periksa koneksi internet Anda dan coba lagi...</p>
  <!-- tidak ada tombol "Coba Lagi", tidak ada event listener online -->
</body>
```

User harus secara manual refresh browser — pengalaman buruk terutama di mobile PWA.

**Fix yang diperlukan:**
```html
<button onclick="window.location.reload()">Coba Lagi</button>
<script>
  window.addEventListener('online', () => window.location.reload());
</script>
```

### Gap #2 — z-index Conflict (Deferred dari Phase 09)

`ReloadPrompt` (`z-30`) tertutup nav bar (`z-40`) — dicatat di STATE.md sebagai deferred.

Ini tidak memblokir offline routing, tapi mempengaruhi UX saat SW update notification muncul.

### Vercel vs Service Worker — Tidak Ada Konflik

```
Browser request → SW intercept (jika installed)
                → Vercel CDN (jika SW tidak ada / online pass-through)

Vercel routes:
  /api/*         → serverless function  (tidak konflik dengan SW NavigationRoute)
  [filesystem]   → static CDN files    (SW serve dari precache, identik)
  /*             → index.html          (SW serve offline.html saat offline)
```

Tidak ada konflik. SW dan Vercel routing complementary.

## Comparison

| Aspek | Status Saat Ini | Status Ideal |
|-------|----------------|--------------|
| `navigateFallback` configuration | ✅ Benar | — |
| offline.html di precache | ✅ Ya | — |
| logo.svg di precache | ✅ Ya | — |
| API routes dikecualikan | ✅ Ya | — |
| Auto-reconnect saat online | ❌ Tidak ada | Listener `window.online` |
| Tombol retry manual | ❌ Tidak ada | Button "Coba Lagi" |
| ReloadPrompt z-index | ⚠️ z-30 tertutup z-40 | z-50 atau higher |
| First visit offline | ⚠️ Native browser error | Tidak bisa diperbaiki (acceptable) |

## Recommendation

**Tambahkan auto-reconnect + retry button ke `offline.html`**

**Rationale:**
Routing mekanisme sudah benar — tidak perlu perubahan SW atau Vercel config. Gap tunggal yang meaningful adalah UX: user tidak tahu cara kembali ke app setelah koneksi pulih. Satu inline `<script>` listener + satu tombol menyelesaikan masalah ini.

Jika ingin, ReloadPrompt z-index (`z-30` → `z-50`) bisa diselesaikan bersamaan sebagai plan kedua di phase yang sama.

**Caveats:**
- `window.addEventListener('online', ...)` memerlukan browser yang mendukung online event (semua modern browser ✅)
- Auto-reload saat reconnect bisa terjadi di waktu yang tidak diinginkan user — pertimbangkan delay 1 detik atau tampilkan banner dulu

## Open Questions

- Apakah auto-reload langsung lebih baik, atau tampilkan banner "Koneksi pulih — Tap untuk refresh"? — Impact: medium (UX preference)
- Haruskah ReloadPrompt z-index fix digabung di phase ini? — Impact: low

## Quality Report

**Sources consulted:**
- `vite.config.ts` — Workbox config (langsung dari source) — 2026-06-13
- `public/offline.html` — Konten halaman offline — 2026-06-13
- `vercel.json` — Routing rules production — 2026-06-13
- `src/components/ReloadPrompt.tsx` — SW integration — 2026-06-13
- `.paul/STATE.md` — Deferred issues log — 2026-06-13

**Verification:**
- `offline.html` di precache: Verified via globPatterns `**/*.html` ✅
- `logo.svg` di precache: Verified via `includeAssets` array ✅
- API dikecualikan dari fallback: Verified via `navigateFallbackAllowlist` regex ✅
- ReloadPrompt z-index conflict: Verified di `className="... z-30 ..."` ReloadPrompt.tsx:24 ✅

**Assumptions (not verified):**
- Workbox NavigationRoute behavior: diasumsikan network-first untuk navigasi (serve offline.html hanya saat network gagal, bukan selalu). Ini adalah standard Workbox behavior untuk generateSW + navigateFallback pattern.

---
*Discovery completed: 2026-06-13*  
*Confidence: HIGH*  
*Ready for: /paul:plan 11-offline-ux*
