# PROJECT — SIKAT-new

## What This Is

Aplikasi manajemen keuangan sekolah (SIKAT = Sistem Kas Sekolah dan Talang) yang mencakup pengelolaan transaksi kas operasional dan dana talang. Dibangun dengan React + Express + PostgreSQL (NeonDB).

## Current State

| Field | Value |
|-------|-------|
| Status | Active development |
| Version | v0.2 (Unused Dependencies Cleanup — complete) |
| Stack | React 19, Express, PostgreSQL, TypeScript, Vite, Tailwind |
| Auth | Custom token-based auth |
| Database | PostgreSQL via NeonDB |

## Requirements

### Active
- [ ] Security: ganti token generation lemah (`Math.random()`) ke `crypto.randomBytes`
- [ ] Security: hapus hardcoded DATABASE_URL dari `server.ts`
- [ ] Security: rotate NeonDB credentials (ada di git history dari .env.example lama)

### Validated (Shipped)
- ✓ Firebase artifact dihapus — Phase 01 (v0.1)
- ✓ Unused dependencies dihapus (better-auth, better-sqlite3, @google/genai) — Phase 02 (v0.2)
- ✓ .env.example bersih dari kredensial dan variabel unused — Phase 02 (v0.2)

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

---
*Last updated: 2026-06-12 after Phase 02*
