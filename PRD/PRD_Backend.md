# PRD — Modul Fondasi Backend

## Aplikasi AI Chatbot Berbasis Laravel API

---

## 1. Ringkasan Modul

**Modul Fondasi Backend** adalah tahap awal pengembangan backend Laravel yang berfungsi sebagai dasar utama sebelum fitur-fitur besar seperti autentikasi, chatbot Gemini, pricing plan, payment Midtrans, generate gambar, dan galeri dikembangkan.

Pada tahap ini, Laravel belum difokuskan untuk menjalankan fitur bisnis utama. Fokusnya adalah membangun struktur backend yang **rapi, konsisten, aman, mudah dikembangkan, dan siap digunakan oleh frontend React** melalui REST API.

Modul ini akan menjadi pondasi teknis agar seluruh fitur berikutnya dapat dibangun dengan pola yang sama dan tidak menyebabkan struktur kode berantakan.

---

## 2. Tujuan Modul

Tujuan utama dari Modul Fondasi Backend adalah:

1. Menyiapkan Laravel sebagai backend API.
2. Menyusun struktur folder aplikasi yang scalable.
3. Menyiapkan standar response JSON.
4. Menyiapkan konfigurasi CORS agar React dapat terhubung ke Laravel.
5. Menyiapkan pola Service Layer untuk logika bisnis.
6. Menyiapkan penggunaan Service Container dan Service Provider.
7. Menyiapkan penggunaan Facade untuk integrasi service eksternal.
8. Menyiapkan Laravel HTTP Client sebagai standar komunikasi ke API eksternal.
9. Menyiapkan standar error handling.
10. Menyiapkan struktur awal untuk integrasi Gemini, Cloudflare AI, dan Midtrans di tahap berikutnya.

---

## 3. Latar Belakang

Aplikasi ini akan dikembangkan menggunakan dua bagian utama:

```text
Frontend : React
Backend  : Laravel REST API
```

Karena frontend menggunakan React, maka Laravel tidak digunakan untuk menampilkan halaman Blade, melainkan sebagai backend API yang menyediakan data dan layanan.

Laravel akan menangani:

```text
- Autentikasi pengguna
- Penyimpanan data
- Validasi request
- Integrasi Gemini API
- Integrasi Cloudflare Worker AI
- Integrasi Midtrans
- Sistem kuota
- Riwayat chat
- Galeri gambar
```

Agar seluruh fitur tersebut dapat dikembangkan dengan rapi, diperlukan fondasi backend yang kuat sejak awal.

---

## 4. Scope Modul

### 4.1 In Scope

Fitur dan pekerjaan yang termasuk dalam Modul Fondasi Backend:

```text
- Instalasi dan konfigurasi awal Laravel
- Konfigurasi database
- Konfigurasi API routes
- Konfigurasi CORS
- Standarisasi response JSON
- Standarisasi error response
- Struktur folder backend
- Pembuatan base service pattern
- Pembuatan service provider awal
- Pembuatan facade pattern awal
- Konfigurasi environment untuk external API
- Konfigurasi Laravel HTTP Client
- Setup helper/trait untuk API response
- Setup global exception handling
- Setup rate limit dasar API
- Setup logging dasar
```

---

### 4.2 Out of Scope

Hal-hal berikut **tidak dikerjakan pada modul ini**:

```text
- Register dan login user
- Generate teks menggunakan Gemini
- Generate gambar menggunakan Cloudflare AI
- Pricing plan
- Payment Gateway Midtrans
- Galeri hasil generate gambar
- Admin dashboard
- Queue generate image
- Webhook Midtrans
```

Fitur-fitur tersebut akan dikembangkan pada modul berikutnya setelah pondasi backend selesai.

---

# 5. Target Pengguna Modul

Modul ini tidak langsung digunakan oleh end-user. Target utama dari modul ini adalah:

```text
- Backend developer
- Frontend developer
- Product team
- Developer yang akan melanjutkan fitur berikutnya
```

