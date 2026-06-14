# STATE — SIKAT-new

## Current Position

Milestone: v0.17 Kas & Talang Layout Fix — Complete ✅
Phase: 17 (Kas & Talang Layout Fix) — Complete (3/3 plans done)
Plan: 17-03 UNIFY complete — Phase 17 closed
Status: Loop closed — milestone v0.17 complete
Last activity: 2026-06-14 — UNIFY 17-03: Talang card redesign (2-row col1 + accordion + AnimatePresence)

Progress:
- Milestone v0.1–v0.17: [██████████] 100% ✅ (all complete)
- Phase 17: [██████████] 100% (17-01 ✅, 17-02 ✅, 17-03 ✅)

## Loop Position

Current loop state:
```
PLAN ──▶ APPLY ──▶ UNIFY
  ✓        ✓        ✓     [Loop 17-03 closed — Phase 17 complete]
```

## Session Continuity

Last session: 2026-06-14
Stopped at: UNIFY 17-03 complete — Phase 17 done
Next action: /paul:milestone (atau /paul:plan untuk milestone baru)
Resume file: .paul/phases/17-kas-talang-layout-fix/17-03-SUMMARY.md

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
| 2026-06-13 | Warna Pelunasan → text-rose-400 | Pelunasan = kas keluar dari perspektif sekolah; neutral (slate-100) misleading bagi pengguna |
| 2026-06-13 | Progress bar: guard kasBalance > 0 | `(kasBalance || 1)` fallback tidak valid; guard eksplisit lebih semantically correct |
| 2026-06-13 | Polling Dashboard 5s → 30s | Data keuangan sekolah tidak butuh sub-5s; 30s hemat battery mobile PWA |
| 2026-06-13 | rose=outgoing convention extended ke Kas.tsx | Konsisten dengan Dashboard: pemasukan=brand-500, pengeluaran=rose-400 |
| 2026-06-13 | Empty state differentiation via isAnyFilterActive | Flag sudah ada; dipakai langsung untuk pesan kontekstual |
| 2026-06-14 | iOS PWA edge-to-edge (black-translucent + viewport-fit=cover) | Dark app + light status bar sangat janggal; native dark PWA pakai edge-to-edge |
| 2026-06-14 | Safe-area via `pt-[max(env(safe-area-inset-top),1.25rem)]` | Tailwind v4 support CSS function di arbitrary value; tidak perlu utility CSS baru |

## Accumulated Context

### Security Concerns
- ~~Token generation: `Math.random().toString(36)` di server.ts~~ — ✅ Fixed in v0.4
- Password stored plain text di database — security concern, kandidat milestone berikutnya
- NeonDB credentials pernah ada di git history (.env.example lama) — pertimbangkan rotate

### Color System (Phase 06 — Complete)
- Token pattern: `brand-*` = teal (#00e5a3); `surface-card/elevated/panel/nav/app/overlay/base` untuk backgrounds
- WCAG: text-text-secondary (slate-400) untuk secondary text; focus ring solid (tanpa opacity)
- ~~recharts fills via tokens.ts~~ — recharts diuninstall di Phase 16; tidak relevan lagi

### Typography System (Phase 07 — Complete)
- Type scale: text-nano(9px)/micro(10px)/label(11px)/body(12px)/value(13px) di @theme
- Font-weight: font-medium=meta, font-bold=label/header, font-black=nominal/primary
- Card padding: hero=p-5, standard=p-4, compact=p-3
- FeedbackContext.tsx: masih pakai arbitrary sizes (6 occurrences) — belum dimigrasikan ke semantic class

### Deferred Issues
- FeedbackContext.tsx: text-[11px], text-[12px], text-[13px], text-xs (6 occurrences) — belum dimigrasikan ke semantic class
- ~~UI: ReloadPrompt (z-30) tertutup nav bar (z-40)~~ — ✅ Fixed in v0.11
- UI: InstallPrompt (fixed bottom-6 right-6 z-40) overlap nav bar — deferred
- Dashboard UI (Phase 12 audit): Skeleton loading states (nice-to-have, scope phase tersendiri)

### Dashboard UI (Phase 12 — Complete)
- Progress bar: `talangPct`/`saldoPct` dengan `kasBalance > 0` guard
- Warna Pelunasan: `text-rose-400` (outgoing kas)
- Truncation: `truncate` pada currency span, `overflow-hidden`+`shrink-0` pada metadata
- Polling: 30_000ms (dari 5000ms)
- Aria: decorative blurs di hero card punya `aria-hidden="true"`

### Kas Rekap UI (Phase 13 — Complete)
- rose=outgoing convention: pemasukan=brand-500, pengeluaran=rose-400 di seluruh transaction nominal
- Spinner track: `border-white/10` + `border-t-brand-500` (pattern seragam dengan Dashboard)
- Empty state: `isAnyFilterActive ? 'Tidak ada transaksi yang sesuai filter.' : 'Belum ada transaksi terekam.'`
- Aria: icon container TrendingUp/TrendingDown punya `aria-hidden="true"`

### Deployment Architecture (Phase 10 — Complete)
- ✅ vercel.json: `routes` + `outputDirectory:dist` — split routing benar
- ✅ api-handler.ts: murni API-only, express.static/sendFile dihapus
- ⚠️ DATABASE_URL harus dikonfigurasi di Vercel dashboard environment variables

### Header Mobile (Phase 14 — Complete)
- theme_color/background_color: `#00e5a3`/`#050811` di vite.config.ts + index.html
- iOS PWA: `viewport-fit=cover` + `apple-mobile-web-app-status-bar-style: black-translucent`
- Safe-area header: `pt-[max(env(safe-area-inset-top),1.25rem)] md:pt-9` di Layout.tsx header
- Flex anti-overflow: `flex-1 min-w-0 overflow-hidden` (left group) + `flex-shrink-0` (right group)
- Type scale: `text-[15px]` → `text-value` di SIKAT branding span

### Header Avatar Remove (Phase 15 — Complete)
- Avatar circle (h-10 w-10 rounded-full gradient) dihapus dari left group header
- Header kini: logo + teks (nama + "Selamat Datang") + right group (badge + logout)
- Tidak ada replacement element — logo sudah cukup sebagai visual anchor

### UI Cleanup (Phase 16 — Complete)
- Dashboard: card "Rincian Per Akun Talang" dihapus; mini stats (Dana Talang Aktif + Kapasitas Sisa) + recent transactions tetap
- Navigasi: 3 item (Beranda · Kas Rekap · Dana Talang) — Laporan dihapus
- recharts di-uninstall (39 packages removed); `tsc --noEmit` clean

### Git State
Branch: main
Last commit: d7daaed (feat(16-ui-cleanup): hapus Rincian Per Akun Talang + halaman Laporan + uninstall recharts)
Feature branches merged: none
