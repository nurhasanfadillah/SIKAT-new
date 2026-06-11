# PROJECT — SIKAT-new

## What This Is

Aplikasi manajemen keuangan sekolah (SIKAT = Sistem Kas Sekolah dan Talang) yang mencakup pengelolaan transaksi kas operasional dan dana talang. Dibangun dengan React + Express + PostgreSQL (NeonDB).

## Current State

| Field | Value |
|-------|-------|
| Status | Active development |
| Version | v0.1 (Codebase Cleanup) |
| Stack | React 19, Express, PostgreSQL, TypeScript, Vite, Tailwind |
| Auth | Custom token-based auth (NOT Better Auth — installed but unused) |
| Database | PostgreSQL via NeonDB |

## Requirements

### Active
- [ ] Hapus unused dependencies (better-auth, better-sqlite3, @google/genai) — kandidat cleanup setelah firebase

### Validated (Shipped)
- ✓ Firebase artifact dihapus — Phase 01

### Out of Scope
- Firebase/Firestore integration — tidak pernah diimplementasikan, dihapus

## Key Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-12 | Hapus Firebase sepenuhnya | Tidak ada runtime usage; sisa template AI Studio |
| 2026-06-12 | Hapus firestore.rules meski di luar PLAN | Jelas dalam scope cleanup Firebase |

---
*Last updated: 2026-06-12 after Phase 01*
