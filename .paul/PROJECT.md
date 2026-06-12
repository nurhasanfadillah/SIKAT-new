# PROJECT — SIKAT-new

## What This Is

Aplikasi manajemen keuangan sekolah (SIKAT = Sistem Kas Sekolah dan Talang) yang mencakup pengelolaan transaksi kas operasional dan dana talang. Dibangun dengan React + Express + PostgreSQL (NeonDB).

## Current State

| Field | Value |
|-------|-------|
| Status | Active development |
| Version | v0.7 (Spacing & Typography — complete) |
| Stack | React 19, Express, PostgreSQL, TypeScript, Vite, Tailwind v4, vite-plugin-pwa, motion |
| Auth | Custom token-based auth |
| Database | PostgreSQL via NeonDB |
| Deploy | Vercel (https://sikat-new.vercel.app) |

## Requirements

### Active
- [ ] Security: rotate NeonDB credentials (ada di git history dari .env.example lama)
- [ ] Security: password stored plain text di database — kandidat milestone berikutnya

### Validated (Shipped)
- ✓ Firebase artifact dihapus — Phase 01 (v0.1)
- ✓ Unused dependencies dihapus (better-auth, better-sqlite3, @google/genai) — Phase 02 (v0.2)
- ✓ .env.example bersih dari kredensial dan variabel unused — Phase 02 (v0.2)
- ✓ Hardcoded DATABASE_URL dihapus dari server.ts — Phase 03 (v0.3)
- ✓ App deployed ke Vercel, accessible publik — Phase 03 (v0.3)
- ✓ PWA: app installable, offline caching, service worker aktif — Phase 03 (v0.3)
- ✓ Token generation diganti dari `Math.random()` ke `crypto.randomBytes` (CSPRNG) — Phase 04 (v0.4)
- ✓ PWA icons branded (SVG custom, icon set lengkap, manifest brand color #2563EB) — Phase 05 (v0.5)
- ✓ Splash screen native-like (Framer Motion, 2.5s, fade 600ms) — Phase 05 (v0.5)
- ✓ 25 semantic color tokens (@theme Tailwind v4): brand-*, surface-*, text-*, hero-*, chart-* — Phase 06 (v0.6)
- ✓ Seluruh app dimigrasikan ke token system: UI components + shell + auth + 4 halaman utama — Phase 06 (v0.6)
- ✓ WCAG accessibility improvements: nav label (4.21:1→7.81:1), input border (3.6:1), focus ring solid — Phase 06 (v0.6)
- ✓ Recharts fills via tokens.ts (bukan hardcoded hex di JSX props) — Phase 06 (v0.6)
- ✓ 5 custom text-size utilities di @theme (text-nano/micro/label/body/value) — Phase 07 (v0.7)
- ✓ 177 arbitrary font-size classes diganti semantic class di 6 file — Phase 07 (v0.7)
- ✓ 3-tier card padding: hero=p-5, standard=p-4, compact=p-3 — Phase 07 (v0.7)
- ✓ Section spacing seragam (space-y-4) dan grid gap konsisten (gap-3) — Phase 07 (v0.7)
- ✓ Font-weight hierarchy: medium/bold/black; font-extrabold dihilangkan — Phase 07 (v0.7)
- ✓ Section header alignment: px-1 offset dihapus dari 4 section headers — Phase 07 (v0.7)

### Out of Scope
- Firebase/Firestore integration — tidak pernah diimplementasikan, dihapus
- Better Auth — custom auth digunakan sebagai gantinya
- SQLite — PostgreSQL digunakan

## Key Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-12 | Hapus Firebase sepenuhnya | Tidak ada runtime usage; sisa template AI Studio |
| 2026-06-12 | Hapus unused deps (better-auth, better-sqlite3, @google/genai) | Tidak ada import di codebase; sisa template AI Studio |
| 2026-06-12 | Sanitasi DATABASE_URL di .env.example | File mengandung kredensial NeonDB asli |
| 2026-06-12 | Deploy ke Vercel dengan app factory pattern | NeonDB serverless-compatible; esbuild pre-bundle api-handler.ts → api/index.js |
| 2026-06-12 | PWA via vite-plugin-pwa + Workbox generateSW | Auto-generate SW dari glob patterns; NetworkFirst untuk /api/* |
| 2026-06-12 | `randomBytes(32)` untuk session tokens, `randomBytes(6)` untuk entity IDs | Entropy cukup: token 256-bit, ID 48-bit untuk collision avoidance |
| 2026-06-12 | Icon set dari SVG custom via @vite-pwa/assets-generator | Single source of truth; regenerate dengan `npm run pwa:assets` |
| 2026-06-12 | SplashScreen di luar AuthProvider di App.tsx | Muncul sebelum auth check; timer 2500ms + AnimatePresence exit fade |
| 2026-06-12 | Pure @theme (bukan three-layer token system) | SIKAT dark-only — tidak butuh :root/.dark toggle; simpler dan sufficient |
| 2026-06-12 | recharts Bar fills via tokens.ts import (bukan inline hex) | Recharts `fill` prop tidak bisa pakai Tailwind class; tokens.ts = single source of truth |
| 2026-06-12 | CartesianGrid/XAxis stroke hex dikecualikan dari migrasi | React inline style objects tidak support CSS custom properties — valid exception |
| 2026-06-12 | text-text-secondary (slate-400) menggantikan text-slate-500 sebagai secondary text | WCAG SC 1.4.3 upgrade: 7.81:1 vs 4.21:1 pada bg-surface-card |

---
*Last updated: 2026-06-12 after Phase 07*
