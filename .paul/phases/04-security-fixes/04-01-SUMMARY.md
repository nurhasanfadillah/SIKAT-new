---
phase: 04-security-fixes
plan: 01
subsystem: auth
tags: [crypto, security, session-token, randomBytes]

requires:
  - phase: 03-pwa-vercel
    provides: server.ts dengan app factory pattern yang digunakan di sini

provides:
  - server.ts dengan CSPRNG untuk semua token dan ID generation

affects: auth

tech-stack:
  added: []
  patterns: [Node.js built-in crypto untuk semua random generation]

key-files:
  modified: [server.ts]

key-decisions:
  - "randomBytes(32) untuk session tokens, randomBytes(6) untuk entity IDs"

duration: ~5min
started: 2026-06-12T00:00:00Z
completed: 2026-06-12T00:00:00Z
---

# Phase 4 Plan 1: Token Security Summary

**`Math.random()` diganti dengan `crypto.randomBytes` di semua 7 lokasi token dan ID generation di server.ts.**

## AC Result

| Criterion | Status |
|-----------|--------|
| AC-1: Session tokens menggunakan CSPRNG | Pass |

## Files Changed

| File | Change |
|------|--------|
| `server.ts` | Modified — import `randomBytes` + 7 penggantian `Math.random()` |

---
*Completed: 2026-06-12*
