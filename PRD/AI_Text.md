# PRD Spesifik — Phase 2: AI Text Chat

## Modul Integrasi Gemini API, Generate Teks/Chatbot, dan Riwayat Chat

---

# 1. Ringkasan Modul

**Phase 2 — AI Text Chat** adalah tahap pengembangan fitur utama aplikasi yang memungkinkan pengguna melakukan percakapan dengan AI menggunakan **Gemini API**.

Pada phase ini, sistem belum membahas generate gambar, payment, pricing plan, maupun galeri gambar. Fokus utama hanya pada:

```text
1. Integrasi Laravel Backend dengan Gemini API.
2. Fitur generate teks/chatbot.
3. Penyimpanan dan penampilan riwayat chat.
```

Frontend React akan bertugas menampilkan antarmuka chat, sedangkan Laravel akan bertugas sebagai backend yang memvalidasi request, menyimpan percakapan, memanggil Gemini API, dan mengembalikan response ke frontend.

---

# 2. Tujuan Modul

Tujuan utama Phase 2 adalah membangun fitur chatbot AI yang stabil, rapi, dan siap dikembangkan lebih lanjut.

Tujuan spesifik:

1. Backend Laravel dapat terhubung ke Gemini API.
2. User dapat membuat sesi percakapan baru.
3. User dapat mengirim prompt teks ke chatbot.
4. Sistem dapat menghasilkan jawaban dari Gemini.
5. Sistem menyimpan pesan user dan jawaban AI ke database.
6. User dapat melihat daftar riwayat chat.
7. User dapat membuka kembali isi percakapan sebelumnya.
8. User dapat menghapus sesi chat miliknya.
9. Sistem dapat menangani error dari Gemini dengan rapi.
10. Frontend React dapat mengonsumsi API chat secara konsisten.

---

# 3. Scope Modul

## 3.1 In Scope

Fitur yang termasuk dalam Phase 2:

```text
- Konfigurasi Gemini API di Laravel
- GeminiService
- Gemini Facade
- AIServiceProvider
- ChatSession model
- ChatMessage model
- Migration tabel chat_sessions
- Migration tabel chat_messages
- API membuat chat session
- API menampilkan daftar chat session
- API menampilkan detail chat session
- API mengirim pesan ke AI
- API menyimpan pesan user
- API menyimpan jawaban AI
- API menghapus chat session
- Ownership check agar user hanya mengakses chat miliknya
- Error handling Gemini
- Response JSON standar
```

---

## 3.2 Out of Scope

Fitur berikut tidak dikerjakan pada Phase 2:

```text
- Generate gambar
- Cloudflare Worker AI
- Pricing plan
- Kuota gambar
- Payment Midtrans
- Galeri gambar
- Admin monitoring
- Streaming response AI secara real-time
- Upload file untuk dianalisis AI
- Voice input
- Voice output
- Multi-model selection oleh user
```

---

# 4. Aktor yang Terlibat

## 4.1 Registered User

User yang sudah login dapat:

```text
- Membuat chat session baru
- Mengirim pesan ke chatbot
- Menerima jawaban AI
- Melihat riwayat chat
- Membuka percakapan lama
- Menghapus chat session miliknya
```

---

## 4.2 System

Sistem bertugas:

```text
- Memvalidasi input prompt
- Menyimpan pesan user
- Mengirim prompt ke Gemini API
- Menerima response dari Gemini API
- Menyimpan jawaban AI
- Mengembalikan response ke frontend
- Menangani error jika Gemini gagal
```

---

# 5. Alur Utama Fitur

## 5.1 Alur Membuat Chat Session Baru

```text
User login
↓
User membuka halaman chatbot
↓
User klik "New Chat"
↓
React mengirim request ke Laravel
↓
Laravel membuat data chat_sessions
↓
Laravel mengembalikan data chat session baru
↓
React menampilkan halaman chat kosong
```

---

## 5.2 Alur Generate Teks / Chatbot

```text
User mengetik prompt di React
↓
React mengirim prompt ke Laravel API
↓
Laravel memvalidasi prompt
↓
Laravel mengecek kepemilikan chat session
↓
Laravel menyimpan pesan user ke database
↓
Laravel memanggil Gemini API melalui GeminiService
↓
Gemini mengembalikan jawaban
↓
Laravel menyimpan jawaban AI ke database
↓
Laravel mengirim response ke React
↓
React menampilkan jawaban AI dalam chat bubble
```

