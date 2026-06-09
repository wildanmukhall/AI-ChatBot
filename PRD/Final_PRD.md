# PRD Lengkap

# AI Chatbot Web App dengan Gemini, Cloudflare AI, dan Midtrans

---

## 1. Ringkasan Produk

Aplikasi ini adalah **AI Chatbot berbasis web** yang memungkinkan pengguna melakukan percakapan dengan AI, membuat teks, serta pada tahap lanjutan dapat menghasilkan gambar dari prompt teks.

Aplikasi akan dikembangkan dengan arsitektur terpisah antara frontend dan backend:

```text
Frontend : React
Backend  : Laravel REST API
Database : MySQL
AI Text  : Gemini API
AI Image : Cloudflare Worker AI
Payment  : Midtrans
```

Laravel akan bertindak sebagai **backend utama** yang mengatur autentikasi, data pengguna, riwayat chat, kuota gambar, transaksi, pembayaran, integrasi AI, dan penyimpanan hasil generate gambar.

React akan bertindak sebagai **frontend client** yang menampilkan antarmuka aplikasi secara dinamis, responsif, dan interaktif.

---

# 2. Visi Produk

Visi aplikasi ini adalah membangun platform AI sederhana namun kuat yang dapat digunakan pengguna untuk:

```text
1. Berinteraksi dengan AI melalui fitur chatbot.
2. Membuat teks berbasis prompt.
3. Menghasilkan gambar dari prompt teks.
4. Menyimpan hasil generate gambar dalam galeri pribadi.
5. Membeli paket kuota generate gambar secara mandiri.
```

Aplikasi ini diarahkan menjadi produk **AI SaaS sederhana** yang memiliki pondasi teknis rapi, dapat dikembangkan bertahap, dan memiliki potensi monetisasi melalui sistem pricing plan.

---

# 3. Tujuan Produk

Tujuan utama aplikasi:

1. Menyediakan chatbot AI berbasis Gemini.
2. Menyediakan fitur generate gambar berbasis Cloudflare Worker AI.
3. Menyediakan sistem akun pengguna.
4. Menyimpan riwayat chat dan hasil generate gambar.
5. Menyediakan sistem kuota untuk generate gambar.
6. Menyediakan pricing plan untuk pembelian kuota.
7. Menyediakan integrasi pembayaran dengan Midtrans.
8. Menyediakan backend API yang stabil untuk frontend React.
9. Menyediakan struktur aplikasi yang scalable dan maintainable.

---

# 4. Target Pengguna

## 4.1 Pengguna Umum

Pengguna yang ingin memakai AI untuk:

```text
- Bertanya kepada chatbot
- Membuat ide tulisan
- Membuat caption
- Membuat konten promosi
- Membuat deskripsi produk
- Membuat prompt gambar
- Generate gambar berbasis teks
```

---

## 4.2 Content Creator

Pengguna yang membutuhkan AI untuk membantu membuat:

```text
- Caption media sosial
- Ide konten
- Script video pendek
- Gambar ilustrasi
- Konsep desain visual
```

---

## 4.3 Developer / Digital Worker

Pengguna yang memakai AI untuk:

```text
- Membantu brainstorming
- Membuat draft teks
- Membuat dokumentasi sederhana
- Membuat prompt gambar
- Menghasilkan aset visual awal
```

---

## 4.4 Admin

Admin bertugas mengelola sistem, memantau transaksi, pricing plan, pengguna, dan aktivitas penggunaan aplikasi.

---

# 5. Aktor Sistem

## 5.1 Guest

Guest adalah pengguna yang belum login.

Hak akses:

```text
- Melihat landing page
- Melihat pricing plan
- Register
- Login
```

Guest belum dapat menggunakan fitur generate teks maupun generate gambar.

---

## 5.2 Registered User

Registered User adalah pengguna yang sudah memiliki akun dan login.

Hak akses:

```text
- Menggunakan chatbot AI
- Melihat riwayat chat
- Menghapus chat session
- Melihat sisa kuota gambar
- Melihat pricing plan
- Membeli paket kuota gambar
- Generate gambar jika kuota tersedia
- Melihat galeri gambar
- Menghapus gambar miliknya sendiri
- Mengelola profile akun
```

---

## 5.3 Admin

Admin adalah pengguna dengan hak akses administratif.

Hak akses:

```text
- Melihat daftar pengguna
- Melihat daftar order
- Melihat daftar payment
- Mengelola pricing plan
- Memantau penggunaan AI
- Memantau generated image
- Melihat statistik sistem
```

---

# 6. Ruang Lingkup Produk

## 6.1 In Scope

Fitur yang termasuk dalam sistem:

```text
- Authentication
- User profile
- Chatbot AI berbasis Gemini
- Chat session
- Chat history
- Pricing plan
- Image quota
- Order
- Payment Midtrans
- Webhook Midtrans
- Generate image berbasis Cloudflare Worker AI
- Gallery hasil generate gambar
- Admin API
- Logging dasar
- Rate limiting
- Queue untuk generate gambar
```

---

## 6.2 Out of Scope untuk Versi Awal

Fitur berikut tidak wajib ada pada versi awal:

```text
- Real-time streaming response AI
- Voice chat
- Upload file untuk dianalisis AI
- Multi-model selection oleh user
- Team workspace
- Subscription bulanan otomatis
- Refund otomatis
- Mobile app native
- Public image marketplace
- Advanced image editing
```

Fitur tersebut dapat dipertimbangkan sebagai pengembangan tahap lanjutan.

---

# 7. Arsitektur Sistem

## 7.1 Gambaran Umum Arsitektur

```text
User Browser
    ↓
React Frontend
    ↓ HTTP Request / JSON
Laravel REST API
    ↓
Controller
    ↓
Form Request Validation
    ↓
Service Layer
    ↓
Database / Queue / Storage / External API
    ↓
Gemini API / Cloudflare Worker AI / Midtrans
```

---

## 7.2 Frontend

Frontend menggunakan React dan bertanggung jawab untuk:

```text
- Menampilkan UI aplikasi
- Mengelola state halaman
- Mengirim request ke backend
- Menampilkan response dari backend
- Menampilkan loading state
- Menampilkan error message
- Menyimpan token autentikasi jika menggunakan token-based auth
- Menjalankan Midtrans Snap di sisi client
```

Frontend tidak boleh langsung memanggil Gemini API, Cloudflare AI, atau Midtrans Server API.

Semua komunikasi ke layanan eksternal harus melalui backend Laravel.

---

## 7.3 Backend

Backend menggunakan Laravel dan bertanggung jawab untuk:

```text
- Menyediakan REST API
- Autentikasi dan otorisasi
- Validasi request
- Menyimpan data ke database
- Memanggil Gemini API
- Memanggil Cloudflare Worker AI
- Mengelola order dan payment
- Menerima webhook Midtrans
- Mengelola kuota generate gambar
- Menjalankan queue job
- Menyimpan file gambar
- Menjaga keamanan API key
```

---

## 7.4 Database

Database menggunakan MySQL untuk menyimpan:

```text
- Data user
- Chat session
- Chat message
- Pricing plan
- User quota
- Order
- Payment
- Generated image
- Quota history
- Log aktivitas penting
```

---

## 7.5 External Services

Sistem menggunakan beberapa layanan eksternal:

```text
Gemini API
```

Digunakan untuk generate teks/chat.

```text
Cloudflare Worker AI
```

Digunakan untuk generate gambar dari prompt teks.

```text
Midtrans
```

Digunakan untuk proses pembayaran pricing plan.

---

# 8. Komunikasi Frontend dan Backend

## 8.1 Pola Komunikasi

Frontend dan backend berkomunikasi menggunakan REST API berbasis HTTP.

Format request dan response menggunakan JSON.

Contoh:

```text
React → Laravel API → JSON Response
```

---

## 8.2 Base URL

Pada local development:

```text
Frontend : http://localhost:5173
Backend  : http://localhost:8000
API Base : http://localhost:8000/api/v1
```

Pada production:

```text
Frontend : https://app.domain.com
Backend  : https://api.domain.com
API Base : https://api.domain.com/api/v1
```

---

## 8.3 Request dari Frontend

Frontend akan menggunakan Axios atau TanStack Query untuk memanggil API.

Contoh request login:

```http
POST /api/v1/auth/login
Content-Type: application/json
Accept: application/json
```

Body:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

---

## 8.4 Response dari Backend

Backend wajib mengembalikan response JSON standar.

Response sukses:

```json
{
  "success": true,
  "message": "Login berhasil.",
  "data": {
    "user": {
      "id": 1,
      "name": "Dandy",
      "email": "user@example.com"
    },
    "token": "plain-text-token"
  }
}
```

Response gagal:

```json
{
  "success": false,
  "message": "Email atau password salah.",
  "errors": null
}
```

---

## 8.5 Autentikasi Request

Untuk tahap awal, sistem dapat menggunakan Laravel Sanctum token-based authentication.

Setelah login berhasil, backend mengirim token ke frontend.

Frontend menyimpan token, lalu mengirim token pada setiap request yang membutuhkan login.

Header:

```http
Authorization: Bearer {token}
Accept: application/json
```

Contoh:

```http
GET /api/v1/me
Authorization: Bearer 1|abcdef...
```

---

## 8.6 Komunikasi Saat Chat

Alur komunikasi chat:

```text
User mengetik prompt di React
↓
React mengirim request ke Laravel
↓
Laravel validasi prompt
↓
Laravel menyimpan pesan user
↓
Laravel memanggil Gemini API
↓
Laravel menerima jawaban Gemini
↓
Laravel menyimpan jawaban AI
↓
Laravel mengirim response ke React
↓
React menampilkan bubble jawaban AI
```

Contoh request:

```http
POST /api/v1/chat-sessions/{id}/messages
Authorization: Bearer {token}
```

Body:

```json
{
  "message": "Buatkan caption promosi untuk produk kopi."
}
```

Contoh response:

```json
{
  "success": true,
  "message": "Pesan berhasil diproses.",
  "data": {
    "user_message": {
      "id": 10,
      "role": "user",
      "content": "Buatkan caption promosi untuk produk kopi."
    },
    "assistant_message": {
      "id": 11,
      "role": "assistant",
      "content": "Nikmati aroma kopi pilihan..."
    }
  }
}
```

---

## 8.7 Komunikasi Saat Generate Gambar

Generate gambar sebaiknya menggunakan queue.

Alur komunikasi:

```text
User mengirim prompt gambar dari React
↓
React mengirim request ke Laravel
↓
Laravel validasi prompt
↓
Laravel cek kuota user
↓
Laravel mengurangi kuota sementara
↓
Laravel membuat data generated_image status processing
↓
Laravel menjalankan queue job
↓
Laravel langsung mengirim response ke React
↓
React menampilkan status processing
↓
Queue memproses gambar melalui Cloudflare Worker AI
↓
Gambar disimpan ke storage
↓
Status menjadi completed
↓
React melakukan polling status
↓
Gambar tampil di galeri
```

Request:

```http
POST /api/v1/images/generate
Authorization: Bearer {token}
```

Body:

```json
{
  "prompt": "A futuristic robot drinking coffee in cyberpunk city"
}
```

Response awal:

```json
{
  "success": true,
  "message": "Generate gambar sedang diproses.",
  "data": {
    "id": 25,
    "prompt": "A futuristic robot drinking coffee in cyberpunk city",
    "status": "processing"
  }
}
```

React kemudian melakukan polling:

```http
GET /api/v1/images/25/status
Authorization: Bearer {token}
```

Response saat selesai:

```json
{
  "success": true,
  "message": "Status gambar berhasil diambil.",
  "data": {
    "id": 25,
    "status": "completed",
    "image_url": "https://api.domain.com/storage/generated-images/image-25.png"
  }
}
```

---

## 8.8 Komunikasi Saat Payment

Alur payment:

```text
User memilih pricing plan di React
↓
React request checkout ke Laravel
↓
Laravel membuat order
↓
Laravel meminta Snap Token ke Midtrans
↓
Laravel mengirim Snap Token ke React
↓
React menjalankan Midtrans Snap popup
↓
User melakukan pembayaran
↓
Midtrans mengirim webhook ke Laravel
↓
Laravel validasi webhook
↓
Laravel update status order
↓
Laravel tambah kuota gambar user
↓
React refresh data quota/order
```

Request checkout:

```http
POST /api/v1/payments/checkout
Authorization: Bearer {token}
```

Body:

```json
{
  "pricing_plan_id": 2
}
```

Response:

```json
{
  "success": true,
  "message": "Snap token berhasil dibuat.",
  "data": {
    "order_code": "ORDER-20260610-0001",
    "snap_token": "midtrans-snap-token"
  }
}
```

Frontend menjalankan:

```javascript
window.snap.pay(snapToken)
```

Webhook dari Midtrans ke Laravel:

```http
POST /api/v1/payments/midtrans/notification
```

Endpoint webhook tidak menggunakan token user, tetapi wajib divalidasi dengan signature Midtrans.

---

# 9. Modul Fitur Sistem

---

# 9.1 Modul Authentication

## Deskripsi

Modul Authentication digunakan agar pengguna dapat membuat akun, login, logout, dan mengakses fitur yang membutuhkan autentikasi.

## Functional Requirement

```text
- Pengguna dapat melakukan register.
- Pengguna dapat melakukan login.
- Pengguna dapat melakukan logout.
- Pengguna dapat melihat data akun aktif.
- Sistem memberikan token setelah login berhasil.
- Sistem melindungi endpoint tertentu dengan auth middleware.
```

## Endpoint

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Acceptance Criteria

```text
- User dapat register dengan name, email, password.
- Email harus unik.
- Password harus terenkripsi.
- Login berhasil mengembalikan token.
- Endpoint protected tidak bisa diakses tanpa token.
- Logout menghapus token aktif.
```

---

# 9.2 Modul User Profile

## Deskripsi

Modul ini digunakan untuk mengelola data dasar pengguna.

