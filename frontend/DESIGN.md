# Design System & UI Guidelines
**Project:** AI Chatbot & Image Generation SaaS
**Theme:** Clean Minimalist (Tailwind) + AI Elegance (Google Gemini)
**Framework:** React + Tailwind CSS v4

---

## 1. Core Philosophy
Dokumen ini menjadi *Single Source of Truth* (SSOT) untuk pengembangan antarmuka (UI/UX) aplikasi. Semua komponen harus mematuhi prinsip berikut:
- **Clean & Accessible:** Mengutamakan ruang kosong (*white space*), keterbacaan tinggi, dan kontras yang nyaman di mata.
- **AI-Driven Elegance:** Identitas AI ditonjolkan melalui penggunaan gradien warna yang halus, transisi lembut, dan *soft shadows*.
- **Adaptive:** Komponen harus mendukung *Light Mode* dan *Dark Mode* secara harmonis.
- **Mobile-First:** Selalu desain untuk layar kecil (HP) terlebih dahulu, lalu gunakan *breakpoints* (`sm:`, `md:`, `lg:`) untuk layar yang lebih besar.

---

## 2. Typography

### Font Families
Kita menggunakan kombinasi 3 *font* dari Google Fonts untuk membedakan hierarki informasi:
- **Heading Font (Montserrat):** Digunakan khusus untuk *Headings* (H1-H6), nama aplikasi, dan judul kartu. Memberikan kesan modern dan geometris.
  - *Tailwind class:* `font-montserrat`
- **Body Font (Inter):** Digunakan untuk teks utama, paragraf, *chat bubble*, dan label antarmuka. Memiliki tingkat keterbacaan tinggi.
  - *Tailwind class:* `font-sans`
- **Mono/AI Accent Font (JetBrains Mono):** Digunakan untuk aksen teknis, teks *prompt* yang sedang diketik, *badge* status, atau blok kode.
  - *Tailwind class:* `font-mono`

### Hierarchy & Text Colors
- **Heading Utama:** `font-montserrat font-bold tracking-tight text-slate-900 dark:text-slate-50`
- **Teks Paragraf/Chat:** `font-sans font-normal text-slate-700 dark:text-slate-300`
- **Teks Mono/Prompt:** `font-mono text-sm text-indigo-600 dark:text-indigo-400`
- **Teks Muted/Info:** `font-sans font-normal text-sm text-slate-500 dark:text-slate-400`

---

## 3. Iconography

- **Library:** Menggunakan Lucide Icons melalui `react-icons`.
- **Prefix:** Selalu gunakan *prefix* `Lu` (contoh: `LuBrain`, `LuSend`, `LuImage`).
- **Style:** Karena mengusung tema *clean*, gunakan *icon* berbasis garis (*stroke*) bawaan Lucide, hindari *filled icons*.
- **Sizing:** Standar ukuran *icon* dalam tombol atau antarmuka adalah `text-lg` atau `text-xl` (sekitar 20px - 24px) agar selaras dengan teks Inter.

---

## 4. Color Palette & Theming

### Base Colors (Background & Surface)
- **Light Mode:**
  - Background Utama: `bg-slate-50`
  - Surface/Card: `bg-white`
  - Border: `border-slate-200`
- **Dark Mode:**
  - Background Utama: `bg-slate-950`
  - Surface/Card: `bg-slate-900`
  - Border: `border-slate-800`

### AI Accent Colors (The "Gemini" Vibe)
Identitas utama aplikasi menggunakan gradasi warna khas AI (biru ke ungu/merah muda).
- **Primary Gradient:** `bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500`
- **Primary Text Gradient:** `bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500`
- **Focus Ring:** `ring-indigo-500/50`

### System States (Feedback Colors)
- **Error/Destructive (Gagal/Kuota Habis):** `bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400`
- **Success (Berhasil/Payment Paid):** `bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400`
- **Warning/Pending:** `bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400`

---

## 5. System States & Visual Effects

