# Design System & UI Guidelines

**Project:** AI Chatbot & Image Generation SaaS  
**Theme:** Premium Glassmorphism + Apple Human Interface Guidelines (HIG) Elegance  
**Framework:** React + Tailwind CSS v4 + Glin UI (`@glinui/ui` & `@glinui/tokens`) + `gooey-toast`

---

## 1. Core Philosophy

Dokumen ini menjadi _Single Source of Truth_ (SSOT) untuk pengembangan antarmuka (UI/UX) aplikasi. Semua komponen wajib mematuhi aturan keselarasan, kedalaman visual, dan ergonomi Apple HIG yang diimplementasikan melalui ekosistem Glin UI:

- **Token-Driven Consistency:** Seluruh pondasi layout, ukuran, dan skema warna diatur terpusat menggunakan `@glinui/tokens` yang dikonfigurasi mengikuti standar ketat Apple HIG.
- **Clarity & Premium Glassmorphic:** Mengutamakan efek kaca transparan yang bersih, tajam, dengan tingkat kontras teks yang tinggi di atasnya. Mengeliminasi efek cairan pihak ketiga yang dapat merusak keterbacaan.
- **True Dark Vibe:** Menggunakan basis warna hitam pekat (_true black_) ala layar OLED Apple untuk efisiensi energi dan kontras tinggi, dipadukan dengan pendaran aksen (_glow_) kuning-oranye keemasan yang mewah.
- **Hit Targets (HIG Standards):** Semua komponen interaktif (tombol, area input) harus dikonfigurasi untuk memiliki tinggi atau area sentuh minimal setinggi **44px** demi kenyamanan kursor dan jari pengguna.

---

## 2. Typography & Hierarchy (HIG Compliant)

### Font Families

Menggunakan font bertipe _neo-grotesque_ yang bersih dan netral untuk mempertahankan kesan sistem bawaan yang premium:

- **UI & Body Font (Inter / Geist Sans):** Digunakan untuk seluruh elemen teks aplikasi (Heading, Body, Chat Bubble, Input, Toast). Memberikan tingkat keterbacaan yang sangat tinggi dan profesional.
    - _Tailwind class:_ `font-sans`
- **Mono Accent Font (JetBrains Mono):** Hanya digunakan untuk porsi kecil yang bersifat teknis, seperti teks _prompt_ di galeri, kode model AI, atau angka statistik kuota.
    - _Tailwind class:_ `font-mono`

### Typography Scale & Color

- **Large Title (Welcome back):** `font-sans font-semibold text-3xl tracking-tight text-white`
- **Card/Section Title (Today, Quick Actions):** `font-sans font-medium text-sm tracking-wide text-neutral-400 uppercase`
- **Body Text / Chat Bubble / Toast Text:** `font-sans font-normal text-sm tracking-wide text-neutral-200`
- **Muted Text / Secondary Info:** `font-sans font-normal text-xs text-neutral-500`

---

## 3. Glin UI Tokens Configuration (Yellow-Orange Aura)

Pemetaan `@glinui/tokens` wajib di-override di tingkat konfigurasi aplikasi agar menghasilkan tema _True Dark Golden_ khas Apple HIG yang presisi:

### Base Colors & Surface Tokens

- `tokens.color.background`: `#0A0A09` (Hitam pekat murni)
- `tokens.color.surface`: `rgba(22, 22, 21, 0.45)` (Wadah utama efek _glassmorphism_)
- `tokens.color.border`: `rgba(255, 255, 255, 0.08)` (Garis pembatas kaca tipis khas Apple)

### Golden Accent Tokens

- `tokens.color.primary`: `#F59E0B` (Amber / Kuning Emas)
- `tokens.color.primaryGradient`: `linear-gradient(to right, #FBBF24, #F59E0B, #F97316)` (Gradasi Kuning ke Oranye)

### Spacing & Radius Tokens (HIG Standar)

- `tokens.radius.card`: `24px` (Sudut melengkung besar khas Apple / _Squircle_)
- `tokens.radius.button`: `9999px` (Melengkung penuh / _Rounded Full_)
- `tokens.spacing.global`: `16px` (Kelipatan 8pt grid system)

---

## 4. Component Guidelines

### A. Glassmorphic Cards & Containers

Gunakan komponen Card bawaan dari `@glinui/ui` dengan menerapkan utility class Tailwind v4 untuk efek kaca premium:

- **Tailwind Classes:** `bg-neutral-900/40 backdrop-blur-xl border border-white/8 shadow-2xl shadow-black/80 overflow-hidden`
- **Visual Glow:** Berikan efek pendaran luar yang halus (_subtle outer glow_) berwarna kuning/oranye menggunakan bayangan tipis pada elemen krusial: `shadow-[0_0_20px_rgba(245,158,11,0.05)]`.

### B. Input & Chat Box

Kotak input diletakkan tetap (_fixed_) di area bawah layar menggunakan komponen Input/Textarea dari Glin UI.

- **Classes:** Menggunakan properti padding `p-5` dengan font-sans bawaan.
- **Text Area:** `w-full bg-transparent text-sm text-white placeholder-neutral-600 resize-none focus:outline-none font-sans tracking-wide`

### C. Buttons (HIG Hit Target)

Tombol dari `@glinui/ui` dikonfigurasi menggunakan ukuran medium/large untuk mencapai batas minimal HIG.

- **Primary Button Configuration:** Memakai token `primaryGradient`, tinggi minimal `h-10` atau `h-11`, teks berwarna hitam pekat (`text-black`), dan font-weight `font-semibold`.
- **Secondary/Icon Button:** `w-10 h-10 rounded-full bg-neutral-900/80 border border-neutral-800 text-neutral-400 hover:text-white transition-colors flex items-center justify-center`

### D. Quick Actions Cards (Grid)

Kartu pintasan di bawah input box menggunakan layout grid 3 kolom yang dibungkus oleh komponen Card Glin UI.

- **Classes:** `p-4 border border-white/5 hover:border-amber-500/20 transition-all hover:-translate-y-0.5 cursor-pointer rounded-2xl`

---

## 5. System Feedback & Alerts (`gooey-toast`)

Notifikasi instan (_toast_) menggunakan library `gooey-toast` untuk memberikan efek transisan animasi membelah/menyatu yang elastis sebagai kontras dari struktur kaku Glin UI.

- **Positioning:** _Top Center_ (`top-center`) untuk mobile, _Top Right_ (`top-right`) untuk desktop.
- **Theming Customization:**
    - _Background:_ `rgba(22, 22, 21, 0.85)` + `backdrop-blur-lg`
    - _Border:_ `1px solid rgba(255, 255, 255, 0.08)`
    - _Text:_ `font-sans text-sm text-neutral-200`

---

## 6. Layouting & Z-Index Management

Ikuti susunan lapisan berikut secara ketat agar tidak ada komponen atau toast yang tumpang tindih secara keliru:

- `z-0` : Background hitam pekat & pendaran aura kuning-oranye statis (menggunakan radial-gradient CSS).
- `z-10` : Konten utama, teks obrolan, dan komponen dasar `@glinui/ui`.
- `z-20` : Fixed Chat Input Area di bagian bawah.
- `z-30` : Sidebar & Top Header Navigation.
- `z-40` : Modal Popup / Overlay Transaksi Midtrans.
- `z-50` : `gooey-toast` Container (Posisi paling atas untuk feedback penting sistem).
