# Codebase Concerns

**Analysis Date:** 2026-06-12

## Security Considerations

**Plaintext Password Storage (CRITICAL):**
- Risk: Passwords stored in plaintext — database breach exposes all credentials
- Files: `server.ts` (registration ~line 169, login comparison ~line 201, seeding ~line 839)
- Current mitigation: None
- Fix: Implement bcrypt (`npm install bcryptjs`) — hash on register, compare on login

**Hardcoded Database Credentials:**
- Risk: Production credentials committed in source code — any repo access leaks DB
- Files: `server.ts` (fallback DATABASE_URL hardcoded), `.env.example` (actual credentials)
- Fix: Remove hardcoded fallback from `server.ts`; use env var validation that exits on missing var

**Weak Session Token Generation:**
- Risk: `Math.random()` is not cryptographically secure — sessions could be predicted/brute-forced
- Files: `server.ts` (token creation ~lines 172, 206)
- Code: `"tok_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)`
- Fix: Use `crypto.randomBytes(32).toString('hex')` from Node.js built-in

**Hardcoded Admin Role by Email:**
- Risk: Business logic coupled to personal email address
- Files: `server.ts` (~line 164): `const defaultRole = normalizedEmail === "nurhasanfadillah@gmail.com" ? "Super Admin" : "Viewer"`
- Fix: Move to env var (`ADMIN_EMAIL`) or remove auto-assignment

**Hardcoded Default Admin Credentials:**
- Risk: Predictable `password123` for seeded Super Admin account
- Files: `server.ts` (~lines 836-840)
- Fix: Use env var for seed password or require first-run setup

**localStorage Token Storage:**
- Risk: XSS attacks can steal session tokens from localStorage
- Files: `src/lib/auth-client.ts` (~lines 12, 102)
- Current mitigation: None (acceptable trade-off for some deployments but worth documenting)
- Improvement path: HttpOnly cookies would eliminate XSS risk

## Tech Debt

**Monolithic Backend (server.ts — 876 lines):**
- Issue: All API routes, database logic, middleware, and server setup in a single file
- Files: `server.ts`
- Impact: Difficult to test individual concerns, high cognitive load for changes
- Fix approach: Extract into `src/server/routes/auth.ts`, `src/server/routes/kas.ts`, etc.

**Oversized Page Components:**
- Issue: Page components far exceed reasonable size
- Files: `src/pages/Talang.tsx` (1,294 lines), `src/pages/Kas.tsx` (809 lines)
- Impact: Hard to navigate, test, or maintain; mixing data fetching, form logic, and display
- Fix approach: Extract form modals, filter logic, and list rendering into sub-components

**Fragile Kas/Talang Synchronization:**
- Issue: Pelunasan Talang matches its corresponding Kas entry by description + nominal string — no foreign key
- Files: `server.ts` (~lines 770-782): `WHERE kategori = 'Pelunasan Dana Talang' AND keterangan = $4 AND nominal = $5`
- Risk: Multiple identical transactions could cause wrong record to be updated/deleted
- Fix approach: Add `kas_id` column to `transaksi_talang` as explicit foreign key reference

**Tight Kas/Talang Coupling:**
- Issue: Talang Pelunasan silently creates/deletes Kas entries — not visible from Kas side
- Files: `server.ts` (~lines 506-523, 750-782, 812-814)
- Risk: Audit trail gaps; Kas modifications can break Talang state
- Fix approach: Explicit sync service or event log

**Unused Dependencies:**
- Issue: 4 large packages installed but not used in runtime code
- Files: `package.json`
- Packages: `firebase` 12.14.0, `better-auth` 1.6.16, `better-sqlite3` 12.10.0, `@google/genai` 2.4.0
- Fix: `npm uninstall firebase better-auth better-sqlite3 @google/genai`

## Performance Bottlenecks

