# ROADMAP — SIKAT-new

## Milestone v0.1 — Codebase Cleanup ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 01 — Firebase Cleanup ✅
**Status:** Complete (2026-06-12) | **Plans:** 1/1
- firebase@12.14.0 diuninstall (69 packages removed)
- firebase-applet-config.json, firebase-blueprint.json, firestore.rules dihapus
- .paul/codebase docs diperbarui

---

## Milestone v0.2 — Unused Dependencies Cleanup ✅

**Status:** Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

### Phase 02 — Unused Dependencies Cleanup ✅
**Status:** Complete (2026-06-12) | **Plans:** 1/1
- better-auth, better-sqlite3, @google/genai, @types/better-sqlite3 diuninstall (93 packages)
- .env.example dibersihkan dan DATABASE_URL disanitasi
- INTEGRATIONS.md diperbarui

---

## Kandidat Milestone Berikutnya

- **v0.3 — Security Fixes:**
  - Token generation lemah (`Math.random().toString(36)`) → ganti ke `crypto.randomBytes`
  - Hardcoded DATABASE_URL di `server.ts` → wajib dari env var
  - Rotate NeonDB credentials (ada di git history)
