# Coding Conventions

**Analysis Date:** 2026-06-12

## Naming Patterns

**Files:**
- PascalCase for React components and contexts: `Dashboard.tsx`, `AuthContext.tsx`, `Layout.tsx`
- camelCase for hooks: `useTransactions.ts`
- kebab-case for utilities: `auth-client.ts`, `utils.ts`
- lowercase for `src/components/ui/` primitives: `button.tsx`, `card.tsx`, `input.tsx`
- Single centralized types file: `types.ts`

**Functions:**
- camelCase for all functions and handlers
- `handle` prefix for event handlers: `handleLogout()`, `handleStartEdit()`, `handleDelete()`
- `get` prefix for getters: `getPageTitle()`, `getLocalDateString()`, `getAuthContext()`
- `use` prefix for custom hooks (enforced by React rules): `useAuth()`, `useTransactions()`, `useFeedback()`

**Variables:**
- camelCase for regular variables: `kasBalance`, `talangBalances`
- SCREAMING_SNAKE_CASE for constants: `PORT = 3000`
- No underscore prefix convention for private members

**Types:**
- PascalCase for interfaces and type aliases: `UserProfile`, `TransaksiKas`, `Role`
- Type unions for enums: `type Role = 'Super Admin' | 'Bendahara' | 'Viewer'`
- Context types suffixed with `Type`: `AuthContextType`, `FeedbackContextType`
- Props interfaces: `ButtonProps`, `ConfirmOptions`
- No `I` prefix for interfaces

**Database:**
- snake_case for table names and columns: `app_users`, `transaksi_kas`, `created_by`, `sumber_dana`
- Prefix scoping for tables: `app_*` for auth, `transaksi_*` for financial

## Code Style

**Formatting:**
- 2-space indentation (consistent throughout)
- No Prettier or EditorConfig configured — formatting is manual
- Mixed quote style: single quotes dominate import statements, double quotes appear in some files
- Semicolons: generally present but inconsistent across files
- No enforced line length limit

**Linting:**
- TypeScript compiler only: `tsc --noEmit` (via `npm run lint`)
- No ESLint configured
- No pre-commit hooks (no Husky/lint-staged)

## Import Organization

**Pattern observed:**
1. React and React ecosystem imports (`react`, `react-router-dom`)
2. Third-party libraries (`date-fns`, `lucide-react`)
3. Context/hook imports (`../contexts/AuthContext`, `../hooks/useTransactions`)
4. Component imports (`../components/ui/card`)
5. Utility/lib imports (`../lib/auth-client`, `../lib/utils`)

**Path style:**
- Relative paths (`../contexts/...`) — not using `@/` alias in practice despite tsconfig definition
- No barrel/index.ts exports — imports reference specific files directly

## Error Handling

**Patterns:**
- Frontend: try-catch in async handlers, errors surfaced via `useFeedback().toast.error(message)`
- Backend: try-catch per route handler → `res.status(N).json({ error: message })`
- No custom Error subclasses — uses native `Error` or inline error responses

**Error Types:**
- 400 → validation failures (bad input, business rule violations)
- 401 → authentication failures (no/invalid/expired token)
- 403 → authorization failures (insufficient role)
- 500 → unexpected server errors

## Logging

**Framework:**
- Backend: `console.log` and `console.error` only — no structured logger
- Frontend: `console.warn` for unexpected API response types, `console.error` for caught errors
- No logging service (Sentry, LogRocket, etc.)

## Comments

**When to Comment:**
- Short explanatory comments for non-obvious logic
- Examples: `// Check Expiry (Sessions last for 30 Days)`, `// HMR is disabled in AI Studio via DISABLE_HMR env var`
- Business context: brief labels on complex business rule sections

**JSDoc:**
- Minimal usage — mostly absent
- SPDX license header present in some files: `@license SPDX-License-Identifier: Apache-2.0`
- No formal JSDoc blocks for function parameters/returns

**Language:**
- User-facing error messages in Indonesian: `"Email atau password salah"`, `"Saldo kas sekolah tidak mencukupi"`
- Code comments in English

## Component Design

**Pattern:**
- Functional components throughout — no class components
- Default exports for pages/layout: `export default function Dashboard() {}`
- Named exports for UI primitives: `export { Button, buttonVariants }`
- `React.forwardRef` for UI primitives that accept ref: `src/components/ui/button.tsx`

**Props:**
- Typed with PascalCase interfaces: `interface ButtonProps`
- Destructured in parameters for readability

## Module Design

**Exports:**
- Pages: single default export (the page component)
- Contexts: named exports for provider + hook (`export { AuthProvider, useAuth }`)
- UI components: named exports

**State co-location:**
- Local UI state: `useState` inside component
- Shared state: React Context
- Server state: `useTransactions` hook with polling

---

*Convention analysis: 2026-06-12*
*Update when patterns change*
