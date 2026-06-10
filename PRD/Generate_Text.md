# PRD Backend — Modul Generate Teks / Chatbot

## 1. Ringkasan Modul

Modul **Generate Teks / Chatbot** adalah fitur backend yang memungkinkan user melakukan percakapan dengan AI melalui sistem chat.

Modul ini dibangun setelah **GeminiService** selesai, sehingga fitur chatbot tidak langsung berhubungan dengan Gemini API dari controller. Controller hanya menerima request, lalu meneruskannya ke service layer. Proses generate jawaban AI dilakukan melalui `GeminiService`.

Output utama modul ini:

```text
User dapat membuat percakapan, mengirim pesan, menerima jawaban AI, melihat riwayat chat, membuka isi percakapan, dan menghapus chat session miliknya.
```

---

# 2. Tujuan Modul

Tujuan pengembangan modul ini adalah:

```text
1. Menyediakan API backend untuk fitur chatbot.
2. Memungkinkan user membuat chat session baru.
3. Memungkinkan user mengirim pesan ke AI.
4. Menggunakan GeminiService untuk menghasilkan jawaban AI.
5. Menyimpan pesan user ke database.
6. Menyimpan jawaban AI ke database.
7. Menampilkan daftar chat session milik user.
8. Menampilkan isi percakapan dalam satu chat session.
9. Menghapus chat session beserta seluruh pesannya.
10. Memastikan user hanya bisa mengakses chat miliknya sendiri.
```

---

# 3. Scope Backend

## 3.1 In Scope

Yang dikembangkan pada modul ini:

```text
- ChatSession model
- ChatMessage model
- Migration chat_sessions
- Migration chat_messages
- ChatService
- ChatSessionController
- ChatMessageController
- StoreChatSessionRequest
- StoreChatMessageRequest
- API membuat chat session
- API menampilkan daftar chat session
- API menampilkan detail chat session
- API menampilkan isi percakapan
- API mengirim pesan user
- API generate jawaban AI melalui GeminiService
- API menghapus chat session
- Ownership validation
- Error handling jika Gemini gagal
- Response JSON standar
```

---

## 3.2 Out of Scope

Yang tidak dikembangkan pada modul ini:

```text
- Integrasi GeminiService dari awal
- Konfigurasi Gemini API
- Generate gambar
- Cloudflare Worker AI
- Pricing plan
- Kuota gambar
- Payment Midtrans
- Galeri gambar
- Admin dashboard
- Streaming response AI
- Upload file
- Voice input/output
- Regenerate answer
- Edit pesan
- Delete individual message
```

Catatan: Modul ini menggunakan `GeminiService` yang diasumsikan sudah tersedia dari modul sebelumnya.

---

# 4. Aktor Sistem

## 4.1 Registered User

User yang sudah login dapat:

```text
- Membuat chat session baru
- Melihat daftar chat session miliknya
- Membuka isi percakapan
- Mengirim pesan ke AI
- Menerima jawaban AI
- Menghapus chat session miliknya
```

---

## 4.2 System

Sistem bertugas:

```text
- Memvalidasi request
- Mengecek kepemilikan chat session
- Menyimpan pesan user
- Memanggil GeminiService
- Menyimpan jawaban AI
- Mengembalikan response JSON standar
- Menangani error dari GeminiService
```

---

# 5. Alur Fitur

## 5.1 Alur Membuat Chat Session

```text
User login
↓
User membuat percakapan baru
↓
Backend menerima request POST /api/chat-sessions
↓
Backend membuat data chat session baru
↓
Backend menghubungkan chat session dengan user login
↓
Backend mengembalikan data chat session
```

---

## 5.2 Alur Mengirim Pesan dan Generate Jawaban AI

```text
User mengirim pesan pada chat session tertentu
↓
Backend memvalidasi isi pesan
↓
Backend mengecek apakah chat session milik user login
↓
Backend menyimpan pesan user ke database
↓
Backend mengirim prompt ke GeminiService
↓
GeminiService mengembalikan jawaban teks
↓
Backend menyimpan jawaban AI sebagai chat message
↓
Backend mengembalikan pesan user dan pesan AI ke client
```

---

## 5.3 Alur Menampilkan Daftar Chat Session

```text
User membuka halaman chat
↓
Backend mengambil semua chat session milik user login
↓
Backend mengurutkan berdasarkan update terbaru
↓
Backend mengembalikan data dengan pagination
```

---

## 5.4 Alur Menampilkan Isi Percakapan

```text
User membuka salah satu chat session
↓
Backend mengecek kepemilikan chat session
↓
Backend mengambil semua pesan dari chat session tersebut
↓
Backend mengurutkan pesan dari yang paling lama
↓
Backend mengembalikan daftar pesan
```

