---
phase: 12-dashboard-ui-polish
topic: Audit UI halaman Dashboard — identifikasi bug, inconsistency, dan edge cases
depth: standard
confidence: HIGH
created: 2026-06-13
---

# Discovery: Audit UI Halaman Dashboard

**Recommendation:** Fix 5 bug fungsional prioritas tinggi + 4 polish issue — estimasi 1 plan, ~15 perubahan di Dashboard.tsx

**Confidence:** HIGH — Semua temuan berasal dari pembacaan langsung source code; tidak ada asumsi.

## Objective

Yang perlu dipelajari sebelum plan dibuat:
- Apakah ada bug fungsional (logika salah, edge case crash)?
- Apakah ada overflow/truncation issue pada tampilan data?
- Apakah ada inkonsistensi dengan design system yang sudah dibangun?
- Apa yang perlu diprioritaskan untuk phase ini?

## Scope

**Include:**
- `src/pages/Dashboard.tsx` — komponen utama dashboard
- `src/hooks/useTransactions.ts` — data fetching & polling
- Layout wrapper sejauh mempengaruhi dashboard
- Design system (token, typography, spacing) sebagai referensi konsistensi

**Exclude:**
- Halaman lain (Kas, Talang, Laporan)
- Backend API changes
- Perubahan arsitektur data

## Findings

### Kategori A: Bug Fungsional (P1 — harus fix)

**A1: Progress bar edge case saat kasBalance = 0**

**Source:** `src/pages/Dashboard.tsx` (progress bar di capacity card)

```tsx
// SEKARANG — bermasalah
style={{width: `${Math.min(100, (totalTalangAktif / (kasBalance || 1)) * 100)}%`}}

// Jika kasBalance = 0 dan totalTalangAktif = 5_000_000:
// (5_000_000 / 1) * 100 = 500_000_000% → Math.min(100) → 100% ✓ TAPI misleading

// Seharusnya: kalau kasBalance = 0, bar = 0% atau 100% (semua tertalang)
```

**Fix:** Gunakan guard eksplisit:
```tsx
const pct = kasBalance > 0 ? Math.min(100, (totalTalangAktif / kasBalance) * 100) : 100;
```

---

**A2: Warna nominal transaksi — Pelunasan talang tampak neutral padahal outgoing**

**Source:** `src/pages/Dashboard.tsx` (transaction list item, ~line 248)

```tsx
// SEKARANG — Pelunasan dan Transfer warnanya slate-100 (neutral)
className={isIncoming || isTalangBaru ? 'text-brand-500' : 'text-slate-100'}

// Pelunasan talang = uang kas keluar → seharusnya merah (text-rose-400)
// Transfer antar akun = neutral ✓ (bisa argumen kedua arah)
```

**Fix:**
```tsx
const isOutgoing = isExpense || isTalangPelunasan;
className={isIncoming || isTalangBaru ? 'text-brand-500' : isOutgoing ? 'text-rose-400' : 'text-slate-100'}
```

---

**A3: Currency text di account card tidak truncate → bisa overlap badge**

**Source:** `src/pages/Dashboard.tsx` (talang account cards, ~line 170)

Nama akun truncate dengan baik, tapi nilai currency (`text-body font-mono font-bold`) tidak punya batas lebar. Pada saldo tinggi (e.g., Rp 15.000.000), bisa overlap ke badge "Aktif"/"Aman" di kanan.

**Fix:** Tambah `truncate` atau `max-w` pada nilai:
```tsx
<span className="text-body font-mono font-bold tracking-tight truncate">
  {formatCurrency(balance)}
</span>
```

---

**A4: Network polling terlalu agresif (5 detik)**

**Source:** `src/hooks/useTransactions.ts` (interval ~5000ms)

Polling setiap 5 detik pada mobile PWA = drain battery + unnecessary server load. Data keuangan tidak perlu real-time sub-5-detik.

**Fix:** Naikkan ke 30 detik:
```tsx
const interval = setInterval(fetchTransactions, 30_000);
```

---

**A5: Metadata span di transaction list tidak truncate**

**Source:** `src/pages/Dashboard.tsx` (transaction metadata ~line 240)

```tsx
<span className="text-nano text-slate-400 flex items-center gap-1 mt-0.5">
  <span className="font-medium text-slate-300">{kategori}</span>
  <span>•</span>
  <span>{tanggal}</span>
</span>
```

Tidak ada `truncate` atau `overflow-hidden`. Pada nama kategori panjang bisa overflow container.

**Fix:** Tambah `overflow-hidden` pada wrapper span atau `truncate` pada kategori span.

---

### Kategori B: Polish & Konsistensi (P2 — sebaiknya fix)

**B1: Balance hero bisa overflow jika nominal sangat besar**

**Source:** `src/pages/Dashboard.tsx` (~line 71)

```tsx
<h2 className="text-3xl font-black tracking-tight text-white select-all">
```

Tidak ada `break-words` atau `overflow-wrap`. Rp 999.999.999.999 akan overflow.

**Fix:** Tambah `break-words` atau reduce ke `text-2xl` untuk nilai besar.

---

**B2: Loading spinner opacity inkonsisten**

**Source:** `src/pages/Dashboard.tsx` (~line 15)