## Functional Requirement

```text
- User dapat melihat profile.
- User dapat mengubah nama.
- User dapat mengubah password.
- User dapat melihat statistik akun sederhana.
```

## Endpoint

```text
GET /api/v1/profile
PUT /api/v1/profile
PUT /api/v1/profile/password
GET /api/v1/profile/stats
```

## Acceptance Criteria

```text
- User hanya dapat mengubah profile miliknya sendiri.
- Password lama harus benar sebelum mengganti password.
- Statistik menampilkan jumlah chat, jumlah gambar, dan sisa kuota.
```

---

# 9.3 Modul Gemini Text Chat

## Deskripsi

Modul ini adalah fitur utama awal aplikasi. User dapat mengirim prompt teks dan mendapatkan balasan dari Gemini.

## Functional Requirement

```text
- User dapat membuat chat session baru.
- User dapat mengirim pesan dalam chat session.
- Sistem mengirim prompt ke Gemini API.
- Sistem menyimpan pesan user.
- Sistem menyimpan jawaban AI.
- User dapat melihat riwayat chat.
- User dapat menghapus chat session.
```

## Endpoint

```text
GET    /api/v1/chat-sessions
POST   /api/v1/chat-sessions
GET    /api/v1/chat-sessions/{id}
DELETE /api/v1/chat-sessions/{id}

GET    /api/v1/chat-sessions/{id}/messages
POST   /api/v1/chat-sessions/{id}/messages
```

## Data yang Disimpan

```text
chat_sessions
chat_messages
```

## Acceptance Criteria

```text
- User dapat membuat percakapan baru.
- User dapat mengirim prompt.
- Sistem mengembalikan jawaban AI.
- Semua pesan tersimpan di database.
- User hanya dapat melihat chat miliknya sendiri.
- Jika Gemini gagal, sistem mengembalikan error yang rapi.
```

---

# 9.4 Modul Pricing Plan

## Deskripsi

Modul Pricing Plan digunakan untuk menampilkan daftar paket pembelian kuota generate gambar.

## Functional Requirement

```text
- Sistem menyediakan daftar paket aktif.
- User dapat melihat detail paket.
- Admin dapat membuat, mengubah, dan menonaktifkan paket.
```

## Contoh Paket

| Paket   |    Harga | Kuota Gambar |
| ------- | -------: | -----------: |
| Free    |      Rp0 |            5 |
| Starter | Rp15.000 |           50 |
| Creator | Rp49.000 |          200 |
| Pro     | Rp99.000 |          500 |

## Endpoint User

```text
GET /api/v1/pricing-plans
GET /api/v1/pricing-plans/{id}
```

## Endpoint Admin

```text
POST   /api/v1/admin/pricing-plans
PUT    /api/v1/admin/pricing-plans/{id}
DELETE /api/v1/admin/pricing-plans/{id}
```

## Acceptance Criteria

```text
- User hanya melihat pricing plan yang aktif.
- Admin dapat mengatur paket.
- Harga dan kuota tidak boleh bernilai negatif.
```

---

# 9.5 Modul Image Quota

## Deskripsi

Modul Image Quota mengatur jatah generate gambar setiap user.

## Functional Requirement

```text
- Sistem membuat kuota awal untuk user baru.
- Sistem dapat menampilkan sisa kuota.
- Sistem mengurangi kuota saat user generate gambar.
- Sistem menambah kuota setelah pembayaran berhasil.
- Sistem mencatat histori perubahan kuota.
```

## Endpoint

```text
GET /api/v1/quota/image
GET /api/v1/quota/histories
```

## Acceptance Criteria

```text
- User baru mendapat kuota awal sesuai konfigurasi.
- Generate gambar gagal jika kuota habis.
- Kuota bertambah setelah order paid.
- Setiap perubahan kuota tercatat di quota history.
```

---

# 9.6 Modul Order

## Deskripsi

Order adalah data pembelian paket yang dibuat sebelum user melakukan pembayaran.

## Functional Requirement

```text
- User dapat membuat order dari pricing plan.
- Sistem menyimpan order_code unik.
- Sistem menyimpan nominal order.
- Sistem menyimpan status order.
- User dapat melihat riwayat order miliknya.
```

## Status Order

```text
pending
paid
expired
failed
cancelled
```

## Endpoint

```text
GET  /api/v1/orders
GET  /api/v1/orders/{id}
POST /api/v1/orders
```

## Acceptance Criteria

```text
- Order hanya dapat dibuat dari pricing plan aktif.
- User hanya dapat melihat order miliknya sendiri.
- Order baru memiliki status pending.
```

---

# 9.7 Modul Payment Midtrans

## Deskripsi

Modul Payment digunakan untuk memproses pembayaran paket generate gambar menggunakan Midtrans.