---

## 5.5 Alur Menghapus Chat Session

```text
User menghapus chat session
↓
Backend mengecek kepemilikan chat session
↓
Backend menghapus chat session
↓
Seluruh chat message terkait ikut terhapus
↓
Backend mengembalikan response sukses
```

---

# 6. Functional Requirement

---

## FR-01 — Membuat Chat Session

### Deskripsi

Sistem harus menyediakan endpoint agar user dapat membuat chat session baru.

### Endpoint

```http
POST /api/chat-sessions
```

Jika menggunakan versioning:

```http
POST /api/v1/chat-sessions
```

### Authentication

Wajib login.

```http
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Percakapan Baru"
}
```

Field `title` bersifat opsional.

### Validation Rule

```text
title:
- nullable
- string
- max:100
```

### Response Success

```json
{
  "success": true,
  "message": "Chat session berhasil dibuat.",
  "data": {
    "id": 1,
    "title": "Percakapan Baru",
    "created_at": "2026-06-10T10:00:00.000000Z",
    "updated_at": "2026-06-10T10:00:00.000000Z"
  }
}
```

### Business Rule

```text
- Chat session harus terhubung dengan user login.
- Jika title tidak dikirim, gunakan default "Percakapan Baru".
- User tidak boleh membuat chat session untuk user lain.
```

### Acceptance Criteria

```text
- User login dapat membuat chat session.
- Chat session tersimpan ke database.
- chat_sessions.user_id berisi ID user login.
- Response mengembalikan data chat session yang dibuat.
```

---

## FR-02 — Menampilkan Daftar Chat Session

### Deskripsi

Sistem harus menyediakan endpoint untuk menampilkan daftar chat session milik user login.

### Endpoint

```http
GET /api/chat-sessions
```

Jika menggunakan versioning:

```http
GET /api/v1/chat-sessions
```

### Query Parameter

```text
page      optional
per_page  optional
search    optional
```

Contoh:

```http
GET /api/chat-sessions?page=1&per_page=10&search=laravel
```

### Response Success

```json
{
  "success": true,
  "message": "Daftar chat session berhasil diambil.",
  "data": [
    {
      "id": 1,
      "title": "Belajar Laravel Service Container",
      "last_message": "Service container adalah fitur Laravel...",
      "messages_count": 6,
      "created_at": "2026-06-10T10:00:00.000000Z",
      "updated_at": "2026-06-10T10:20:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 1
  }
}
```

### Business Rule

```text
- User hanya melihat chat session miliknya sendiri.
- Data diurutkan berdasarkan updated_at terbaru.
- Endpoint wajib menggunakan pagination.
- Search hanya mencari berdasarkan title.
- last_message diambil dari pesan terakhir dalam chat session.
```

### Acceptance Criteria

```text
- User login dapat melihat daftar chat miliknya.
- User tidak dapat melihat chat milik user lain.
- Response memiliki pagination meta.
- Data terbaru tampil paling atas.
```

---

## FR-03 — Menampilkan Detail Chat Session

### Deskripsi

Sistem harus menyediakan endpoint untuk mengambil detail satu chat session.

### Endpoint

```http
GET /api/chat-sessions/{id}
```

Jika menggunakan versioning:

```http
GET /api/v1/chat-sessions/{id}
```

### Response Success

```json
{
  "success": true,
  "message": "Detail chat session berhasil diambil.",
  "data": {
    "id": 1,
    "title": "Belajar Laravel Service Container",
    "messages_count": 6,
    "created_at": "2026-06-10T10:00:00.000000Z",
    "updated_at": "2026-06-10T10:20:00.000000Z"
  }
}
```

### Business Rule

```text
- User hanya dapat membuka detail chat session miliknya sendiri.
- Jika chat session tidak ditemukan, kembalikan 404.
- Jika chat session bukan milik user login, kembalikan 404 atau 403.
```

Rekomendasi: gunakan **404** agar tidak membocorkan keberadaan data milik user lain.

### Acceptance Criteria

```text
- Detail chat session dapat diambil jika milik user login.
- Chat milik user lain tidak dapat diakses.
- Response tidak mengandung data sensitif.
```

---

## FR-04 — Menampilkan Isi Percakapan

### Deskripsi

Sistem harus menyediakan endpoint untuk menampilkan seluruh pesan pada satu chat session.

### Endpoint

```http
GET /api/chat-sessions/{id}/messages
```

Jika menggunakan versioning:

```http
GET /api/v1/chat-sessions/{id}/messages
```

### Response Success