Frontend developer membutuhkan backend yang sudah memiliki standar API yang jelas agar integrasi React berjalan mudah.

Backend developer membutuhkan struktur yang rapi agar pengembangan fitur AI, payment, dan image generation tidak saling bercampur.

---

# 6. Arsitektur Backend

Arsitektur backend yang digunakan adalah:

```text
React Frontend
      ↓
Laravel API Routes
      ↓
Controller
      ↓
Form Request / Validation
      ↓
Service Layer
      ↓
Repository / Model / External API
      ↓
Database / Third Party API
```

Penjelasan:

```text
Controller
```

Bertugas menerima request dari frontend dan mengembalikan response JSON.

```text
Form Request
```

Bertugas melakukan validasi input dari user.

```text
Service Layer
```

Bertugas menyimpan logika bisnis utama.

```text
Service Provider
```

Bertugas mendaftarkan service ke dalam Laravel Service Container.

```text
Facade
```

Bertugas menyediakan akses sederhana ke service tertentu, misalnya `Gemini::generateText()`.

```text
Laravel HTTP Client
```

Bertugas melakukan request ke API eksternal seperti Gemini, Cloudflare AI, dan Midtrans.

---

# 7. Prinsip Arsitektur

Modul fondasi backend harus mengikuti prinsip berikut:

## 7.1 Controller Harus Tipis

Controller tidak boleh berisi logika bisnis yang panjang.

Contoh yang kurang baik:

```php
public function generate(Request $request)
{
    // validasi
    // panggil API
    // parsing response
    // simpan database
    // handle error
    // return response
}
```

Contoh yang lebih baik:

```php
public function generate(GenerateTextRequest $request, ChatService $chatService)
{
    $result = $chatService->generate($request->validated());

    return ApiResponse::success($result, 'Teks berhasil digenerate.');
}
```

---

## 7.2 Logika Bisnis Berada di Service

Semua proses penting diletakkan di dalam service.

Contoh:

```text
GeminiService
CloudflareImageService
MidtransService
ImageQuotaService
ChatService
PaymentService
```

Dengan pola ini, kode lebih mudah diuji, digunakan ulang, dan dikembangkan.

---

## 7.3 External API Tidak Dipanggil Langsung dari Controller

Controller tidak boleh langsung menggunakan:

```php
Http::post(...)
```

Pemanggilan API eksternal harus melalui service.

Contoh:

```php
GeminiService::generateText()
```

atau:

```php
Gemini::generateText()
```

---

## 7.4 Response API Harus Konsisten

Semua response API harus memiliki format yang sama agar mudah dibaca oleh frontend React.

---

## 7.5 Error Handling Harus Terpusat

Error tidak boleh ditangani secara acak di setiap controller. Error umum harus ditangani melalui exception handler atau helper response.

---

# 8. Struktur Folder Backend

Struktur folder awal yang direkomendasikan:

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
│   ├── Payment/
│   │   ├── MidtransService.php
│   │   └── PaymentService.php
│   │
│   ├── Quota/
│   │   └── ImageQuotaService.php
│   │
│   └── Shared/
│       └── ApiResponseService.php
│
├── Providers/
│   ├── AIServiceProvider.php
│   └── PaymentServiceProvider.php
│
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── HealthCheckController.php
│   │
│   ├── Middleware/
│   │   └── ForceJsonResponse.php
│   │
│   └── Requests/
│
├── Exceptions/
│   ├── ExternalApiException.php
│   └── BusinessRuleException.php
│
└── Support/
    └── ApiResponse.php
```

---

# 9. Standar API Response

## 9.1 Success Response

Semua response berhasil harus menggunakan format berikut:

```json
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": {}
}
```

Contoh response list:

```json
{
  "success": true,
  "message": "Daftar data berhasil diambil.",
  "data": [
    {
      "id": 1,
      "name": "Starter Plan"
    }
  ]
}
```

---

## 9.2 Error Response

Semua response gagal harus menggunakan format berikut:

```json
{
  "success": false,
  "message": "Terjadi kesalahan.",
  "errors": {}
}
```

Contoh validasi gagal:

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "email": [
      "Email wajib diisi."
    ]
  }
}
```

