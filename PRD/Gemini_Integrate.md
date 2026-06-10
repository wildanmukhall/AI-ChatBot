# PRD Backend — Modul Integrasi Gemini API

## 1. Ringkasan Modul

**Modul Integrasi Gemini API** adalah modul backend Laravel yang berfungsi sebagai penghubung antara aplikasi dengan layanan **Google Gemini API**.

Modul ini belum membahas fitur chatbot secara penuh seperti chat session, riwayat chat, atau penyimpanan pesan. Fokus modul ini hanya pada pembuatan service integrasi agar backend mampu:

```text
1. Menerima prompt teks dari internal aplikasi.
2. Mengirim prompt tersebut ke Gemini API.
3. Menerima response teks dari Gemini.
4. Mengembalikan hasil response ke service/modul lain.
5. Menangani error jika Gemini gagal merespons.
```

Output utama modul:

```text
Backend sudah bisa mengirim prompt ke Gemini dan menerima response teks.
```

---

# 2. Tujuan Modul

Tujuan pengembangan Modul Integrasi Gemini API adalah:

```text
1. Menyediakan service khusus untuk komunikasi dengan Gemini API.
2. Menyimpan konfigurasi Gemini secara aman melalui .env.
3. Menggunakan Laravel HTTP Client sebagai standar request ke API eksternal.
4. Menyediakan Facade agar service Gemini dapat dipanggil dengan rapi.
5. Mendaftarkan GeminiService ke Laravel Service Container melalui AIServiceProvider.
6. Menangani timeout, failed response, dan error dari Gemini.
7. Menghasilkan response teks yang siap digunakan oleh modul Chatbot.
```

---

# 3. Scope Backend

## 3.1 In Scope

Yang dikembangkan pada modul ini:

```text
- GeminiService
- Gemini Facade
- AIServiceProvider
- Konfigurasi Gemini di .env
- Konfigurasi Gemini di config/services.php
- Request ke Gemini menggunakan Laravel HTTP Client
- Timeout request
- Retry sederhana jika diperlukan
- Error handling jika Gemini gagal
- Custom exception untuk external API error
- Logging error Gemini
- Method generateText()
- Endpoint testing internal opsional untuk validasi koneksi Gemini
```

---

## 3.2 Out of Scope

Yang tidak dikembangkan pada modul ini:

```text
- Chat session
- Chat message
- Riwayat chat
- Penyimpanan prompt ke database
- Penyimpanan response AI ke database
- UI frontend
- Streaming response AI
- Multi-turn conversation
- Token usage tracking
- Generate gambar
- Cloudflare Worker AI
- Payment Midtrans
- Pricing plan
- Kuota penggunaan AI
```

Modul ini hanya membangun service integrasi Gemini. Fitur chatbot penuh akan memakai service ini pada modul berikutnya.

---

# 4. Aktor Sistem

## 4.1 Internal Backend Service

Modul lain di backend, seperti `ChatService`, akan menggunakan GeminiService untuk menghasilkan teks dari prompt user.

Contoh penggunaan:

```php
$response = Gemini::generateText($prompt);
```

atau:

```php
$response = $geminiService->generateText($prompt);
```

---

## 4.2 Gemini API

Gemini API berperan sebagai external provider yang menerima prompt dan mengembalikan response teks.

---

## 4.3 System

Sistem Laravel bertugas:

```text
- Membaca konfigurasi Gemini dari .env
- Membuat payload request
- Mengirim request ke Gemini
- Menerima response
- Mengekstrak teks dari response
- Menangani error
- Mencatat log jika terjadi kegagalan
```

---

# 5. Alur Kerja Modul

## 5.1 Alur Generate Teks