```json
{
  "success": true,
  "message": "Pesan chat berhasil diambil.",
  "data": [
    {
      "id": 1,
      "role": "user",
      "content": "Jelaskan apa itu API dengan bahasa sederhana.",
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

### Business Rule

```text
- User hanya dapat melihat pesan dari chat session miliknya.
- Pesan diurutkan dari paling lama ke paling baru.
- Pesan user memiliki role user.
- Pesan AI memiliki role assistant.
```

### Acceptance Criteria

```text
- Isi percakapan dapat ditampilkan.
- Urutan pesan benar.
- User tidak bisa melihat pesan dari chat session user lain.
```

---

## FR-05 — Mengirim Pesan User dan Generate Jawaban AI

### Deskripsi

Sistem harus menyediakan endpoint agar user dapat mengirim pesan ke AI pada chat session tertentu.

### Endpoint

```http
POST /api/chat-sessions/{id}/messages
```

Jika menggunakan versioning:

```http
POST /api/v1/chat-sessions/{id}/messages
```

### Request Body

```json
{
  "message": "Jelaskan apa itu Laravel Service Provider."
}
```

### Validation Rule

```text
message:
- required
- string
- min:2
- max:5000
```

### Response Success

```json
{
  "success": true,
  "message": "Pesan berhasil diproses.",
  "data": {
    "user_message": {
      "id": 10,
      "role": "user",
      "content": "Jelaskan apa itu Laravel Service Provider.",
      "created_at": "2026-06-10T10:30:00.000000Z"
    },
    "assistant_message": {
      "id": 11,
      "role": "assistant",
      "content": "Laravel Service Provider adalah tempat untuk mendaftarkan service ke dalam aplikasi...",
      "provider": "gemini",
      "model": "gemini-1.5-flash",
      "created_at": "2026-06-10T10:30:04.000000Z"
    }
  }
}
```

### Business Rule

```text
- User hanya dapat mengirim pesan ke chat session miliknya.
- Pesan user wajib disimpan terlebih dahulu.
- Setelah pesan user tersimpan, sistem memanggil GeminiService.
- Jawaban Gemini disimpan sebagai pesan assistant.
- provider untuk jawaban AI adalah "gemini".
- model diambil dari config services.gemini.model.
- updated_at chat session harus berubah setelah pesan baru dibuat.
```

### Acceptance Criteria

```text
- User dapat mengirim pesan valid.
- Pesan user tersimpan ke chat_messages.
- GeminiService dipanggil untuk generate jawaban.
- Jawaban AI tersimpan ke chat_messages.
- Response mengembalikan user_message dan assistant_message.
- User tidak bisa mengirim pesan ke chat session milik orang lain.
```

---

## FR-06 — Menyimpan Pesan User

### Deskripsi

Setiap pesan yang dikirim user harus disimpan ke database.

### Data yang Disimpan

```text
chat_session_id
role = user
content = isi pesan user
provider = null
model = null
metadata = null atau JSON opsional
created_at
updated_at
```

### Acceptance Criteria

```text
- Pesan user tersimpan sebelum request ke GeminiService.
- Jika penyimpanan pesan user gagal, request ke Gemini tidak boleh dilakukan.
- Pesan user terhubung ke chat session yang benar.
```

---

## FR-07 — Menyimpan Jawaban AI

### Deskripsi

Setiap jawaban dari Gemini harus disimpan sebagai pesan assistant.

### Data yang Disimpan

```text
chat_session_id
role = assistant
content = jawaban Gemini
provider = gemini
model = model dari config
metadata = null atau JSON opsional
created_at
updated_at
```

### Acceptance Criteria

```text
- Jawaban AI tersimpan setelah Gemini berhasil merespons.
- Jawaban AI memiliki role assistant.
- Provider dan model tersimpan dengan benar.
- Jawaban AI terhubung ke chat session yang benar.
```

---

## FR-08 — Menghapus Chat Session

### Deskripsi

Sistem harus menyediakan endpoint agar user dapat menghapus chat session miliknya.

### Endpoint

```http
DELETE /api/chat-sessions/{id}
```

Jika menggunakan versioning:

```http
DELETE /api/v1/chat-sessions/{id}
```

### Response Success

```json
{
  "success": true,
  "message": "Chat session berhasil dihapus.",
  "data": null
}
```

### Business Rule

```text
- User hanya dapat menghapus chat session miliknya sendiri.
- Ketika chat session dihapus, seluruh chat_messages terkait ikut dihapus.
- Data chat milik user lain tidak boleh terhapus.
```

### Acceptance Criteria

```text
- Chat session berhasil dihapus.
- Seluruh pesan dalam chat session tersebut ikut terhapus.
- User tidak dapat menghapus chat session milik user lain.
```

---

## FR-09 — Auto Generate Title Chat Session

### Deskripsi

Sistem dapat membuat judul chat session otomatis dari pesan pertama user.

### Business Rule

```text
- Jika chat session masih berjudul "Percakapan Baru", sistem dapat mengganti title dari pesan pertama user.
- Title otomatis diambil dari 40–60 karakter pertama pesan user.
- Jika pesan terlalu panjang, tambahkan "...".
```

### Contoh

Pesan user:

```text
Jelaskan perbedaan Laravel Service Container dan Service Provider dengan bahasa sederhana.
```

Title otomatis:

```text
Jelaskan perbedaan Laravel Service Container...
```

### Acceptance Criteria

```text
- Title otomatis dibuat setelah pesan pertama dikirim.
- Title tidak lebih dari 60 karakter.
- Title tidak berubah lagi setelah chat session memiliki title khusus.
```

---

# 7. Struktur Database

## 7.1 Tabel `chat_sessions`

### Fungsi

Menyimpan sesi percakapan milik user.

### Kolom

```text
id
user_id
title
created_at
updated_at
```

### Detail Kolom

| Kolom      | Tipe      | Keterangan                |
| ---------- | --------- | ------------------------- |
| id         | bigint    | Primary key               |
| user_id    | bigint    | Relasi ke users           |
| title      | varchar   | Judul percakapan          |
| created_at | timestamp | Waktu dibuat              |
| updated_at | timestamp | Waktu terakhir diperbarui |

### Index

```text
user_id
updated_at
```

### Relasi

```text
chat_sessions belongsTo users
chat_sessions hasMany chat_messages
```

---

## 7.2 Tabel `chat_messages`

### Fungsi

Menyimpan pesan user dan jawaban AI.

### Kolom

```text
id
chat_session_id
role
content
provider
model
metadata
created_at
updated_at
```

### Detail Kolom

| Kolom           | Tipe             | Keterangan                |
| --------------- | ---------------- | ------------------------- |
| id              | bigint           | Primary key               |
| chat_session_id | bigint           | Relasi ke chat_sessions   |
| role            | varchar          | user / assistant / system |
| content         | longText         | Isi pesan                 |
| provider        | varchar nullable | gemini untuk pesan AI     |
| model           | varchar nullable | model AI yang digunakan   |
| metadata        | json nullable    | Data tambahan             |
| created_at      | timestamp        | Waktu dibuat              |
| updated_at      | timestamp        | Waktu diperbarui          |

### Role

```text
user
assistant
system
```

### Index

```text
chat_session_id
role
created_at
```

### Relasi

```text
chat_messages belongsTo chat_sessions
```

---

# 8. Model dan Relasi

## 8.1 User Model

Tambahkan relasi:

```php
public function chatSessions()
{
    return $this->hasMany(ChatSession::class);
}
```

---

## 8.2 ChatSession Model

Relasi:

```php
public function user()
{
    return $this->belongsTo(User::class);
}