---

## 9.3 Pagination Response

Untuk data list seperti chat history, galeri, order, dan payment, format pagination menggunakan struktur berikut:

```json
{
  "success": true,
  "message": "Data berhasil diambil.",
  "data": [
    {
      "id": 1,
      "title": "Percakapan Baru"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 50
  }
}
```

---

# 10. API Response Helper

Agar response konsisten, dibuat class khusus:

```text
app/Support/ApiResponse.php
```

Contoh implementasi:

```php
namespace App\Support;

class ApiResponse
{
    public static function success($data = null, string $message = 'Request berhasil diproses.', int $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function error(string $message = 'Terjadi kesalahan.', $errors = null, int $status = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
```

Contoh penggunaan:

```php
return ApiResponse::success($user, 'User berhasil diambil.');
```

---

# 11. Middleware Force JSON Response

Karena backend ini khusus API, maka setiap request harus diarahkan untuk menerima JSON.

```text
app/Http/Middleware/ForceJsonResponse.php
```

Contoh:

```php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ForceJsonResponse
{
    public function handle(Request $request, Closure $next)
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
```

Tujuannya agar Laravel selalu mengembalikan response JSON, terutama ketika terjadi error validasi atau unauthenticated.

---

# 12. Endpoint Awal Modul Fondasi

Pada modul ini, endpoint yang dibuat masih sederhana.

## 12.1 Health Check API

Digunakan untuk memastikan backend berjalan.

```http
GET /api/health
```

Response:

```json
{
  "success": true,
  "message": "Backend API berjalan dengan baik.",
  "data": {
    "app": "AI Chatbot API",
    "status": "ok",
    "environment": "local"
  }
}
```

---

## 12.2 API Version Check

Opsional, tetapi bagus untuk jangka panjang.

```http
GET /api/v1/status
```

Response:

```json
{
  "success": true,
  "message": "API aktif.",
  "data": {
    "version": "v1",
    "status": "active"
  }
}
```

---

# 13. Routing API

Struktur route awal:

```php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HealthCheckController;

Route::prefix('v1')->group(function () {
    Route::get('/health', [HealthCheckController::class, 'index']);
    Route::get('/status', [HealthCheckController::class, 'status']);
});
```

Dengan struktur ini, endpoint menjadi:

```text
GET /api/v1/health
GET /api/v1/status
```

Menggunakan prefix `v1` membuat API lebih siap dikembangkan ke versi berikutnya.

---

# 14. Health Check Controller

```php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;

class HealthCheckController extends Controller
{
    public function index()
    {
        return ApiResponse::success([
            'app' => config('app.name'),
            'status' => 'ok',
            'environment' => app()->environment(),
        ], 'Backend API berjalan dengan baik.');
    }

    public function status()
    {
        return ApiResponse::success([
            'version' => 'v1',
            'status' => 'active',
        ], 'API aktif.');
    }
}
```

---

# 15. Konfigurasi CORS

Karena frontend menggunakan React, Laravel harus mengizinkan request dari domain frontend.

Contoh pada `.env`:

```env
FRONTEND_URL=http://localhost:5173
```

Contoh konfigurasi CORS:

```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:5173'),
],
```

Tujuannya agar React dapat melakukan request ke Laravel tanpa terkena error CORS.

Contoh pengembangan lokal:

```text
React    : http://localhost:5173
Laravel  : http://localhost:8000
```

---

# 16. Environment Configuration

File `.env` harus disiapkan sejak awal untuk kebutuhan jangka panjang.

```env
APP_NAME="AI Chatbot API"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ai_chatbot
DB_USERNAME=root
DB_PASSWORD=

GEMINI_API_KEY=
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MODEL=gemini-1.5-flash

CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_IMAGE_ENDPOINT=

MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
```

