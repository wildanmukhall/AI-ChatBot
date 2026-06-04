# Identitas Kelompok

---

**Nama Kelompok:** `SEBELAS`

**Nama Proyek / Aplikasi:** `AI WEB CHATBOT`

**Jumlah Anggota:** `3` orang

**Repositori:** `https://github.com/`

---

## Anggota & Role

**Anggota 1**
- Nama Lengkap: `Dandy Sultana Putra Ali`
- NIM: `230705199`
- Role: `Backend Developer`
- Teknologi: `Laravel, MySQL, REST API, Gemini API, Cloudflare Worker AI, Midtrans`

**Anggota 2**
- Nama Lengkap: `Syibran Malawi`
- NIM: `230705062`
- Role: `Frontend Developer`
- Teknologi: `Blade, Tailwind CSS, Vite`

**Anggota 3**
- Nama Lengkap: `M. Wildan Mukhalladun`
- NIM: `230705059`
- Role: `DevOps Engineer`
- Teknologi: `Railway, GitHub, Deployment Automation, Environment Configuration`

---

## Stack Teknologi

**Frontend:** `Blade, Tailwind CSS, Vite`

**Backend:** `Laravel`

**Database:** `MySQL`

**DevOps / Infrastruktur:** `Railway, GitHub`

**Layanan AI Generate Teks:** `Gemini API`

**Layanan AI Generate Gambar:** `Cloudflare Worker AI / Text-to-Image Model`

**Payment Gateway:** `Midtrans`

---

## Arsitektur Aplikasi

AI Web Chatbot merupakan aplikasi chatbot berbasis web yang terdiri dari antarmuka pengguna, backend Laravel, database MySQL, serta beberapa layanan eksternal. Pengguna berinteraksi melalui halaman web berbasis Blade. Setiap request generate teks, generate gambar, autentikasi, galeri, pricing plan, dan pembayaran akan diproses oleh backend Laravel melalui endpoint API yang telah disediakan.

Untuk fitur generate teks, backend Laravel meneruskan prompt pengguna ke Gemini API. Untuk fitur generate gambar text-to-image, backend mengirim prompt gambar ke endpoint Cloudflare Worker yang memanfaatkan model AI generate gambar. Sistem juga menggunakan Midtrans sebagai payment gateway untuk memproses pembayaran paket generate gambar berbayar.

```text
User
  ↓
Frontend Blade
  ↓
Backend API Laravel
  ↓
MySQL Database
  ↓
Layanan Eksternal
  ├── Gemini API untuk generate teks
  ├── Cloudflare Worker AI untuk generate gambar
  └── Midtrans untuk payment gateway
```

**Aplikasi 1 — Frontend**
- Nama Aplikasi: `AI Web Chatbot`
- Deskripsi Singkat: `Antarmuka web untuk pengguna melakukan generate teks, generate gambar, melihat galeri hasil gambar, memilih pricing plan, serta melakukan autentikasi.`
- Berkomunikasi dengan: `Backend API Laravel`

**Aplikasi 3 — Backend (Laravel)**
- Nama Aplikasi / Service: `API Chatbot Laravel`
- Deskripsi Singkat: `Layanan backend yang mengelola autentikasi pengguna, endpoint generate teks, endpoint generate gambar, pricing plan, transaksi pembayaran Midtrans, penyimpanan riwayat, serta galeri hasil generate gambar.`
- Menyediakan layanan untuk: `Frontend Chatbot Web UI, Gemini API, Cloudflare Worker AI, Midtrans, dan MySQL Database`

---

## Struktur Direktori Utama

```text
ai-web-chatbot/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Requests/
│   └── Models/
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── css/
│   ├── js/
│   └── views/
├── routes/
│   ├── web.php
│   └── api.php
├── storage/
├── tests/
├── .env.example
├── composer.json
├── package.json
└── README.md
```

---

## Environment Variable Utama

```env
APP_NAME="AI Web Chatbot"
APP_ENV=local
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_web_chatbot
DB_USERNAME=root
DB_PASSWORD=

GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_URL=https://generativelanguage.googleapis.com

CLOUDFLARE_WORKER_AI_URL=https://your-worker-name.your-subdomain.workers.dev
CLOUDFLARE_WORKER_AI_TOKEN=your_cloudflare_worker_token

MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_IS_PRODUCTION=false
```

---

## Catatan Pengembangan

- API key Gemini, token Cloudflare Worker, dan server key Midtrans tidak boleh disimpan langsung di dalam kode program.
- Seluruh konfigurasi sensitif disimpan di file `.env`.
- Backend Laravel bertanggung jawab sebagai penghubung antara frontend, database, dan layanan eksternal.
- Railway digunakan untuk deployment dan pengelolaan environment variable production.