---

## 5.3 Alur Melihat Riwayat Chat

```text
User membuka halaman chat
↓
React request daftar chat session
↓
Laravel mengambil chat session milik user
↓
Laravel mengembalikan daftar chat session
↓
React menampilkan daftar riwayat di sidebar
```

---

## 5.4 Alur Membuka Chat Lama

```text
User memilih salah satu chat session
↓
React request detail pesan chat
↓
Laravel mengecek kepemilikan chat session
↓
Laravel mengambil semua pesan pada session tersebut
↓
Laravel mengembalikan data pesan
↓
React menampilkan isi percakapan
```

---

## 5.5 Alur Menghapus Chat Session

```text
User klik delete chat
↓
React mengirim request delete
↓
Laravel mengecek kepemilikan chat
↓
Laravel menghapus chat session dan seluruh pesan terkait
↓
Laravel mengembalikan response sukses
↓
React menghapus chat dari sidebar
```

---

# 6. Kebutuhan Fungsional

## FR-01 — Konfigurasi Gemini API

Sistem harus menyediakan konfigurasi Gemini API melalui `.env` dan `config/services.php`.

Environment variable:

```env
GEMINI_API_KEY=
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIMEOUT=30
```

Konfigurasi di `config/services.php`:

```php
'gemini' => [
    'api_key' => env('GEMINI_API_KEY'),
    'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
    'model' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
    'timeout' => env('GEMINI_TIMEOUT', 30),
],
```

Acceptance Criteria:

```text
- API key tidak ditulis langsung di source code.
- Model Gemini dapat diganti melalui .env.
- Timeout request dapat dikonfigurasi.
- Jika API key kosong, sistem mengembalikan error yang jelas.
```

---

## FR-02 — GeminiService

Sistem harus memiliki service khusus untuk komunikasi dengan Gemini API.

Lokasi file:

```text
app/Services/AI/GeminiService.php
```

Tanggung jawab GeminiService:

```text
- Menerima prompt dari ChatService
- Menyiapkan payload request Gemini
- Mengirim request menggunakan Laravel HTTP Client
- Mengatur timeout
- Menangani response gagal
- Mengekstrak teks jawaban dari response Gemini
- Melempar custom exception jika terjadi error
```

Contoh method utama:

```php
public function generateText(string $prompt): string
{
    //
}
```

Acceptance Criteria:

```text
- Controller tidak memanggil Gemini API secara langsung.
- Semua request ke Gemini dilakukan melalui GeminiService.
- Jika Gemini gagal, service melempar ExternalApiException.
- Response Gemini diparsing menjadi string jawaban yang siap disimpan.
```

---

## FR-03 — Gemini Facade

Sistem dapat menyediakan Facade agar GeminiService dapat dipanggil secara ringkas.

Lokasi file:

```text
app/Facades/Gemini.php
```

Contoh penggunaan:

```php
Gemini::generateText($prompt);
```

Acceptance Criteria:

```text
- Facade memiliki accessor yang sesuai dengan binding service container.
- Facade dapat memanggil method generateText.
- Facade tidak menyimpan logika bisnis.
```

---

## FR-04 — AIServiceProvider

Sistem harus mendaftarkan GeminiService ke Service Container melalui Service Provider.

Lokasi file:

```text
app/Providers/AIServiceProvider.php
```

Binding:

```php
$this->app->singleton('gemini', function () {
    return new GeminiService();
});
```

Acceptance Criteria:

```text
- GeminiService terdaftar di service container.
- Facade Gemini dapat mengakses service yang terdaftar.
- Provider terdaftar di konfigurasi Laravel.
```

---

## FR-05 — Membuat Chat Session

User dapat membuat sesi chat baru.

Endpoint:

```http
POST /api/v1/chat-sessions
```

Request body opsional:

```json
{
  "title": "Percakapan Baru"
}
```

Response sukses:

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

Acceptance Criteria:

```text
- Endpoint hanya dapat diakses oleh user yang login.
- Chat session otomatis terhubung ke user login.
- Jika title kosong, sistem menggunakan default "Percakapan Baru".
- User tidak bisa membuat chat session untuk user lain.
```

---

## FR-06 — Menampilkan Daftar Chat Session

User dapat melihat daftar chat session miliknya.

Endpoint:

```http
GET /api/v1/chat-sessions
```

Query opsional:

```text
?page=1&per_page=10&search=keyword
```

Response:

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

Acceptance Criteria:

```text
- User hanya melihat chat session miliknya.
- Data diurutkan berdasarkan updated_at terbaru.
- Mendukung pagination.
- Mendukung pencarian berdasarkan title.
```

---

## FR-07 — Menampilkan Detail Chat Session

User dapat melihat detail satu chat session.

Endpoint:

```http
GET /api/v1/chat-sessions/{id}
```

Response:

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

Acceptance Criteria:

```text
- User hanya bisa membuka chat session miliknya.
- Jika chat session bukan miliknya, sistem mengembalikan 403 atau 404.
- Jika chat session tidak ditemukan, sistem mengembalikan error 404.
```

---

## FR-08 — Menampilkan Pesan dalam Chat Session

User dapat melihat semua pesan dalam satu chat session.

Endpoint:

```http
GET /api/v1/chat-sessions/{id}/messages
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
      "content": "Buatkan ide konten tentang session dan cookie.",
      "provider": null,
      "model": null,
      "created_at": "2026-06-10T10:00:00.000000Z"
    },
    {
      "id": 2,
      "role": "assistant",
      "content": "Berikut ide konten yang bisa kamu gunakan...",
      "provider": "gemini",
      "model": "gemini-1.5-flash",
      "created_at": "2026-06-10T10:00:05.000000Z"
    }
  ]
}
```

Acceptance Criteria:

```text
- User hanya bisa melihat pesan dari chat session miliknya.
- Pesan diurutkan dari yang paling lama ke paling baru.
- Response berisi role user dan assistant.
```

---

## FR-09 — Mengirim Pesan dan Generate Jawaban AI

User dapat mengirim pesan ke AI dalam chat session tertentu.

Endpoint:

```http
POST /api/v1/chat-sessions/{id}/messages
```

Request body:

```json
{
  "message": "Jelaskan apa itu API dengan bahasa sederhana."
}
```

Validasi:

```text
message wajib diisi
message harus string
message minimal 2 karakter
message maksimal 5000 karakter
```

Response sukses:

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

Acceptance Criteria:

```text
- Endpoint hanya dapat diakses oleh user login.
- User hanya dapat mengirim pesan ke chat session miliknya.
- Pesan user disimpan sebelum request ke Gemini.
- Jawaban AI disimpan setelah Gemini berhasil merespons.
- Jika Gemini gagal, pesan user tetap boleh tersimpan, tetapi sistem harus mengembalikan error yang rapi.
- Chat session updated_at berubah setelah pesan baru dibuat.
```

---

## FR-10 — Auto Generate Title Chat Session

Sistem dapat membuat judul otomatis dari pesan pertama user.

Pendekatan MVP:

```text
Jika chat session masih berjudul "Percakapan Baru", sistem mengambil 40-60 karakter pertama dari pesan pertama user sebagai title.
```

Contoh:

Prompt:

```text
Buatkan ide konten tentang cara website mengingat user melalui session dan cookie
```

Title otomatis:

```text
Buatkan ide konten tentang cara website...
```

Acceptance Criteria:

```text
- Title otomatis dibuat dari pesan pertama.
- Title tidak terlalu panjang.
- User tetap bisa mengganti title nanti jika fitur rename dibuat.
```

Catatan: fitur rename chat session boleh dibuat pada Phase 2 atau ditunda ke improvement.

---

## FR-11 — Menghapus Chat Session

User dapat menghapus chat session miliknya.

Endpoint:

```http
DELETE /api/v1/chat-sessions/{id}
```

Response:

```json
{
  "success": true,
  "message": "Chat session berhasil dihapus.",
  "data": null
}
```

Acceptance Criteria:

```text
- User hanya bisa menghapus chat session miliknya.
- Ketika chat session dihapus, semua chat_messages terkait ikut terhapus.
- Jika data tidak ditemukan, sistem mengembalikan 404.
```

---

# 7. Kebutuhan Non-Fungsional

## 7.1 Security

```text
- Gemini API key wajib disimpan di .env.
- Frontend React tidak boleh mengetahui Gemini API key.
- Endpoint chat wajib menggunakan auth middleware.
- User tidak boleh mengakses chat session milik user lain.
- Validasi input wajib dilakukan sebelum request ke Gemini.
- Response error tidak boleh membocorkan API key, stack trace, atau detail internal.
```