```text
Service internal memanggil GeminiService
↓
GeminiService menerima prompt
↓
GeminiService validasi prompt secara dasar
↓
GeminiService membaca API key, base URL, dan model dari config
↓
GeminiService membuat payload request Gemini
↓
GeminiService mengirim request menggunakan Laravel HTTP Client
↓
Gemini API memproses prompt
↓
Gemini API mengembalikan response
↓
GeminiService mengecek status response
↓
GeminiService mengekstrak teks jawaban
↓
GeminiService mengembalikan teks ke pemanggil
```

---

## 5.2 Alur Jika Gemini Gagal

```text
GeminiService mengirim request
↓
Request timeout / response failed / response kosong
↓
GeminiService mencatat error ke log
↓
GeminiService melempar ExternalApiException
↓
Service/controller pemanggil menangkap exception
↓
Backend mengembalikan response error standar
```

---

# 6. Functional Requirement

---

## FR-01 — Konfigurasi Gemini API di `.env`

### Deskripsi

Sistem harus menyediakan konfigurasi Gemini API melalui file `.env`.

### Environment Variable

```env
GEMINI_API_KEY=
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-1.5-flash
GEMINI_TIMEOUT=30
GEMINI_RETRY_TIMES=2
GEMINI_RETRY_SLEEP=500
```

### Business Rule

```text
- API key tidak boleh ditulis langsung di source code.
- API key wajib dibaca dari environment variable.
- Model Gemini harus bisa diganti tanpa mengubah source code.
- Timeout harus bisa diatur dari environment variable.
```

### Acceptance Criteria

```text
- File .env memiliki konfigurasi Gemini.
- Jika API key belum diisi, sistem dapat mendeteksi dan mengembalikan error yang jelas.
- Tidak ada API key hardcode di service, controller, route, atau file lain.
```

---

## FR-02 — Konfigurasi Gemini di `config/services.php`

### Deskripsi

Sistem harus menyediakan konfigurasi Gemini pada `config/services.php`.

### Konfigurasi

```php
'gemini' => [
    'api_key' => env('GEMINI_API_KEY'),
    'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
    'model' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
    'timeout' => env('GEMINI_TIMEOUT', 30),
    'retry_times' => env('GEMINI_RETRY_TIMES', 2),
    'retry_sleep' => env('GEMINI_RETRY_SLEEP', 500),
],
```

### Acceptance Criteria

```text
- Semua konfigurasi Gemini dipusatkan di config/services.php.
- GeminiService mengambil konfigurasi dari config, bukan langsung dari env().
- Perubahan model, timeout, dan retry dapat dilakukan melalui .env.
```

---

## FR-03 — GeminiService

### Deskripsi

Sistem harus memiliki service khusus untuk menangani seluruh komunikasi dengan Gemini API.

### Lokasi File

```text
app/Services/AI/GeminiService.php
```

### Method Utama

```php
public function generateText(string $prompt): string
```

### Tanggung Jawab GeminiService

```text
- Menerima prompt teks.
- Memastikan prompt tidak kosong.
- Membuat payload request sesuai format Gemini API.
- Mengirim request menggunakan Laravel HTTP Client.
- Menggunakan timeout request.
- Menggunakan retry jika dikonfigurasi.
- Mengecek apakah response berhasil.
- Mengekstrak teks dari response Gemini.
- Menangani response kosong.
- Melempar exception jika request gagal.
- Mencatat error ke log.
```

### Acceptance Criteria

```text
- Service dapat menerima prompt string.
- Service dapat mengirim prompt ke Gemini.
- Service dapat mengembalikan response teks.
- Service tidak mengembalikan raw response Gemini ke modul lain.
- Service tidak berisi logic chat session atau penyimpanan database.
- Service tidak dipanggil langsung dari frontend.
```

---

## FR-04 — Request ke Gemini Menggunakan Laravel HTTP Client

### Deskripsi

Semua komunikasi ke Gemini API harus menggunakan Laravel HTTP Client.

### Contoh Pola Request

```php
$response = Http::timeout($this->timeout)
    ->retry($this->retryTimes, $this->retrySleep)
    ->withHeaders([
        'Content-Type' => 'application/json',
    ])
    ->post($this->endpoint(), [
        'contents' => [
            [
                'parts' => [
                    ['text' => $prompt],
                ],
            ],
        ],
    ]);
```