## Functional Requirement

```text
- Sistem dapat membuat Snap Token.
- User dapat membayar melalui Midtrans Snap.
- Sistem menerima webhook dari Midtrans.
- Sistem memvalidasi signature webhook.
- Sistem mengubah status order sesuai status pembayaran.
- Sistem menambah kuota gambar jika pembayaran berhasil.
```

## Endpoint

```text
POST /api/v1/payments/checkout
GET  /api/v1/payments/{order}
POST /api/v1/payments/midtrans/notification
```

## Acceptance Criteria

```text
- Checkout menghasilkan snap_token.
- Webhook Midtrans dapat diterima.
- Webhook palsu ditolak.
- Order berubah menjadi paid jika pembayaran berhasil.
- Kuota user bertambah sesuai paket.
- Webhook yang sama tidak menambah kuota dua kali.
```

Catatan penting: sistem harus menerapkan **idempotency** pada webhook agar pembayaran yang sama tidak diproses berulang.

---

# 9.8 Modul Cloudflare Image Generation

## Deskripsi

Modul ini memungkinkan user membuat gambar berdasarkan prompt teks.

## Functional Requirement

```text
- User dapat mengirim prompt gambar.
- Sistem memvalidasi prompt.
- Sistem mengecek kuota.
- Sistem membuat data generated image dengan status processing.
- Sistem menjalankan queue job.
- Sistem memanggil Cloudflare Worker AI.
- Sistem menyimpan gambar ke storage.
- Sistem mengubah status menjadi completed.
- Sistem mengembalikan kuota jika proses gagal.
```

## Endpoint

```text
POST /api/v1/images/generate
GET  /api/v1/images/{id}/status
```

## Status

```text
processing
completed
failed
```

## Acceptance Criteria

```text
- User tidak bisa generate gambar jika kuota habis.
- Prompt wajib diisi.
- Proses generate gambar berjalan melalui queue.
- Gambar berhasil disimpan ke storage.
- Status gambar dapat dilacak oleh frontend.
- Jika generate gagal, status menjadi failed.
- Jika gagal karena sistem/provider, kuota dikembalikan.
```

---

# 9.9 Modul Gallery

## Deskripsi

Gallery menampilkan semua hasil generate gambar milik user.

## Functional Requirement

```text
- User dapat melihat daftar gambar miliknya.
- User dapat melihat detail gambar.
- User dapat menghapus gambar.
- User dapat mencari gambar berdasarkan prompt.
- User dapat melakukan filter berdasarkan status/tanggal.
```

## Endpoint

```text
GET    /api/v1/images
GET    /api/v1/images/{id}
DELETE /api/v1/images/{id}
```

## Acceptance Criteria

```text
- User hanya dapat melihat gambar miliknya sendiri.
- Gambar ditampilkan dengan pagination.
- Delete hanya menghapus data/gambar milik user terkait.
- Detail gambar menampilkan prompt, status, dan image_url.
```

---

# 9.10 Modul Admin

## Deskripsi

Modul Admin digunakan untuk mengelola sistem dan memantau aktivitas aplikasi.

## Functional Requirement

```text
- Admin dapat melihat daftar user.
- Admin dapat melihat order.
- Admin dapat melihat payment.
- Admin dapat mengelola pricing plan.
- Admin dapat melihat daftar generated image.
- Admin dapat melihat statistik penggunaan.
```

## Endpoint

```text
GET /api/v1/admin/users
GET /api/v1/admin/orders
GET /api/v1/admin/payments
GET /api/v1/admin/generated-images
GET /api/v1/admin/stats
```

## Acceptance Criteria

```text
- Endpoint admin hanya dapat diakses oleh admin.
- User biasa tidak boleh mengakses endpoint admin.
- Data list menggunakan pagination.
```

---

# 10. Struktur Database

## 10.1 users

```text
id
name
email
password
role
created_at
updated_at
```

Role:

```text
user
admin
```

---

## 10.2 chat_sessions

```text
id
user_id
title
created_at
updated_at
```

---

## 10.3 chat_messages

```text
id
chat_session_id
role
content
provider
model
created_at
updated_at
```

Role:

```text
user
assistant
system
```

---

## 10.4 pricing_plans

```text
id
name
description
price
image_quota
is_active
created_at
updated_at
```

---

## 10.5 user_image_quotas

```text
id
user_id
remaining_quota
total_purchased_quota
total_used_quota
created_at
updated_at
```

---

## 10.6 quota_histories

```text
id
user_id
type
amount
description
reference_type
reference_id
created_at
updated_at
```

Type:

```text
bonus
purchase
usage
refund
adjustment
```

---

## 10.7 orders

