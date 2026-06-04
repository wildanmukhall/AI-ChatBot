# AI Web Chatbot

AI Web Chatbot adalah aplikasi chatbot berbasis web yang memungkinkan pengguna mengirim pertanyaan melalui antarmuka web dan menerima balasan dari layanan AI secara real time. Sistem ini mendukung dua jenis layanan AI, yaitu generate teks menggunakan Gemini API dan generate gambar text-to-image menggunakan model AI yang dijalankan melalui Cloudflare Worker. Sistem ini dibangun menggunakan Laravel sebagai backend, Blade sebagai antarmuka frontend, MySQL sebagai database, serta Railway sebagai platform deployment.

## Identitas Proyek

| Keterangan | Detail |
|---|---|
| Nama Kelompok | SEBELAS |
| Nama Proyek | AI Chatbot |
| Jumlah Anggota | 3 orang |
| Repositori | https://github.com/wildanmukhall/AI-ChatBot |
| Frontend | Blade |
| Backend | Laravel |
| Database | MySQL |
| Deployment | Railway |

## Anggota Tim

| Nama | NIM | Role | Teknologi |
|---|---:|---|---|
| Dandy Sultana Putra Ali | 230705199 | Backend Developer | Laravel, MySQL, API |
| Syibran Malawi | 230705062 | Frontend Developer | Blade, Tailwind CSS, Vite |
| M. Wildan Mukhalladun | 230705059 | DevOps Engineer | Railway, GitHub, Deployment Automation |

## Deskripsi Sistem

AI Web Chatbot terdiri dari antarmuka pengguna dan layanan backend. Pengguna mengirim pesan melalui halaman chatbot, kemudian frontend meneruskan pesan tersebut ke backend Laravel. Backend memproses request, menghubungkan sistem dengan layanan AI eksternal sesuai jenis permintaan, menyimpan riwayat percakapan ke database, lalu mengirimkan kembali respons AI ke frontend. Untuk permintaan generate teks, sistem menggunakan Gemini API. Untuk permintaan generate gambar berbasis text-to-image, sistem memanfaatkan model AI yang tersedia melalui Cloudflare Worker.

Secara umum, alur sistem adalah sebagai berikut:

```text
User
  ↓
Frontend Blade
  ↓
Backend API Laravel
  ↓
Layanan AI Eksternal
  ├── Gemini API untuk generate teks
  └── Cloudflare Worker AI untuk generate gambar text-to-image
  ↓
Backend API Laravel
  ↓
Frontend Blade
  ↓
User
```

## Arsitektur Aplikasi

### 1. Frontend

Frontend digunakan sebagai antarmuka utama bagi pengguna untuk berinteraksi dengan chatbot.

**Nama aplikasi:** AI Web Chatbot

**Fungsi utama:**

- Menampilkan halaman chatbot.
- Menerima input pesan dari pengguna.
- Mengirim pesan pengguna ke backend.
- Menampilkan respons chatbot dari backend.
- Memberikan pengalaman penggunaan yang sederhana dan responsif.

**Teknologi yang digunakan:**

- Blade
- Tailwind CSS
- Vite

### 2. Backend

Backend digunakan untuk menangani logika utama aplikasi, termasuk pengelolaan request chatbot, integrasi dengan layanan AI, serta penyimpanan riwayat percakapan.

**Nama service:** API Chatbot Laravel

**Fungsi utama:**

- Menyediakan endpoint untuk pengiriman pesan chatbot.
- Memvalidasi input dari pengguna.
- Mengirim permintaan generate teks ke Gemini API.
- Mengirim permintaan generate gambar text-to-image ke model AI melalui Cloudflare Worker.
- Mengolah respons dari layanan AI.
- Menyimpan riwayat percakapan ke database.
- Mengirimkan respons kembali ke frontend.

**Teknologi yang digunakan:**

- Laravel
- MySQL
- REST API

### 3. Integrasi Layanan AI

Integrasi layanan AI digunakan untuk memproses permintaan pengguna berdasarkan jenis fitur yang digunakan. Sistem membedakan layanan AI menjadi dua bagian utama, yaitu layanan generate teks dan layanan generate gambar.

**Generate teks:**

- Menggunakan Gemini API.
- Digunakan untuk memproses pesan pengguna dan menghasilkan jawaban chatbot berbasis teks.
- Backend Laravel mengirim prompt pengguna ke Gemini API, kemudian menerima respons teks untuk ditampilkan kembali pada frontend.

**Generate gambar text-to-image:**

- Menggunakan model AI yang tersedia melalui Cloudflare Worker.
- Digunakan untuk menghasilkan gambar berdasarkan prompt teks yang diberikan pengguna.
- Backend Laravel mengirim prompt gambar ke endpoint Cloudflare Worker, kemudian menerima hasil gambar atau URL gambar untuk ditampilkan pada frontend.

### 4. Database

Database digunakan untuk menyimpan data yang dibutuhkan oleh aplikasi.

