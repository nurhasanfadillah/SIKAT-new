---
phase: 03-pwa-vercel-deploy
topic: PWA Implementation + Deploy to Vercel (React 19 + Vite 6 + Express + PostgreSQL)
depth: standard
confidence: HIGH
created: 2026-06-12
---

# Discovery: PWA + Deploy to Vercel

**Recommendation:** Gunakan `vite-plugin-pwa` untuk PWA dan deploy ke Vercel via serverless function dengan refactor minimal pada `server.ts`.

**Confidence:** HIGH — Stack (Vite + Express + NeonDB) sudah terbukti kompatibel dengan kedua pendekatan; semua sumber dari dokumentasi resmi.

## Objective

Yang perlu diketahui sebelum planning:
- Library PWA mana yang cocok untuk Vite 6?
- Bagaimana cara deploy full-stack (Express + Vite) ke Vercel?
- Seberapa besar refactor yang dibutuhkan pada `server.ts` yang ada?
- Apakah ada isu kompatibilitas antara setup saat ini dengan Vercel?

## Scope

**Include:**
- PWA library options untuk Vite
- Vercel deployment strategy untuk Express + Vite
- Analisis `server.ts` saat ini terhadap persyaratan Vercel
- Database (NeonDB PostgreSQL) di Vercel environment

**Exclude:**
- Alternatif hosting lain (Railway, Render, Heroku)
- PWA push notifications / background sync (advanced features)
- Next.js migration

## Findings

### Topik 1: PWA Implementation

#### Option A: `vite-plugin-pwa` (generateSW strategy)

**Source:** https://vite-pwa-org.netlify.app/guide/

**Summary:** Plugin resmi Vite untuk PWA. Menggunakan Workbox di bawahnya. Zero-config dengan `generateSW` strategy — plugin generate service worker secara otomatis.

**Pros:**
- Integrasi native dengan Vite — satu plugin, langsung jalan
- Auto-generate service worker + web app manifest
- Precaching untuk static assets (JS/CSS/HTML)
- Runtime caching configurable per URL pattern
- Aktif maintain, kompatibel dengan Vite 6

**Cons:**
- `generateSW` tidak allow custom service worker logic (butuh switch ke `injectManifest` jika nanti perlu background sync)
- Tambah ~2KB runtime overhead (workbox-window)

**For our use case:** Sangat cocok. SIKAT adalah read-heavy app — user melihat histori transaksi. Caching asset bawaan sudah cukup untuk "offline-friendly" experience.

#### Option B: `vite-plugin-pwa` (injectManifest strategy)

**Source:** https://vite-pwa-org.netlify.app/workbox/inject-manifest

**Summary:** Sama dengan Option A tapi pakai custom service worker file. Plugin hanya inject precache manifest, sisanya custom.

**Pros:**
- Full control atas service worker logic
- Support push notifications, background sync natively

**Cons:**
- Perlu tulis service worker manual
- Lebih kompleks dari yang dibutuhkan untuk scope ini

**For our use case:** Overkill untuk kebutuhan saat ini. Bisa migrasi ke ini nanti tanpa perubahan architecture.

#### Option C: Manual Service Worker

**Summary:** Tanpa plugin, register service worker vanilla.

**For our use case:** Tidak recommended — duplikasi effort, tidak ada auto-precaching untuk Vite build output.

---

### Topik 2: Deploy to Vercel

#### Option A: Vercel Serverless Functions (Express as handler)

**Source:** https://vercel.com/docs/frameworks/backend/express

**Summary:** Express app di-wrap sebagai Vercel serverless function. Entry point `api/index.ts` export Express app sebagai default. Vercel route semua request ke function ini via `vercel.json`.

**Pros:**
- Minimal refactor: pisah `createApp()` dari `startServer()`
- Auto-scaling, managed infrastructure
- NeonDB sudah optimized untuk serverless (built-in connection pooling)
- Cold start ~500ms — acceptable untuk use case ini
- Free tier cukup untuk MVP

**Cons:**
- Max execution time 30s (Pro) — aman untuk semua endpoint yang ada
- Cold start jika tidak ada traffic 15+ menit
- Stateless per request — aman karena semua state di NeonDB

**Isu kritis pada `server.ts` saat ini:**
1. `createViteServer` dari `vite` diimport di top-level — perlu conditional import atau pisah dari production path
2. `startServer()` memanggil `app.listen()` — tidak diperlukan di Vercel (Vercel yang handle HTTP)
3. `initDatabase()` dan `seedDefaultUser()` perlu dipanggil di cold start (bukan di `app.listen()`)