```text
id
user_id
pricing_plan_id
order_code
amount
status
created_at
updated_at
```

---

## 10.8 payments

```text
id
order_id
provider
transaction_id
payment_type
transaction_status
fraud_status
raw_response
paid_at
created_at
updated_at
```

---

## 10.9 generated_images

```text
id
user_id
prompt
image_path
image_url
provider
model
status
error_message
created_at
updated_at
```

---

# 11. Struktur Backend Laravel

```text
app/
├── Facades/
│   ├── Gemini.php
│   ├── CloudflareAI.php
│   └── MidtransPayment.php
│
├── Services/
│   ├── AI/
│   │   ├── GeminiService.php
│   │   ├── CloudflareImageService.php
│   │   └── Contracts/
│   │       ├── TextGeneratorInterface.php
│   │       └── ImageGeneratorInterface.php
│   │
│   ├── Chat/
│   │   └── ChatService.php
│   │
│   ├── Payment/
│   │   ├── MidtransService.php
│   │   └── PaymentService.php
│   │
│   ├── Quota/
│   │   └── ImageQuotaService.php
│   │
│   ├── Order/
│   │   └── OrderService.php
│   │
│   └── Gallery/
│       └── ImageGalleryService.php
│
├── Providers/
│   ├── AIServiceProvider.php
│   └── PaymentServiceProvider.php
│
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php
│   │       ├── ProfileController.php
│   │       ├── ChatSessionController.php
│   │       ├── ChatMessageController.php
│   │       ├── PricingPlanController.php
│   │       ├── OrderController.php
│   │       ├── PaymentController.php
│   │       ├── ImageGenerationController.php
│   │       ├── GalleryController.php
│   │       └── Admin/
│   │           ├── UserController.php
│   │           ├── AdminOrderController.php
│   │           ├── AdminPaymentController.php
│   │           └── AdminPricingPlanController.php
│   │
│   ├── Requests/
│   │   ├── Auth/
│   │   ├── Chat/
│   │   ├── Payment/
│   │   └── Image/
│   │
│   └── Middleware/
│       ├── ForceJsonResponse.php
│       └── EnsureUserIsAdmin.php
│
├── Jobs/
│   └── GenerateImageJob.php
│
├── Models/
│   ├── User.php
│   ├── ChatSession.php
│   ├── ChatMessage.php
│   ├── PricingPlan.php
│   ├── UserImageQuota.php
│   ├── QuotaHistory.php
│   ├── Order.php
│   ├── Payment.php
│   └── GeneratedImage.php
│
├── Exceptions/
│   ├── BusinessRuleException.php
│   ├── ExternalApiException.php
│   └── InsufficientQuotaException.php
│
└── Support/
    └── ApiResponse.php
```

---

# 12. Struktur Frontend React

```text
src/
├── api/
│   ├── axiosInstance.js
│   ├── authApi.js
│   ├── chatApi.js
│   ├── pricingApi.js
│   ├── quotaApi.js
│   ├── paymentApi.js
│   └── imageApi.js
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── chat/
│   ├── pricing/
│   └── gallery/
│
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── chat/
│   ├── pricing/
│   ├── payment/
│   ├── image-generation/
│   └── gallery/
│
├── hooks/
│   ├── useAuth.js
│   ├── useQuota.js
│   └── usePollingImageStatus.js
│
├── routes/
│   └── AppRouter.jsx
│
├── stores/
│   └── authStore.js
│
└── main.jsx
```

---

# 13. Standar API Response

## 13.1 Success

```json
{
  "success": true,
  "message": "Request berhasil diproses.",
  "data": {}
}
```

---

## 13.2 Error

```json
{
  "success": false,
  "message": "Terjadi kesalahan.",
  "errors": {}
}
```

---

## 13.3 Pagination

```json
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 10,
    "total": 30
  }
}
```

---

# 14. Non-Functional Requirement

## 14.1 Security

```text
- API key disimpan di .env.
- Password di-hash.
- Endpoint protected menggunakan auth middleware.
- Endpoint admin menggunakan role middleware.
- Webhook Midtrans wajib validasi signature.
- User hanya dapat mengakses data miliknya sendiri.
- CORS hanya mengizinkan domain frontend resmi.
- Rate limiting diterapkan pada endpoint sensitif.
```

---

## 14.2 Performance

```text
- Endpoint umum memiliki response cepat.
- Data list menggunakan pagination.
- Generate gambar menggunakan queue.
- Request ke external API menggunakan timeout.
- Pricing plan dapat menggunakan cache.
- File gambar disimpan di storage yang sesuai.
```

---

## 14.3 Reliability