### Endpoint Format

```text
{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}
```

Contoh:

```text
https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=API_KEY
```

### Acceptance Criteria

```text
- Service menggunakan Laravel HTTP Client.
- Service tidak menggunakan cURL manual.
- Service tidak menggunakan file_get_contents.
- Timeout diterapkan pada request.
- Retry diterapkan sesuai konfigurasi jika dibutuhkan.
```

---

## FR-05 — Payload Request Gemini

### Deskripsi

Sistem harus mengirim payload yang sesuai untuk request generate teks.

### Payload Minimal

```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "Prompt user"
        }
      ]
    }
  ]
}
```

### Business Rule

```text
- Prompt wajib dikirim pada bagian contents[0].parts[0].text.
- Payload harus disusun di dalam GeminiService.
- Modul pemanggil tidak perlu mengetahui format payload Gemini.
```

### Acceptance Criteria

```text
- GeminiService dapat membuat payload dari prompt.
- Jika format payload berubah, perubahan cukup dilakukan pada GeminiService.
- Modul lain cukup mengirim string prompt.
```

---

## FR-06 — Parsing Response Gemini

### Deskripsi

Sistem harus mengekstrak teks jawaban dari response Gemini.

### Contoh Struktur Response Gemini

```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Jawaban dari Gemini"
          }
        ]
      }
    }
  ]
}
```

### Path Response yang Diambil

```text
candidates.0.content.parts.0.text
```

### Business Rule

```text
- GeminiService hanya mengembalikan teks jawaban.
- Raw JSON response tidak dikembalikan sebagai hasil utama.
- Jika teks tidak ditemukan, sistem menganggap response tidak valid.
```

### Acceptance Criteria

```text
- Service dapat mengambil teks dari response Gemini.
- Jika teks kosong atau tidak ditemukan, service melempar ExternalApiException.
- Modul pemanggil menerima string hasil generate.
```

---

## FR-07 — Gemini Facade

### Deskripsi

Sistem harus menyediakan Facade agar GeminiService dapat dipanggil secara ringkas.

### Lokasi File

```text
app/Facades/Gemini.php
```

### Implementasi

```php
namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class Gemini extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'gemini';
    }
}
```

### Contoh Penggunaan

```php
use App\Facades\Gemini;

$text = Gemini::generateText('Jelaskan apa itu API.');
```

### Acceptance Criteria

```text
- Facade Gemini tersedia.
- Facade mengarah ke binding service container yang benar.
- Facade dapat memanggil method generateText.
- Facade tidak berisi logic request API.
```

---

## FR-08 — AIServiceProvider

### Deskripsi

Sistem harus mendaftarkan GeminiService ke Laravel Service Container menggunakan Service Provider.

### Lokasi File

```text
app/Providers/AIServiceProvider.php
```

### Binding

```php
use App\Services\AI\GeminiService;

public function register(): void
{
    $this->app->singleton('gemini', function () {
        return new GeminiService();
    });
}
```

### Registrasi Provider

Untuk Laravel versi modern:

```php
// bootstrap/providers.php

return [
    App\Providers\AppServiceProvider::class,
    App\Providers\AIServiceProvider::class,
];
```

### Acceptance Criteria

```text
- AIServiceProvider tersedia.
- GeminiService terdaftar sebagai singleton.
- Facade Gemini dapat mengakses GeminiService.
- Provider terdaftar di aplikasi Laravel.
```

---

## FR-09 — Error Handling Jika Gemini Gagal

### Deskripsi

Sistem harus menangani kegagalan dari Gemini API dengan aman dan jelas.

### Kondisi Error yang Harus Ditangani

```text
- API key kosong
- Request timeout
- Response HTTP gagal
- Response 400
- Response 401/403
- Response 429 rate limit
- Response 500 dari Gemini
- Response JSON tidak sesuai format
- Response teks kosong
- Koneksi internet/server gagal
```