**Database:** MySQL

**Contoh data yang dapat disimpan:**

- Data pengguna, jika sistem memiliki fitur login.
- Riwayat pesan pengguna.
- Respons chatbot.
- Waktu percakapan.
- Status request atau metadata percakapan.

### 5. Deployment dan Infrastruktur

Deployment aplikasi dilakukan menggunakan Railway. Railway digunakan untuk menjalankan aplikasi Laravel, mengelola environment variable, serta menghubungkan aplikasi dengan database.

**Teknologi yang digunakan:**

- Railway
- GitHub
- Deployment Automation

## Fitur Utama Sistem

Berikut fitur utama yang dirancang pada sistem AI Web Chatbot:

### 1. Generate Teks

Fitur generate teks digunakan untuk memproses prompt atau pertanyaan yang dikirimkan oleh pengguna. Sistem akan meneruskan prompt dari frontend ke backend Laravel, kemudian backend mengirimkan request ke Gemini API. Respons dari Gemini API akan dikembalikan ke frontend dan ditampilkan sebagai jawaban chatbot berbasis teks.

### 2. Generate Gambar

Fitur generate gambar digunakan untuk menghasilkan gambar berdasarkan prompt teks yang dimasukkan oleh pengguna. Backend Laravel akan mengirimkan prompt gambar ke endpoint Cloudflare Worker yang memanfaatkan model text-to-image. Hasil generate dapat ditampilkan pada halaman aplikasi dalam bentuk gambar atau URL gambar.

### 3. Pricing Plan Generate Gambar

Fitur pricing plan digunakan untuk mengatur batasan dan paket penggunaan fitur generate gambar. Sistem dapat menyediakan beberapa pilihan paket, misalnya paket gratis dengan jumlah generate terbatas dan paket berbayar dengan kuota generate gambar yang lebih besar. Fitur ini membantu membatasi penggunaan resource AI sekaligus menjadi dasar monetisasi layanan.

### 4. Autentikasi Pengguna

Fitur autentikasi digunakan untuk mengelola akses pengguna ke dalam sistem. Pengguna dapat melakukan registrasi, login, dan logout. Dengan adanya autentikasi, sistem dapat menyimpan riwayat generate teks, hasil generate gambar, serta penggunaan kuota berdasarkan akun masing-masing pengguna.

### 5. Galeri Hasil Generate Gambar

Fitur galeri digunakan untuk menampilkan kembali hasil gambar yang pernah dibuat oleh pengguna. Setiap gambar hasil generate dapat disimpan ke database beserta informasi prompt, waktu pembuatan, dan pemilik akun. Dengan fitur ini, pengguna dapat melihat, mengelola, atau menggunakan kembali hasil gambar tanpa harus melakukan generate ulang.

## Struktur Direktori Laravel

Berikut contoh struktur direktori utama yang digunakan dalam proyek Laravel:

```text
ai-web-chatbot/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Requests/
│   └── Models/
├── bootstrap/
├── config/
├── database/
│   ├── migrations/
│   └── seeders/
├── public/
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

## Kebutuhan Sistem

Sebelum menjalankan proyek, pastikan perangkat sudah memiliki:

- PHP versi 8.2 atau lebih baru.
- Composer.
- Node.js dan npm.
- MySQL.
- Git.
- Akun Railway untuk deployment.

## Instalasi Lokal

Ikuti langkah berikut untuk menjalankan proyek secara lokal.

### 1. Clone Repository

```bash
git clone https://github.com/username/ai-web-chatbot.git
cd ai-web-chatbot
```

### 2. Install Dependency Laravel

```bash
composer install
```

### 3. Install Dependency Frontend

```bash
npm install
```

### 4. Salin File Environment

```bash
cp .env.example .env
```

Untuk pengguna Windows, dapat menggunakan:

```bash
copy .env.example .env
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

### 6. Konfigurasi Database

Sesuaikan konfigurasi database pada file `.env`.

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_web_chatbot
DB_USERNAME=root
DB_PASSWORD=
```

### 7. Konfigurasi API AI

Tambahkan konfigurasi API layanan AI pada file `.env`. Gemini API digunakan untuk generate teks, sedangkan Cloudflare Worker digunakan untuk generate gambar text-to-image.

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_URL=https://generativelanguage.googleapis.com
CLOUDFLARE_WORKER_AI_URL=https://your-worker-name.your-subdomain.workers.dev
CLOUDFLARE_WORKER_AI_TOKEN=your_cloudflare_worker_token
```

### 8. Jalankan Migrasi Database

```bash
php artisan migrate
```

### 9. Jalankan Server Laravel

```bash
php artisan serve
```

### 10. Jalankan Vite

```bash
npm run dev
```

Aplikasi dapat diakses melalui:

```text
http://127.0.0.1:8000
```

## Contoh Endpoint API

Berikut contoh rancangan endpoint yang dapat digunakan pada backend Laravel.

| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/` | Menampilkan halaman chatbot |
| POST | `/api/chat` | Mengirim pesan pengguna ke chatbot berbasis Gemini API |
| POST | `/api/generate-image` | Mengirim prompt teks untuk menghasilkan gambar melalui Cloudflare Worker AI |
| GET | `/api/chat/history` | Mengambil riwayat percakapan |

### Contoh Request Chat

```http
POST /api/chat
Content-Type: application/json
```

```json
{
  "message": "Apa itu Laravel?"
}
```

### Contoh Response Chat

```json
{
  "success": true,
  "message": "Laravel adalah framework PHP yang digunakan untuk membangun aplikasi web secara cepat, rapi, dan terstruktur."
}
```

### Contoh Request Generate Gambar

```http
POST /api/generate-image
Content-Type: application/json
```

```json
{
  "prompt": "Gambar robot kecil sedang membantu pengguna di depan laptop"
}
```

### Contoh Response Generate Gambar

```json
{
  "success": true,
  "image_url": "https://example.com/generated-image.png"
}
```

## Environment Variable

| Variable | Deskripsi |
|---|---|
| `APP_NAME` | Nama aplikasi Laravel |
| `APP_ENV` | Mode aplikasi, seperti local atau production |
| `APP_KEY` | Key keamanan aplikasi Laravel |
| `APP_URL` | URL aplikasi |
| `DB_CONNECTION` | Jenis database |
| `DB_HOST` | Host database |
| `DB_PORT` | Port database |
| `DB_DATABASE` | Nama database |
| `DB_USERNAME` | Username database |
| `DB_PASSWORD` | Password database |
| `GEMINI_API_KEY` | API key untuk Gemini API yang digunakan pada fitur generate teks |
| `GEMINI_API_URL` | URL endpoint Gemini API |
| `CLOUDFLARE_WORKER_AI_URL` | URL endpoint Cloudflare Worker untuk fitur generate gambar text-to-image |
| `CLOUDFLARE_WORKER_AI_TOKEN` | Token akses Cloudflare Worker, jika endpoint membutuhkan autentikasi |

## Alur Kerja Chatbot

1. Pengguna membuka halaman chatbot.
2. Pengguna mengetik pesan atau prompt pada form input.
3. Frontend mengirim request ke endpoint backend.
4. Backend melakukan validasi input.
5. Jika request berupa generate teks, backend mengirim prompt ke Gemini API.
6. Jika request berupa generate gambar, backend mengirim prompt ke Cloudflare Worker AI.
7. Layanan AI mengembalikan respons berupa teks atau hasil gambar.
8. Backend menyimpan riwayat request dan respons ke database.
9. Backend mengirim respons ke frontend.
10. Frontend menampilkan jawaban teks atau gambar kepada pengguna.

## Deployment ke Railway

Langkah umum deployment ke Railway:

1. Push project ke GitHub.
2. Login ke Railway.
3. Buat project baru di Railway.
4. Hubungkan repository GitHub.
5. Tambahkan environment variable yang dibutuhkan.
6. Tambahkan database MySQL jika diperlukan.
7. Jalankan proses deploy.
8. Pastikan aplikasi berhasil berjalan pada domain Railway.

## Perintah Penting

```bash
php artisan serve
```

Menjalankan server Laravel secara lokal.

```bash
npm run dev
```

Menjalankan Vite untuk proses development frontend.

```bash
npm run build
```

Membuat build asset frontend untuk production.

```bash
php artisan migrate
```

Menjalankan migrasi database.

```bash
php artisan config:clear
```

Membersihkan cache konfigurasi Laravel.

```bash
php artisan cache:clear
```

Membersihkan cache aplikasi.

## Pembagian Tugas Tim

### Backend Developer

Bertanggung jawab terhadap pengembangan logic backend, API chatbot, integrasi Gemini API untuk generate teks, integrasi Cloudflare Worker AI untuk generate gambar, validasi request, serta pengelolaan database.

### Frontend Developer

Bertanggung jawab terhadap tampilan antarmuka chatbot, implementasi Blade, styling menggunakan Tailwind CSS, serta integrasi tampilan dengan endpoint backend.

### DevOps Engineer

Bertanggung jawab terhadap pengelolaan repository GitHub, konfigurasi Railway, deployment aplikasi, serta pengaturan environment variable pada server.

## Catatan Pengembangan

Beberapa hal yang perlu diperhatikan selama pengembangan:

- Jangan menyimpan API key secara langsung di dalam kode.
- Gunakan file `.env` untuk menyimpan konfigurasi sensitif.
- Pastikan validasi input dilakukan sebelum request dikirim ke layanan AI.
- Simpan riwayat percakapan dengan struktur database yang jelas.
- Pastikan error dari Gemini API dan Cloudflare Worker AI ditangani dengan baik.
- Gunakan GitHub untuk version control dan kolaborasi tim.

## Lisensi

Proyek ini dibuat untuk kebutuhan pembelajaran dan dokumentasi kelompok.

---