```text
- Jika Gemini gagal, sistem menampilkan error rapi.
- Jika Cloudflare AI gagal, status gambar menjadi failed.
- Jika generate gambar gagal karena sistem/provider, kuota dikembalikan.
- Jika webhook payment dikirim ulang, sistem tidak boleh menambah kuota dua kali.
- Failed job tercatat di failed_jobs.
```

---

## 14.4 Scalability

```text
- Backend menggunakan service layer.
- External API dipisahkan ke service khusus.
- Queue digunakan untuk pekerjaan berat.
- API menggunakan versioning /api/v1.
- Struktur folder mendukung pengembangan modul baru.
```

---

## 14.5 Maintainability

```text
- Controller harus tipis.
- Validasi menggunakan Form Request.
- Logika bisnis berada di Service.
- Response API menggunakan helper standar.
- Exception penting menggunakan custom exception.
- Konfigurasi external service berada di config/services.php.
```

---

# 15. Rate Limiting

Rekomendasi rate limit:

```text
Auth login/register       : 5 request / menit
Chat generate text        : 20 request / menit
Generate image            : 5 request / menit
Payment checkout          : 10 request / menit
Public pricing endpoint   : 60 request / menit
Admin endpoint            : 120 request / menit
```

Rate limiting penting agar sistem tidak mudah disalahgunakan, terutama pada fitur AI yang memiliki biaya komputasi.

---

# 16. Queue Requirement

Queue wajib digunakan untuk fitur generate gambar.

Alasan:

```text
- Generate gambar lebih berat daripada generate teks.
- Response external AI bisa lambat.
- Menghindari request timeout.
- User tetap mendapat response awal.
- Proses dapat dipantau melalui status.
```

Queue awal dapat menggunakan:

```text
QUEUE_CONNECTION=database
```

Untuk production dapat ditingkatkan ke Redis.

---

# 17. Storage Requirement

Pada tahap awal, gambar dapat disimpan di Laravel local storage.

```text
storage/app/public/generated-images
```

Untuk production, disarankan menggunakan:

```text
- Cloudflare R2
- Amazon S3
- DigitalOcean Spaces
```

Response ke frontend harus berupa URL yang dapat diakses oleh browser.

---

# 18. External API Requirement

## 18.1 Gemini API

Digunakan hanya dari backend.

Backend mengirim:

```text
- Prompt user
- Model name
- API key
```

Backend menerima:

```text
- Generated text
- Error response jika gagal
```

Frontend tidak boleh mengetahui API key Gemini.

---

## 18.2 Cloudflare Worker AI

Digunakan hanya dari backend atau worker endpoint yang dikontrol developer.

Backend mengirim:

```text
- Prompt gambar
- API token
```

Backend menerima:

```text
- Binary image / image response
- Error response
```

---

## 18.3 Midtrans

Midtrans digunakan dengan dua sisi:

```text
Backend:
- Membuat Snap Token
- Menerima webhook
- Validasi signature
- Update order/payment
```

```text
Frontend:
- Menjalankan Snap popup menggunakan snap_token
```

---

# 19. Tahapan Pengembangan

## Phase 1 — Backend Foundation

Target:

```text
Laravel siap menjadi REST API untuk React.
```

Pekerjaan:

```text
- Setup Laravel
- Setup database
- Setup API versioning
- Setup CORS
- Setup ApiResponse
- Setup ForceJsonResponse
- Setup Service Provider
- Setup Facade
- Setup config services
- Setup queue table
```

---

## Phase 2 — Authentication & Profile

Target:

```text
User dapat register, login, logout, dan mengakses profile.
```

Pekerjaan:

```text
- Laravel Sanctum
- Register
- Login
- Logout
- Me endpoint
- Profile endpoint
- Protected route
```

---

## Phase 3 — Gemini Text Chat

Target:

```text
User dapat chatting dengan Gemini dan riwayat tersimpan.
```

Pekerjaan:

```text
- GeminiService
- ChatSession
- ChatMessage
- Chat API
- Error handling Gemini
- Chat history
```

---

## Phase 4 — Pricing, Quota, dan Order

Target:

```text
Sistem memiliki paket harga, kuota gambar, dan order.
```

Pekerjaan:

```text
- PricingPlan
- Seeder pricing
- UserImageQuota
- QuotaHistory
- Order
- Order history
```

---

## Phase 5 — Midtrans Payment

Target:

```text
User dapat membeli paket dan kuota bertambah otomatis.
```

Pekerjaan:

```text
- MidtransService
- Checkout
- Snap Token
- Payment record
- Webhook
- Signature validation
- Add quota after payment
```

---

## Phase 6 — Generate Image

Target:

```text
User dapat generate gambar jika kuota tersedia.
```

Pekerjaan:

```text
- CloudflareImageService
- GeneratedImage
- GenerateImageJob
- Queue worker
- Storage image
- Refund quota on failure
- Status polling
```

