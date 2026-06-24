# PRD Lengkap — Modul Generate Gambar Cloudflare Worker

**Backend Laravel + Frontend React**

---

## 1. Ringkasan Modul

Modul **Generate Gambar Cloudflare Worker** adalah fitur yang memungkinkan user membuat gambar dari prompt teks melalui aplikasi.

Alur utamanya:

```text
User mengisi prompt di frontend
↓
Frontend mengirim request ke backend Laravel
↓
Backend mengecek auth, validasi prompt, dan kuota
↓
Backend mengirim request ke Cloudflare Worker milik kamu
↓
Cloudflare Worker generate gambar
↓
Backend menerima binary image
↓
Backend menyimpan gambar ke storage
↓
Backend mengembalikan status dan image_url ke frontend
↓
Frontend menampilkan hasil gambar
```

Cloudflare Worker yang digunakan:

```text
https://dark-mouse-667e.dandysultana3.workers.dev/generate
```

Modul ini harus siap di dua layer:

```text
1. Backend Laravel
   Bertugas sebagai penghubung aman ke Cloudflare Worker, validasi, kuota, storage, dan database.

2. Frontend React
   Bertugas menyediakan form prompt, loading state, error handling, polling status, dan menampilkan gambar.
```

---

# 2. Tujuan Modul

Tujuan fitur ini adalah:

```text
1. User dapat generate gambar dari prompt teks.
2. Frontend tidak langsung memanggil Cloudflare Worker.
3. Backend menjadi perantara utama antara frontend dan Cloudflare Worker.
4. Backend dapat mengontrol auth, kuota, validasi, rate limit, dan penyimpanan hasil.
5. Hasil gambar disimpan ke database dan storage.
6. Frontend dapat menangkap status proses dan menampilkan gambar.
7. Gambar yang berhasil dibuat dapat masuk ke modul Image Gallery.
```

---

# 3. Output Modul

Output akhir modul:

```text
User dapat mengisi prompt di frontend, menekan tombol generate, menunggu proses, lalu melihat gambar hasil generate dari Cloudflare Worker.
```

Output backend:

```text
Backend berhasil request ke Cloudflare Worker, menerima image binary, menyimpan gambar, dan menyediakan image_url.
```

Output frontend:

```text
Frontend siap mengirim prompt, menampilkan loading, menangkap response backend, polling status, dan menampilkan gambar.
```

---

# 4. Scope Modul

## 4.1 Scope Backend

Yang dikembangkan pada backend:

```text
- Konfigurasi endpoint Cloudflare Worker
- CloudflareWorkerImageService
- ImageGenerationService
- GenerateImageJob
- GeneratedImage model
- Migration generated_images
- GenerateImageRequest
- ImageGenerationController
- Endpoint generate gambar
- Endpoint cek status gambar
- Validasi prompt, negative prompt, width, height
- Request backend ke Cloudflare Worker
- Menerima binary image dari Worker
- Menyimpan gambar ke storage Laravel
- Menyimpan metadata gambar ke database
- Status processing, completed, failed
- Error handling jika Worker gagal
- Refund kuota jika generate gagal
- Rate limiting endpoint generate
```

---

## 4.2 Scope Frontend

Yang dikembangkan pada frontend React:

```text
- Halaman Generate Image
- Form prompt
- Field negative prompt
- Pilihan ukuran gambar
- Tombol generate
- Loading state saat proses berjalan
- Error state jika gagal
- Preview hasil gambar
- Polling status generate
- Menangkap image_url dari backend
- Menampilkan gambar hasil generate
- Tombol generate ulang
- Tombol lihat di gallery
```

---

## 4.3 Out of Scope

Yang tidak masuk modul ini:

```text
- Payment Midtrans
- Pricing plan
- Admin dashboard
- Marketplace gambar publik
- Image editing
- Image-to-image
- Upload gambar referensi
- Download tracking
- Like/share gambar
- Moderasi prompt lanjutan
```

Namun modul ini tetap bergantung pada **quota** jika sistem kuota sudah tersedia.

---

# 5. Prinsip Arsitektur

## 5.1 Prinsip Utama

Frontend **tidak boleh** langsung request ke Cloudflare Worker.

Tidak disarankan:

```text
React Frontend
↓
Cloudflare Worker
```

Disarankan:

```text
React Frontend
↓
Laravel Backend
↓
Cloudflare Worker
↓
Laravel Backend
↓
React Frontend
```

Alasannya:

```text
1. Backend dapat memvalidasi user login.
2. Backend dapat mengecek kuota.
3. Backend dapat menyimpan histori generate.
4. Backend dapat menyimpan gambar ke storage.
5. Backend dapat melakukan rate limiting.
6. URL Cloudflare Worker tidak perlu dijadikan pusat logic frontend.
7. Frontend cukup consume API Laravel.
```

---

# 6. Arsitektur Sistem

```text
React Frontend
  |
  | POST /api/images/generate
  |
Laravel API
  |
  | Validasi request
  | Cek auth
  | Cek kuota
  | Buat generated_images status processing
  | Dispatch GenerateImageJob
  |
Queue Worker Laravel
  |
  | Request ke Cloudflare Worker
  |
Cloudflare Worker
  |
  | Return image binary
  |
Laravel Backend
  |
  | Simpan file ke storage
  | Update generated_images status completed
  |
React Frontend
  |
  | Polling GET /api/images/{id}/status
  | Tampilkan image_url
```

---

# 7. Mode Proses yang Direkomendasikan

## 7.1 Mode Queue-Based

Mode yang disarankan:

```text
POST /api/images/generate
```

tidak langsung menunggu gambar selesai, tetapi langsung mengembalikan status:

```text
processing
```

Lalu frontend melakukan polling ke:

```text
GET /api/images/{id}/status
```

Keuntungan:

```text
- Tidak membuat request frontend timeout.
- Lebih aman untuk proses AI yang lambat.
- Cocok untuk production.
- Mudah ditampilkan sebagai loading/progress di frontend.
```

---

# 8. Alur Generate Gambar

## 8.1 Alur Berhasil

```text
User login
↓
User membuka halaman generate image
↓
User mengisi prompt
↓
Frontend request POST /api/images/generate
↓
Backend validasi prompt
↓
Backend cek kuota user
↓
Backend kurangi kuota 1
↓
Backend buat generated_images status processing
↓
Backend dispatch GenerateImageJob
↓
Backend response ke frontend dengan ID proses
↓
Frontend mulai polling status
↓
GenerateImageJob request ke Cloudflare Worker
↓
Worker return binary image
↓
Backend simpan gambar ke storage
↓
Backend update status completed
↓
Frontend polling mendapat image_url
↓
Frontend menampilkan gambar
```

---

## 8.2 Alur Kuota Habis

```text
User mengirim prompt
↓
Backend cek kuota
↓
Kuota tidak tersedia
↓
Backend menolak request
↓
Frontend menampilkan pesan kuota habis
```

---

## 8.3 Alur Worker Gagal

```text
User request generate
↓
Kuota dikurangi
↓
Job request ke Cloudflare Worker
↓
Worker gagal / timeout / response invalid
↓
Backend update status failed
↓
Backend refund kuota
↓
Frontend polling mendapat status failed
↓
Frontend menampilkan pesan error
```

---

# 9. Backend Requirement

---

## FR-BE-01 — Konfigurasi Cloudflare Worker

Backend harus menyimpan URL Cloudflare Worker di `.env`.

### `.env`

```env
CLOUDFLARE_IMAGE_WORKER_URL=https://dark-mouse-667e.dandysultana3.workers.dev/generate
CLOUDFLARE_IMAGE_WORKER_TIMEOUT=120
CLOUDFLARE_IMAGE_WORKER_RETRY_TIMES=1
CLOUDFLARE_IMAGE_WORKER_RETRY_SLEEP=500
```

Jika nanti ingin Worker dilindungi token:

```env
CLOUDFLARE_IMAGE_WORKER_TOKEN=
```

---

## FR-BE-02 — Konfigurasi `config/services.php`

Tambahkan konfigurasi:

```php
'cloudflare_image_worker' => [
    'url' => env('CLOUDFLARE_IMAGE_WORKER_URL'),
    'token' => env('CLOUDFLARE_IMAGE_WORKER_TOKEN'),
    'timeout' => env('CLOUDFLARE_IMAGE_WORKER_TIMEOUT', 120),
    'retry_times' => env('CLOUDFLARE_IMAGE_WORKER_RETRY_TIMES', 1),
    'retry_sleep' => env('CLOUDFLARE_IMAGE_WORKER_RETRY_SLEEP', 500),
],
```

