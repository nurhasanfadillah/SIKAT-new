# Testing Patterns

**Analysis Date:** 2026-06-12

## Test Framework

**Runner:**
- **None configured** — no test framework present

**Assertion Library:**
- None

**Run Commands:**
```bash
npm run lint    # TypeScript type-check only (tsc --noEmit) — not a test runner
```

## Test File Organization

**Current State:**
- Zero test files exist in the project
- No `*.test.ts`, `*.test.tsx`, `*.spec.ts` files
- No `__tests__/` directories
- No test utilities or fixtures

## Test Structure

**Current coverage: 0%**

No patterns to document — test infrastructure does not exist.

## Mocking

**Framework:** None

## Fixtures and Factories

**Location:** None — no fixtures exist

## Coverage

**Requirements:**
- No coverage target set
- No coverage tooling configured
- No CI enforcement

## Test Types

**Unit Tests:** Not implemented
**Integration Tests:** Not implemented
**E2E Tests:** Not implemented

## What Needs Testing (Priority Order)

**Critical (financial correctness):**
- Balance validation logic in `server.ts` (`getSimulatedBalances`) — prevents negative Talang balances
- Pelunasan auto-sync: creating/updating/deleting Talang Pelunasan must sync Kas entries
- Authentication token validation (`getAuthContext` in `server.ts`)
- RBAC enforcement: Viewer cannot write, Bendahara cannot manage users

**High (data integrity):**
- All API endpoints: happy path + validation errors + auth errors
- Transaction CRUD: create, read, update, delete for both Kas and Talang
- Role management: assign/revoke Bendahara role, prevent last Super Admin demotion

**Medium (UI behavior):**
- `useTransactions` hook: polling, loading state, refetch
- AuthContext: session check, profile fetch, logout
- FeedbackContext: toast queue, confirmation modal promise

## Recommended Stack

When implementing tests, use:
- **Runner:** Vitest (matches existing Vite setup) - `vitest`, `@vitest/ui`
- **Component testing:** React Testing Library - `@testing-library/react`, `@testing-library/user-event`
- **API testing:** Supertest - `supertest`, `@types/supertest`
- **Test database:** Separate PostgreSQL instance or pg-mem for unit tests

**Suggested file structure:**
```
src/
├── hooks/
│   ├── useTransactions.ts
│   └── useTransactions.test.ts
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
├── pages/
│   ├── Kas.tsx
│   └── Kas.test.tsx
server.test.ts              # API integration tests
```

## Run Commands (Once Configured)

```bash
# After adding vitest:
npx vitest                  # Run all tests
npx vitest --watch          # Watch mode
npx vitest --coverage       # With coverage report
npx vitest run server.test.ts  # Single file
```

---

*Testing analysis: 2026-06-12*
*No tests exist — adding tests is a high-priority concern*