public function messages()
{
    return $this->hasMany(ChatMessage::class);
}
```

Fillable:

```php
protected $fillable = [
    'user_id',
    'title',
];
```

---

## 8.3 ChatMessage Model

Relasi:

```php
public function chatSession()
{
    return $this->belongsTo(ChatSession::class);
}
```

Fillable:

```php
protected $fillable = [
    'chat_session_id',
    'role',
    'content',
    'provider',
    'model',
    'metadata',
];
```

Cast:

```php
protected $casts = [
    'metadata' => 'array',
];
```

---

# 9. Struktur File Backend

Struktur file yang disarankan:

```text
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── ChatSessionController.php
│   │       └── ChatMessageController.php
│   │
│   └── Requests/
│       └── Chat/
│           ├── StoreChatSessionRequest.php
│           └── StoreChatMessageRequest.php
│
├── Services/
│   └── Chat/
│       └── ChatService.php
│
├── Models/
│   ├── ChatSession.php
│   └── ChatMessage.php
│
└── Exceptions/
    └── ExternalApiException.php
```

Migration:

```text
database/migrations/xxxx_xx_xx_xxxxxx_create_chat_sessions_table.php
database/migrations/xxxx_xx_xx_xxxxxx_create_chat_messages_table.php
```

---

# 10. Service Design

## 10.1 ChatService

### Lokasi

```text
app/Services/Chat/ChatService.php
```

### Tanggung Jawab

```text
- Membuat chat session
- Mengambil daftar chat session user
- Mengambil detail chat session
- Mengambil pesan dalam chat session
- Menyimpan pesan user
- Memanggil GeminiService
- Menyimpan jawaban AI
- Menghapus chat session
- Memastikan ownership user
- Auto generate title dari pesan pertama
```

### Method yang Disarankan

```php
public function createSession(User $user, ?string $title = null): ChatSession