Business rule:

```text
- URL Worker tidak boleh hardcode di service.
- Backend mengambil URL dari config.
- Token Worker opsional untuk keamanan tambahan.
```

---

## FR-BE-03 — Tabel `generated_images`

Tabel utama:

```text
generated_images
```

Kolom:

```text
id
user_id
prompt
negative_prompt
image_path
image_url
provider
model
status
width
height
error_message
quota_refunded
metadata
started_at
completed_at
failed_at
created_at
updated_at
```

Status yang digunakan:

```text
processing
completed
failed
```

Contoh data:

| Kolom           | Contoh                                              |
| --------------- | --------------------------------------------------- |
| user_id         | 1                                                   |
| prompt          | a futuristic Indonesian university student using AI |
| negative_prompt | blurry, low quality                                 |
| provider        | cloudflare_worker                                   |
| model           | @cf/bytedance/stable-diffusion-xl-lightning         |
| status          | completed                                           |
| width           | 512                                                 |
| height          | 512                                                 |
| image_path      | generated-images/1/25.png                           |
| image_url       | /storage/generated-images/1/25.png                  |

---

## FR-BE-04 — Model `GeneratedImage`

Lokasi:

```text
app/Models/GeneratedImage.php
```

Relasi:

```php
public function user()
{
    return $this->belongsTo(User::class);
}
```

Fillable:

```php
protected $fillable = [
    'user_id',
    'prompt',
    'negative_prompt',
    'image_path',
    'image_url',
    'provider',
    'model',
    'status',
    'width',
    'height',
    'error_message',
    'quota_refunded',
    'metadata',
    'started_at',
    'completed_at',
    'failed_at',
];
```

Casts:

```php
protected $casts = [
    'metadata' => 'array',
    'quota_refunded' => 'boolean',
    'started_at' => 'datetime',
    'completed_at' => 'datetime',
    'failed_at' => 'datetime',
];
```

---

## FR-BE-05 — CloudflareWorkerImageService

Service ini bertugas request ke Cloudflare Worker kamu.

Lokasi:

```text
app/Services/AI/CloudflareWorkerImageService.php
```

Method utama:

```php
public function generate(string $prompt, array $options = []): string
```

Return:

```text
Binary image content
```

Payload ke Worker:

```json
{
  "prompt": "a futuristic Indonesian university student using AI",
  "negative_prompt": "blurry, low quality, watermark",
  "width": 512,
  "height": 512
}
```

Tanggung jawab service:

```text
- Membaca URL Worker dari config
- Mengirim request POST ke Worker
- Menggunakan Laravel HTTP Client
- Mengirim Content-Type application/json
- Menerima binary image
- Mengecek HTTP status
- Mengecek Content-Type response
- Melempar exception jika response JSON error
- Melempar exception jika response bukan image
```

Business rule:

```text
- Service ini hanya komunikasi dengan Worker.
- Service tidak mengecek kuota.
- Service tidak menyimpan file.
- Service tidak membuat database record.
```

---

## FR-BE-06 — ImageGenerationService

Service ini mengatur business logic generate gambar.

Lokasi:

```text
app/Services/Image/ImageGenerationService.php
```

Method:

```php
public function requestGeneration(User $user, array $data): GeneratedImage

public function getStatus(User $user, int $imageId): GeneratedImage

public function markAsCompleted(GeneratedImage $image, string $path, string $url): GeneratedImage

public function markAsFailed(GeneratedImage $image, string $message): GeneratedImage
```

Tanggung jawab:

```text
- Cek kuota user
- Kurangi kuota
- Buat record generated_images
- Dispatch GenerateImageJob
- Ambil status gambar
- Validasi ownership
- Update status completed/failed
- Refund kuota jika gagal
```

---

## FR-BE-07 — GenerateImageJob

Lokasi:

```text
app/Jobs/GenerateImageJob.php
```

Tugas job:

```text
1. Ambil record GeneratedImage.
2. Update started_at.
3. Request ke CloudflareWorkerImageService.
4. Terima binary image.
5. Simpan file ke storage.
6. Update image_path dan image_url.
7. Update status menjadi completed.
8. Jika gagal, update status failed.
9. Jika gagal setelah kuota terpotong, refund kuota.
10. Catat log error.
```

Queue:

```env
QUEUE_CONNECTION=database
```

Command yang dibutuhkan:

```bash
php artisan queue:table
php artisan queue:failed-table
php artisan migrate
php artisan queue:work
```

---

## FR-BE-08 — Endpoint Generate Gambar

Endpoint:

```http
POST /api/images/generate
```

Jika memakai versioning:

```http
POST /api/v1/images/generate
```

Auth:

```text
Wajib auth:sanctum
```

Request body:

```json
{
  "prompt": "a futuristic Indonesian university student using AI, cinematic lighting, realistic, high detail",
  "negative_prompt": "blurry, low quality, watermark, distorted",
  "width": 512,
  "height": 512
}
```

Validation:

```text
prompt:
- required
- string
- min:3
- max:1000

negative_prompt:
- nullable
- string
- max:1000

width:
- nullable
- integer
- in:512,768,1024

height:
- nullable
- integer
- in:512,768,1024
```

Response success:

```json
{
  "success": true,
  "message": "Generate gambar sedang diproses.",
  "data": {
    "id": 25,
    "prompt": "a futuristic Indonesian university student using AI, cinematic lighting, realistic, high detail",
    "negative_prompt": "blurry, low quality, watermark, distorted",
    "status": "processing",
    "provider": "cloudflare_worker",
    "width": 512,
    "height": 512,
    "image_url": null,
    "created_at": "2026-06-24T10:00:00.000000Z"
  }
}
```

---

## FR-BE-09 — Endpoint Cek Status Gambar

Endpoint:

```http
GET /api/images/{id}/status
```

Jika memakai versioning:

```http
GET /api/v1/images/{id}/status
```

Response processing:

```json
{
  "success": true,
  "message": "Status generate gambar berhasil diambil.",
  "data": {
    "id": 25,
    "status": "processing",
    "image_url": null,
    "error_message": null,
    "created_at": "2026-06-24T10:00:00.000000Z",
    "completed_at": null,
    "failed_at": null
  }
}
```

Response completed:

```json
{
  "success": true,
  "message": "Status generate gambar berhasil diambil.",
  "data": {
    "id": 25,
    "status": "completed",
    "image_url": "http://localhost:8000/storage/generated-images/1/25.png",
    "error_message": null,
    "created_at": "2026-06-24T10:00:00.000000Z",
    "completed_at": "2026-06-24T10:00:20.000000Z",
    "failed_at": null
  }
}
```

Response failed:

```json
{
  "success": true,
  "message": "Status generate gambar berhasil diambil.",
  "data": {
    "id": 25,
    "status": "failed",
    "image_url": null,
    "error_message": "Gagal generate gambar. Kuota telah dikembalikan.",
    "created_at": "2026-06-24T10:00:00.000000Z",
    "completed_at": null,
    "failed_at": "2026-06-24T10:01:00.000000Z"
  }
}
```

---

## FR-BE-10 — Storage Gambar

Gambar disimpan ke Laravel Storage.

Disk:

```text
public
```

Path:

```text
generated-images/{user_id}/{generated_image_id}.png
```

Contoh:

```text
storage/app/public/generated-images/1/25.png
```

Public URL:

```text
http://localhost:8000/storage/generated-images/1/25.png
```

Command:

```bash
php artisan storage:link
```

Business rule:

```text
- Binary image dari Worker tidak disimpan langsung ke database.
- Database hanya menyimpan image_path dan image_url.
- File harus unik berdasarkan generated_image_id.
```

---

## FR-BE-11 — Error Handling Backend

Error kuota habis:

```json
{
  "success": false,
  "message": "Kuota generate gambar habis. Silakan pilih paket untuk melanjutkan.",
  "errors": null
}
```