Pada modul fondasi, key Gemini, Cloudflare, dan Midtrans belum wajib diisi. Namun variabelnya disiapkan agar modul berikutnya lebih mudah dikembangkan.

---

# 17. Konfigurasi `config/services.php`

Tambahkan konfigurasi awal:

```php
return [

    'gemini' => [
        'api_key' => env('GEMINI_API_KEY'),
        'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
        'model' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
    ],

    'cloudflare' => [
        'api_token' => env('CLOUDFLARE_API_TOKEN'),
        'account_id' => env('CLOUDFLARE_ACCOUNT_ID'),
        'image_endpoint' => env('CLOUDFLARE_IMAGE_ENDPOINT'),
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY'),
        'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    ],

];
```

---

# 18. Service Container dan Service Provider

Pada modul fondasi, kita menyiapkan pola registrasi service.

## 18.1 AI Service Provider

```bash
php artisan make:provider AIServiceProvider
```

Struktur:

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\AI\GeminiService;
use App\Services\AI\CloudflareImageService;

class AIServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('gemini', function () {
            return new GeminiService();
        });

        $this->app->singleton('cloudflare-ai', function () {
            return new CloudflareImageService();
        });
    }

    public function boot(): void
    {
        //
    }
}
```

Daftarkan provider di:

```php
bootstrap/providers.php
```

```php
return [
    App\Providers\AppServiceProvider::class,
    App\Providers\AIServiceProvider::class,
];
```

---

## 18.2 Payment Service Provider

```bash
php artisan make:provider PaymentServiceProvider
```

Contoh:

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Payment\MidtransService;

class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton('midtrans-payment', function () {
            return new MidtransService();
        });
    }

    public function boot(): void
    {
        //
    }
}
```

---

# 19. Facade Pattern

Facade disiapkan agar pemanggilan service eksternal lebih rapi.

## 19.1 Gemini Facade

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

Contoh pemakaian nanti:

```php
Gemini::generateText($prompt);
```

---

## 19.2 Cloudflare AI Facade

```php
namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class CloudflareAI extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'cloudflare-ai';
    }
}
```

---

## 19.3 Midtrans Payment Facade

```php
namespace App\Facades;

use Illuminate\Support\Facades\Facade;

class MidtransPayment extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return 'midtrans-payment';
    }
}
```

---

# 20. Base External API Service

Karena aplikasi ini akan banyak memanggil layanan eksternal, perlu dibuat pola dasar.

Contoh:

```text
app/Services/Shared/ExternalApiService.php
```

```php
namespace App\Services\Shared;

use Illuminate\Support\Facades\Http;

class ExternalApiService
{
    protected function client()
    {
        return Http::timeout(30)
            ->retry(2, 500)
            ->acceptJson();
    }
}
```

Nanti service seperti Gemini dan Cloudflare dapat mewarisi base service ini.

Contoh:

```php
class GeminiService extends ExternalApiService
{
    //
}
```

Tujuannya agar semua request API eksternal memiliki standar:

```text
- timeout
- retry
- accept JSON
- error handling
```

---

# 21. Error Handling

## 21.1 Jenis Error yang Perlu Distandarkan

```text
- Validation error
- Authentication error
- Authorization error
- Not found error
- Business rule error
- External API error
- Server error
```

---

## 21.2 Contoh BusinessRuleException

```php
namespace App\Exceptions;

use Exception;

class BusinessRuleException extends Exception
{
    //
}
```

Contoh penggunaan nanti:

```php
throw new BusinessRuleException('Kuota generate gambar habis.');
```

---

## 21.3 Contoh ExternalApiException

```php
namespace App\Exceptions;

use Exception;

class ExternalApiException extends Exception
{
    //
}
```

Contoh penggunaan nanti:

```php
throw new ExternalApiException('Gagal menghubungi Gemini API.');
```

---

# 22. Rate Limiting Dasar