public function getUserSessions(User $user, array $filters = [])

public function getSession(User $user, int $sessionId): ChatSession

public function getMessages(User $user, int $sessionId)

public function sendMessage(User $user, int $sessionId, string $message): array

public function deleteSession(User $user, int $sessionId): void
```

---

## 10.2 Alur Method `sendMessage()`

```text
1. Ambil chat session berdasarkan sessionId dan userId.
2. Simpan pesan user ke chat_messages.
3. Jika title masih default, update title dari pesan pertama.
4. Panggil GeminiService atau Gemini Facade.
5. Terima jawaban AI.
6. Simpan jawaban AI ke chat_messages.
7. Update updated_at chat session.
8. Return user_message dan assistant_message.
```

---

## 10.3 Penggunaan GeminiService

ChatService dapat menggunakan dependency injection:

```php
public function __construct(
    protected GeminiService $geminiService
) {}
```

Atau menggunakan Facade:

```php
$text = Gemini::generateText($message);
```

Rekomendasi untuk maintainability:

```text
Gunakan dependency injection agar lebih mudah dites.
```

---

# 11. Controller Design

## 11.1 ChatSessionController

### Lokasi

```text
app/Http/Controllers/Api/ChatSessionController.php
```

### Method

```php
index()
store(StoreChatSessionRequest $request)
show($id)
destroy($id)
```

### Tanggung Jawab

```text
- Menerima request terkait chat session
- Memanggil ChatService
- Mengembalikan response JSON standar
```

---

## 11.2 ChatMessageController

### Lokasi

```text
app/Http/Controllers/Api/ChatMessageController.php
```

### Method

```php
index($chatSessionId)
store(StoreChatMessageRequest $request, $chatSessionId)
```

### Tanggung Jawab

```text
- Menerima request pesan chat
- Memanggil ChatService
- Mengembalikan response JSON standar
```

---

# 12. Form Request

## 12.1 StoreChatSessionRequest

### Lokasi

```text
app/Http/Requests/Chat/StoreChatSessionRequest.php
```

### Rules

```php
[
    'title' => ['nullable', 'string', 'max:100'],
]
```

---

## 12.2 StoreChatMessageRequest

### Lokasi

```text
app/Http/Requests/Chat/StoreChatMessageRequest.php
```

### Rules

```php
[
    'message' => ['required', 'string', 'min:2', 'max:5000'],
]
```

---

# 13. Route Design

Jika tanpa versioning:

```php
use App\Http\Controllers\Api\ChatSessionController;
use App\Http\Controllers\Api\ChatMessageController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/chat-sessions', [ChatSessionController::class, 'index']);
    Route::post('/chat-sessions', [ChatSessionController::class, 'store']);
    Route::get('/chat-sessions/{id}', [ChatSessionController::class, 'show']);
    Route::delete('/chat-sessions/{id}', [ChatSessionController::class, 'destroy']);

    Route::get('/chat-sessions/{id}/messages', [ChatMessageController::class, 'index']);
    Route::post('/chat-sessions/{id}/messages', [ChatMessageController::class, 'store']);
});
```

Jika menggunakan versioning:

```php
use App\Http\Controllers\Api\ChatSessionController;
use App\Http\Controllers\Api\ChatMessageController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get('/chat-sessions', [ChatSessionController::class, 'index']);
    Route::post('/chat-sessions', [ChatSessionController::class, 'store']);
    Route::get('/chat-sessions/{id}', [ChatSessionController::class, 'show']);
    Route::delete('/chat-sessions/{id}', [ChatSessionController::class, 'destroy']);

    Route::get('/chat-sessions/{id}/messages', [ChatMessageController::class, 'index']);
    Route::post('/chat-sessions/{id}/messages', [ChatMessageController::class, 'store']);
});
```

---

# 14. API Contract Lengkap

## 14.1 Create Chat Session

```http
POST /api/chat-sessions
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

Body:

```json
{
  "title": "Percakapan Baru"
}
```

Response:

```json
{
  "success": true,
  "message": "Chat session berhasil dibuat.",
  "data": {
    "id": 1,
    "title": "Percakapan Baru",
    "created_at": "2026-06-10T10:00:00.000000Z",
    "updated_at": "2026-06-10T10:00:00.000000Z"
  }
}
```

---

## 14.2 Get Chat Sessions

```http
GET /api/chat-sessions?page=1&per_page=10&search=laravel
Authorization: Bearer {token}
Accept: application/json
```

Response:

```json
{
  "success": true,
  "message": "Daftar chat session berhasil diambil.",
  "data": [
    {
      "id": 1,
      "title": "Belajar Laravel Service Provider",
      "last_message": "Service Provider adalah bagian penting...",
      "messages_count": 4,
      "created_at": "2026-06-10T10:00:00.000000Z",
      "updated_at": "2026-06-10T10:20:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 1
  }
}
```

---

## 14.3 Get Chat Session Detail

```http
GET /api/chat-sessions/1
Authorization: Bearer {token}
Accept: application/json
```

Response:

```json
{
  "success": true,
  "message": "Detail chat session berhasil diambil.",
  "data": {
    "id": 1,
    "title": "Belajar Laravel Service Provider",
    "messages_count": 4,
    "created_at": "2026-06-10T10:00:00.000000Z",
    "updated_at": "2026-06-10T10:20:00.000000Z"
  }
}
```

---

## 14.4 Get Chat Messages

```http
GET /api/chat-sessions/1/messages
Authorization: Bearer {token}
Accept: application/json
```

Response:

```json
{
  "success": true,
  "message": "Pesan chat berhasil diambil.",
  "data": [
    {
      "id": 1,
      "role": "user",
      "content": "Apa itu Laravel Service Provider?",
      "provider": null,
      "model": null,
      "created_at": "2026-06-10T10:00:00.000000Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Laravel Service Provider adalah tempat untuk mendaftarkan service...",
      "provider": "gemini",
      "model": "gemini-1.5-flash",
      "created_at": "2026-06-10T10:00:04.000000Z"
    }
  ]
}
```

---

## 14.5 Send Message

```http
POST /api/chat-sessions/1/messages
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

Body:

```json
{
  "message": "Jelaskan dengan contoh sederhana."
}
```

Response:

```json
{
  "success": true,
  "message": "Pesan berhasil diproses.",
  "data": {
    "user_message": {
      "id": 3,
      "role": "user",
      "content": "Jelaskan dengan contoh sederhana.",
      "created_at": "2026-06-10T10:05:00.000000Z"
    },
    "assistant_message": {
      "id": 4,
      "role": "assistant",
      "content": "Contoh sederhananya, Service Provider seperti petugas registrasi...",
      "provider": "gemini",
      "model": "gemini-1.5-flash",
      "created_at": "2026-06-10T10:05:04.000000Z"
    }
  }
}
```

---

## 14.6 Delete Chat Session

```http
DELETE /api/chat-sessions/1
Authorization: Bearer {token}
Accept: application/json
```

Response:

```json
{
  "success": true,
  "message": "Chat session berhasil dihapus.",
  "data": null
}
```

---

# 15. Response Standard

Semua endpoint wajib menggunakan format response standar aplikasi.

## Success Response

```json
{
  "success": true,
  "message": "Request berhasil diproses.",
  "data": {}
}
```

## Error Response

```json
{
  "success": false,
  "message": "Terjadi kesalahan.",
  "errors": null
}
```

## Pagination Response

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

# 16. Error Handling

## 16.1 Unauthenticated

```json
{
  "success": false,
  "message": "Unauthenticated.",
  "errors": null
}
```

---

## 16.2 Validation Error

Contoh pesan kosong:

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "message": [
      "Pesan wajib diisi."
    ]
  }
}
```

---

## 16.3 Chat Session Tidak Ditemukan

```json
{
  "success": false,
  "message": "Chat session tidak ditemukan.",
  "errors": null
}
```

---

## 16.4 Mengakses Chat Milik User Lain

Rekomendasi response:

```json
{
  "success": false,
  "message": "Chat session tidak ditemukan.",
  "errors": null
}
```

Catatan: gunakan response 404 untuk menghindari informasi bahwa data tersebut sebenarnya ada tetapi milik user lain.

---

## 16.5 Gemini Gagal

```json
{
  "success": false,
  "message": "Layanan AI sedang mengalami gangguan. Silakan coba beberapa saat lagi.",
  "errors": null
}
```

---

# 17. Security Requirement

Kebutuhan keamanan modul:

```text
- Semua endpoint wajib menggunakan auth:sanctum.
- User hanya boleh mengakses chat session miliknya sendiri.
- Query chat session wajib difilter berdasarkan user_id.
- User tidak boleh mengirim pesan ke chat session milik user lain.
- User tidak boleh menghapus chat session milik user lain.
- Prompt user wajib divalidasi.
- API key Gemini tidak boleh terekspos.
- Error response tidak boleh menampilkan stack trace.
```

Contoh prinsip query:

```php
ChatSession::where('user_id', $user->id)->findOrFail($sessionId);
```

---

# 18. Performance Requirement

Kebutuhan performa:

```text
- Daftar chat session wajib menggunakan pagination.
- Query daftar chat session tidak boleh mengambil seluruh pesan.
- last_message sebaiknya diambil secara efisien.
- Isi pesan hanya diambil saat user membuka chat session tertentu.
- Request generate AI memiliki batas panjang prompt.
- Endpoint generate AI dapat diberi rate limit.
```

Rekomendasi rate limit:

```text
POST /api/chat-sessions/{id}/messages
20 request / menit / user
```

---

# 19. Reliability Requirement

Kebutuhan reliabilitas:

```text
- Jika pesan user gagal disimpan, GeminiService tidak boleh dipanggil.
- Jika Gemini gagal setelah pesan user tersimpan, sistem harus mengembalikan error rapi.
- Error Gemini harus dicatat pada log.
- Sistem tidak boleh crash jika GeminiService melempar ExternalApiException.
- Penghapusan chat session harus menghapus pesan terkait secara aman.
```

---

# 20. Transaction Requirement

Pada proses `sendMessage`, perlu diperhatikan konsistensi data.

Rekomendasi:

```text
- Simpan pesan user terlebih dahulu.
- Panggil GeminiService.
- Simpan jawaban AI.
```

Catatan penting:

Jika semua proses dibungkus dalam satu database transaction, request ke Gemini yang lambat dapat membuat transaksi database terbuka terlalu lama. Maka untuk MVP, pendekatan yang disarankan:

```text
1. Simpan pesan user.
2. Panggil GeminiService di luar transaksi panjang.
3. Simpan pesan assistant jika response berhasil.
4. Jika Gemini gagal, pesan user tetap tersimpan, tetapi response error dikembalikan.
```

Opsional improvement:

```text
Simpan pesan assistant dengan status failed jika Gemini gagal.
```

Namun untuk MVP, belum wajib.

---

# 21. Logging Requirement

Sistem harus mencatat log untuk kondisi berikut:

```text
- GeminiService gagal.
- User mencoba mengakses chat session yang bukan miliknya.
- Pesan gagal disimpan.
- Jawaban AI gagal disimpan.
```

Data log yang boleh dicatat:

```text
user_id
chat_session_id
provider
model
error_message
status_code jika tersedia
timestamp
```

Data yang tidak boleh dicatat:

```text
API key Gemini
Password user
Token autentikasi
Data sensitif user
```

---

# 22. Testing Scenario Backend

## TS-01 — Membuat Chat Session Berhasil

```text
Given user sudah login
When user request POST /api/chat-sessions
Then sistem membuat chat session baru
And chat session terhubung ke user login
```

---

## TS-02 — Menampilkan Daftar Chat Session

```text
Given user sudah login
And user memiliki beberapa chat session
When user request GET /api/chat-sessions
Then sistem mengembalikan daftar chat session milik user
And data memiliki pagination
```

---

## TS-03 — Menampilkan Detail Chat Session

```text
Given user sudah login
And chat session milik user tersedia
When user request GET /api/chat-sessions/{id}
Then sistem mengembalikan detail chat session
```

---

## TS-04 — Menampilkan Isi Percakapan

```text
Given user sudah login
And chat session memiliki beberapa pesan
When user request GET /api/chat-sessions/{id}/messages
Then sistem mengembalikan pesan sesuai urutan waktu
```

---

## TS-05 — Mengirim Pesan Berhasil

```text
Given user sudah login
And chat session milik user tersedia
And GeminiService berjalan normal
When user request POST /api/chat-sessions/{id}/messages
Then pesan user tersimpan
And jawaban AI tersimpan
And response mengembalikan user_message dan assistant_message
```

---

## TS-06 — Mengirim Pesan Kosong

```text
Given user sudah login
When user request POST /api/chat-sessions/{id}/messages dengan message kosong
Then sistem mengembalikan error validasi
And GeminiService tidak dipanggil
```

---

## TS-07 — Mengirim Pesan ke Chat User Lain

```text
Given user A sudah login
And chat session milik user B tersedia
When user A request POST /api/chat-sessions/{id}/messages
Then sistem mengembalikan 404 atau forbidden
And pesan tidak tersimpan
And GeminiService tidak dipanggil
```

---

## TS-08 — Gemini Gagal

```text
Given user sudah login
And chat session milik user tersedia
And GeminiService gagal
When user mengirim pesan
Then pesan user tetap tersimpan
And jawaban AI tidak tersimpan
And sistem mengembalikan error AI yang rapi
And error dicatat pada log
```

---

## TS-09 — Hapus Chat Session Berhasil

```text
Given user sudah login
And chat session milik user tersedia
When user request DELETE /api/chat-sessions/{id}
Then chat session terhapus
And semua chat message terkait ikut terhapus
```

---