Error validasi prompt:

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "prompt": [
      "Prompt wajib diisi."
    ]
  }
}
```

Error Cloudflare Worker:

```json
{
  "success": false,
  "message": "Layanan generate gambar sedang mengalami gangguan. Silakan coba beberapa saat lagi.",
  "errors": null
}
```

Error gambar tidak ditemukan:

```json
{
  "success": false,
  "message": "Data generate gambar tidak ditemukan.",
  "errors": null
}
```

---

# 10. Frontend Requirement

---

## FR-FE-01 — Halaman Generate Image

Frontend harus menyediakan halaman:

```text
Generate Image Page
```

Route frontend contoh:

```text
/images/generate
```

Fungsi halaman:

```text
- Menampilkan form generate gambar
- Mengirim prompt ke backend
- Menampilkan loading saat proses berjalan
- Melakukan polling status
- Menampilkan hasil gambar
- Menampilkan error jika gagal
```

---

## FR-FE-02 — Form Generate Gambar

Field form:

```text
prompt
negative_prompt
size
```

Prompt:

```text
Textarea
Required
Min 3 karakter
Max 1000 karakter
```

Negative prompt:

```text
Input / textarea
Optional
Max 1000 karakter
```

Size:

```text
Select
512 x 512
768 x 768
1024 x 1024
```

Default size:

```text
512 x 512
```

Alasan:

```text
512 paling aman dan hemat untuk testing.
```

---

## FR-FE-03 — Submit Generate

Saat user klik tombol generate:

```text
1. Frontend validasi prompt.
2. Tombol generate berubah menjadi loading.
3. Frontend request POST /api/images/generate.
4. Jika response sukses, simpan generated_image_id.
5. Mulai polling status.
6. Jika response error, tampilkan error.
```

Request frontend ke backend:

```http
POST /api/images/generate
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

Body:

```json
{
  "prompt": "a futuristic Indonesian university student using AI, cinematic lighting, realistic, high detail",
  "negative_prompt": "blurry, low quality, watermark, distorted",
  "width": 512,
  "height": 512
}
```

---

## FR-FE-04 — Loading State

Frontend harus memiliki state:

```text
idle
submitting
processing
completed
failed
```

Penjelasan:

| State      | Keterangan                        |
| ---------- | --------------------------------- |
| idle       | Belum generate                    |
| submitting | Request awal ke backend           |
| processing | Backend sedang generate via queue |
| completed  | Gambar selesai dibuat             |
| failed     | Proses gagal                      |

---

## FR-FE-05 — Polling Status

Setelah mendapat response dari `POST /api/images/generate`, frontend harus melakukan polling:

```http
GET /api/images/{id}/status
```

Interval polling:

```text
2–3 detik sekali
```

Stop polling jika:

```text
status = completed
status = failed
timeout frontend tercapai
user keluar halaman
```

Batas maksimal polling frontend:

```text
2 menit
```

Jika lewat 2 menit:

```text
Tampilkan pesan:
"Generate gambar masih diproses. Silakan cek kembali di galeri."
```

---

## FR-FE-06 — Menampilkan Hasil Gambar

Jika status `completed`, frontend menerima:

```json
{
  "status": "completed",
  "image_url": "http://localhost:8000/storage/generated-images/1/25.png"
}
```

Frontend harus:

```text
- Menampilkan image_url pada tag img.
- Menyediakan tombol buka gambar.
- Menyediakan tombol generate lagi.
- Menyediakan tombol lihat di gallery.
```

Contoh render:

```jsx
<img src={imageUrl} alt={prompt} />
```

---

## FR-FE-07 — Menampilkan Error

Jika status `failed`, frontend menerima:

```json
{
  "status": "failed",
  "error_message": "Gagal generate gambar. Kuota telah dikembalikan."
}
```

Frontend harus menampilkan:

```text
Generate gambar gagal. Silakan coba lagi.
```

Jika error dari backend:

```json
{
  "success": false,
  "message": "Kuota generate gambar habis. Silakan pilih paket untuk melanjutkan."
}
```

Frontend harus menampilkan pesan tersebut secara jelas.

---

# 11. Frontend Component Design

Struktur komponen yang disarankan:

```text
src/
├── pages/
│   └── GenerateImagePage.jsx
│
├── components/
│   └── image/
│       ├── ImagePromptForm.jsx
│       ├── ImageGenerationPreview.jsx
│       ├── ImageGenerationStatus.jsx
│       └── ImageGenerationError.jsx
│
├── services/
│   └── imageService.js
│
└── hooks/
    └── useImageGeneration.js
```

---

## 11.1 `GenerateImagePage.jsx`

Tanggung jawab:

```text
- Menjadi halaman utama generate image.
- Menggabungkan form, status, error, dan preview.
```

---

## 11.2 `ImagePromptForm.jsx`

Tanggung jawab:

```text
- Input prompt
- Input negative prompt
- Select size
- Submit generate
- Disable button saat loading
```

---

## 11.3 `ImageGenerationPreview.jsx`

