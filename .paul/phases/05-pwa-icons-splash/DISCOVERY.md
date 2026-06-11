---
phase: 05-pwa-icons-splash
topic: PWA icon set generation + native-like splash screen
depth: standard
confidence: HIGH
created: 2026-06-12
---

# Discovery: PWA Icon Set + Splash Screen untuk SIKAT

**Recommendation:** Gunakan `@vite-pwa/assets-generator` (tool resmi vite-pwa) untuk generate semua icon sizes dari satu SVG, + React CSS `SplashScreen` component untuk splash native-like di semua platform.

**Confidence:** HIGH — berdasarkan dokumentasi resmi vite-pwa, verifikasi integrasi vite-plugin-pwa yang sudah ada, dan platform behavior yang terdokumentasi.

---

## Objective

Yang perlu diputuskan sebelum planning:
- Apa tool terbaik untuk generate icon set lengkap dari satu sumber?
- Bagaimana cara implementasi splash screen yang native-like?
- Konsep visual icon apa yang relevan untuk app keuangan sekolah?

---

## Scope

**Include:**
- Tool untuk generate semua PWA icon sizes dari satu SVG source
- Splash screen approach yang bekerja di Android, iOS, dan Desktop
- Integrasi dengan vite-plugin-pwa yang sudah ada

**Exclude:**
- Desain icon itu sendiri (butuh Figma, dikerjakan manual oleh user atau tim desain)
- Apple splash screen kompleks (value rendah vs kompleksitas tinggi)
- PWA icon untuk desktop OS (Start Menu / Dock)

---

## Kondisi Saat Ini

```
public/
├── pwa-192x192.png        ← placeholder solid blue #2563EB
├── pwa-512x512.png        ← placeholder solid blue #2563EB
└── pwa-maskable-512x512.png ← placeholder solid blue #2563EB
manifest.json              ← stale (hanya favicon.ico)
vite.config.ts             ← VitePWA configured, 3 icons di manifest
```

**Gap:** Icon placeholder, manifest stale, splash screen belum ada.

---

## Findings

### Icon Generation

#### Option A: `@vite-pwa/assets-generator` (official tool)

**Source:** vite-pwa-org.netlify.app/assets-generator

Tool resmi dari tim vite-plugin-pwa. Generate semua icon sizes dari satu SVG menggunakan `sharp`.

**Cara kerja:**
```bash
npm install -D @vite-pwa/assets-generator
npx pwa-assets-generator --preset minimal2023
```

Preset `minimal2023` menghasilkan:
- `favicon.ico` (48×48)
- `pwa-64x64.png`
- `pwa-192x192.png`
- `pwa-512x512.png`
- `maskable-icon-512x512.png` (dengan safe zone 20%)
- `apple-touch-icon-180x180.png` (iOS home screen)

**Pros:**
- Zero-config (pakai preset)
- Official, maintained bersama vite-plugin-pwa
- Satu SVG → semua ukuran
- Bisa generate Apple splash images jika dibutuhkan nanti
- Langsung auto-include di vite-plugin-pwa manifest

**Cons:**
- Tambah dev dependency `@vite-pwa/assets-generator` + `sharp` (~10MB dev)
- Butuh SVG berkualitas tinggi sebagai input

**Fit untuk SIKAT:** Sangat cocok. App sudah pakai vite-plugin-pwa — tool ini dirancang untuk integrasi sempurna.

---

#### Option B: `pwa-asset-generator` (community tool)

**Source:** npm pwa-asset-generator

Tool komunitas, lebih tua. Mirip functionality tapi tidak official.

**Pros:** Familiar bagi sebagian developer
**Cons:** Bukan official, maintenance tidak seaktif Option A, tidak didesain khusus untuk vite-plugin-pwa

**Fit untuk SIKAT:** Tidak direkomendasikan — Option A adalah modern replacement-nya.

---

#### Option C: Manual sharp/jimp script

Script Node.js custom untuk resize SVG ke semua ukuran.

**Pros:** Kontrol penuh
**Cons:** Maintain script sendiri, mudah lupa ukuran yang dibutuhkan, tidak generate Apple assets

**Fit untuk SIKAT:** Tidak perlu — sudah ada Option A yang lebih baik.

---

### Splash Screen

#### Option A: React CSS SplashScreen Component

Component React yang tampil saat app initialize, lalu fade out.

