# AI ChatBot — Dokumentasi Penggunaan

Aplikasi AI Chatbot berbasis web yang memungkinkan pengguna melakukan percakapan dengan AI menggunakan **Gemini API**. Backend dibangun dengan **Laravel 12**, frontend dengan **React**, dan autentikasi menggunakan **Laravel Sanctum**.

---

## Daftar Isi

- [Identitas Proyek](#identitas-proyek)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Kebutuhan Sistem](#kebutuhan-sistem)
- [Instalasi & Setup](#instalasi--setup)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [Panduan API](#panduan-api)
    - [Autentikasi](#1-autentikasi)
    - [Health Check](#2-health-check)
    - [Chat Session](#3-chat-session)
    - [Chat Message](#4-chat-message)
- [Panduan Integrasi Frontend (React)](#panduan-integrasi-frontend-react)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Perintah Penting](#perintah-penting)
- [Troubleshooting](#troubleshooting)

---

## Identitas Proyek

| Keterangan    | Detail                                      |
| ------------- | ------------------------------------------- |
| Nama Kelompok | SEBELAS                                     |
| Nama Proyek   | AI Chatbot                                  |
| Repositori    | https://github.com/wildanmukhall/AI-ChatBot |
| Frontend      | React                                       |
| Backend       | Laravel 12                                  |
| Database      | MySQL                                       |
| Auth          | Laravel Sanctum (Bearer Token)              |
| AI Provider   | Google Gemini API                           |

### Anggota Tim

| Nama                        |       Nim | Role               |
| --------------------------- | --------: | ------------------ |
| Dandy Sultana Putra Ali     | 230705199 | Backend Developer  |
| Syibran Malawi              | 230705062 | Frontend Developer |
| Muhammad Wildan Mukhalladun | 230705059 | DevOps Engineer    |

---

## Arsitektur Sistem

```
User → React Frontend → Laravel API → Gemini API
                ↕               ↕
           State Mgmt      MySQL Database
```

### Alur Request Chat

```
1. User mengetik pesan di React
2. React mengirim POST ke /api/v1/chat-sessions/{id}/messages
3. Laravel memvalidasi request (StoreChatMessageRequest)
4. ChatService menyimpan pesan user ke database
5. ChatService memanggil GeminiService.generateText()
6. GeminiService mengirim request ke Gemini API
7. Jawaban AI disimpan ke database
8. Laravel mengembalikan response JSON ke React
9. React menampilkan jawaban AI
```

### Arsitektur Backend (Service-Oriented)

```
Controller (tipis, hanya delegasi)
    ↓
Form Request (validasi input)
    ↓
ChatService (logika bisnis)
    ↓
GeminiService (komunikasi API)
    ↓
Gemini API (Google AI)
```

---

## Kebutuhan Sistem

- **PHP** ≥ 8.2
- **Composer** ≥ 2.x
- **Node.js** ≥ 18.x & **npm**
- **MySQL** ≥ 8.0
- **Git**
- **Gemini API Key** (dari [Google AI Studio](https://aistudio.google.com/apikey))

---

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/wildanmukhall/AI-ChatBot.git
cd AI-ChatBot
```

### 2. Install Dependencies

Install dependency untuk backend (Laravel) dan frontend (React):

```bash
# Install dependency Backend (berada di root folder)
composer install

# Install dependency Frontend (masuk ke folder frontend)
cd frontend
npm install
cd ..
```

### 3. Salin File Environment

```bash
# Linux / macOS
cp .env.example .env

# Windows
copy .env.example .env
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Buat Database MySQL

```sql
CREATE DATABASE ai_chatbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 6. Jalankan Migrasi

```bash
php artisan migrate
```

### 7. (Opsional) Setup Cepat dengan Composer Script

```bash
composer setup
```

Script ini otomatis menjalankan: install dependency, copy `.env`, generate key, migrasi, dan build frontend.

---

## Konfigurasi Environment

Edit file `.env` sesuai kebutuhan:

### Database

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_chatbot
DB_USERNAME=root
DB_PASSWORD=
```

### Gemini API (WAJIB)

```env
GEMINI_API_KEY=
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIMEOUT=30
```

> **Cara mendapatkan API Key:**
>
> 1. Buka [Google AI Studio](https://aistudio.google.com/apikey)
> 2. Login dengan akun Google
> 3. Klik **"Create API Key"**
> 4. Copy API key dan paste ke `GEMINI_API_KEY`

### Frontend URL (CORS)

```env
FRONTEND_URL=http://localhost:5173
```

### Konfigurasi Lanjutan (Opsional)

```env
# Cloudflare Workers AI (untuk generate gambar — Phase selanjutnya)
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_IMAGE_ENDPOINT=

# Midtrans Payment (Payment Gateway)
MIDTRANS_SERVER_KEY="SB-Mid-server-YOUR_SERVER_KEY"
MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_CLIENT_KEY"
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
MIDTRANS_SNAP_URL="https://app.sandbox.midtrans.com/snap/v1/transactions"
MIDTRANS_API_BASE_URL="https://api.sandbox.midtrans.com"
```

### Tabel Environment Variable

| Variable          | Wajib | Default                                            | Deskripsi               |
| ----------------- | :---: | -------------------------------------------------- | ----------------------- |
| `GEMINI_API_KEY`  |  ✅   | —                                                  | API key Google Gemini   |
| `GEMINI_BASE_URL` |  ❌   | `https://generativelanguage.googleapis.com/v1beta` | Base URL Gemini API     |
| `GEMINI_MODEL`    |  ❌   | `gemini-1.5-flash`                                 | Model AI yang digunakan |
| `GEMINI_TIMEOUT`  |  ❌   | `30`                                               | Timeout request (detik) |
| `FRONTEND_URL`    |  ✅   | `http://localhost:5173`                            | URL frontend untuk CORS |
| `DB_DATABASE`     |  ✅   | `ai_chatbot`                                       | Nama database MySQL     |

---

## Menjalankan Aplikasi (Monorepo)

Aplikasi ini menggunakan arsitektur **Monorepo**, di mana backend (Laravel API) berada di folder utama (root) dan frontend (React SPA) berada terpisah di dalam folder `frontend/`. Anda perlu menjalankan keduanya secara bersamaan di terminal yang berbeda.

### Terminal 1: Menjalankan Backend (Laravel API)

Buka terminal di **folder utama (root)** proyek (`AI-ChatBot/`), lalu jalankan:

```bash
php artisan serve
```

> Server backend akan berjalan di `http://localhost:8000`.

### Terminal 2: Menjalankan Frontend (React SPA)

Buka terminal baru, masuk ke **folder `frontend/`**, lalu jalankan server pengembangan Vite:

```bash
cd frontend
npm run dev
```

> Server frontend akan berjalan di `http://localhost:5173`. Frontend sudah dikonfigurasi (melalui `vite.config.js`) untuk mem-proxy request API secara otomatis ke backend `http://localhost:8000`.

### Terminal 3: Queue Worker (Opsional)

Jika Anda menggunakan fitur antrean (Queue) di Laravel untuk tugas latar belakang, buka terminal baru di **folder utama (root)** dan jalankan:

```bash
php artisan queue:listen
```

### Verifikasi Backend Berjalan

```bash
curl http://localhost:8000/api/v1/health
```

Response yang diharapkan:

```json
{
    "success": true,
    "message": "Backend API berjalan dengan baik.",
    "data": {
        "app": "AI Chatbot API",
        "status": "ok",
        "environment": "local",
        "timestamp": "2026-06-10T10:00:00+00:00"
    }
}
```

---

## Struktur Proyek

```
AI-ChatBot/
├── app/
│   ├── Exceptions/
│   │   ├── BusinessRuleException.php      # Exception aturan bisnis
│   │   └── ExternalApiException.php       # Exception API eksternal (Gemini)
│   ├── Facades/
│   │   └── Gemini.php                     # Facade untuk GeminiService
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── ChatSessionController.php  # CRUD chat session
│   │   │   ├── ChatMessageController.php  # Kirim/ambil pesan
│   │   │   └── HealthCheckController.php  # Health check endpoint
│   │   └── Requests/Chat/
│   │       ├── StoreChatSessionRequest.php # Validasi buat session
│   │       └── StoreChatMessageRequest.php # Validasi kirim pesan
│   ├── Models/
│   │   ├── User.php                       # Model user + relasi chatSessions
│   │   ├── ChatSession.php                # Model sesi percakapan
│   │   └── ChatMessage.php                # Model pesan chat
│   ├── Providers/
│   │   ├── AIServiceProvider.php          # Register GeminiService, ChatService
│   │   └── AppServiceProvider.php         # Rate limiting config
│   ├── Services/
│   │   ├── AI/
│   │   │   ├── Contracts/
│   │   │   │   └── TextGeneratorInterface.php  # Interface contract
│   │   │   └── GeminiService.php          # Komunikasi dengan Gemini API
│   │   ├── Chat/
│   │   │   └── ChatService.php            # Logika bisnis chat
│   │   └── Shared/
│   │       └── ExternalApiService.php     # Base class HTTP client
│   └── Support/
│       └── ApiResponse.php                # Helper response JSON standar
├── config/
│   ├── cors.php                           # Konfigurasi CORS
│   ├── sanctum.php                        # Konfigurasi Sanctum auth
│   └── services.php                       # Config Gemini, Cloudflare, Midtrans
├── database/migrations/
│   ├── 2026_06_10_000001_create_chat_sessions_table.php
│   └── 2026_06_10_000002_create_chat_messages_table.php
├── routes/
│   └── api.php                            # Semua route API
├── PRD/
│   └── AI_text.md                         # Product Requirement Document
└── .env.example                           # Template environment variable
```

---

## Panduan API

Semua endpoint menggunakan prefix `/api/v1`. Response menggunakan format JSON standar.

### Format Response Sukses

```json
{
    "success": true,
    "message": "Deskripsi hasil.",
    "data": {}
}
```

### Format Response Error

```json
{
    "success": false,
    "message": "Deskripsi error.",
    "errors": null
}
```

---

### 1. Autentikasi

Semua endpoint chat memerlukan **Bearer Token** dari Laravel Sanctum.

#### Registrasi User (jika tersedia)

```http
POST /api/v1/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Login & Dapatkan Token

```http
POST /api/v1/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:

```json
{
    "success": true,
    "message": "Login berhasil.",
    "data": {
        "token": "1|abc123xyz..."
    }
}
```

#### Menggunakan Token

Sertakan token di header **Authorization** pada setiap request:

```http
Authorization: Bearer 1|abc123xyz...
```

---

### 2. Health Check

#### GET `/api/v1/health`

Cek status backend (tanpa auth).

```bash
curl http://localhost:8000/api/v1/health
```

#### GET `/api/v1/status`

Cek versi API (tanpa auth).

```bash
curl http://localhost:8000/api/v1/status
```

#### POST `/api/dev/gemini/test`

Endpoint opsional khusus untuk _development_ untuk menguji integrasi Gemini API tanpa memerlukan sesi chat (tanpa autentikasi).

```http
POST /api/dev/gemini/test
Content-Type: application/json

{
  "prompt": "Jelaskan apa itu Laravel secara singkat."
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Gemini berhasil merespons.",
    "data": {
        "text": "Laravel adalah framework PHP untuk membangun aplikasi web..."
    }
}
```

---

### 3. Chat Session

Semua endpoint berikut memerlukan `Authorization: Bearer {token}`.

#### 3.1 Buat Chat Session Baru

```http
POST /api/v1/chat-sessions
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Percakapan Baru"
}
```

> `title` bersifat opsional. Jika tidak dikirim, default: `"Percakapan Baru"`.

**Response (201):**

```json
{
    "success": true,
    "message": "Chat session berhasil dibuat.",
    "data": {
        "id": 1,
        "title": "Percakapan Baru",
        "created_at": "2026-06-10T10:00:00.000000Z"
    }
}
```

#### 3.2 Daftar Chat Session

```http
GET /api/v1/chat-sessions?page=1&per_page=10&search=keyword
Authorization: Bearer {token}
```

| Parameter  | Tipe   | Wajib | Default | Deskripsi                   |
| ---------- | ------ | :---: | ------- | --------------------------- |
| `page`     | int    |  ❌   | 1       | Halaman ke-n                |
| `per_page` | int    |  ❌   | 10      | Jumlah data per halaman     |
| `search`   | string |  ❌   | —       | Pencarian berdasarkan title |

**Response (200):**

```json
{
    "success": true,
    "message": "Daftar chat session berhasil diambil.",
    "data": [
        {
            "id": 1,
            "title": "Ide Konten TikTok",
            "last_message": "Berikut ide konten yang bisa kamu buat...",
            "messages_count": 8,
            "updated_at": "2026-06-10T10:30:00.000000Z"
        }
    ],
    "meta": {
        "current_page": 1,
        "last_page": 3,
        "per_page": 10,
        "total": 30
    }
}
```

#### 3.3 Detail Chat Session

```http
GET /api/v1/chat-sessions/{id}
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Detail chat session berhasil diambil.",
    "data": {
        "id": 1,
        "title": "Ide Konten TikTok",
        "created_at": "2026-06-10T10:00:00.000000Z",
        "updated_at": "2026-06-10T10:30:00.000000Z"
    }
}
```

#### 3.4 Hapus Chat Session

```http
DELETE /api/v1/chat-sessions/{id}
Authorization: Bearer {token}
```

> Menghapus session beserta **seluruh pesan** di dalamnya (cascade delete).

**Response (200):**

```json
{
    "success": true,
    "message": "Chat session berhasil dihapus.",
    "data": null
}
```

---

### 4. Chat Message

#### 4.1 Ambil Semua Pesan dalam Session

```http
GET /api/v1/chat-sessions/{id}/messages
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Pesan chat berhasil diambil.",
    "data": [
        {
            "id": 1,
            "role": "user",
            "content": "Apa itu API?",
            "provider": null,
            "model": null,
            "created_at": "2026-06-10T10:00:00.000000Z"
        },
        {
            "id": 2,
            "role": "assistant",
            "content": "API adalah perantara yang memungkinkan dua aplikasi saling berkomunikasi...",
            "provider": "gemini",
            "model": "gemini-1.5-flash",
            "created_at": "2026-06-10T10:00:05.000000Z"
        }
    ]
}
```

#### 4.2 Kirim Pesan & Generate Jawaban AI

```http
POST /api/v1/chat-sessions/{id}/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Jelaskan apa itu API dengan bahasa sederhana."
}
```

**Validasi:**

| Field     | Aturan                         |
| --------- | ------------------------------ |
| `message` | Wajib, string, min 2, max 5000 |

**Response (200):**

```json
{
    "success": true,
    "message": "Pesan berhasil diproses.",
    "data": {
        "user_message": {
            "id": 12,
            "role": "user",
            "content": "Jelaskan apa itu API dengan bahasa sederhana.",
            "created_at": "2026-06-10T10:40:00.000000Z"
        },
        "assistant_message": {
            "id": 13,
            "role": "assistant",
            "content": "API adalah perantara yang memungkinkan dua aplikasi saling berkomunikasi...",
            "provider": "gemini",
            "model": "gemini-1.5-flash",
            "created_at": "2026-06-10T10:40:05.000000Z"
        }
    }
}
```

---

### 5. User Profile

Semua endpoint berikut memerlukan `Authorization: Bearer {token}`.

#### 5.1 Lihat Profile User

```http
GET /api/v1/profile
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Profile berhasil diambil.",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2026-06-10T10:00:00.000000Z"
    }
}
```

#### 5.2 Update Nama User

```http
PUT /api/v1/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe Updated"
}
```

**Validasi:**
| Field | Aturan |
| ------ | ------------------------------- |
| `name` | Wajib, string, min 3, max 100 |

**Response (200):**

```json
{
    "success": true,
    "message": "Profile berhasil diperbarui.",
    "data": {
        "id": 1,
        "name": "John Doe Updated",
        "email": "john@example.com"
    }
}
```

#### 5.3 Update Password User

```http
PUT /api/v1/profile/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "old_password_here",
  "password": "new_password_here",
  "password_confirmation": "new_password_here"
}
```

**Validasi:**
| Field | Aturan |
| ------------------ | ----------------------------------------- |
| `current_password` | Wajib, string, harus cocok dengan db |
| `password` | Wajib, string, min 8, confirmed |

**Response (200):**

```json
{
    "success": true,
    "message": "Password berhasil diperbarui.",
    "data": null
}
```

#### 5.4 Ambil Statistik Dasar User

```http
GET /api/v1/profile/stats
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Statistik profile berhasil diambil.",
    "data": {
        "total_sessions": 15,
        "total_messages": 120
    }
}
```

### 6. Payment Gateway (Midtrans)

#### 6.1 Checkout (Buat Order & Snap Token)

Memerlukan `Authorization: Bearer {token}`.

```http
POST /api/v1/payments/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "pricing_plan_id": 1
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Snap token berhasil dibuat.",
    "data": {
        "order_id": 1,
        "order_code": "ORD-1234567890",
        "snap_token": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
        "redirect_url": "https://app.sandbox.midtrans.com/snap/v3/redirection/a1b2..."
    }
}
```

#### 6.2 Detail Order & Payment

Memerlukan `Authorization: Bearer {token}`.

```http
GET /api/v1/payments/{order_id}
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Detail payment berhasil diambil.",
    "data": {
        "order": {
            "id": 1,
            "order_code": "ORD-1234567890",
            "amount": 50000,
            "image_quota": 50,
            "status": "paid",
            "paid_at": "2026-06-21T06:00:00.000000Z"
        },
        "payment": {
            "provider": "midtrans",
            "transaction_id": "trx-123",
            "payment_type": "gopay",
            "transaction_status": "settlement",
            "fraud_status": "accept"
        }
    }
}
```

#### 6.3 Webhook Midtrans (Notification)

Endpoint ini dipanggil oleh server Midtrans (Public/Tanpa Auth).

```http
POST /api/v1/payments/midtrans/notification
Content-Type: application/json

{
  "transaction_time": "2026-06-21 13:00:00",
  "transaction_status": "settlement",
  "transaction_id": "trx-123",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "...",
  "payment_type": "gopay",
  "order_id": "ORD-1234567890",
  "merchant_id": "M012345",
  "gross_amount": "50000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Response (200):**

```json
{
    "success": true,
    "message": "Notification processed.",
    "data": null
}
```

---

## Panduan Integrasi Frontend (React)

### Setup Axios Instance

```javascript
// src/lib/api.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// Interceptor: Sisipkan token otomatis
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

### Contoh: Login & Simpan Token

```javascript
// src/services/authService.js
import api from "../lib/api";

export const login = async (email, password) => {
    const response = await api.post("/login", { email, password });
    const token = response.data.data.token;
    localStorage.setItem("auth_token", token);
    return token;
};
```

### Contoh: Service Chat

```javascript
// src/services/chatService.js
import api from "../lib/api";

// Buat session baru
export const createSession = async (title) => {
    const res = await api.post("/chat-sessions", { title });
    return res.data.data;
};

// Ambil daftar session
export const getSessions = async (page = 1, perPage = 10, search = "") => {
    const res = await api.get("/chat-sessions", {
        params: { page, per_page: perPage, search },
    });
    return res.data;
};

// Ambil detail session
export const getSession = async (id) => {
    const res = await api.get(`/chat-sessions/${id}`);
    return res.data.data;
};

// Ambil pesan dalam session
export const getMessages = async (sessionId) => {
    const res = await api.get(`/chat-sessions/${sessionId}/messages`);
    return res.data.data;
};

// Kirim pesan ke AI
export const sendMessage = async (sessionId, message) => {
    const res = await api.post(`/chat-sessions/${sessionId}/messages`, {
        message,
    });
    return res.data.data;
};

// Hapus session
export const deleteSession = async (id) => {
    const res = await api.delete(`/chat-sessions/${id}`);
    return res.data;
};
```

### Contoh: Komponen Chat dengan React

```jsx
// Contoh alur penggunaan di React component
import { useState, useEffect } from "react";
import {
    getSessions,
    createSession,
    getMessages,
    sendMessage,
} from "./services/chatService";

function ChatPage() {
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    // 1. Load daftar session saat halaman dibuka
    useEffect(() => {
        getSessions().then((res) => setSessions(res.data));
    }, []);

    // 2. Load pesan saat session dipilih
    useEffect(() => {
        if (activeSessionId) {
            getMessages(activeSessionId).then(setMessages);
        }
    }, [activeSessionId]);

    // 3. Buat session baru
    const handleNewChat = async () => {
        const session = await createSession();
        setSessions((prev) => [session, ...prev]);
        setActiveSessionId(session.id);
        setMessages([]);
    };

    // 4. Kirim pesan
    const handleSend = async () => {
        if (!input.trim() || isSending) return;
        setIsSending(true);

        // Tampilkan pesan user sementara
        const tempUserMsg = { role: "user", content: input, id: "temp" };
        setMessages((prev) => [...prev, tempUserMsg]);
        setInput("");

        try {
            const result = await sendMessage(activeSessionId, input);
            // Ganti pesan temp dengan data dari server
            setMessages((prev) => [
                ...prev.filter((m) => m.id !== "temp"),
                result.user_message,
                result.assistant_message,
            ]);
        } catch (error) {
            console.error(
                "Gagal mengirim pesan:",
                error.response?.data?.message,
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div>
            {/* Sidebar: daftar session */}
            {/* Chat Window: daftar messages */}
            {/* Input: form kirim pesan */}
        </div>
    );
}
```

### State Management yang Direkomendasikan

| Library         | Kegunaan                            |
| --------------- | ----------------------------------- |
| TanStack Query  | API fetching, caching, auto-refetch |
| Zustand/Context | Auth state (token, user info)       |
| Axios           | HTTP client dengan interceptor      |

---

## Error Handling

### Validation Error (422)

```json
{
    "success": false,
    "message": "Validasi gagal.",
    "errors": {
        "message": ["Pesan wajib diisi."]
    }
}
```

### Unauthorized (401)

```json
{
    "success": false,
    "message": "Unauthenticated.",
    "errors": null
}
```

### Forbidden — Ownership (403/404)

User mencoba mengakses chat milik user lain:

```json
{
    "success": false,
    "message": "Anda tidak memiliki akses ke percakapan ini.",
    "errors": null
}
```

### Gemini API Error (502)

```json
{
    "success": false,
    "message": "Layanan AI sedang mengalami gangguan. Silakan coba beberapa saat lagi.",
    "errors": null
}
```

### Gemini Timeout (504)

```json
{
    "success": false,
    "message": "Layanan AI tidak merespons. Silakan coba beberapa saat lagi.",
    "errors": null
}
```

### Rate Limit Exceeded (429)

```json
{
    "success": false,
    "message": "Terlalu banyak request. Silakan coba lagi nanti.",
    "errors": null
}
```

---

## Rate Limiting

| Endpoint                                    | Limit              |
| ------------------------------------------- | ------------------ |
| Public endpoints (`/health`, `/status`)     | 60 request / menit |
| Authenticated endpoints (list, detail, dll) | 60 request / menit |
| `POST /chat-sessions/{id}/messages` (AI)    | 20 request / menit |

---

## Struktur Database

### Tabel `chat_sessions`

| Kolom        | Tipe        | Deskripsi                                  |
| ------------ | ----------- | ------------------------------------------ |
| `id`         | bigint (PK) | Primary key                                |
| `user_id`    | bigint (FK) | Relasi ke tabel users                      |
| `title`      | string      | Judul session (default: "Percakapan Baru") |
| `created_at` | timestamp   | Waktu dibuat                               |
| `updated_at` | timestamp   | Waktu terakhir diupdate                    |

### Tabel `chat_messages`

| Kolom             | Tipe                          | Deskripsi                          |
| ----------------- | ----------------------------- | ---------------------------------- |
| `id`              | bigint (PK)                   | Primary key                        |
| `chat_session_id` | bigint (FK)                   | Relasi ke chat_sessions            |
| `role`            | enum(user, assistant, system) | Pengirim pesan                     |
| `content`         | text                          | Isi pesan                          |
| `provider`        | string (nullable)             | `gemini` untuk AI, null untuk user |
| `model`           | string (nullable)             | Model AI yang digunakan            |
| `metadata`        | json (nullable)               | Data tambahan opsional             |
| `created_at`      | timestamp                     | Waktu dibuat                       |
| `updated_at`      | timestamp                     | Waktu terakhir diupdate            |

### Tabel `generated_images`

| Kolom             | Tipe              | Deskripsi                              |
| ----------------- | ----------------- | -------------------------------------- |
| `id`              | bigint (PK)       | Primary key                            |
| `user_id`         | bigint (FK)       | Relasi ke tabel users                  |
| `prompt`          | text              | Teks prompt                            |
| `negative_prompt` | text (nullable)   | Teks negatif prompt                    |
| `image_path`      | string (nullable) | Path internal file gambar              |
| `image_url`       | string (nullable) | URL publik gambar                      |
| `provider`        | string            | AI provider (default: cloudflare)      |
| `model`           | string            | Model yang digunakan                   |
| `status`          | string            | Status (processing, completed, failed) |
| `error_message`   | text (nullable)   | Pesan error jika gagal                 |
| `quota_refunded`  | boolean           | Status refund kuota                    |

---

## Modul Pembayaran (Midtrans)

Sistem ini mendukung integrasi Midtrans Sandbox untuk menangani pembelian kuota.

### Endpoints Pembayaran

1. **Checkout (Create Order)**
    - **URL:** `POST /api/v1/payments/checkout`
    - **Header:** `Authorization: Bearer {token}`
    - **Body:**
        ```json
        {
            "pricing_plan_id": 1
        }
        ```
    - **Response:**
        ```json
        {
            "success": true,
            "message": "Checkout berhasil.",
            "data": {
                "order_id": 1,
                "snap_token": "...",
                "snap_redirect_url": "https://app.sandbox.midtrans.com/snap/v3/redirection/..."
            }
        }
        ```

2. **Cek Status Pesanan**
    - **URL:** `GET /api/v1/payments/{order_id}`
    - **Header:** `Authorization: Bearer {token}`
    - **Response:** Menampilkan detail order beserta status pembayarannya (pending, success, failed, dll).

3. **Webhook Midtrans**
    - **URL:** `POST /api/v1/payments/midtrans/notification`
    - **Deskripsi:** Endpoint khusus yang menerima notifikasi asinkron dari Midtrans dan memperbarui status pesanan.

### Testing Midtrans Sandbox

1. Pastikan env terisi:
    ```env
    MIDTRANS_IS_PRODUCTION=false
    MIDTRANS_SERVER_KEY="SB-Mid-server-..."
    MIDTRANS_CLIENT_KEY="SB-Mid-client-..."
    ```
2. Checkout dari aplikasi untuk mendapatkan `snap_redirect_url`.
3. Buka URL tersebut dan lakukan simulasi pembayaran menggunakan kartu debit/kredit dummy Midtrans atau metode lain yang didukung di Simulator Midtrans.
4. (Opsional untuk testing webhook lokal): Gunakan Ngrok (`ngrok http 8000`) lalu daftarkan URL Ngrok tersebut di Midtrans Dashboard > Settings > Configuration.

---

## Modul Generate Gambar (Text-to-Image)

Sistem ini memiliki fitur Text-to-Image menggunakan Cloudflare Workers AI. Proses dilakukan secara asynchronous menggunakan queue untuk mencegah timeout API.

### Endpoints Text-to-Image

1. **Request Generate Image**
    - **URL:** `POST /api/v1/images/generate`
    - **Header:** `Authorization: Bearer {token}`
    - **Body:**
        ```json
        {
            "prompt": "A futuristic city with flying cars at sunset",
            "negative_prompt": "blurry, low quality",
            "width": 1024,
            "height": 1024
        }
        ```
    - **Response:**
        ```json
        {
            "success": true,
            "message": "Generate gambar sedang diproses.",
            "data": {
                "id": 12,
                "prompt": "A futuristic city with flying cars at sunset",
                "status": "processing",
                "provider": "cloudflare",
                "model": "@cf/bytedance/stable-diffusion-xl-lightning",
                "created_at": "2026-06-21T07:00:00Z"
            }
        }
        ```

2. **Cek Status Gambar**
    - **URL:** `GET /api/v1/images/{id}/status`
    - **Header:** `Authorization: Bearer {token}`
    - **Response:**
        ```json
        {
            "success": true,
            "message": "Status generate gambar berhasil diambil.",
            "data": {
                "id": 12,
                "status": "completed",
                "image_url": "http://localhost:8000/storage/generated-images/1/12.png",
                "error_message": null,
                "created_at": "2026-06-21T07:00:00Z",
                "completed_at": "2026-06-21T07:00:05Z",
                "failed_at": null
            }
        }
        ```

### Testing Cloudflare Worker Text-to-Image

1. Pastikan queue worker berjalan: `php artisan queue:work`
2. Pastikan storage link telah terbuat: `php artisan storage:link`
3. Pastikan konfigurasi env terisi sesuai Worker Anda:
    ```env
    CLOUDFLARE_IMAGE_WORKER_URL="https://dark-mouse-667e.dandysultana3.workers.dev/generate"
    CLOUDFLARE_IMAGE_WORKER_TIMEOUT=120
    CLOUDFLARE_IMAGE_WORKER_RETRY_TIMES=1
    ```
4. Panggil endpoint request generate, catat `id` yang didapat.
5. Panggil endpoint status check dengan interval tertentu hingga status berubah menjadi `completed` atau `failed`.

### Panduan Integrasi Frontend (React) - Image Generation

Berikut adalah contoh implementasi Service dan Component React untuk fitur Text-to-Image yang terhubung dengan backend Laravel Anda. Backend menggunakan sistem _Queue_ dan _Polling_ untuk mencegah _timeout_.

**Catatan Penting untuk Frontend:**

- Pastikan instance Axios Anda (misalnya `api.js` atau `axiosInstance.js`) sudah memiliki `baseURL: 'http://localhost:8000/api/v1'`.
- Jangan menambahkan `/api/v1` lagi di path request Anda agar tidak terjadi duplikasi (Error 404 Endpoint tidak ditemukan).

**1. Service API (`src/services/imageService.js` atau `src/api/imageApi.js`)**

```javascript
import api from "../lib/api"; // Sesuaikan dengan file axios instance Anda

// Request generate gambar (mengembalikan status 'processing' dan ID task)
export const generateImage = async (payload) => {
    // Hanya gunakan /images/generate karena baseURL sudah ada
    const res = await api.post("/images/generate", payload);
    return res.data;
};

// Cek status gambar menggunakan ID dari generateImage
export const getImageStatus = async (id) => {
    const res = await api.get(`/images/${id}/status`);
    return res.data;
};
```

**2. Hook React (Opsional - `src/hooks/useImageGeneration.js`)**

```javascript
import { useState, useRef, useEffect } from "react";
import { generateImage, getImageStatus } from "../services/imageService";

export function useImageGeneration() {
    const [status, setStatus] = useState("idle"); // idle, submitting, processing, completed, failed
    const [imageUrl, setImageUrl] = useState(null);
    const [error, setError] = useState(null);
    const pollIntervalRef = useRef(null);

    const startGeneration = async (
        prompt,
        negative_prompt = "",
        width = 512,
        height = 512,
    ) => {
        setStatus("submitting");
        setError(null);
        setImageUrl(null);

        try {
            const response = await generateImage({
                prompt,
                negative_prompt,
                width,
                height,
            });
            if (response.success && response.data.id) {
                setStatus("processing");
                startPolling(response.data.id);
            }
        } catch (err) {
            setStatus("failed");
            setError(
                err.response?.data?.message ||
                    "Gagal memulai proses generate gambar.",
            );
        }
    };

    const startPolling = (id) => {
        // Polling setiap 3 detik
        pollIntervalRef.current = setInterval(async () => {
            try {
                const response = await getImageStatus(id);
                const currentStatus = response.data.status;

                if (currentStatus === "completed") {
                    setStatus("completed");
                    setImageUrl(response.data.image_url);
                    clearInterval(pollIntervalRef.current);
                } else if (currentStatus === "failed") {
                    setStatus("failed");
                    setError(
                        response.data.error_message ||
                            "Proses generate gambar gagal.",
                    );
                    clearInterval(pollIntervalRef.current);
                }
            } catch (err) {
                // Abaikan error jaringan sementara, atau tangani jika berulang kali
                console.error("Error saat polling:", err);
            }
        }, 3000);
    };

    useEffect(() => {
        // Cleanup interval saat komponen di-unmount
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    return { status, imageUrl, error, startGeneration };
}
```

### 🛑 Troubleshooting Error Umum

1. **Gambar Muncul sebagai Kumpulan Baut / Onderdil Mesin (Typewriter Parts):**
    - **Penyebab:** Cloudflare Model `@cf/bytedance/stable-diffusion-xl-lightning` **tidak mendukung** parameter `negative_prompt`, `width`, dan `height`. Jika parameter ini terkirim ke Cloudflare, model akan error dan mengembalikan gambar _noise/placeholder model_.
    - **Solusi:** Di backend, `CloudflareWorkerImageService.php` sudah disetel untuk HANYA mengirimkan parameter `prompt` saja.

2. **Error `cURL error 28: Resolving timed out` di Terminal Queue:**
    - **Penyebab:** DNS komputer lokal Anda lambat dalam memetakan domain `workers.dev` milik Cloudflare.
    - **Solusi:** Sudah ditambahkan `->connectTimeout(30)` di backend. Pastikan Anda merestart terminal queue dengan cara `Ctrl+C` lalu menjalankan ulang `php artisan queue:work`.

3. **Gambar Tidak Pernah Selesai (Processing Terus):**
    - **Penyebab:** Anda lupa menyalakan Queue Worker Laravel.
    - **Solusi:** Buka terminal baru, pastikan Anda masuk ke folder project, lalu jalankan `php artisan queue:work`. Worker ini wajib menyala agar gambar bisa ditarik dari Cloudflare secara background.

**3. Contoh Komponen UI (`src/pages/GenerateImagePage.jsx`)**

```jsx
import { useState } from "react";
import { useImageGeneration } from "../hooks/useImageGeneration";

export default function GenerateImagePage() {
    const [prompt, setPrompt] = useState("");
    const [negativePrompt, setNegativePrompt] = useState("");
    const { status, imageUrl, error, startGeneration } = useImageGeneration();

    const handleGenerate = (e) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        startGeneration(prompt, negativePrompt);
    };

    return (
        <div>
            <h2>Generate Gambar dengan AI</h2>
            <form onSubmit={handleGenerate}>
                <textarea
                    placeholder="Masukkan prompt... (contoh: A futuristic city)"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Negative prompt... (contoh: blurry)"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                />
                <button
                    type="submit"
                    disabled={
                        status === "submitting" || status === "processing"
                    }
                >
                    {status === "submitting" || status === "processing"
                        ? "Memproses..."
                        : "Generate Gambar"}
                </button>
            </form>

            {/* Menampilkan Status / Hasil */}
            <div style={{ marginTop: "20px" }}>
                {status === "processing" && (
                    <p>AI sedang menggambar, mohon tunggu... ⏳</p>
                )}
                {status === "failed" && (
                    <p style={{ color: "red" }}>Error: {error}</p>
                )}
                {status === "completed" && imageUrl && (
                    <div>
                        <p>✅ Selesai!</p>
                        <img
                            src={imageUrl}
                            alt="Generated AI"
                            style={{ maxWidth: "100%", borderRadius: "8px" }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
```

---

## Modul Image Gallery

Modul Image Gallery menyediakan endpoint untuk menampilkan, melihat detail, dan menghapus gambar hasil generate milik user.

### Endpoints Image Gallery

1. **Daftar Gallery (List)**
    - **URL:** `GET /api/v1/images`
    - **Header:** `Authorization: Bearer {token}`
    - **Query Parameters (Opsional):**
        - `page`: Nomor halaman (default: 1)
        - `per_page`: Jumlah data per halaman (maksimal 50, default: 12)
        - `search`: Pencarian berdasarkan kata kunci pada prompt
        - `status`: Filter status (`processing`, `completed`, `failed`)
        - `date_from` & `date_to`: Filter rentang tanggal pembuatan
        - `sort_by` & `sort_order`: Pengurutan data (default: `created_at` `desc`)
    - **Response:**
      Mengembalikan data hasil generate gambar beserta pagination meta.

2. **Detail Gambar**
    - **URL:** `GET /api/v1/images/{id}`
    - **Header:** `Authorization: Bearer {token}`
    - **Response:**
      Mengembalikan detail lengkap satu hasil generate gambar.

3. **Hapus Gambar**
    - **URL:** `DELETE /api/v1/images/{id}`
    - **Header:** `Authorization: Bearer {token}`
    - **Deskripsi:**
      Menghapus data gambar di database serta menghapus file gambar fisik dari storage jika ada. Data user lain tidak dapat dihapus.

---

## Perintah Penting

```bash
# Jalankan semua service sekaligus (server + queue + logs + vite)
composer dev

# Setup project dari awal
composer setup

# Jalankan server Laravel saja
php artisan serve

# Jalankan Vite dev server saja
npm run dev

# Jalankan migrasi database
php artisan migrate

# Rollback migrasi
php artisan migrate:rollback

# Build frontend untuk production
npm run build

# Bersihkan cache
php artisan config:clear
php artisan cache:clear

# Jalankan test
composer test
```

---

## Troubleshooting

### 1. "Layanan AI belum dikonfigurasi"

**Penyebab:** `GEMINI_API_KEY` kosong di `.env`.

**Solusi:**

1. Dapatkan API key dari [Google AI Studio](https://aistudio.google.com/apikey)
2. Tambahkan ke `.env`: `GEMINI_API_KEY=your_key_here`
3. Jalankan: `php artisan config:clear`

### 2. CORS Error di Browser

**Penyebab:** `FRONTEND_URL` tidak sesuai dengan URL React.

**Solusi:**

1. Pastikan `FRONTEND_URL=http://localhost:5173` di `.env`
2. Jalankan: `php artisan config:clear`

### 3. "Unauthenticated" pada Endpoint Chat

**Penyebab:** Token tidak dikirim atau sudah expired.

**Solusi:**

1. Login ulang untuk mendapatkan token baru
2. Pastikan header `Authorization: Bearer {token}` dikirim di setiap request

### 4. "Terlalu banyak request"

**Penyebab:** Rate limit terlampaui.

**Solusi:** Tunggu 1 menit lalu coba lagi. Limit AI generate: 20 req/menit.

### 5. Migrasi Gagal

**Solusi:**

```bash
php artisan migrate:fresh   # WARNING: Menghapus semua data
```

---

## Fitur Auto-Generate Title

Saat user mengirim pesan pertama di session yang masih berjudul "Percakapan Baru", sistem otomatis mengambil 50 karakter pertama dari pesan tersebut sebagai title session.

**Contoh:**

- Pesan: `"Buatkan ide konten tentang cara website mengingat user melalui session dan cookie"`
- Title otomatis: `"Buatkan ide konten tentang cara website menging..."`

---

## Data Ownership

Sistem menerapkan aturan kepemilikan data yang ketat:

- User **hanya** bisa mengakses chat session miliknya sendiri
- User **tidak bisa** melihat, mengirim pesan, atau menghapus session milik user lain
- Setiap query database selalu difilter berdasarkan `user_id`

---

## Lisensi

Proyek ini dibuat untuk kebutuhan pembelajaran mata kuliah Sistem Web dan Mobile.

---