Tanggung jawab:

```text
- Menampilkan gambar hasil generate
- Menampilkan placeholder saat belum ada gambar
```

---

## 11.4 `ImageGenerationStatus.jsx`

Tanggung jawab:

```text
- Menampilkan status processing/completed/failed
- Menampilkan loading indicator
```

---

## 11.5 `imageService.js`

Berisi fungsi API:

```js
export async function generateImage(payload) {
  return api.post("/images/generate", payload);
}

export async function getImageStatus(id) {
  return api.get(`/images/${id}/status`);
}
```

---

## 11.6 `useImageGeneration.js`

Hook untuk mengatur state:

```text
- form data
- loading
- error
- generated image id
- status polling
- image_url
```

State minimal:

```js
{
  status: "idle",
  imageId: null,
  imageUrl: null,
  error: null
}
```

---

# 12. API Contract Frontend ↔ Backend

## 12.1 Generate Image

Request:

```http
POST /api/images/generate
```

Body:

```json
{
  "prompt": "a futuristic Indonesian university student using AI",
  "negative_prompt": "blurry, low quality",
  "width": 512,
  "height": 512
}
```

Success:

```json
{
  "success": true,
  "message": "Generate gambar sedang diproses.",
  "data": {
    "id": 25,
    "status": "processing",
    "image_url": null
  }
}
```

---

## 12.2 Polling Status

Request:

```http
GET /api/images/25/status
```

Processing:

```json
{
  "success": true,
  "data": {
    "id": 25,
    "status": "processing",
    "image_url": null,
    "error_message": null
  }
}
```

Completed:

```json
{
  "success": true,
  "data": {
    "id": 25,
    "status": "completed",
    "image_url": "http://localhost:8000/storage/generated-images/1/25.png",
    "error_message": null
  }
}
```

Failed:

```json
{
  "success": true,
  "data": {
    "id": 25,
    "status": "failed",
    "image_url": null,
    "error_message": "Gagal generate gambar. Kuota telah dikembalikan."
  }
}
```

---

# 13. Backend Folder Structure

```text
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── ImageGenerationController.php
│   │
│   └── Requests/
│       └── Image/
│           └── GenerateImageRequest.php
│
├── Services/
│   ├── AI/
│   │   └── CloudflareWorkerImageService.php
│   │
│   ├── Image/
│   │   └── ImageGenerationService.php
│   │
│   └── Quota/
│       └── ImageQuotaService.php
│
├── Jobs/
│   └── GenerateImageJob.php
│
├── Models/
│   └── GeneratedImage.php
│
└── Exceptions/
    ├── ExternalApiException.php
    └── InsufficientQuotaException.php
```

---

# 14. Frontend Folder Structure

```text
src/
├── pages/
│   └── GenerateImagePage.jsx
│
├── components/
│   └── image/
│       ├── ImagePromptForm.jsx
│       ├── ImageGenerationPreview.jsx
│       ├── ImageGenerationStatus.jsx
│       └── ImageGenerationError.jsx
│
├── hooks/
│   └── useImageGeneration.js
│
├── services/
│   └── imageService.js
│
└── lib/
    └── api.js
```

---

# 15. Route Backend

Tanpa versioning:

```php
use App\Http\Controllers\Api\ImageGenerationController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/images/generate', [ImageGenerationController::class, 'generate'])
        ->middleware('throttle:5,1');

    Route::get('/images/{id}/status', [ImageGenerationController::class, 'status']);
});
```

Dengan versioning:

```php
use App\Http\Controllers\Api\ImageGenerationController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::post('/images/generate', [ImageGenerationController::class, 'generate'])
        ->middleware('throttle:5,1');

    Route::get('/images/{id}/status', [ImageGenerationController::class, 'status']);
});
```

---

# 16. Route Frontend

Contoh route React:

```jsx
<Route path="/images/generate" element={<GenerateImagePage />} />
```

Jika memakai layout auth:

```jsx
<Route element={<ProtectedRoute />}>
  <Route path="/images/generate" element={<GenerateImagePage />} />
</Route>
```

---

# 17. Security Requirement

## Backend

