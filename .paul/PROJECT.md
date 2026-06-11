# PROJECT — SIKAT-new

## What This Is

Aplikasi manajemen keuangan sekolah (SIKAT = Sistem Kas Sekolah dan Talang) yang mencakup pengelolaan transaksi kas operasional dan dana talang. Dibangun dengan React + Express + PostgreSQL (NeonDB).

## Current State

| Field | Value |
|-------|-------|
| Status | Active development |
| Version | v0.4 (Security Fixes — complete) |
| Stack | React 19, Express, PostgreSQL, TypeScript, Vite, Tailwind, vite-plugin-pwa |
| Auth | Custom token-based auth |
| Database | PostgreSQL via NeonDB |
| Deploy | Vercel (https://sikat-new.vercel.app) |

## Requirements

### Active
- [ ] Security: rotate NeonDB credentials (ada di git history dari .env.example lama)
- [ ] Design: ganti PWA icons placeholder dengan icon desain final

### Validated (Shipped)
- ✓ Firebase artifact dihapus — Phase 01 (v0.1)
- ✓ Unused dependencies dihapus (better-auth, better-sqlite3, @google/genai) — Phase 02 (v0.2)
- ✓ .env.example bersih dari kredensial dan variabel unused — Phase 02 (v0.2)
- ✓ Hardcoded DATABASE_URL dihapus dari server.ts — Phase 03 (v0.3)
- ✓ App deployed ke Vercel, accessible publik — Phase 03 (v0.3)
- ✓ PWA: app installable, offline caching, service worker aktif — Phase 03 (v0.3)
- ✓ Token generation diganti dari `Math.random()` ke `crypto.randomBytes` (CSPRNG) — Phase 04 (v0.4)

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

---
*Last updated: 2026-06-12 after Phase 04*
