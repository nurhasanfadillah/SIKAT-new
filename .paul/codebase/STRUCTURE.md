# Codebase Structure

**Analysis Date:** 2026-06-12

## Directory Layout

```
SIKAT-new/
├── src/                    # React frontend source
│   ├── main.tsx           # React DOM mount point
│   ├── App.tsx            # Root component with routing & providers
│   ├── types.ts           # Centralized TypeScript type definitions
│   ├── pages/             # Route-level page components
│   ├── components/        # Reusable UI components
│   │   └── ui/           # Atomic UI primitives (Radix-based)
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React data-fetching hooks
│   └── lib/               # Client utilities & helpers
├── server.ts              # Express backend (876 lines, monolithic)
├── index.html             # SPA HTML entry template
├── vite.config.ts         # Vite + Tailwind + React plugin config
├── tsconfig.json          # TypeScript compiler config
├── package.json           # Dependencies & npm scripts
├── .env.example           # Required environment variable template
├── metadata.json          # Google AI Studio deployment metadata
├── public/                # Static assets
└── dist/                  # Build output (gitignored)
```

## Directory Purposes

**`src/pages/`**
- Purpose: Route-level feature components, one per page
- Contains: `Login.tsx`, `Dashboard.tsx`, `Kas.tsx`, `Talang.tsx`, `Laporan.tsx`
- Key files: `Kas.tsx` (809 lines), `Talang.tsx` (1294 lines) — largest files in codebase
- Subdirectories: None

**`src/components/`**
- Purpose: Reusable shared UI components
- Contains: `Layout.tsx` (mobile app wrapper + nav), `ui/` (atomic primitives)
- Key files: `Layout.tsx` — wraps all authenticated pages

**`src/components/ui/`**
- Purpose: Atomic design system components built on Radix UI
- Contains: `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `select.tsx`, `tabs.tsx`
- Naming: lowercase filenames for this subdirectory

**`src/contexts/`**
- Purpose: Global React state via Context API
- Contains: `AuthContext.tsx` (user/session state), `FeedbackContext.tsx` (toasts & confirm dialogs)

**`src/hooks/`**
- Purpose: Custom hooks for data fetching and state
- Contains: `useTransactions.ts` — fetches all Kas + Talang, polls every 5s

**`src/lib/`**
- Purpose: Utilities and service clients
- Contains: `auth-client.ts` (auth API calls + safeFetch wrapper), `utils.ts` (formatCurrency, date helpers)

## Key File Locations

**Entry Points:**
- `src/main.tsx` — React app mount, wraps with AuthProvider > FeedbackProvider > RouterProvider
- `src/App.tsx` — Route definitions, ProtectedRoute wrapper, provider composition
- `server.ts` — Express server startup, DB init, seed, all API routes

**Configuration:**
- `vite.config.ts` — Vite build config (React plugin, Tailwind, path alias `@/*`)
- `tsconfig.json` — TypeScript config (ES2022, strict, isolatedModules)
- `.env.example` — Required env vars template (`DATABASE_URL`, `GEMINI_API_KEY`, etc.)
- `package.json` — Scripts: `dev`, `build`, `start`, `clean`, `lint`

**Core Logic:**
- `server.ts` — All backend: DB schema, auth endpoints, user endpoints, transaction endpoints
- `src/contexts/AuthContext.tsx` — Auth state machine (session check, profile fetch, logout)
- `src/hooks/useTransactions.ts` — Data fetching & 5-second polling
- `src/lib/auth-client.ts` — safeFetch wrapper, auth API methods

**Type Definitions:**
- `src/types.ts` — `Role`, `UserProfile`, `TransaksiKas`, `TransaksiTalang`, `AuditLog`

**Documentation:**
- `.env.example` — Environment setup guide
- `README.md` — Not present (no user-facing docs found)

## Naming Conventions

**Files:**
- PascalCase for React components: `Dashboard.tsx`, `AuthContext.tsx`, `Layout.tsx`
- camelCase for hooks: `useTransactions.ts`
- kebab-case for utilities: `auth-client.ts`
- lowercase for `ui/` primitives: `button.tsx`, `card.tsx`
- Single centralized: `types.ts` (all types in one file)

**Directories:**
- lowercase plural: `pages/`, `components/`, `contexts/`, `hooks/`, `lib/`
- Subdirectory for primitives: `components/ui/`

**API Routes:**
- REST convention: `/api/auth/*`, `/api/users`, `/api/kas`, `/api/talang`, `/api/transactions`
- Standard HTTP verbs: GET (read), POST (create), PUT (update), DELETE (remove)

**Database:**
- Prefixed table names: `app_users`, `app_sessions`, `transaksi_kas`, `transaksi_talang`
- snake_case columns: `created_by`, `sumber_dana`, `akun_talang`, `createdAt`
- ID format: prefix + random suffix: `usr_abc123`, `tok_xyz789`, `kas_def456`

## Where to Add New Code

**New Page/Route:**
- Page component: `src/pages/NewPage.tsx`
- Route: Add to `src/App.tsx` under ProtectedRoute
- Navigation: Add link in `src/components/Layout.tsx`

**New UI Component:**
- Atomic primitive: `src/components/ui/component-name.tsx`
- Feature-specific: `src/components/ComponentName.tsx`

**New API Endpoint:**
- Add route handler directly in `server.ts` following existing pattern (getAuthContext → validation → DB query)

**New Global State:**
- New context: `src/contexts/NewContext.tsx` (follow AuthContext pattern)
- New hook: `src/hooks/useFeature.ts`

**New Types:**
- Add to `src/types.ts` (centralized)

## Special Directories

**`dist/`**
- Purpose: Build output for both frontend and server
- Source: Generated by `npm run build` (Vite + esbuild)
- Committed: No (in .gitignore)

**`.paul/`**
- Purpose: PAUL project planning documentation
- Source: Generated by /paul:map-codebase, /paul:init
- Committed: Yes

---

*Structure analysis: 2026-06-12*
*Update when directory structure changes*