**Polling All Transactions Every 5 Seconds:**
- Problem: `setInterval(fetchTransactions, 5000)` runs on all pages, fetches all records
- Files: `src/hooks/useTransactions.ts` (~line 34)
- Impact: Grows linearly with transaction count and open browser tabs
- Improvement path: Increase interval, add pagination, or switch to Server-Sent Events

**In-Memory Balance Calculation on Every Talang Write:**
- Problem: `getSimulatedBalances()` loads all Talang transactions into memory to validate new entries
- Files: `server.ts` (`getSimulatedBalances` function ~lines 104-130)
- Impact: O(n) per transaction creation/update; degrades as transaction history grows
- Improvement path: Maintain running balance in a `talang_balances` table or DB view

**No Pagination:**
- Problem: All transactions fetched and rendered regardless of count
- Files: `src/pages/Kas.tsx`, `src/pages/Talang.tsx`, `GET /api/transactions` in `server.ts`
- Improvement path: Add `?page=1&limit=50` query parameters to API and UI

## Race Conditions

**Balance Validation Without DB Transaction:**
- Problem: Balance check and insert are two separate operations — concurrent requests can both pass validation
- Files: `server.ts` (~lines 452-465 for Talang create, ~lines 693-708 for update)
- Risk: Two simultaneous Pelunasan requests could overdraw an account
- Fix: Wrap balance check + insert in PostgreSQL `BEGIN/COMMIT` transaction

## Missing Critical Features

**No Test Coverage (0%):**
- Problem: No test files, no test framework, no CI gates
- Files: Entire codebase — no `*.test.ts` files exist
- Risk: Financial calculation bugs (wrong balance, missed sync) go undetected
- Priority: High — financial application with no regression safety net
- First tests to write: `getSimulatedBalances`, auth token validation, Pelunasan sync logic

**No Audit Logging:**
- Problem: `AuditLog` type defined in `src/types.ts` but never implemented
- Risk: No accountability trail — cannot answer "who changed this transaction and when"
- Files: `src/types.ts` (type exists), `server.ts` (no audit inserts), `transaksi_kas`/`transaksi_talang` (no audit table)
- Fix: Create `audit_logs` table; insert on every transaction create/update/delete

## Fragile Areas

**Middleware Chain (getAuthContext):**
- Files: `server.ts` (getAuthContext called at top of every protected route)
- Why fragile: If session token format changes, all routes break simultaneously
- Safe modification: Add tests before changing token format; validate against all endpoints

**Pelunasan Auto-Sync Logic:**
- Files: `server.ts` (~lines 506-523 creation, 750-782 update, 812-814 delete)
- Why fragile: Three separate code paths must all stay consistent; editing one without the others breaks data integrity
- Safe modification: Read all three paths before changing any one of them

## Dependencies at Risk

**React 19.0.1:**
- Status: Very recent major version; some ecosystem packages may have React 19 compatibility issues
- Impact: Radix UI, testing library adapters may need updates

**better-sqlite3 12.10.0:**
- Risk: Native module — requires recompilation for different Node.js versions
- Impact: Build failures on version mismatch (though it's unused and should be removed)

## Test Coverage Gaps

**Balance Calculation:**
- What's not tested: `getSimulatedBalances()` logic — the most critical business function
- Files: `server.ts` (`getSimulatedBalances` function)
- Risk: Wrong balance allows overdraft of school funds
- Priority: High

**Authentication Endpoints:**
- What's not tested: `/api/auth/login`, `/api/auth/register`, token validation, session expiry
- Files: `server.ts` (auth routes)
- Risk: Auth regressions go undetected
- Priority: High

**Pelunasan Synchronization:**
- What's not tested: Full create/update/delete lifecycle of Pelunasan and resulting Kas sync
- Files: `server.ts` (Talang POST/PUT/DELETE handlers)
- Risk: Kas/Talang balances become inconsistent
- Priority: High

---

*Concerns audit: 2026-06-12*
*Update as issues are fixed or new ones discovered*
