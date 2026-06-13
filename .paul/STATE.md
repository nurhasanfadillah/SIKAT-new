# STATE — SIKAT-new

## Current Position

Milestone: v0.10 Vercel Deployment Fix
Phase: 10 of 10 (API Routing Fix) — Complete
Plan: 10-01 complete
Status: UNIFY complete — milestone v0.10 ready for git commit + production verification
Last activity: 2026-06-13 — UNIFY 10-01 (vercel.json split routing + api-handler.ts cleanup)

Progress:
- Milestone v0.1–v0.9: [██████████] 100% ✅ (all complete)
- Milestone v0.10: [██████████] 100% ✅
- Phase 10: [██████████] 100% ✅

## Loop Position

Current loop state:
```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Loop complete — phase 10 done]
```

## Session Continuity

Last session: 2026-06-13
Stopped at: UNIFY complete — phase 10 done
Next action: Git commit phase 10, deploy ke Vercel, verifikasi production (API, static, SPA navigation)
Resume file: .paul/phases/10-api-routing-fix/10-01-SUMMARY.md

## Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-12 | Hapus Firebase sepenuhnya | Firebase tidak digunakan dalam kode sumber; hanya artifact dari template AI Studio |
| 2026-06-12 | Hapus firestore.rules juga | Ditemukan saat eksekusi — artifact Firebase yang tidak ada di plan tapi jelas dalam scope cleanup |
| 2026-06-12 | v0.2 fokus pada unused deps | better-auth, better-sqlite3, @google/genai terpasang tapi tidak ada usage di codebase |
| 2026-06-12 | Sanitasi DATABASE_URL di .env.example | File mengandung kredensial NeonDB asli — diganti ke placeholder |
| 2026-06-12 | PWA + Vercel sebagai v0.3 | Priority: app perlu accessible secara publik sebelum security fixes |
| 2026-06-12 | Split 03 menjadi 2 plan | Plan 03-01 (Vercel) → 03-02 (PWA): berbeda subsystem, keduanya touch package.json |
| 2026-06-12 | App factory pattern untuk Vercel | createApp() pure factory, startServer() conditional via VERCEL env var |
| 2026-06-12 | VitePWA generateSW + NetworkFirst /api/* | Workbox auto-generate SW; API tidak pernah served dari cache |
| 2026-06-12 | Icon set dari SVG custom via @vite-pwa/assets-generator | Single source of truth; regenerate dengan npm run pwa:assets |
| 2026-06-12 | SplashScreen di luar AuthProvider | Muncul sebelum auth check; timer 2500ms + AnimatePresence exit fade |
| 2026-06-12 | text-xs disamakan text-body (12px) | Semantik identik — satu class untuk 12px, tidak ada dual naming |
| 2026-06-12 | font-extrabold dihilangkan dari codebase | Konvergen ke font-black untuk primary values; 3-level hierarchy lebih jelas |
| 2026-06-12 | FeedbackContext.tsx dikecualikan dari type scale migration | Tidak ada di files_modified PLAN 07-01 — deferred |
| 2026-06-13 | Audit PWA komprehensif → milestone v0.9 | 3 gap kritis: offline fallback, update notification toast, custom install prompt — sisanya manifest polish di 09-02 |
| 2026-06-13 | Split routing: /api/* ke function, static via CDN | Single catch-all ke function overwhelm NeonDB concurrent init; rewrites tidak override API file detection |

## Accumulated Context

### Security Concerns
- ~~Token generation: `Math.random().toString(36)` di server.ts~~ — ✅ Fixed in v0.4
- Password stored plain text di database — security concern, kandidat milestone berikutnya
- NeonDB credentials pernah ada di git history (.env.example lama) — pertimbangkan rotate

### Color System (Phase 06 — Complete)
- Token pattern: `brand-*` = teal (#00e5a3); `surface-card/elevated/panel/nav/app/overlay/base` untuk backgrounds
- recharts fills: selalu pakai `tokens.colors.chart.*` via import (bukan Tailwind class)
- WCAG: text-text-secondary (slate-400) untuk secondary text; focus ring solid (tanpa opacity)
- CartesianGrid/XAxis stroke dalam recharts dikecualikan — React inline style tidak support CSS variables

### Typography System (Phase 07 — Complete)
- Type scale: text-nano(9px)/micro(10px)/label(11px)/body(12px)/value(13px) di @theme
- Font-weight: font-medium=meta, font-bold=label/header, font-black=nominal/primary
- Card padding: hero=p-5, standard=p-4, compact=p-3
- FeedbackContext.tsx: masih pakai arbitrary sizes (6 occurrences) — belum dimigrasikan ke semantic class

### Deferred Issues
- FeedbackContext.tsx: text-[11px], text-[12px], text-[13px], text-xs (6 occurrences) — belum dimigrasikan ke semantic class
- UI: ReloadPrompt (z-30) tertutup nav bar (z-40) — deferred
- UI: InstallPrompt (fixed bottom-6 right-6 z-40) overlap nav bar — deferred

### Deployment Architecture (Phase 10 — Complete)
- ✅ vercel.json: `routes` + `outputDirectory:dist` — split routing benar
- ✅ api-handler.ts: murni API-only, express.static/sendFile dihapus
- ⚠️ DATABASE_URL harus dikonfigurasi di Vercel dashboard environment variables

### Git State
Branch: main
Last commit: 3f95494 (fix(vercel): revert to rewrites+/api, add try/catch for DB errors)
Feature branches merged: none