**For our use case:** Cocok. Perubahan yang diperlukan terbatas dan terisolasi.

#### Option B: Vercel dengan Static Frontend + External Backend

**Summary:** Frontend Vite di-deploy ke Vercel sebagai static site. Backend Express di-deploy ke provider lain (Railway, Render).

**Cons:**
- CORS configuration tambahan
- Dua deployment pipeline terpisah
- Tidak perlu untuk scale saat ini

**For our use case:** Tidak direkomendasikan. Menambah kompleksitas tanpa benefit yang jelas.

#### Option C: Custom Server di Vercel

**For our use case:** Tidak tersedia untuk Hobby/Pro Vercel plans. Skip.

## Comparison

### PWA Options

| Kriteria | vite-plugin-pwa (generateSW) | vite-plugin-pwa (injectManifest) | Manual |
|----------|------------------------------|----------------------------------|--------|
| Setup complexity | Rendah | Medium | Tinggi |
| Cocok untuk Vite 6 | ✅ | ✅ | ✅ |
| Offline caching | Auto | Custom | Manual |
| Custom SW logic | ❌ | ✅ | ✅ |
| Butuh saat ini | ✅ | ❌ | ❌ |

### Vercel Deployment Options

| Kriteria | Serverless Function | Static + External Backend |
|----------|--------------------|-----------------------------|
| Refactor needed | Minimal | Besar |
| Infrastructure | Satu platform | Dua platform |
| Cold start | ~500ms | N/A |
| Cost (MVP) | Free | Free + Free |
| CORS config | Tidak perlu | Perlu |

## Recommendation

**PWA: `vite-plugin-pwa` dengan `generateSW` strategy**

Install:
```bash
npm install -D vite-plugin-pwa
```

Config minimal di `vite.config.ts`:
- `registerType: 'autoUpdate'`
- Manifest dengan nama app + icons
- Workbox: precache semua JS/CSS/HTML, network-first untuk `/api/*`

**Vercel: Serverless Function dengan refactor `server.ts`**

Refactor yang diperlukan (terisolasi, tidak ubah logic bisnis):
1. Extract `createApp()` function yang return `{ app, pool }`
2. Buat `api/index.ts` — entry point Vercel yang export `app` sebagai default
3. Handle `initDatabase()` + `seedDefaultUser()` di cold start (bukan di `app.listen()`)
4. Conditional import Vite hanya di dev mode
5. Buat `vercel.json` dengan rewrite semua ke `/api`
6. Set `DATABASE_URL` di Vercel environment variables

**Caveats:**
- Password di database masih plain text (bukan scope fase ini, tapi catat untuk v0.3 security)
- `seedDefaultUser()` menyimpan hardcoded password — perlu ditangani sebelum go-live ke production publik
- NeonDB credentials yang di-hardcode di `server.ts:19` WAJIB dipindah ke env var sebelum deploy (security critical)

## Open Questions

- Apakah perlu icons PWA dibuat dari awal? — Impact: low (bisa pakai placeholder dulu)
- Apakah `initDatabase()` perlu dijalankan setiap cold start atau hanya sekali? — Impact: low (idempotent karena `CREATE TABLE IF NOT EXISTS`)
- Vercel Pro vs Hobby tier? — Impact: low (Hobby cukup untuk MVP, upgrade nanti jika perlu)

## Quality Report

**Sources consulted:**
- vite-plugin-pwa official docs (vite-pwa-org.netlify.app) — 2026
- Vercel Express deployment guide (vercel.com/docs/frameworks/backend/express) — 2026
- Neon + Vercel connection guide (neon.com/docs/guides/vercel-connection-methods) — 2026
- Vercel project configuration reference (vercel.com/docs/project-configuration) — 2026

**Verification:**
- `vite-plugin-pwa` kompatibel dengan Vite 6: Verified — plugin listing menyebut Vite 5+, Vite 6 sudah GA
- Vercel bisa run Express: Verified via official Express guide di Vercel docs
- NeonDB compatible dengan Vercel serverless: Verified via Neon docs (connection pooling built-in)
- `server.ts` menggunakan `app.listen()`: Verified via read langsung file (baris 871)
- `createViteServer` diimport top-level: Verified via read langsung file (baris 4)

**Assumptions (not verified):**
- Vercel free tier tidak memiliki cold start lebih dari 3 detik untuk region AP
- `@vercel/node` runtime support TypeScript langsung tanpa transpile tambahan

---
*Discovery completed: 2026-06-12*
*Confidence: HIGH*
*Ready for: /paul:plan 03-pwa-vercel-deploy*
