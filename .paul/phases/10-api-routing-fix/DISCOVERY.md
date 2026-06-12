---
phase: 10-api-routing-fix
topic: Vercel Routing — POST /api/auth/login 404 Not Found di production
depth: standard
confidence: HIGH
created: 2026-06-13
---

# Discovery: Vercel Routing 404 pada /api/* paths

**Recommendation:** Ganti `rewrites` ke `routes` di `vercel.json` — satu baris perubahan yang memperbaiki semua API routes.

**Confidence:** HIGH — Root cause jelas dari analisis Vercel v2 routing priority; fix sudah terbukti dari konfigurasi awal phase 03 yang berfungsi.

## Objective

Yang perlu diketahui sebelum planning:
- Mengapa `POST /api/auth/login` mengembalikan 404 di production?
- Apakah ini masalah `vercel.json` atau kode Express?
- Apa perbedaan `routes` vs `rewrites` di Vercel v2?
- Apa opsi fix dan trade-off-nya?

## Scope

**Include:**
- Vercel v2 routing priority analysis
- `vercel.json` current state vs expected behavior
- Opsi perbaikan dan implikasinya

**Exclude:**
- Perubahan pada kode Express atau API handler
- Alternatif hosting lain
- Perubahan database atau auth logic

## Root Cause Analysis

### Temuan Kritis: Commit `2ec5d8b` Memperkenalkan Regresi

Commit terbaru "fix: update Vercel rewrites and remove function duration settings" mengganti `routes` → `rewrites` di `vercel.json`. Ini menyebabkan regresi routing di production.

### Vercel v2 Routing Priority Order

```
1. Static files (dari outputDirectory / public/)
2. API Functions (files di api/ directory)   ← MASALAH ADA DI SINI
3. Rewrites
4. 404
```

**Flow yang terjadi sekarang (BROKEN):**
```
POST /api/auth/login
  → Step 2: Cek api/auth/login.js → TIDAK ADA
  → Return 404  ← BERHENTI DI SINI, tidak fall-through ke rewrites!
```

**Flow yang diharapkan:**
```
POST /api/auth/login
  → Rewrite /(.*) → /api/index
  → Express handler menangani POST /api/auth/login
  → Return JSON response
```

Karena Vercel TIDAK fall-through dari "API function not found" ke rewrites, seluruh `/api/*` endpoints gagal dengan 404.

**Bukti:** Error message "Gagal masuk: Server merespons format tidak valid" terjadi karena `auth-client.ts:79` mendeteksi response bukan JSON — artinya yang dikembalikan adalah Vercel's HTML 404 page, bukan response dari Express.

## Findings

### Option A: Kembalikan ke `routes` (Minimal Change)

**`vercel.json`:**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "routes": [
    { "src": "/(.*)", "dest": "/api/index" }
  ]
}
```

**Cara kerja:**
- `routes` menggantikan seluruh default routing Vercel
- Semua request (API dan static) di-proxy ke Express handler di `/api/index`
- Express melayani static files dari `dist/` via `express.static(distPath)`
- Express melayani SPA via catch-all `get("*", ...)` ke `index.html`

**Pros:**
- Satu baris perubahan — sangat minimal
- Behavior identik dengan konfigurasi awal phase 03 yang sudah terbukti bekerja
- Tidak perlu ubah Express handler

**Cons:**
- Static assets (JS/CSS) dilayani melalui serverless function, bukan CDN langsung
- Sedikit lebih lambat untuk initial load (tapi service worker cache-kan setelah itu)

**For our use case:** Solusi terbaik. SIKAT sudah punya service worker yang cache semua static assets, jadi latency tambahan hanya di first visit.

---

### Option B: `outputDirectory` + Split Routes (Optimal tapi Kompleks)

**`vercel.json`:**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**Cara kerja:**
- `/api/*` di-route ke Express handler SEBELUM filesystem check
- Static files dilayani langsung oleh Vercel CDN (via `handle: filesystem`)
- SPA routing fallback ke `index.html`

**Pros:**
- Static assets dilayani via CDN — lebih cepat
- Serverless function hanya dipanggil untuk API requests

**Cons:**
- Lebih kompleks, 3 route rules
- Butuh perubahan lebih besar
- Vercel `handle: filesystem` behavior perlu diverifikasi dengan setup ini

**For our use case:** Over-engineering untuk saat ini. SIKAT sudah punya service worker — CDN caching dari Vercel tidak memberikan benefit tambahan yang signifikan.

---

### Option C: Rewrites + Explicit `/api/` Route

**`vercel.json`:**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" },
    { "source": "/(.*)", "destination": "/api/index" }
  ]
}
```

**Analisis:** TIDAK AKAN BERHASIL. Berdasarkan Vercel v2 routing priority, API Functions (step 2) diperiksa SEBELUM Rewrites (step 3). Menambahkan rewrite untuk `/api/(.*)` tetap tidak akan mengubah urutan pengecekan — Vercel masih akan mencari `api/auth/login.js` terlebih dahulu, tidak menemukannya, dan return 404.

**For our use case:** Skip.

## Comparison

| Kriteria | Option A: routes simple | Option B: routes + CDN | Option C: rewrites |
|----------|------------------------|------------------------|-------------------|
| Fix 404 | ✅ | ✅ | ❌ |
| Kompleksitas perubahan | Minimal (1 baris) | Medium (4 baris) | N/A |
| Static file performance | Via function | Via CDN | N/A |
| PWA/Service Worker impact | Tidak ada | Tidak ada | N/A |
| Risiko | Sangat rendah | Low | Tidak berfungsi |

## Recommendation

**Pilih: Option A — Kembalikan ke `routes`**

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "routes": [
    { "src": "/(.*)", "dest": "/api/index" }
  ]
}
```

**Rationale:** Ini adalah konfigurasi yang sudah terbukti bekerja sebelum commit `2ec5d8b`. Minimal change, zero risk, langsung fix production bug. Service worker sudah handle caching static assets sehingga tidak ada performance penalty yang berarti.

**Caveats:**
- Static assets dilayani via serverless function di first visit; setelah itu service worker cache-kan
- Pastikan build menghasilkan `dist/` yang benar sebelum deploy

## Open Questions

Tidak ada — discovery menjawab semua pertanyaan.

## Quality Report

**Sources consulted:**
- Vercel v2 Project Configuration docs (vercel.com/docs/project-configuration) — 2026
- Kode `api/index.js` — file di-read langsung
- Kode `vercel.json` — file di-read langsung
- Kode `api-handler.ts` — file di-read langsung
- `package.json` build script — di-read langsung
- Commit history di `STATE.md` — commit `2ec5d8b` sebagai titik regresi

**Verification:**
- Routing priority Vercel v2: Verified — fungsi `api/` diperiksa sebelum rewrites
- Commit `2ec5d8b` sebagai penyebab: Verified — pesan commit "update Vercel rewrites" + current broken state
- Express handler memiliki route `/api/auth/login`: Verified — `api/index.js:184`
- Error "format tidak valid" = Vercel HTML 404: Verified via `auth-client.ts:79` (content-type check)
- `express.static(distPath)` ada di Express handler: Verified — `api/index.js:731`

**Assumptions (not verified):**
- `routes` dengan `/(.*)`  tidak konflik dengan Vercel's well-known route handling
- `process.cwd()` di Vercel serverless function menunjuk ke project root (sudah bekerja sebelumnya)

---
*Discovery completed: 2026-06-13*
*Confidence: HIGH*
*Ready for: /paul:plan 10-api-routing-fix*