### Hover, Active, & Disabled States
- **Soft Shadows (Elevations):**
  - *Default Card:* `shadow-sm`
  - *Hover State:* `hover:shadow-md transition-shadow duration-300`
- **Disabled State:** Saat tombol ditekan atau kuota habis, turunkan *opacity* dan ubah kursor.
  - *Classes:* `opacity-50 cursor-not-allowed pointer-events-none`
- **Subtle Blur (Glass effect ringan):**
  Digunakan pada Header/Top Bar agar teks di bawahnya terlihat samar saat di-scroll: `bg-white/80 dark:bg-slate-950/80 backdrop-blur-md`.

### Loading & Skeleton States
Sangat penting saat menunggu respons Gemini AI atau proses Cloudflare AI.
- **Skeleton Box (Image Generation):** Gunakan *pulse animation* dengan warna *slate* netral.
  - *Classes:* `animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl`
- **AI Active Glow:** Animasi *pulse* transparan (opacity 10-20%) pada elemen saat AI memproses.

---

## 6. Component Guidelines

### A. Buttons
- **Primary Button:** 
  Menggunakan *Primary Gradient*, teks putih, tanpa *border*.
  *Classes:* `bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-full px-6 py-2.5 font-sans font-medium hover:opacity-90 transition-opacity flex items-center gap-2`
- **Secondary Button:** 
  Transparan/putih dengan *border* tipis.
  *Classes:* `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-6 py-2.5 font-sans hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2`

### B. Inputs & Chat Box
- **Text Area/Input:** 
  *Classes:* `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all w-full font-sans`

### C. Chat Interface
- **User Bubble:** `bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tr-sm px-5 py-3 max-w-[85%] md:max-w-[75%] font-sans`
- **AI Bubble:** `bg-transparent text-slate-800 dark:text-slate-200 rounded-2xl px-5 py-3 max-w-[100%] md:max-w-[85%] font-sans`

### D. Image Gallery Cards
- Menampilkan gambar hasil *generate* dengan sudut `rounded-xl` dan `overflow-hidden`.
- *Hover Effect:* Muncul *overlay* gradasi gelap yang menampilkan teks *prompt*.
  *Classes Overlay:* `absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 md:hover:opacity-100 transition-opacity flex items-end p-4 font-mono text-sm text-white`

---

## 7. Layouting, Spacing, & Z-Index Management

### A. Container & Spacing
- **Container Utama (Chat & Gallery):** Gunakan `max-w-4xl` atau `max-w-5xl` dengan `mx-auto` agar konten tidak terlalu melebar di monitor besar.
- **Padding Global:** Gunakan `p-4` untuk *mobile* dan `md:p-8` untuk *desktop*.

### B. Responsive Behavior
- **Sidebar (Navigasi):**
  - **Mobile (`< 768px`):** Disembunyikan (menggunakan `hidden`). Digantikan oleh tombol "Hamburger" di Header yang membuka *off-canvas menu* atau *drawer*.
  - **Desktop (`>= 768px`):** Tampil sebagai *fixed sidebar* di sebelah kiri dengan lebar `w-64` atau `w-72`. Area konten utama bergeser ke kanan (`md:ml-64`).
- **Chat Input Area:**
  Selalu *fixed* di bagian bawah layar. Pada mode *desktop*, lebarnya harus mengikuti lebar area konten utama (dikurangi lebar sidebar), bukan melebar *full screen*.

### C. Z-Index Scale (Penting untuk menghindari *bug* tumpukan elemen)
Ikuti hierarki *z-index* berikut secara ketat:
- `z-0` : Background / Elemen dasar
- `z-10` : Konten obrolan / Kartu galeri
- `z-20` : Floating elements dalam konten (seperti tombol *scroll to bottom*)
- `z-30` : Fixed Chat Input Area (di bagian bawah)
- `z-40` : Header / Top Navigation Bar
- `z-50` : Sidebar / Mobile Drawer Navigation
- `z-60` : Modal Popup / Alert / Midtrans Snap Overlay