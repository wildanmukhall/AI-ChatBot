# API Specification

> Dokumentasi ini menjelaskan endpoint utama yang digunakan pada proyek **AI Web Chatbot**. Seluruh endpoint menggunakan format request dan response berbasis JSON, kecuali halaman web yang dirender langsung melalui Blade.

---

## Base URL

```text
http://127.0.0.1:8000/api
```

Untuk production, base URL menyesuaikan domain hasil deployment di Railway.

---

## Format Response Umum

**Response Sukses:**

```json
{
  "success": true,
  "message": "Request berhasil diproses",
  "data": {}
}
```

**Response Gagal:**

```json
{
  "success": false,
  "message": "Request gagal diproses",
  "errors": {}
}
```

---

## Register Pengguna

**Method:** `POST`

**URL:** `/api/auth/register`

**Deskripsi:** Endpoint untuk membuat akun pengguna baru.

**Autentikasi Diperlukan:** `Tidak`

**Sumber:** `Internal System`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Dandy Sultana",
  "email": "dandy@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response Sukses (`201 Created`):**
```json
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "Dandy Sultana",
      "email": "dandy@example.com"
    },
    "token": "user_access_token"
  }
}
```

**Response Gagal:**
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "email": ["Email sudah digunakan"]
  }
}
```

---

## Login Pengguna

**Method:** `POST`

**URL:** `/api/auth/login`

**Deskripsi:** Endpoint untuk autentikasi pengguna agar dapat mengakses fitur utama sistem.

**Autentikasi Diperlukan:** `Tidak`

**Sumber:** `Internal System`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "dandy@example.com",
  "password": "password123"
}
```

**Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "Dandy Sultana",
      "email": "dandy@example.com"
    },
    "token": "user_access_token"
  }
}
```

**Response Gagal:**
```json
{
  "success": false,
  "message": "Email atau password salah"
}
```

---

## Logout Pengguna

**Method:** `POST`

**URL:** `/api/auth/logout`

**Deskripsi:** Endpoint untuk logout pengguna dan menghapus token aktif.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Internal System`

**Request Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

**Response Gagal:**
```json
{
  "success": false,
  "message": "Unauthenticated"
}
```

---

## Generate Teks

**Method:** `POST`

**URL:** `/api/chat/generate-text`

**Deskripsi:** Endpoint untuk mengirim prompt pengguna ke backend Laravel. Backend akan meneruskan prompt ke Gemini API dan mengembalikan hasil generate teks ke frontend.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Third-Party API — Gemini API`

**Request Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "Jelaskan apa itu Laravel secara singkat"
}
```

**Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "message": "Generate teks berhasil",
  "data": {
    "conversation_id": 12,
    "user_message": "Jelaskan apa itu Laravel secara singkat",
    "ai_response": "Laravel adalah framework PHP yang digunakan untuk membangun aplikasi web secara cepat, rapi, dan terstruktur."
  }
}
```

**Response Gagal:**
```json
{
  "success": false,
  "message": "Generate teks gagal diproses"
}
```

---

## Riwayat Generate Teks

**Method:** `GET`

**URL:** `/api/chat/history`

**Deskripsi:** Endpoint untuk mengambil riwayat percakapan atau generate teks milik pengguna yang sedang login.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Internal System`

**Request Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "message": "Riwayat chat berhasil diambil",
  "data": [
    {
      "id": 12,
      "user_message": "Jelaskan apa itu Laravel secara singkat",
      "ai_response": "Laravel adalah framework PHP untuk membangun aplikasi web.",
      "created_at": "2026-06-04 10:15:00"
    }
  ]
}
```

**Response Gagal:**
```json
{
  "success": false,
  "message": "Riwayat chat gagal diambil"
}
```

---

## Generate Gambar Text-to-Image

**Method:** `POST`

**URL:** `/api/images/generate`

**Deskripsi:** Endpoint untuk menghasilkan gambar berdasarkan prompt teks. Backend Laravel akan mengirim prompt ke Cloudflare Worker AI yang menjalankan model text-to-image.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Third-Party API — Cloudflare Worker AI`

**Request Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "Robot kecil sedang membantu pengguna di depan laptop",
  "size": "1024x1024"
}
```

**Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "message": "Generate gambar berhasil",
  "data": {
    "image_id": 8,
    "prompt": "Robot kecil sedang membantu pengguna di depan laptop",
    "image_url": "https://example.com/generated/robot-image.png",
    "remaining_quota": 4
  }
}
```

**Response Gagal:**
```json
{
  "success": false,
  "message": "Kuota generate gambar tidak mencukupi"
}
```

---

