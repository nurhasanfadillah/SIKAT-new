# SUMMARY — 09-01: PWA UX Enhancements

**Date:** 2026-06-13
**Status:** COMPLETE

## What Was Built

3 PWA UX features ditambahkan untuk meningkatkan adoption dan user experience:

1. **Offline fallback page** (`public/offline.html`) — full standalone HTML dengan branding SIKAT, muncul saat user offline dan halaman tidak di-cache SW. Workbox `navigateFallback` dikonfigurasi dengan allowlist `^(?!\/api\/).*`.

2. **Update notification toast** (`src/components/ReloadPrompt.tsx`) — komponen React dengan `useRegisterSW` dari `virtual:pwa-register/react`. Menampilkan toast glassmorphism "Versi baru tersedia" dengan tombol Refresh yang memanggil `updateServiceWorker(true)`.

3. **Custom install prompt** (`src/components/InstallPrompt.tsx`) — komponen React dengan listener `beforeinstallprompt`. Floating pill button "Install SIKAT" di bottom-right, hidden setelah dismissed per session.

## Files Changed

| File | Action |
|------|--------|
| `public/offline.html` | Created — standalone offline fallback page |
| `vite.config.ts` | Modified — added `navigateFallback`, `navigateFallbackAllowlist` to workbox |
| `src/vite-env.d.ts` | Created — TypeScript type references for `virtual:pwa-register/react` |
| `src/components/ReloadPrompt.tsx` | Created — update notification toast component |
| `src/components/InstallPrompt.tsx` | Created — custom install prompt component |
| `src/App.tsx` | Modified — added `<ReloadPrompt />` and `<InstallPrompt />` before AuthProvider |

## Verification

- `npm run lint` — TypeScript passes (0 errors)
- `npm run build` — Vite + esbuild succeed
- `dist/offline.html` exists ✅
- `dist/sw.js` precaches offline.html ✅
- `dist/sw.js` has NavigationRoute → /offline.html with allowlist ✅
- `dist/manifest.webmanifest` valid JSON ✅

## Decisions

- ReloadPrompt + InstallPrompt rendered OUTSIDE AuthProvider (consistent with SplashScreen pattern)
- Glassmorphism style (`bg-surface-card/95 backdrop-blur-md`) for toast — matches SIKAT design language
- Install prompt dismisses per session (not permanently) — user can be prompted again on next visit
- `navigateFallbackAllowlist` excludes `/api/*` routes — API calls never served from offline fallback

## Deferred

- Manifest enhancements (categories, screenshots) — Plan 09-02
- Favicon consolidation — Plan 09-02
- INTEGRATIONS.md PWA section — Plan 09-02