```text
- Endpoint generate wajib auth.
- User hanya bisa melihat status gambar miliknya.
- Frontend tidak boleh memanggil Cloudflare Worker langsung.
- Worker URL disimpan di backend env.
- Jika menggunakan token Worker, token hanya disimpan di backend.
- Prompt wajib divalidasi.
- Rate limit wajib diterapkan.
- Error internal tidak boleh bocor ke frontend.
```

## Frontend

```text
- Token auth dikirim hanya ke backend.
- Frontend tidak menyimpan URL Worker sebagai API utama.
- Frontend tidak menyimpan secret Worker.
- Error ditampilkan secara aman.
```

---

# 18. Performance Requirement

## Backend

```text
- Generate gambar menggunakan queue.
- Endpoint generate tidak menunggu proses selesai.
- File gambar disimpan di storage, bukan database.
- Polling endpoint harus ringan.
- Request ke Worker memiliki timeout.
- Rate limit endpoint generate.
```

## Frontend

```text
- Polling tidak terlalu cepat.
- Interval polling 2–3 detik.
- Polling berhenti saat completed/failed.
- Gambar ditampilkan dari image_url.
- Tombol generate disabled saat loading.
```

---

# 19. Reliability Requirement

```text
- Jika Worker gagal, status menjadi failed.
- Jika Worker timeout, status menjadi failed.
- Jika storage gagal, status menjadi failed.
- Jika gagal setelah kuota terpotong, kuota dikembalikan.
- Refund kuota tidak boleh dobel.
- Jika frontend ditutup, job backend tetap berjalan.
- User dapat melihat hasil nanti melalui gallery.
```

---

# 20. Rate Limit

Endpoint:

```text
POST /api/images/generate
```

Rekomendasi:

```text
5 request / menit / user
```

Jika kena rate limit:

```json
{
  "success": false,
  "message": "Terlalu banyak request generate gambar. Silakan coba lagi nanti.",
  "errors": null
}
```

---

# 21. Testing Scenario Backend

## TS-BE-01 — Generate Berhasil

```text
Given user sudah login
And user memiliki kuota
When user request POST /api/images/generate
Then generated_images dibuat status processing
And GenerateImageJob dikirim ke queue
```

---

## TS-BE-02 — Worker Berhasil Return Gambar

```text
Given GenerateImageJob berjalan
When Worker mengembalikan binary image
Then backend menyimpan file ke storage
And status menjadi completed
And image_url tersimpan
```

---

## TS-BE-03 — Kuota Habis

```text
Given user login
And kuota user 0
When user request generate
Then backend mengembalikan error kuota habis
And generated_images tidak dibuat
```

---

## TS-BE-04 — Worker Gagal

```text
Given job berjalan
When Worker return error 500
Then status menjadi failed
And error_message tersimpan
And kuota dikembalikan
```

---

## TS-BE-05 — Status Image Milik User Lain

```text
Given user A login
And image milik user B tersedia
When user A request GET /api/images/{id}/status
Then backend mengembalikan 404
```

---

# 22. Testing Scenario Frontend

## TS-FE-01 — Form Valid

```text
Given user membuka halaman generate image
When user mengisi prompt valid
And klik generate
Then tombol berubah loading
And request dikirim ke backend
```

---

## TS-FE-02 — Prompt Kosong

```text
Given user membuka form
When user klik generate tanpa prompt
Then frontend menampilkan error prompt wajib diisi
And request tidak dikirim
```

---

## TS-FE-03 — Generate Processing

```text
Given backend mengembalikan status processing
When frontend menerima ID gambar
Then frontend mulai polling status
And menampilkan loading generate
```

---

## TS-FE-04 — Generate Completed

```text
Given polling mendapat status completed
When response memiliki image_url
Then frontend menampilkan gambar hasil generate
And polling berhenti
```

---

## TS-FE-05 — Generate Failed

```text
Given polling mendapat status failed
When response memiliki error_message
Then frontend menampilkan pesan gagal
And polling berhenti
```

---

# 23. Acceptance Criteria

Modul dianggap selesai jika:

```text
- Backend memiliki endpoint POST /api/images/generate.
- Backend memiliki endpoint GET /api/images/{id}/status.
- Backend request ke Cloudflare Worker milik user.
- Backend dapat menerima binary image dari Worker.
- Backend menyimpan gambar ke storage.
- Backend menyimpan image_url ke database.
- Backend menjalankan generate melalui queue.
- Backend menangani status processing, completed, failed.
- Backend mengecek kuota sebelum generate.
- Backend refund kuota jika generate gagal.
- Frontend memiliki form generate gambar.
- Frontend dapat mengirim prompt ke backend.
- Frontend dapat menampilkan loading.
- Frontend dapat polling status.
- Frontend dapat menangkap image_url.
- Frontend dapat menampilkan gambar hasil generate.
- Frontend dapat menampilkan error jika gagal.
- Frontend tidak memanggil Cloudflare Worker langsung.
```