Rate limiting penting agar API tidak disalahgunakan.

Contoh pembagian:

```text
Public endpoint       : 60 request / menit
Auth endpoint         : 120 request / menit
AI generate endpoint  : 10 request / menit
Payment endpoint      : 20 request / menit
```

Pada modul fondasi, cukup siapkan konfigurasi awal.

Contoh route:

```php
Route::middleware(['throttle:api'])->prefix('v1')->group(function () {
    Route::get('/health', [HealthCheckController::class, 'index']);
});
```

Untuk fitur AI nanti, bisa dibuat throttle khusus:

```text
throttle:ai-generate
```

---

# 23. Logging Dasar

Logging perlu disiapkan untuk kebutuhan debugging.

Yang perlu dicatat pada tahap fondasi:

```text
- Error aplikasi
- Request gagal ke API eksternal
- Error validasi penting
- Error pembayaran
- Failed job
```

Pada modul fondasi, cukup gunakan Laravel logging default.

Contoh nanti pada service:

```php
logger()->error('Gemini API Error', [
    'message' => $exception->getMessage(),
]);
```

---

# 24. Database Migration pada Modul Fondasi

Pada modul ini, migration bisnis belum dibuat.

Migration yang diperlukan hanya bawaan Laravel:

```text
users
cache
jobs
failed_jobs
personal_access_tokens
```

Jika menggunakan Laravel Sanctum, tabel berikut perlu tersedia:

```text
personal_access_tokens
```

Untuk queue, tabel berikut disiapkan:

```text
jobs
failed_jobs
```

Walaupun queue belum digunakan pada modul fondasi, setup awal ini penting karena generate gambar nanti sangat disarankan menggunakan queue.

---

# 25. Konfigurasi Queue Awal

Pada `.env`:

```env
QUEUE_CONNECTION=database
```

Lalu buat tabel queue:

```bash
php artisan queue:table
php artisan queue:failed-table
php artisan migrate
```

Pada tahap awal, queue belum wajib dijalankan, tetapi strukturnya sudah siap untuk modul generate gambar.

---

# 26. Security Requirement

Modul fondasi harus memenuhi standar keamanan dasar berikut:

```text
- API key tidak boleh ditulis langsung di kode
- API key harus disimpan di .env
- Response error tidak boleh membocorkan secret
- CORS hanya mengizinkan frontend domain yang valid
- Endpoint API menggunakan prefix versi
- Request API eksternal menggunakan timeout
- Tidak menyimpan credential di repository GitHub
```

File `.env` tidak boleh ikut di-commit.

---

# 27. Performance Requirement

Fondasi backend harus memperhatikan performa sejak awal.

Requirement:

```text
- Response health check maksimal 300 ms pada local environment
- API response menggunakan JSON ringan
- Endpoint list di masa depan wajib menggunakan pagination
- Request external API wajib memiliki timeout
- Generate image nanti wajib menggunakan queue
- Config dan route cache harus siap digunakan saat production
```

Command production nanti:

```bash
php artisan config:cache
php artisan route:cache
php artisan optimize
```

---

# 28. Acceptance Criteria

Modul Fondasi Backend dianggap selesai apabila memenuhi kriteria berikut:

## 28.1 Setup Laravel

```text
- Laravel berhasil dijalankan secara lokal
- Database berhasil terkoneksi
- Migration berhasil dijalankan
- API route aktif
```

---

## 28.2 API Response

```text
- Semua response success menggunakan format standar
- Semua response error menggunakan format standar
- Endpoint health check mengembalikan JSON
```

---

## 28.3 CORS

```text
- React frontend dapat melakukan request ke Laravel API
- Tidak terjadi error CORS pada local development
```

---

## 28.4 Struktur Kode

```text
- Folder Services tersedia
- Folder Facades tersedia
- Folder Support tersedia
- Folder Providers tersedia
- Service Provider berhasil didaftarkan
- Facade dapat digunakan tanpa error
```

---