---

## 7.2 Performance

```text
- Daftar chat session wajib menggunakan pagination.
- Request ke Gemini wajib memiliki timeout.
- Endpoint pesan tidak boleh mengambil semua session sekaligus.
- Response API harus ringan dan hanya mengirim data yang dibutuhkan frontend.
- Chat message panjang dibatasi maksimal 5000 karakter pada MVP.
```

---

## 7.3 Reliability

```text
- Jika Gemini timeout, sistem mengembalikan error yang mudah dipahami.
- Jika Gemini mengembalikan response kosong, sistem mengembalikan fallback message.
- Jika database gagal menyimpan pesan, sistem tidak boleh memanggil Gemini.
- Jika Gemini gagal setelah pesan user tersimpan, sistem mencatat error pada log.
```

---

## 7.4 Maintainability

```text
- Controller harus tipis.
- Logika generate chat berada di ChatService.
- Komunikasi Gemini berada di GeminiService.
- Validasi request berada di Form Request.
- Response menggunakan ApiResponse helper.
- Error external API menggunakan ExternalApiException.
```

---

# 8. Struktur Database

## 8.1 Tabel `chat_sessions`

Fungsi: menyimpan sesi percakapan user.

Kolom:

```text
id
user_id
title
created_at
updated_at
```

Relasi:

```text
chat_sessions belongsTo users
chat_sessions hasMany chat_messages
```

Index yang disarankan:

```text
user_id
updated_at
```

---

## 8.2 Tabel `chat_messages`

Fungsi: menyimpan pesan user dan jawaban AI.

Kolom:

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

Penjelasan kolom:

```text
chat_session_id : relasi ke chat_sessions
role            : user / assistant / system
content         : isi pesan
provider        : gemini untuk jawaban AI, null untuk pesan user
model           : model AI yang digunakan
metadata        : JSON opsional untuk menyimpan data tambahan
```

Role:

```text
user
assistant
system
```

Index yang disarankan:

```text
chat_session_id
created_at
```

---

# 9. Model dan Relasi

## 9.1 User Model

Relasi:

```php
public function chatSessions()
{
    return $this->hasMany(ChatSession::class);
}
```

---

## 9.2 ChatSession Model

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

---

## 9.3 ChatMessage Model

Relasi:

```php
public function chatSession()
{
    return $this->belongsTo(ChatSession::class);
}
```

---

# 10. Struktur Backend Laravel

Struktur yang digunakan untuk Phase 2:

```text
app/
├── Facades/
│   └── Gemini.php
│
├── Services/
│   ├── AI/
│   │   └── GeminiService.php
│   │
│   └── Chat/
│       └── ChatService.php
│
├── Providers/
│   └── AIServiceProvider.php
│
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
├── Models/
│   ├── ChatSession.php
│   └── ChatMessage.php
│
└── Exceptions/
    └── ExternalApiException.php
```

---

# 11. Service Design

## 11.1 GeminiService

Tanggung jawab:

```text
- Menangani komunikasi dengan Gemini API.
- Mengubah prompt menjadi payload Gemini.
- Mengambil jawaban dari response Gemini.
- Menangani error dari Gemini.
```

Method:

```php
generateText(string $prompt): string
```

Opsional untuk pengembangan berikutnya:

```php
generateChatResponse(array $messages): string
```

Catatan: untuk MVP, cukup kirim prompt terakhir. Untuk versi yang lebih baik, sistem dapat mengirim beberapa pesan terakhir sebagai konteks.

---

## 11.2 ChatService

Tanggung jawab:

```text
- Membuat chat session
- Mengambil daftar chat session user
- Mengambil pesan dalam chat session
- Menyimpan pesan user
- Memanggil GeminiService
- Menyimpan jawaban assistant
- Menghapus chat session
- Memastikan ownership user
```

Method yang disarankan:

```php
createSession(User $user, ?string $title = null): ChatSession

getUserSessions(User $user, array $filters = [])

getSessionMessages(User $user, ChatSession $session)

sendMessage(User $user, ChatSession $session, string $message): array

deleteSession(User $user, ChatSession $session): void
```

---

# 12. API Contract

## 12.1 Create Chat Session

```http
POST /api/v1/chat-sessions
Authorization: Bearer {token}
```

Body:

```json
{
  "title": "Percakapan Baru"
}
```

---

## 12.2 Get Chat Sessions

```http
GET /api/v1/chat-sessions?page=1&per_page=10&search=konten
Authorization: Bearer {token}
```

---

## 12.3 Get Chat Session Detail

```http
GET /api/v1/chat-sessions/{id}
Authorization: Bearer {token}
```

---

## 12.4 Get Chat Messages

```http
GET /api/v1/chat-sessions/{id}/messages
Authorization: Bearer {token}
```

---

## 12.5 Send Message

```http
POST /api/v1/chat-sessions/{id}/messages
Authorization: Bearer {token}
```

Body:

```json
{
  "message": "Apa itu Laravel service container?"
}
```

---

## 12.6 Delete Chat Session

```http
DELETE /api/v1/chat-sessions/{id}
Authorization: Bearer {token}
```

---

# 13. Komunikasi Frontend dan Backend

## 13.1 Saat Halaman Chat Dibuka

```text
React memanggil:
GET /api/v1/chat-sessions

Laravel mengembalikan:
Daftar chat session user

React menampilkan:
Sidebar riwayat chat
```

---

## 13.2 Saat User Klik New Chat

```text
React memanggil:
POST /api/v1/chat-sessions

Laravel mengembalikan:
Data chat session baru

React menampilkan:
Area chat kosong untuk session tersebut
```

---

## 13.3 Saat User Mengirim Pesan

```text
React menambahkan bubble user sementara
↓
React menampilkan loading bubble assistant
↓
React memanggil:
POST /api/v1/chat-sessions/{id}/messages
↓
Laravel menyimpan pesan user
↓
Laravel memanggil Gemini
↓
Laravel menyimpan jawaban AI
↓
Laravel mengirim response
↓
React mengganti loading bubble dengan jawaban AI
```

---

## 13.4 Saat User Membuka Chat Lama

```text
React memanggil:
GET /api/v1/chat-sessions/{id}/messages

Laravel mengembalikan:
Daftar pesan dalam session

React menampilkan:
Semua chat bubble berdasarkan role
```

---

## 13.5 Saat User Menghapus Chat

```text
React memanggil:
DELETE /api/v1/chat-sessions/{id}

Laravel menghapus:
Chat session dan semua message

React menghapus:
Item chat dari sidebar
```

---

# 14. Frontend Requirement untuk Phase 2

Walaupun fokus utama Phase 2 adalah backend, frontend perlu menyesuaikan alur API.

Komponen React yang dibutuhkan:

```text
ChatPage
ChatSidebar
ChatWindow
ChatBubble
ChatInput
NewChatButton
ChatLoadingBubble
```

State yang perlu dikelola:

```text
activeChatSessionId
chatSessions
messages
isSendingMessage
isLoadingSessions
isLoadingMessages
errorMessage
```

Rekomendasi pengelolaan data:

```text
TanStack Query untuk API fetching
Zustand/Context untuk auth state
Axios instance untuk bearer token
```

---

# 15. Error Handling

## 15.1 Validation Error

Jika prompt kosong:

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

## 15.2 Unauthorized

Jika token tidak ada:

```json
{
  "success": false,
  "message": "Unauthenticated.",
  "errors": null
}
```

---

## 15.3 Forbidden / Ownership Error

Jika user mencoba mengakses chat milik orang lain:

```json
{
  "success": false,
  "message": "Anda tidak memiliki akses ke percakapan ini.",
  "errors": null
}
```

---

## 15.4 Gemini Error

Jika Gemini gagal:

```json
{
  "success": false,
  "message": "Layanan AI sedang mengalami gangguan. Silakan coba beberapa saat lagi.",
  "errors": null
}
```

---

# 16. Logging Requirement

Sistem perlu mencatat log untuk kasus berikut:

```text
- Gemini API timeout
- Gemini API failed response
- Response Gemini kosong
- User mencoba mengakses chat session milik user lain
- Error saat menyimpan chat message
```

Contoh log context:

```text
user_id
chat_session_id
provider
model
error_message
timestamp
```

---

# 17. Rate Limiting

Endpoint generate chat perlu dibatasi agar tidak disalahgunakan.

Rekomendasi:

```text
POST /chat-sessions/{id}/messages
20 request / menit / user
```

Endpoint list/detail:

```text
60 request / menit / user
```

Jika rate limit terlampaui:

```json
{
  "success": false,
  "message": "Terlalu banyak request. Silakan coba lagi nanti.",
  "errors": null
}
```

---

# 18. Data Ownership Rule

Aturan penting:

```text
Semua chat session dan chat message wajib dimiliki oleh user tertentu.
```

Maka:

```text
- User A tidak boleh melihat chat session User B.
- User A tidak boleh mengirim pesan ke session User B.
- User A tidak boleh menghapus session User B.
- Query database harus selalu difilter berdasarkan user_id.
```

Contoh prinsip query:

```php
ChatSession::where('user_id', $user->id)->findOrFail($id);
```

---

# 19. MVP Behavior

Untuk versi MVP Phase 2, perilaku sistem dibuat sederhana:

```text
- User membuat chat session.
- User mengirim prompt.
- Sistem mengirim prompt terakhir ke Gemini.
- Sistem menyimpan pesan user dan jawaban assistant.
- Riwayat chat dapat dibuka kembali.
```

Belum wajib:

```text
- Streaming response
- Memory percakapan panjang
- Token counting
- Model selector
- Regenerate answer
- Edit message
```

---

# 20. Future Improvement

Setelah MVP stabil, fitur lanjutan yang dapat ditambahkan:

```text
- Rename chat session
- Regenerate AI response
- Delete individual message
- Edit prompt lalu generate ulang
- Streaming response seperti ChatGPT
- Kirim beberapa pesan terakhir sebagai context
- Token usage tracking
- Favorite chat
- Export chat ke PDF/TXT
- Search isi chat message
```

---

# 21. Acceptance Criteria Keseluruhan Phase 2

Phase 2 dianggap selesai jika:

```text
- Gemini API berhasil dikonfigurasi melalui .env.
- GeminiService dapat menghasilkan teks dari prompt.
- GeminiService dipanggil melalui service layer, bukan langsung dari controller.
- User dapat membuat chat session baru.
- User dapat mengirim pesan dalam chat session.
- Sistem menyimpan pesan user.
- Sistem menyimpan jawaban assistant.
- User dapat melihat daftar chat session miliknya.
- User dapat membuka isi percakapan lama.
- User dapat menghapus chat session miliknya.
- User tidak bisa mengakses chat milik user lain.
- Response API konsisten menggunakan format success/error.
- Error dari Gemini ditangani dengan rapi.
- Endpoint chat dilindungi auth middleware.
```

---

# 22. Deliverable Phase 2

Output teknis yang harus selesai:

```text
1. Gemini API configuration
2. AIServiceProvider
3. GeminiService
4. Gemini Facade
5. ChatSession migration
6. ChatMessage migration
7. ChatSession model
8. ChatMessage model
9. ChatService
10. ChatSessionController
11. ChatMessageController
12. StoreChatSessionRequest
13. StoreChatMessageRequest
14. API routes untuk chat
15. Ownership validation
16. Error handling Gemini
17. Logging Gemini error
18. API documentation sederhana untuk frontend
```

---

# 23. Prioritas Implementasi

Urutan implementasi yang paling aman:

```text
1. Tambahkan config Gemini di .env dan config/services.php
2. Buat GeminiService
3. Buat AIServiceProvider
4. Buat Gemini Facade
5. Test GeminiService secara manual
6. Buat migration chat_sessions
7. Buat migration chat_messages
8. Buat model dan relasi
9. Buat ChatService
10. Buat Form Request
11. Buat ChatSessionController
12. Buat ChatMessageController
13. Buat API routes
14. Test create session
15. Test send message
16. Test get messages
17. Test list sessions
18. Test delete session
19. Test ownership user
20. Test error Gemini
```

---

# 24. Kesimpulan

Phase 2 berfokus pada pembangunan fitur inti aplikasi, yaitu **AI Text Chat**.

Target akhir dari phase ini adalah:

```text
User dapat login, membuat percakapan, mengirim prompt, menerima jawaban Gemini, dan membuka kembali riwayat chat.
```

Backend Laravel harus tetap mengikuti arsitektur:

```text
Controller
↓
Form Request
↓
ChatService
↓
GeminiService
↓
Gemini API
```

Dengan pendekatan ini, fitur chatbot akan lebih rapi, mudah diuji, dan siap dikembangkan ke tahap berikutnya seperti pricing plan, payment, generate gambar, dan galeri.