```tsx
border-brand-500/30 border-t-brand-500
```

`/30` opacity pada border + solid di `border-t` adalah pattern yang benar, tapi `border-brand-500/30` di sini kurang gelap sehingga track-nya hampir invisible di background gelap.

**Fix:** Ganti ke `border-white/10 border-t-brand-500` untuk kontras lebih baik.

---

**B3: Stat cards tidak punya min-height → height inconsistent**

**Source:** `src/pages/Dashboard.tsx` (2-column talang cards ~line 110)

Card height tergantung content. Pada layout 2-column, kedua card bisa punya tinggi berbeda jika content berbeda.

**Fix:** Tambah `min-h-[110px]` pada kedua card stat.

---

**B4: Elemen dekoratif blur tidak punya aria-hidden**

**Source:** `src/pages/Dashboard.tsx` (blur orbs/decorative divs)

```tsx
<div className="absolute top-[-30%] right-[-10%] w-44 h-44 bg-brand-500/10 ..."/>
```

Screen reader akan mencoba membaca elemen dekoratif ini.

**Fix:** Tambah `aria-hidden="true"` pada semua elemen dekoratif.

---

### Kategori C: Out of Scope / Deferred

**C1: Hard-coded talang limit di Laporan.tsx** — Ini bukan Dashboard, defer ke phase Laporan.

**C2: Skeleton loading states** — Nice-to-have, scope phase tersendiri.

**C3: InstallPrompt overlap nav bar** — Sudah tercatat di STATE.md deferred issues.

**C4: FeedbackContext.tsx arbitrary text sizes** — Sudah tercatat di STATE.md deferred.

## Comparison

| Issue | Severity | File | Lines Est. | Risk |
|-------|----------|------|------------|------|
| A1: Progress bar edge case | P1 Bug | Dashboard.tsx | 1 | Low |
| A2: Warna nominal Pelunasan | P1 UX | Dashboard.tsx | 2-3 | Low |
| A3: Currency truncation | P1 Overflow | Dashboard.tsx | 1 | Low |
| A4: Polling interval | P1 Perf | useTransactions.ts | 1 | Low |
| A5: Metadata truncation | P1 Overflow | Dashboard.tsx | 1-2 | Low |
| B1: Balance break-words | P2 Overflow | Dashboard.tsx | 1 | Low |
| B2: Spinner opacity | P2 Visual | Dashboard.tsx | 1 | Low |
| B3: Card min-height | P2 Layout | Dashboard.tsx | 2 | Low |
| B4: aria-hidden dekoratif | P2 A11y | Dashboard.tsx | 4-5 | Low |

## Recommendation

**Fix semua P1 + P2 dalam 1 plan.**

**Rationale:**
- Semua fix adalah targeted, low-risk (1-3 baris per fix)
- Tidak ada perubahan API atau struktur komponen
- Semua dalam 2 file saja (Dashboard.tsx + useTransactions.ts)
- Total estimasi: ~15-20 baris perubahan

**Execution order dalam plan:**
1. useTransactions.ts — polling interval (isolated, no visual impact)
2. Dashboard.tsx — semua A1-A5 (bug fungsional)
3. Dashboard.tsx — semua B1-B4 (polish)

**Caveats:**
- A2 (warna Pelunasan) membutuhkan verifikasi logic `isTalangPelunasan` — pastikan variable ini sudah ada/di-define
- B3 (min-height) perlu visual check setelah apply — nilai `110px` adalah estimasi, mungkin perlu adjust

## Open Questions

- Apakah ada `isTalangPelunasan` / `isTalangTransfer` yang sudah didefinisikan di transaction list render? — Impact: medium (tentukan cara fix A2)
- Apakah user pernah punya saldo sangat besar (> 9 digit)? — Impact: low (tentukan urgensi B1)

## Quality Report

**Sources consulted:**
- `src/pages/Dashboard.tsx` — dibaca langsung (2026-06-13)
- `src/hooks/useTransactions.ts` — dibaca langsung (2026-06-13)
- `src/components/Layout.tsx` — dibaca langsung (2026-06-13)
- `src/index.css` (theme tokens) — dibaca langsung (2026-06-13)
- `src/lib/tokens.ts` — dibaca langsung (2026-06-13)
- `.paul/STATE.md` — accumulated context cross-referenced (2026-06-13)

**Verification:**
- A1 (progress bar edge case): Verified via source — `(kasBalance || 1)` pattern jelas terlihat
- A2 (warna nominal): Verified via source — conditional logic `isIncoming || isTalangBaru` dikonfirmasi
- A3, A5 (truncation): Verified via source — tidak ada `truncate` pada element dimaksud
- A4 (polling 5s): Verified via source — `setInterval(fetchTransactions, 5000)` dikonfirmasi
- B4 (aria-hidden): Verified via source — decorative divs tidak punya aria attributes

**Assumptions (not verified):**
- Nilai `min-h-[110px]` untuk B3 belum di-visual-test — perlu adjustment setelah apply
- Variable name `isTalangPelunasan` di A2 belum dikonfirmasi — perlu cek exact variable name saat plan

---
*Discovery completed: 2026-06-13*
*Confidence: HIGH*
*Ready for: /paul:plan 12-dashboard-ui-polish*
