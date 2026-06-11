# Technology Stack

**Analysis Date:** 2026-06-12

## Languages

**Primary:**
- TypeScript 5.8.2 - All application code (frontend & backend) - `package.json`, `tsconfig.json`

**Secondary:**
- JavaScript - Config files and build scripts - `vite.config.ts` (transpiled via tsx)

## Runtime

**Environment:**
- Node.js (type declarations `@types/node: ^22.14.0`) - No explicit .nvmrc pinning
- Browser runtime for React frontend (ES2022 target)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 19.0.1 - Frontend UI framework - `src/main.tsx`, `src/App.tsx`
- React Router DOM 7.17.0 - Client-side routing - `src/App.tsx`
- Express.js 4.21.2 - Backend REST API server - `server.ts`

**Testing:**
- None configured (0% test coverage)

**Build/Dev:**
- Vite 6.2.3 - Frontend bundler & dev server - `vite.config.ts`
- esbuild 0.25.0 - Server bundler (outputs `dist/server.cjs`) - `package.json` build script
- tsx 4.21.0 - TypeScript runtime for development - `package.json` dev script

## Key Dependencies

**UI Components:**
- @radix-ui/* (dialog, label, select, slot, tabs) - Headless accessible components - `package.json`
- Tailwind CSS 4.1.14 - Utility CSS framework - `vite.config.ts`
- Class Variance Authority 0.7.1 - Component variant management - `src/components/ui/button.tsx`
- clsx 2.1.1 + tailwind-merge 3.6.0 - Conditional classnames - `src/lib/utils.ts`
- Lucide React 0.546.0 - Icon library - `src/pages/Dashboard.tsx`
- Recharts 3.8.1 - Charts/data visualization - `src/pages/Dashboard.tsx`
- Motion 12.23.24 (Framer Motion alternative) - Animations

**Infrastructure:**
- pg 8.21.0 - PostgreSQL driver - `server.ts`
- dotenv 17.2.3 - Environment variable loading - `server.ts`
- date-fns 4.4.0 - Date formatting utilities - `src/pages/Dashboard.tsx`

**PWA:**
- vite-plugin-pwa 1.3.0 - Service worker + offline support
- @vite-pwa/assets-generator 1.0.2 - PWA icon generation

## Configuration

**Environment:**
- `.env` file loaded via dotenv - `.env.example`
- Key variables: `DATABASE_URL` (required), `APP_URL` (optional, auto-injected by Vercel)

**Build:**
- `vite.config.ts` - Vite + React plugin + Tailwind plugin + path alias `@/*`
- `tsconfig.json` - ES2022 target, react-jsx, strict, isolatedModules, allowJs: true
- `package.json` scripts: `dev` (tsx server.ts), `build` (vite + esbuild), `start` (node dist/server.cjs)

## Platform Requirements

**Development:**
- Any platform with Node.js ~22.x
- PostgreSQL database (NeonDB serverless recommended)
- `npm run dev` starts both frontend (Vite HMR) and backend (tsx) via single command

**Production:**
- Deployed on **Vercel** (serverless functions + CDN)
- Serverless handler: `api/index.js` via `vercel.json` rewrites
- `npm run vercel-build` (Vite + esbuild)
- Requires `DATABASE_URL` env var pointing to NeonDB (PostgreSQL serverless)

---

*Stack analysis: 2026-06-12*
*Update after major dependency changes*