### Response Internal

GeminiService tidak langsung mengembalikan JSON API response ke frontend. GeminiService harus melempar exception, misalnya:

```text
ExternalApiException
```

### Lokasi Custom Exception

```text
app/Exceptions/ExternalApiException.php
```

### Contoh Message

```text
Layanan Gemini sedang tidak tersedia. Silakan coba beberapa saat lagi.
```

### Acceptance Criteria

```text
- Jika Gemini gagal, aplikasi tidak crash.
- Error dicatat ke log.
- API key tidak muncul dalam log.
- Exception dapat ditangani oleh controller/service pemanggil.
- Response error ke frontend tetap menggunakan format standar aplikasi.
```

---

## FR-10 — Timeout Request

### Deskripsi

Request ke Gemini wajib memiliki timeout agar request tidak menggantung terlalu lama.

### Requirement

```text
- Default timeout: 30 detik
- Timeout dapat diubah melalui GEMINI_TIMEOUT
- Jika timeout terjadi, sistem mencatat log dan melempar ExternalApiException
```

### Acceptance Criteria

```text
- Laravel HTTP Client menggunakan timeout.
- Timeout value diambil dari config.
- Timeout tidak ditulis hardcode di banyak tempat.
```

---

## FR-11 — Logging Error Gemini

### Deskripsi

Jika terjadi error pada request Gemini, sistem harus mencatat log untuk debugging.

### Data Log yang Boleh Dicatat

```text
- provider: gemini
- model
- status code jika tersedia
- error message
- timestamp
```

### Data yang Tidak Boleh Dicatat

```text
- API key
- Full authorization credential
- Data sensitif user
- Prompt sensitif secara penuh jika tidak diperlukan
```

### Contoh Log

```php
logger()->error('Gemini API request failed', [
    'provider' => 'gemini',
    'model' => config('services.gemini.model'),
    'status' => $response->status(),
    'message' => $response->body(),
]);
```

Catatan: untuk production, isi body error sebaiknya dibatasi agar tidak terlalu panjang.

### Acceptance Criteria

```text
- Error Gemini tercatat pada log.
- Log tidak membocorkan API key.
- Log cukup informatif untuk debugging.
```

---

## FR-12 — Endpoint Testing Internal Opsional

### Deskripsi

Untuk memudahkan pengujian awal, sistem boleh menyediakan endpoint testing Gemini.

Endpoint ini bersifat opsional dan hanya digunakan pada development.

### Endpoint Opsional

```http
POST /api/dev/gemini/test
```

### Request Body

```json
{
  "prompt": "Jelaskan apa itu Laravel secara singkat."
}
```

### Response Success

```json
{
  "success": true,
  "message": "Gemini berhasil merespons.",
  "data": {
    "text": "Laravel adalah framework PHP untuk membangun aplikasi web..."
  }
}
```

### Business Rule

```text
- Endpoint ini tidak wajib untuk production.
- Endpoint ini sebaiknya hanya aktif pada environment local/development.
- Endpoint ini tidak boleh dibuka bebas di production.
```

### Acceptance Criteria

```text
- Developer dapat mengetes GeminiService tanpa membuat fitur chatbot penuh.
- Endpoint test tidak aktif atau tidak digunakan pada production.
```

---

# 7. Struktur File Backend

Struktur file yang dibutuhkan:

```text
app/
├── Facades/
│   └── Gemini.php
│
├── Services/
│   └── AI/
│       └── GeminiService.php
│
├── Providers/
│   └── AIServiceProvider.php
│
├── Exceptions/
│   └── ExternalApiException.php
│
└── Http/
    └── Controllers/
        └── Api/
            └── Dev/
                └── GeminiTestController.php   // opsional
```

File konfigurasi yang diperbarui:

```text
.env
config/services.php
bootstrap/providers.php
```