---

# 24. Deliverable Backend

```text
1. Migration generated_images
2. Model GeneratedImage
3. CloudflareWorkerImageService
4. ImageGenerationService
5. GenerateImageJob
6. GenerateImageRequest
7. ImageGenerationController
8. Route POST /api/images/generate
9. Route GET /api/images/{id}/status
10. Konfigurasi .env Cloudflare Worker
11. Storage image
12. Queue worker setup
13. Error handling
14. Quota integration
15. Logging
```

---

# 25. Deliverable Frontend

```text
1. GenerateImagePage.jsx
2. ImagePromptForm.jsx
3. ImageGenerationPreview.jsx
4. ImageGenerationStatus.jsx
5. ImageGenerationError.jsx
6. useImageGeneration.js
7. imageService.js
8. Integrasi auth token ke request API
9. Loading state
10. Polling status
11. Preview image_url
12. Error handling UI
```

---

# 26. Prioritas Implementasi

## Backend

```text
1. Tambahkan env Cloudflare Worker URL.
2. Tambahkan config services.php.
3. Buat migration generated_images.
4. Buat model GeneratedImage.
5. Buat GenerateImageRequest.
6. Buat CloudflareWorkerImageService.
7. Buat ImageGenerationService.
8. Buat GenerateImageJob.
9. Buat ImageGenerationController.
10. Tambahkan route API.
11. Jalankan storage:link.
12. Jalankan queue worker.
13. Test generate via Postman/curl.
```

## Frontend

```text
1. Buat imageService.js.
2. Buat useImageGeneration.js.
3. Buat ImagePromptForm.
4. Buat ImageGenerationStatus.
5. Buat ImageGenerationPreview.
6. Buat GenerateImagePage.
7. Integrasikan route frontend.
8. Test prompt valid.
9. Test loading.
10. Test polling status.
11. Test tampil gambar.
12. Test error state.
```

---

# 27. Catatan Penting Implementasi

## 27.1 Backend Harus Request ke Worker Kamu

Backend request ke:

```text
https://dark-mouse-667e.dandysultana3.workers.dev/generate
```

Payload:

```json
{
  "prompt": "test image",
  "width": 512,
  "height": 512
}
```

Worker akan mengembalikan binary image. Backend tidak boleh memperlakukan response ini sebagai JSON jika request berhasil.

---

## 27.2 Frontend Tidak Menangkap Binary Langsung dari Worker

Frontend tidak menangkap gambar langsung dari Cloudflare Worker.

Frontend menangkap:

```text
image_url dari backend
```

Bukan:

```text
binary image dari Worker
```

Ini membuat frontend lebih bersih dan hasil gambar otomatis masuk ke gallery.

---

## 27.3 Queue Worker Wajib Aktif

Jika queue worker mati, status akan terus:

```text
processing
```

Maka saat development harus menjalankan:

```bash
php artisan queue:work
```

---

## 27.4 Storage Link Wajib Aktif

Agar gambar bisa dibuka di browser:

```bash
php artisan storage:link
```

---

# 28. Kesimpulan

Modul **Generate Gambar Cloudflare Worker** harus dibangun dengan dua layer yang siap:

```text
Backend Laravel
- Menerima request dari frontend
- Mengecek auth dan kuota
- Request ke Cloudflare Worker
- Menyimpan gambar
- Memberikan image_url

Frontend React
- Mengirim prompt ke backend
- Menampilkan loading
- Polling status
- Menangkap image_url
- Menampilkan gambar
```

Endpoint utama backend:

```http
POST /api/images/generate
GET  /api/images/{id}/status
```

Endpoint Cloudflare Worker yang digunakan backend:

```http
POST https://dark-mouse-667e.dandysultana3.workers.dev/generate
```

Dengan PRD ini, fitur generate gambar akan siap secara backend dan frontend, aman, rapi, serta langsung terhubung dengan modul gallery hasil generate gambar.