**Cara kerja:**
```tsx
// SplashScreen.tsx — tampil 2-3 detik, fade out
function SplashScreen({ visible }) {
  return (
    <div className={`fixed inset-0 bg-blue-600 flex items-center
      justify-center transition-opacity duration-500
      ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <img src="/pwa-192x192.png" className="w-24 h-24" />
      <p className="text-white font-bold text-xl mt-4">SIKAT</p>
    </div>
  )
}
```

**Pros:**
- Bekerja di **semua platform** (Android, iOS, Desktop)
- Branded — tampilan sama di semua device
- Kontrol penuh atas timing dan animasi
- Bekerja offline
- Konsisten saat app sudah ter-install

**Cons:**
- Bukan OS-level splash (tampil setelah web engine load)
- Ada jeda putih singkat sebelum React render (minimal)

**Fit untuk SIKAT:** Pendekatan utama yang direkomendasikan.

---

#### Option B: Native Android Manifest Splash (zero config)

Saat PWA ter-install di Android, Chrome otomatis generate splash dari manifest:
- `background_color` sebagai background
- `theme_color` sebagai header bar
- Icon 512px di tengah

**Current config:** `background_color: '#ffffff'` → splash putih polos.

**Pros:** Zero code, native Android experience, gratis
**Cons:** Android/Chrome only, tidak ada di iOS atau Desktop, unbranded jika icon belum bagus

**Fit untuk SIKAT:** Dipakai sebagai **tambahan** Option A. Update `background_color` ke brand color setelah icon dibuat.

---

#### Option C: Apple Splash Screens via Meta Tags

Splash screen khusus iOS menggunakan `apple-touch-startup-image` meta tags. `@vite-pwa/assets-generator` bisa generate ini dengan `createAppleSplashScreens()`.

**Pros:** Satu-satunya cara splash native di iOS
**Cons:**
- Butuh ~30+ HTML meta tag (satu per device/orientasi)
- Payload besar (~2MB+ gambar untuk semua device)
- Safari bug: ignores landscape, stretches portrait
- Rumit di-maintain

**Fit untuk SIKAT:** Skip untuk sekarang. React component (Option A) sudah cover iOS. Bisa ditambahkan nanti jika dibutuhkan.

---

## Comparison

| Criteria | @vite-pwa/assets-generator | pwa-asset-generator | Manual script |
|----------|---------------------------|---------------------|---------------|
| Integrasi vite-plugin-pwa | Sempurna (official) | Partial | Manual |
| Kemudahan setup | Zero-config (preset) | Sedang | Tinggi effort |
| Maintenance | Dirawat oleh vite-pwa team | Komunitas | Self-maintained |
| Apple assets support | Ya | Terbatas | Tidak |
| Sumber tunggal (SVG) | Ya | Ya | Ya |
| Recommended 2025 | Ya | Tidak | Tidak |

| Criteria | React CSS Splash | Native Manifest | Apple Meta Tags |
|----------|-----------------|-----------------|-----------------|
| Platform coverage | Semua | Android only | iOS only |
| Effort implementasi | Sedang (1 component) | Zero (manifest) | Tinggi |
| Kontrol desain | Penuh | Terbatas | Terbatas |
| Maintenance | Minimal | Minimal | Tinggi |
| Value untuk SIKAT | Tinggi | Sedang | Rendah |

---

## Recommendation

**Icon generation: Gunakan `@vite-pwa/assets-generator` dengan `minimal2023` preset.**

**Splash screen: Hybrid — React CSS component (primary) + native Android manifest (free bonus).**

**Rationale:**
- App sudah pakai vite-plugin-pwa, jadi @vite-pwa/assets-generator adalah natural fit — satu command generate semua ukuran, auto-integrate dengan manifest
- React splash cover semua platform (Android, iOS, Desktop) dengan satu implementasi
- Native Android manifest splash didapat gratis hanya dengan update `background_color`
- Skip Apple meta tags: complexity tinggi, React component sudah handle iOS

**Icon visual concept untuk SIKAT:**
- **Tema:** Buku kas / ledger + koin atau simbol mata uang
- **Warna:** Biru Tailwind (#2563EB) sebagai primary — profesional, financial, trustworthy
- **Style:** Flat/geometric (scalable ke 64x64 tanpa kehilangan detail)
- **Safe zone:** Desain dalam area 80% tengah untuk maskable icon (Android adaptive)
- **Nama:** "SIKAT" bisa jadi teks di dalam icon atau subtitle di bawah logo

**Caveats:**
- User perlu membuat desain SVG source sendiri (Figma) sebelum assets bisa di-generate
- SVG harus high quality dan readable di ukuran kecil (64x64)
- Background `background_color` di manifest harus di-update dari `#ffffff` ke brand color

---

## Open Questions

- Siapa yang akan mendesain SVG icon? (user sendiri di Figma, atau pakai icon library seperti Heroicons/Lucide sebagai base?) — Impact: **high** (blocker sebelum generate assets)
- Apakah ingin dark mode splash screen? (React component bisa handle dengan Tailwind `dark:`) — Impact: **low**

---

## Quality Report

**Sources consulted:**
- vite-pwa-org.netlify.app/assets-generator (2024, official docs)
- github.com/vite-pwa/assets-generator (2024)
- web.dev/maskable-icon (Google, 2024)
- developer.mozilla.org/en-US/docs/Web/Progressive_web_apps (MDN, 2024)
- deepwiki.com/vite-pwa/vite-plugin-pwa (2024)

**Verification:**
- @vite-pwa/assets-generator: Verified via official docs dan npm (~166k weekly downloads)
- minimal2023 preset sizes: Verified via vite-pwa docs
- Native Android manifest splash: Verified via MDN PWA docs
- iOS `apple-touch-startup-image` bug: Known issue, documented multiple places
- workbox globPatterns `*.png` sudah cover semua generated icons: Verified via vite.config.ts current setup

**Assumptions (not verified):**
- SVG sumber akan dibuat oleh user (tool hanya generate sizes dari sumber yang ada)
- `@vite-pwa/assets-generator` versi terbaru compatible dengan vite-plugin-pwa versi yang digunakan di project ini

---
*Discovery completed: 2026-06-12*
*Confidence: HIGH*
*Ready for: /paul:plan 05-pwa-icons-splash*
