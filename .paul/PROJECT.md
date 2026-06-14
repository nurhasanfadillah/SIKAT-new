# PROJECT — SIKAT-new

## What This Is

Aplikasi manajemen keuangan sekolah (SIKAT = Sistem Kas Sekolah dan Talang) yang mencakup pengelolaan transaksi kas operasional dan dana talang. Dibangun dengan React + Express + PostgreSQL (NeonDB).

## Current State

| Field | Value |
|-------|-------|
| Status | Active development |
| Version | v0.17 (Kas & Talang Card Redesign — complete) |
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
- ✓ Vercel split routing: `/api/*` → serverless function, static files via CDN, SPA fallback — Phase 10 (v0.10)
- ✓ api-handler.ts murni API-only (express.static dan sendFile dihapus) — Phase 10 (v0.10)
- ✓ PWA offline page: auto-reconnect (`window.online` listener) + tombol "Coba Lagi" — Phase 11 (v0.11)
- ✓ ReloadPrompt z-index diperbaiki (z-30 → z-50), toast tidak tertutup navbar — Phase 11 (v0.11)
- ✓ Dashboard: progress bar edge case aman (kasBalance=0 guard) — Phase 12 (v0.12)
- ✓ Dashboard: warna nominal Pelunasan talang diperbaiki (text-rose-400) — Phase 12 (v0.12)
- ✓ Dashboard: text overflow diatasi di account cards dan transaction metadata — Phase 12 (v0.12)
- ✓ Dashboard: background polling dioptimalkan 5s → 30s — Phase 12 (v0.12)
- ✓ Dashboard: elemen dekoratif diberi aria-hidden untuk aksesibilitas — Phase 12 (v0.12)
- ✓ Kas Rekap: bug `text-rose-450` (class invalid) diperbaiki → `text-rose-400` — Phase 13 (v0.13)
- ✓ Kas Rekap: warna nominal Pengeluaran → `text-rose-400` (konsisten rose=outgoing di seluruh transaction views) — Phase 13 (v0.13)
- ✓ Kas Rekap: spinner track pattern diseragamkan dengan Dashboard (`border-white/10`) — Phase 13 (v0.13)
- ✓ Kas Rekap: empty state pesan kontekstual — filter aktif vs benar-benar kosong — Phase 13 (v0.13)
- ✓ Kas Rekap: icon dekoratif TrendingUp/TrendingDown diberi aria-hidden — Phase 13 (v0.13)
- ✓ PWA theme_color dan background_color diperbarui ke teal (#00e5a3/#050811) — Phase 14 (v0.14)
- ✓ iOS PWA edge-to-edge: viewport-fit=cover + apple-mobile-web-app-status-bar-style: black-translucent — Phase 14 (v0.14)
- ✓ Header safe-area-inset-top padding via CSS max() function (pt-[max(env(safe-area-inset-top),1.25rem)]) — Phase 14 (v0.14)
- ✓ Header flex layout aman di 360px Android (flex-1 min-w-0 left, flex-shrink-0 right) — Phase 14 (v0.14)
- ✓ text-[15px] arbitrary dihapus dari Layout.tsx → text-value (13px, type scale Phase 07) — Phase 14 (v0.14)
- ✓ Avatar circle inisial (h-10 w-10 gradient rounded-full) dihapus dari header — Phase 15 (v0.15)
- ✓ Card "Rincian Per Akun Talang" dihapus dari Dashboard; mini stats + recent transactions tetap intact — Phase 16 (v0.16)
- ✓ Halaman Laporan dihapus sepenuhnya (Laporan.tsx, route `/laporan`, nav item) — Phase 16 (v0.16)
- ✓ recharts di-uninstall; navigasi tersisa 3 item (Beranda · Kas Rekap · Dana Talang) — Phase 16 (v0.16)
- ✓ h-dvh→h-svh (keyboard overlay fix) + hapus inner scroll Kas & Talang — Phase 17 (v0.17)
- ✓ Kas card redesign: tanggal-first 2-row + expandedId accordion + AnimatePresence — Phase 17 (v0.17)
- ✓ Talang card redesign: 2-row col1 (tanggal + akun tag) + expandedId accordion — Phase 17 (v0.17)

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
| 2026-06-13 | Gunakan `routes` (bukan `rewrites`) di vercel.json | rewrites tidak override Vercel API file detection; routes lebih eksplisit |
| 2026-06-13 | `handle:filesystem` + `outputDirectory:dist` untuk static serving | CDN melayani static assets langsung tanpa masuk ke serverless function |
| 2026-06-13 | Hapus express.static dari api-handler.ts | dist/ tidak accessible dari serverless context; function = API-only |
| 2026-06-13 | Auto-reload langsung saat event `online` | Simpel; tidak perlu state; sesuai PWA mobile standard |
| 2026-06-13 | Warna Pelunasan talang → text-rose-400 | Pelunasan = kas keluar dari perspektif sekolah; neutral (slate-100) misleading |
| 2026-06-13 | Progress bar: guard `kasBalance > 0` sebelum division | `(kasBalance \|\| 1)` menghasilkan percentage tidak valid saat kasBalance=0 |
| 2026-06-13 | rose=outgoing convention extended ke Kas.tsx | Pemasukan=brand-500, Pengeluaran=rose-400 di seluruh transaction nominal displays; konsisten dengan Dashboard |
| 2026-06-13 | Empty state differentiation: `isAnyFilterActive ? filter-msg : empty-msg` | Flag sudah ada di useMemo; dipakai langsung untuk pesan kontekstual tanpa logic baru |
| 2026-06-14 | iOS PWA edge-to-edge: black-translucent + viewport-fit=cover | App dark-themed — light status bar sangat janggal di atas dark navy; native dark PWA pakai edge-to-edge |
| 2026-06-14 | Safe-area header via `pt-[max(env(safe-area-inset-top),1.25rem)]` | Tailwind v4 arbitrary support CSS function; satu class handle dua kondisi: notch vs tidak; tidak perlu utility baru di index.css |
| 2026-06-14 | Hapus avatar div seluruhnya tanpa replacement | Tidak perlu elemen pengganti di posisi yang sama; logo + teks nama sudah cukup sebagai header identity |
| 2026-06-14 | Hapus halaman Laporan sepenuhnya | Informasi di Laporan redundan — semua data sudah cukup di Dashboard, Kas Rekap, dan Dana Talang |
| 2026-06-14 | Hapus recharts sepenuhnya (uninstall) | Hanya dipakai Laporan.tsx; setelah halaman dihapus, dependency menjadi dead weight (39 packages removed) |

---
*Last updated: 2026-06-14 after Phase 16*