## 28.5 Konfigurasi Eksternal

```text
- Konfigurasi Gemini tersedia di config/services.php
- Konfigurasi Cloudflare tersedia di config/services.php
- Konfigurasi Midtrans tersedia di config/services.php
- Semua secret diambil dari .env
```

---

## 28.6 Queue

```text
- Tabel jobs tersedia
- Tabel failed_jobs tersedia
- QUEUE_CONNECTION sudah disiapkan
```

---

# 29. Deliverable Modul

Output akhir dari Modul Fondasi Backend adalah:

```text
1. Laravel API project siap digunakan.
2. Database berhasil terkoneksi.
3. API route versi v1 tersedia.
4. Endpoint health check tersedia.
5. Format response JSON sudah standar.
6. Middleware ForceJsonResponse tersedia.
7. CORS siap untuk frontend React.
8. Struktur folder service layer tersedia.
9. Service provider awal tersedia.
10. Facade awal tersedia.
11. Konfigurasi Gemini, Cloudflare, dan Midtrans tersedia.
12. Queue database sudah disiapkan.
13. Error handling dasar sudah disiapkan.
14. Logging dasar siap digunakan.
```

---

# 30. Risiko dan Mitigasi

| Risiko                                 | Dampak                              | Mitigasi                                                        |
| -------------------------------------- | ----------------------------------- | --------------------------------------------------------------- |
| Struktur backend tidak rapi sejak awal | Fitur berikutnya sulit dikembangkan | Gunakan service layer, provider, dan facade sejak modul fondasi |
| Response API tidak konsisten           | Frontend React sulit integrasi      | Buat helper `ApiResponse`                                       |
| CORS tidak dikonfigurasi               | React tidak bisa request ke Laravel | Tambahkan `FRONTEND_URL` dan konfigurasi CORS                   |
| API key bocor                          | Risiko keamanan tinggi              | Simpan semua key di `.env`                                      |
| Controller terlalu gemuk               | Sulit testing dan maintenance       | Pindahkan logika bisnis ke service                              |
| Generate image timeout di masa depan   | User experience buruk               | Siapkan queue dari awal                                         |
| External API gagal                     | Aplikasi error tidak terkendali     | Gunakan timeout, retry, dan custom exception                    |

---

# 31. Prioritas Implementasi Modul Fondasi

Urutan pengerjaan yang disarankan:

```text
1. Install Laravel dan konfigurasi database
2. Setup API routes dengan prefix v1
3. Buat ApiResponse helper
4. Buat HealthCheckController
5. Setup CORS untuk React
6. Buat middleware ForceJsonResponse
7. Setup struktur folder Services, Facades, Support
8. Buat AIServiceProvider
9. Buat PaymentServiceProvider
10. Buat Facade awal Gemini, CloudflareAI, MidtransPayment
11. Tambahkan config services untuk Gemini, Cloudflare, Midtrans
12. Setup queue database
13. Setup error handling dasar
14. Test endpoint dari Postman/Thunder Client
15. Test request dari React
```

---

# 32. Ringkasan Akhir

Modul Fondasi Backend adalah tahap penting yang memastikan Laravel siap menjadi backend API untuk aplikasi AI chatbot.

Pada tahap ini, fokus utamanya bukan membangun fitur bisnis, tetapi membangun **kerangka teknis utama**:

```text
Laravel API
RESTful endpoint
CORS
Response JSON standar
Service Layer
Facade
Service Container
Service Provider
Laravel HTTP Client
Queue preparation
Error handling
Logging
Environment configuration
```

Setelah modul ini selesai, backend sudah siap untuk masuk ke modul berikutnya, yaitu:

```text
Modul Autentikasi Pengguna
↓
Modul Integrasi Gemini API
↓
Modul Generate Teks / Chatbot
```

Dengan fondasi seperti ini, pengembangan aplikasi akan jauh lebih rapi, terarah, dan siap berkembang menjadi produk AI SaaS yang stabil.