## TS-10 — Hapus Chat Session Milik User Lain

```text
Given user A sudah login
And chat session milik user B tersedia
When user A request DELETE /api/chat-sessions/{id}
Then sistem mengembalikan 404 atau forbidden
And data chat session user B tidak terhapus
```

---

# 23. Acceptance Criteria Keseluruhan Modul

Modul Generate Teks / Chatbot Backend dianggap selesai jika:

```text
- User dapat membuat chat session.
- User dapat melihat daftar chat session miliknya.
- User dapat melihat detail chat session miliknya.
- User dapat melihat isi percakapan.
- User dapat mengirim pesan ke AI.
- Pesan user tersimpan ke database.
- Backend memanggil GeminiService untuk generate jawaban.
- Jawaban AI tersimpan ke database.
- User dapat menghapus chat session miliknya.
- Semua pesan dalam chat session ikut terhapus saat session dihapus.
- User tidak bisa mengakses chat milik user lain.
- Semua endpoint menggunakan auth:sanctum.
- Validasi request menggunakan Form Request.
- Logika bisnis berada di ChatService.
- Controller tetap tipis.
- Response menggunakan format JSON standar.
- Error Gemini ditangani dengan rapi.
```

---

# 24. Deliverable Backend

File dan komponen yang harus tersedia:

```text
1. Migration chat_sessions
2. Migration chat_messages
3. Model ChatSession
4. Model ChatMessage
5. Relasi User ke ChatSession
6. ChatService
7. ChatSessionController
8. ChatMessageController
9. StoreChatSessionRequest
10. StoreChatMessageRequest
11. Route API chat session
12. Route API chat message
13. Endpoint create chat session
14. Endpoint list chat session
15. Endpoint detail chat session
16. Endpoint list messages
17. Endpoint send message
18. Endpoint delete chat session
19. Ownership validation
20. Error handling Gemini
21. Response JSON standar
```

---

# 25. Prioritas Implementasi

Urutan implementasi yang disarankan:

```text
1. Buat migration chat_sessions.
2. Buat migration chat_messages.
3. Buat model ChatSession.
4. Buat model ChatMessage.
5. Tambahkan relasi pada User model.
6. Buat StoreChatSessionRequest.
7. Buat StoreChatMessageRequest.
8. Buat ChatService.
9. Implementasikan createSession().
10. Implementasikan getUserSessions().
11. Implementasikan getSession().
12. Implementasikan getMessages().
13. Implementasikan sendMessage().
14. Implementasikan deleteSession().
15. Buat ChatSessionController.
16. Buat ChatMessageController.
17. Tambahkan route API.
18. Test create chat session.
19. Test send message dengan GeminiService.
20. Test riwayat chat.
21. Test ownership validation.
22. Test delete chat session.
23. Test error Gemini.
```

---

# 26. Catatan Implementasi

## 26.1 Jangan Panggil Gemini dari Controller

Tidak disarankan:

```php
public function store(Request $request)
{
    $response = Gemini::generateText($request->message);
}
```

Disarankan:

```php
public function store(StoreChatMessageRequest $request, int $id)
{
    $result = $this->chatService->sendMessage(
        $request->user(),
        $id,
        $request->validated('message')
    );

    return ApiResponse::success($result, 'Pesan berhasil diproses.');
}
```

---

## 26.2 Ownership Validation Wajib Ada

Setiap query chat session harus berdasarkan user login.

Contoh:

```php
$session = ChatSession::where('user_id', $user->id)
    ->findOrFail($sessionId);
```

Jangan menggunakan:

```php
$session = ChatSession::findOrFail($sessionId);
```

Karena itu dapat membuka peluang user mengakses data user lain.

---

## 26.3 Response Message Sebaiknya Dirapikan

Response tidak perlu mengirim semua field database. Kirim hanya field yang dibutuhkan:

```text
id
role
content
provider
model
created_at
```

---

# 27. Kesimpulan

Modul **Generate Teks / Chatbot Backend** adalah modul inti yang menghubungkan fitur chat user dengan GeminiService.

Dengan modul ini, backend sudah mampu:

```text
Membuat chat session
↓
Menerima pesan user
↓
Menyimpan pesan user
↓
Memanggil GeminiService
↓
Menyimpan jawaban AI
↓
Menampilkan riwayat percakapan
↓
Menghapus chat session
```

Modul ini harus tetap mengikuti pola arsitektur backend:

```text
Route API
↓
Controller
↓
Form Request
↓
ChatService
↓
GeminiService
↓
Database
```

Dengan struktur ini, fitur chatbot akan lebih rapi, aman, mudah diuji, dan siap dikonsumsi oleh frontend React pada tahap berikutnya.
