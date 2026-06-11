# ROADMAP — SIKAT-new

## Milestone v0.1 — Codebase Cleanup

**Goal:** Membersihkan sisa-sisa artifact dari template Google AI Studio dan merapikan proyek agar hanya berisi kode yang benar-benar digunakan.

**Status:** ✅ Complete (2026-06-12)
**Progress:** 1/1 phases complete — 100%

---

### Phase 01 — Firebase Cleanup ✅
**Status:** Complete (2026-06-12)
**Plans:** 1/1

**Delivered:**
- firebase package (v12.14.0) diuninstall — 69 packages removed
- firebase-applet-config.json, firebase-blueprint.json, firestore.rules dihapus
- .paul/codebase/INTEGRATIONS.md dan STRUCTURE.md diperbarui
- npm run lint pass tanpa error

---

## Milestone v0.2 — (Belum direncanakan)

Kandidat untuk milestone berikutnya:
- Hapus unused dependencies: `better-auth`, `better-sqlite3`, `@google/genai`
- Perbaiki security concerns yang dicatat di CONCERNS.md (token generation, hardcoded DB URL)
