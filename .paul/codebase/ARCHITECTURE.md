# Architecture

**Analysis Date:** 2026-06-12

## Pattern Overview

**Overall:** Full-Stack Monolith (React SPA + Express REST API)

**Key Characteristics:**
- Single Express server handles both API and static file serving
- React SPA with client-side routing (no SSR)
- Context API for global state (no Redux/Zustand)
- Custom Bearer token authentication stored in localStorage
- 5-second polling for real-time data (no WebSocket)
- Complex business rules: Talang Pelunasan auto-syncs with Kas entries

## Layers

**Presentation Layer (Frontend):**
- Purpose: User interface, forms, navigation, data display
- Contains: Page components, UI components, Layout
- Location: `src/pages/*.tsx`, `src/components/`
- Depends on: State/context layer, data fetching layer
- Used by: React Router in `src/App.tsx`

**State Management Layer (Frontend):**
- Purpose: Global auth state, global feedback/toast state
- Contains: AuthContext, FeedbackContext
- Location: `src/contexts/AuthContext.tsx`, `src/contexts/FeedbackContext.tsx`
- Depends on: Auth client lib
- Used by: All page components via custom hooks

**Data Fetching Layer (Frontend):**
- Purpose: Centralized API polling and transaction state
- Contains: useTransactions hook
- Location: `src/hooks/useTransactions.ts`
- Depends on: safeFetch from auth-client
- Used by: Dashboard, Kas, Talang, Laporan pages

**Client Utility Layer (Frontend):**
- Purpose: Auth API calls, session management, helper functions
- Contains: auth-client.ts, utils.ts
- Location: `src/lib/auth-client.ts`, `src/lib/utils.ts`
- Depends on: Browser localStorage
- Used by: Contexts, hooks, page components

**Backend (Monolithic Express Server):**
- Purpose: REST API, database access, business logic, auth
- Contains: All backend code in a single 876-line file
- Location: `server.ts` (root)
- Sub-concerns: DB init, auth routes, user routes, transaction routes, Vite integration

## Data Flow

**Authentication Flow:**
1. User submits login form (`src/pages/Login.tsx`)
2. POST `/api/auth/login` sent with email/password
3. `server.ts` validates credentials against `app_users` table (plaintext comparison ⚠️ — bcrypt not yet implemented)
4. Session token created in `app_sessions` table, returned to client
5. Client stores token in `localStorage` (`sikat_session_token`)
6. `AuthContext` reads token, fetches `/api/user/profile` with Bearer header
7. User profile stored in context, protected routes rendered

**Transaction Fetch Flow:**
1. Page mounts, `useTransactions()` hook activates
2. `safeFetch` injects Bearer token from localStorage
3. GET `/api/transactions` returns all Kas + Talang records
4. Data stored in hook state, returned to components
5. `setInterval` repeats fetch every 5 seconds

**Create Kas/Talang Transaction Flow:**
1. Form submitted in `src/pages/Kas.tsx` or `src/pages/Talang.tsx`
2. POST `/api/kas` or `/api/talang` with full payload
3. Backend validates: date format, nominal > 0, role check
4. Business rules enforced: balance constraints, account validation
5. If Talang Pelunasan: auto-insert matching Kas entry
6. Database insert, success response returned
7. `useFeedback().toast.success()` notification shown
8. `useTransactions().refetch()` triggers data refresh

**State Management:**
- Auth state: `localStorage` token + React Context
- App state: Mostly local component state (useState)
- Server state: 5-second polling via `useTransactions` hook

## Key Abstractions

**Context Provider:**
- Purpose: Global state accessible throughout component tree
- Examples: `src/contexts/AuthContext.tsx` (useAuth), `src/contexts/FeedbackContext.tsx` (useFeedback)
- Pattern: `createContext` + custom hook (`useAuth`, `useFeedback`)

**Custom Hook:**
- Purpose: Encapsulate API calls and local state
- Examples: `src/hooks/useTransactions.ts` (returns `{ kas, talang, loading, refetch }`)
- Pattern: Single responsibility, polling via setInterval

**safeFetch Wrapper:**
- Purpose: Automatically inject Bearer token on every API call
- Location: `src/lib/auth-client.ts`
- Pattern: Wrapper around native fetch, reads from localStorage

**getAuthContext (Backend):**
- Purpose: Extract and validate session from Bearer token on every protected route
- Location: `server.ts` (used throughout route handlers)
- Pattern: Helper called at top of each protected route handler

**Role-Based Access Control:**
- Roles: `Super Admin`, `Bendahara`, `Viewer`
- Enforcement: `server.ts` route handlers check role before write operations
- Integrity: Prevents demotion of last Super Admin

## Entry Points

**Frontend Entry:**
- Location: `src/main.tsx`
- Triggers: Browser load of `index.html`
- Responsibilities: Mount React app, wrap with providers (AuthProvider, FeedbackProvider, Router)

**Backend Entry:**
- Location: `server.ts` (root)
- Triggers: `npm run dev` or `npm run start`
- Responsibilities: Connect to PostgreSQL, initialize tables, seed default admin, start Express on port 3000, serve Vite in dev or static files in prod

**Routing:**
- Location: `src/App.tsx`
- Routes: `/login`, `/dashboard`, `/kas`, `/talang`, `/laporan`
- All routes except `/login` wrapped in `ProtectedRoute` component

## Error Handling

**Strategy:** try-catch in both frontend and backend; error messages surface to user via FeedbackContext

**Patterns:**
- Frontend: try-catch in async handlers → `useFeedback().toast.error(message)`
- Backend: try-catch per route handler → `res.status(400/401/403/500).json({ error: msg })`
- Auth errors: 401 → frontend redirects to `/login` via AuthContext

## Cross-Cutting Concerns

**Logging:**
- Backend: `console.log`/`console.error` only — no structured logging service
- Frontend: `console.error`/`console.warn` for unexpected states

**Validation:**
- Backend: Inline validation in route handlers (string length, numeric bounds, date format)
- Max amount: 1 trillion IDR hardcoded limit
- Frontend: Minimal client-side validation (form required fields)

**Authentication:**
- Bearer token injected via `safeFetch` on all API calls
- 30-day session expiry checked on every request via `getAuthContext`

---

*Architecture analysis: 2026-06-12*
*Update when major patterns change*