---

# 8. Service Design

## 8.1 GeminiService

### Lokasi

```text
app/Services/AI/GeminiService.php
```

### Property yang Dibutuhkan

```php
protected string $apiKey;
protected string $baseUrl;
protected string $model;
protected int $timeout;
protected int $retryTimes;
protected int $retrySleep;
```

### Method yang Disarankan

```php
public function generateText(string $prompt): string

protected function endpoint(): string

protected function payload(string $prompt): array

protected function extractText(array $response): string

protected function ensureConfigured(): void
```

### Tanggung Jawab Method

#### `generateText()`

```text
- Entry point utama untuk generate teks.
- Menerima prompt.
- Validasi prompt dasar.
- Memanggil endpoint Gemini.
- Menangani response.
- Mengembalikan teks hasil generate.
```

#### `endpoint()`

```text
- Membentuk URL endpoint Gemini berdasarkan base_url, model, dan api_key.
```

#### `payload()`

```text
- Membentuk body request Gemini.
```

#### `extractText()`

```text
- Mengambil teks dari response Gemini.
- Melempar exception jika teks tidak ditemukan.
```

#### `ensureConfigured()`

```text
- Memastikan API key, base URL, dan model tersedia.
- Melempar exception jika konfigurasi belum lengkap.
```

---

# 9. Facade Design

## Gemini Facade

### Lokasi

```text
app/Facades/Gemini.php
```

### Accessor

```php
protected static function getFacadeAccessor(): string
{
    return 'gemini';
}
```

### Tujuan

```text
- Memberikan cara pemanggilan service yang ringkas.
- Memudahkan penggunaan di service lain.
- Menjaga agar logika Gemini tetap berada di GeminiService.
```

---

# 10. Service Provider Design

## AIServiceProvider

### Lokasi

```text
app/Providers/AIServiceProvider.php
```

### Binding

```php
$this->app->singleton('gemini', function () {
    return new GeminiService();
});
```

### Tujuan

```text
- Mendaftarkan GeminiService ke Laravel Service Container.
- Menjamin instance service dapat digunakan ulang.
- Mendukung pemanggilan melalui Facade.
```

---

# 11. API Contract Opsional untuk Testing

Bagian ini hanya berlaku jika dibuat endpoint testing.

## 11.1 Test Gemini Generate Text

### Endpoint

```http
POST /api/dev/gemini/test
```

### Request

```json
{
  "prompt": "Buatkan definisi singkat tentang API."
}
```

### Success Response

```json
{
  "success": true,
  "message": "Gemini berhasil merespons.",
  "data": {
    "text": "API adalah antarmuka yang memungkinkan dua aplikasi saling berkomunikasi."
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Layanan Gemini sedang tidak tersedia. Silakan coba beberapa saat lagi.",
  "errors": null
}
```

---

# 12. Response Standard

Modul ini harus mengikuti response standar aplikasi jika digunakan melalui controller.

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

Catatan:

```text
GeminiService sendiri cukup mengembalikan string atau melempar exception.
Format JSON response dibuat oleh controller atau layer API.
```

---

# 13. Error Handling Detail

## 13.1 API Key Kosong

Kondisi:

```text
GEMINI_API_KEY belum diisi.
```

Expected behavior:

```text
GeminiService melempar ExternalApiException.
```

Message:

```text
Konfigurasi Gemini API belum lengkap.
```

---

## 13.2 Timeout

Kondisi:

```text
Gemini tidak merespons dalam batas waktu konfigurasi.
```

Expected behavior:

```text
Sistem mencatat log dan melempar ExternalApiException.
```

Message:

```text
Request ke Gemini mengalami timeout.
```

---

## 13.3 Unauthorized / Forbidden

Kondisi:

```text
API key salah, expired, atau tidak punya akses.
```

Expected behavior:

```text
Sistem mencatat status code tanpa membocorkan API key.
```

Message:

```text
Layanan Gemini tidak dapat diakses.
```