## Galeri Hasil Generate Gambar

**Method:** `GET`

**URL:** `/api/images/gallery`

**Deskripsi:** Endpoint untuk mengambil daftar gambar yang pernah dihasilkan oleh pengguna yang sedang login.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Internal System`

**Request Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "message": "Data galeri berhasil diambil",
  "data": [
    {
      "id": 8,
      "prompt": "Robot kecil sedang membantu pengguna di depan laptop",
      "image_url": "https://example.com/generated/robot-image.png",
      "created_at": "2026-06-04 10:30:00"
    }
  ]
}
```

**Response Gagal:**
```json
{
  "success": false,
  "message": "Data galeri gagal diambil"
}
```

---

## Daftar Pricing Plan Generate Gambar

**Method:** `GET`

**URL:** `/api/pricing-plans`

**Deskripsi:** Endpoint untuk mengambil daftar paket generate gambar yang tersedia pada sistem.

**Autentikasi Diperlukan:** `Tidak`

**Sumber:** `Internal System`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:** `-`

**Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "message": "Data pricing plan berhasil diambil",
  "data": [
    {
      "id": 1,
      "name": "Free Plan",
      "price": 0,
      "image_quota": 3,
      "description": "Paket gratis untuk mencoba fitur generate gambar"
    },
    {
      "id": 2,
      "name": "Premium Plan",
      "price": 25000,
      "image_quota": 50,
      "description": "Paket berbayar untuk generate gambar dengan kuota lebih besar"
    }
  ]
}
```

**Response Gagal:**
```json
{
  "success": false,
  "message": "Data pricing plan gagal diambil"
}
```

---

## Membuat Transaksi Pembayaran Midtrans

**Method:** `POST`

**URL:** `/api/payments/create`

**Deskripsi:** Endpoint untuk membuat transaksi pembayaran paket berbayar melalui Midtrans. Backend akan membuat order, mengirim data transaksi ke Midtrans, lalu mengembalikan snap token atau redirect URL ke frontend.

**Autentikasi Diperlukan:** `Ya`

**Sumber:** `Third-Party API — Midtrans`

**Request Headers:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "pricing_plan_id": 2
}
```

**Response Sukses (`201 Created`):**
```json
{
  "success": true,
  "message": "Transaksi pembayaran berhasil dibuat",
  "data": {
    "order_id": "ORDER-20260604-0001",
    "snap_token": "midtrans_snap_token",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/midtrans_snap_token"
  }
}
```

**Response Gagal:**
```json
{
  "success": false,
  "message": "Transaksi pembayaran gagal dibuat"
}
```

---

## Callback Pembayaran Midtrans

**Method:** `POST`

**URL:** `/api/payments/callback`

**Deskripsi:** Endpoint untuk menerima notifikasi status pembayaran dari Midtrans. Setelah pembayaran berhasil, sistem memperbarui status transaksi dan menambahkan kuota generate gambar ke akun pengguna.

**Autentikasi Diperlukan:** `Tidak, tetapi wajib memverifikasi signature Midtrans`

**Sumber:** `Third-Party API — Midtrans`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "order_id": "ORDER-20260604-0001",
  "transaction_status": "settlement",
  "payment_type": "bank_transfer",
  "gross_amount": "25000.00",
  "signature_key": "midtrans_signature_key"
}
```

**Response Sukses (`200 OK`):**
```json
{
  "success": true,
  "message": "Callback pembayaran berhasil diproses"
}
```

**Response Gagal:**
```json
{
  "success": false,
  "message": "Signature pembayaran tidak valid"
}
```

---

## Kode Status HTTP

| Status Code | Keterangan |
|---:|---|
| `200` | Request berhasil diproses |
| `201` | Data berhasil dibuat |
| `400` | Request tidak valid |
| `401` | Pengguna belum terautentikasi |
| `403` | Pengguna tidak memiliki akses |
| `404` | Data tidak ditemukan |
| `422` | Validasi gagal |
| `500` | Terjadi kesalahan pada server atau layanan eksternal |

---

## Catatan Keamanan API

- Endpoint generate teks, generate gambar, galeri, riwayat chat, dan pembayaran wajib menggunakan autentikasi.
- API key Gemini, token Cloudflare Worker, dan server key Midtrans tidak boleh dikirim ke frontend.
- Validasi prompt perlu dilakukan untuk mencegah input kosong, terlalu panjang, atau tidak sesuai aturan sistem.
- Callback Midtrans harus diverifikasi menggunakan signature key sebelum status transaksi diperbarui.
- Kuota generate gambar hanya boleh bertambah setelah status pembayaran dinyatakan berhasil.