---

## Phase 7 — Gallery

Target:

```text
User dapat melihat dan mengelola hasil generate gambar.
```

Pekerjaan:

```text
- Gallery API
- Image list
- Image detail
- Delete image
- Search/filter
- Pagination
```

---

## Phase 8 — Admin & Monitoring

Target:

```text
Admin dapat memantau dan mengelola sistem.
```

Pekerjaan:

```text
- Admin middleware
- User list
- Order list
- Payment list
- Pricing management
- Generated image monitoring
- Basic stats
```

---

# 20. MVP Definition

Versi MVP aplikasi dianggap selesai jika fitur berikut sudah tersedia:

```text
1. User dapat register dan login.
2. User dapat menggunakan chatbot Gemini.
3. User dapat melihat riwayat chat.
4. User dapat melihat pricing plan.
5. User memiliki kuota gambar.
6. User dapat membeli paket melalui Midtrans.
7. Kuota bertambah setelah pembayaran sukses.
8. User dapat generate gambar.
9. User dapat melihat hasil gambar di galeri.
```

Admin panel dapat dibuat sederhana pada MVP, minimal untuk mengelola pricing plan dan melihat transaksi.

---

# 21. Success Metrics

Ukuran keberhasilan aplikasi:

```text
- User berhasil register dan login tanpa error.
- Chatbot dapat memberikan response stabil.
- Riwayat chat tersimpan dengan benar.
- Checkout Midtrans berhasil dibuat.
- Webhook Midtrans berhasil memproses payment.
- Kuota bertambah sesuai paket.
- Generate gambar berhasil diproses melalui queue.
- Gambar tampil di galeri.
- Tidak ada user yang bisa mengakses data user lain.
- Error dari external API ditangani dengan rapi.
```

---

# 22. Risiko Produk dan Mitigasi

| Risiko                                      | Dampak                     | Mitigasi                                          |
| ------------------------------------------- | -------------------------- | ------------------------------------------------- |
| Gemini API gagal merespons                  | Chat tidak berjalan        | Gunakan timeout, retry, dan error message rapi    |
| Generate gambar lambat                      | User menunggu terlalu lama | Gunakan queue dan status polling                  |
| Kuota terpotong saat generate gagal         | User dirugikan             | Refund kuota jika proses gagal                    |
| Webhook Midtrans terkirim ulang             | Kuota bisa bertambah dobel | Terapkan idempotency                              |
| API key bocor                               | Risiko keamanan tinggi     | Simpan secret di `.env`                           |
| User mengakses data user lain               | Risiko privasi             | Gunakan policy/ownership check                    |
| Controller terlalu besar                    | Sulit maintenance          | Gunakan service layer                             |
| CORS bermasalah                             | React gagal request API    | Konfigurasi domain frontend dengan benar          |
| Payment berhasil tapi kuota tidak bertambah | User komplain              | Simpan payment log dan proses webhook dengan aman |

---

# 23. Acceptance Criteria Keseluruhan Sistem

Sistem dianggap sesuai PRD apabila:

```text
- Frontend React dapat berkomunikasi dengan Laravel API.
- Semua response API menggunakan format standar.
- User dapat register, login, logout.
- Endpoint protected tidak bisa diakses tanpa token.
- User dapat membuat dan melihat chat session.
- User dapat mengirim prompt dan menerima response Gemini.
- Riwayat chat tersimpan di database.
- User dapat melihat pricing plan.
- User dapat membuat checkout payment.
- Midtrans Snap Token berhasil dibuat.
- Webhook Midtrans berhasil memproses pembayaran.
- Kuota gambar bertambah setelah pembayaran sukses.
- User tidak bisa generate gambar jika kuota habis.
- Generate gambar diproses melalui queue.
- Hasil gambar disimpan dan tampil di galeri.
- User hanya bisa melihat data miliknya sendiri.
- Admin dapat mengakses endpoint admin.
- Sistem menangani error external API dengan response yang rapi.
```

---

# 24. Kesimpulan

PRD ini menetapkan bahwa aplikasi akan dibangun sebagai **AI SaaS web app** dengan pemisahan jelas antara frontend dan backend.

Struktur final sistem:

```text
React
sebagai frontend dinamis dan responsif

Laravel
sebagai backend REST API

MySQL
sebagai database utama

Gemini API
sebagai layanan generate teks

Cloudflare Worker AI
sebagai layanan generate gambar

Midtrans
sebagai payment gateway

Queue
sebagai pemroses generate gambar

Storage
sebagai penyimpanan hasil gambar
```

Target akhir aplikasi adalah:

```text
Pengguna dapat login, chatting dengan AI, membeli kuota gambar, generate gambar, dan menyimpan hasilnya di galeri pribadi.
```