---

## 13.4 Rate Limited

Kondisi:

```text
Gemini mengembalikan status 429.
```

Expected behavior:

```text
Sistem mencatat log dan melempar exception.
```

Message:

```text
Batas penggunaan Gemini sedang tercapai. Silakan coba lagi nanti.
```

---

## 13.5 Response Kosong

Kondisi:

```text
Response berhasil tetapi tidak mengandung teks.
```

Expected behavior:

```text
Sistem menganggap response tidak valid.
```

Message:

```text
Gemini tidak mengembalikan jawaban yang valid.
```

---

# 14. Security Requirement

Modul ini harus memenuhi keamanan berikut:

```text
- API key disimpan hanya di .env.
- API key tidak boleh muncul di response.
- API key tidak boleh muncul di log.
- Frontend tidak boleh memanggil Gemini API secara langsung.
- Frontend tidak boleh menerima API key.
- Error response tidak boleh membocorkan detail konfigurasi internal.
- Endpoint testing Gemini tidak boleh aktif bebas di production.
```

---

# 15. Performance Requirement

Kebutuhan performa:

```text
- Request ke Gemini wajib menggunakan timeout.
- Retry tidak boleh terlalu agresif agar tidak memperlambat response.
- Default timeout maksimal 30 detik.
- Service hanya mengembalikan data teks yang diperlukan.
- Tidak menyimpan raw response besar kecuali dibutuhkan untuk debugging terbatas.
```

Rekomendasi:

```text
GEMINI_TIMEOUT=30
GEMINI_RETRY_TIMES=2
GEMINI_RETRY_SLEEP=500
```

---

# 16. Reliability Requirement

Kebutuhan reliabilitas:

```text
- Jika Gemini gagal, sistem tidak crash.
- Error dikonversi menjadi exception yang dapat ditangani oleh layer atas.
- Service tetap dapat digunakan oleh modul ChatService nanti.
- Jika response Gemini berubah format, hanya GeminiService yang perlu diperbaiki.
- Modul lain tidak bergantung langsung pada struktur raw response Gemini.
```

---

# 17. Testing Scenario Backend

## TS-01 — Generate Text Berhasil

```text
Given GEMINI_API_KEY valid
When GeminiService::generateText() dipanggil dengan prompt valid
Then service mengembalikan response teks dari Gemini
```

---

## TS-02 — Prompt Kosong

```text
Given prompt kosong
When generateText() dipanggil
Then service melempar exception atau validasi error
And request ke Gemini tidak dikirim
```

---

## TS-03 — API Key Kosong

```text
Given GEMINI_API_KEY kosong
When generateText() dipanggil
Then service melempar ExternalApiException
And log error dicatat tanpa API key
```

---

## TS-04 — Gemini Timeout

```text
Given Gemini API tidak merespons dalam batas waktu
When request dikirim
Then service melempar ExternalApiException
And error timeout dicatat pada log
```

---

## TS-05 — Gemini Mengembalikan HTTP Error

```text
Given Gemini mengembalikan status 401/403/429/500
When request dikirim
Then service melempar ExternalApiException
And status code dicatat pada log
```

---

## TS-06 — Response Gemini Tidak Berisi Teks

```text
Given response Gemini tidak memiliki candidates.0.content.parts.0.text
When response diproses
Then service melempar ExternalApiException
```

---

## TS-07 — Facade Berfungsi

```text
Given AIServiceProvider sudah terdaftar
When Gemini::generateText('Halo') dipanggil
Then Facade berhasil meneruskan request ke GeminiService
```

---

# 18. Acceptance Criteria Keseluruhan Modul

Modul Integrasi Gemini API dianggap selesai jika:

```text
- Konfigurasi Gemini tersedia di .env.
- Konfigurasi Gemini tersedia di config/services.php.
- GeminiService tersedia.
- GeminiService memiliki method generateText().
- GeminiService menggunakan Laravel HTTP Client.
- Request ke Gemini menggunakan timeout.
- Request ke Gemini menggunakan retry sesuai konfigurasi jika diterapkan.
- GeminiService dapat mengirim prompt ke Gemini.
- GeminiService dapat menerima dan mengekstrak response teks.
- GeminiService menangani failed response dari Gemini.
- GeminiService menangani response kosong/tidak valid.
- GeminiService mencatat log error tanpa membocorkan API key.
- ExternalApiException tersedia.
- Gemini Facade tersedia.
- AIServiceProvider tersedia.
- GeminiService terdaftar di Service Container.
- Backend dapat menghasilkan teks dari prompt melalui GeminiService atau Facade.
```

---

# 19. Deliverable Backend

File dan komponen yang harus tersedia:

```text
1. app/Services/AI/GeminiService.php
2. app/Facades/Gemini.php
3. app/Providers/AIServiceProvider.php
4. app/Exceptions/ExternalApiException.php
5. Konfigurasi Gemini di .env.example
6. Konfigurasi Gemini di config/services.php
7. Registrasi AIServiceProvider
8. Implementasi Laravel HTTP Client request
9. Timeout request
10. Error handling Gemini
11. Logging error Gemini
12. Endpoint testing opsional untuk development
```

---

# 20. Prioritas Implementasi

Urutan implementasi yang disarankan:

```text
1. Tambahkan konfigurasi Gemini di .env dan .env.example.
2. Tambahkan konfigurasi Gemini di config/services.php.
3. Buat ExternalApiException.
4. Buat GeminiService.
5. Implementasikan method generateText().
6. Implementasikan endpoint(), payload(), dan extractText().
7. Tambahkan timeout dan retry pada HTTP Client.
8. Tambahkan error handling dan logging.
9. Buat AIServiceProvider.
10. Register GeminiService ke Service Container.
11. Buat Gemini Facade.
12. Daftarkan AIServiceProvider.
13. Test pemanggilan GeminiService.
14. Test pemanggilan Gemini Facade.
15. Buat endpoint test opsional jika diperlukan.
```

---

# 21. Catatan Implementasi

## 21.1 Contoh Pemanggilan dari Service Lain

```php
use App\Facades\Gemini;

$text = Gemini::generateText('Jelaskan apa itu REST API dengan sederhana.');
```

Atau menggunakan dependency injection:

```php
use App\Services\AI\GeminiService;

public function __construct(
    protected GeminiService $geminiService
) {}

public function handle()
{
    return $this->geminiService->generateText('Halo Gemini');
}
```

---

## 21.2 Contoh Output dari Service

GeminiService cukup mengembalikan string:

```text
REST API adalah cara agar aplikasi dapat saling berkomunikasi melalui HTTP menggunakan format data seperti JSON.
```

Bukan:

```json
{
  "candidates": [...]
}
```

Raw response Gemini tidak dijadikan output utama agar modul lain lebih mudah menggunakan hasilnya.

---

# 22. Kesimpulan

Modul **Integrasi Gemini API** berfungsi sebagai fondasi utama untuk fitur AI Text Chat.

Modul ini tidak menyimpan percakapan dan tidak mengelola chat history. Tugasnya hanya menyediakan service backend yang stabil untuk:

```text
Menerima prompt
↓
Mengirim request ke Gemini
↓
Menerima response teks
↓
Mengembalikan teks ke modul lain
```

Dengan selesainya modul ini, backend Laravel sudah siap digunakan oleh modul berikutnya, yaitu:

```text
Generate Teks / Chatbot
Riwayat Chat
Chat Session
Chat Message
```

Arsitektur modul harus tetap mengikuti prinsip:

```text
Service Provider
↓
Service Container
↓
Facade / Dependency Injection
↓
GeminiService
↓
Laravel HTTP Client
↓
Gemini API
```

Sehingga integrasi Gemini menjadi rapi, aman, mudah diuji, dan siap dikembangkan.
