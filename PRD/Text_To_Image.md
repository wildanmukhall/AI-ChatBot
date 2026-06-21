# PRD Backend — Modul Generate Gambar Text-to-Image

## 1. Ringkasan Modul

Modul **Generate Gambar Text-to-Image** adalah modul backend Laravel yang memungkinkan user membuat gambar berdasarkan prompt teks.

Modul ini menggunakan layanan **Cloudflare Workers AI** sebagai provider text-to-image. Backend Laravel bertugas menerima prompt dari user, mengecek kuota gambar, membuat data proses generate, menjalankan proses generate melalui queue, mengirim prompt ke Cloudflare Workers AI, menyimpan hasil gambar ke storage, lalu memperbarui status hasil generate.

Cloudflare Workers AI menyediakan REST API yang dapat dipanggil dari platform mana pun menggunakan **Account ID** dan **API Token**. Endpoint dasarnya menggunakan pola `/accounts/{ACCOUNT_ID}/ai/run/{model}` dengan Authorization Bearer Token. ([Cloudflare Docs][1])

Output utama modul:

```text
User dapat generate gambar dari prompt teks jika memiliki kuota, lalu hasil gambar tersimpan di backend dan dapat ditampilkan oleh frontend.
```

---

# 2. Tujuan Modul

Tujuan pengembangan modul ini adalah:

```text
1. Menyediakan API generate gambar berbasis prompt teks.
2. Mengintegrasikan backend Laravel dengan Cloudflare Workers AI.
3. Mengecek kuota user sebelum generate gambar.
4. Mengurangi kuota saat generate dimulai.
5. Menyimpan data generate gambar ke database.
6. Menjalankan proses generate gambar melalui queue.
7. Menyimpan hasil gambar ke storage.
8. Menyediakan endpoint status generate gambar.
9. Mengembalikan kuota jika proses generate gagal karena sistem/provider.
10. Menyediakan data hasil generate agar siap digunakan oleh modul Gallery.
```

---

# 3. Scope Backend

## 3.1 In Scope

Yang dikembangkan pada modul ini:

```text
- Konfigurasi Cloudflare Workers AI
- CloudflareImageService
- ImageGenerationService
- GenerateImageJob
- GeneratedImage model
- Migration generated_images
- Endpoint generate gambar
- Endpoint cek status generate gambar
- Validasi prompt gambar
- Cek kuota user
- Consume kuota user
- Refund kuota jika generate gagal
- Simpan status processing/completed/failed
- Simpan file gambar ke Laravel Storage
- Simpan path/url gambar ke database
- Error handling Cloudflare Workers AI
- Logging error generate gambar
- Rate limiting endpoint generate gambar
- Response JSON standar
```

---

## 3.2 Out of Scope

Yang tidak dikembangkan pada modul ini:

```text
- Pricing plan
- Payment Midtrans
- Checkout paket
- Admin dashboard
- UI frontend React
- Galeri gambar lengkap
- Delete gambar dari galeri
- Public image marketplace
- Image-to-image
- Inpainting
- Advanced image editing
- NSFW moderation tingkat lanjut
- Multi-provider image generation
```

Catatan: modul ini hanya menangani proses generate gambar dan penyimpanan hasil awal. Modul **Gallery** dapat dikembangkan terpisah untuk list, detail, delete, search, dan filter gambar.

---

# 4. Ketergantungan Modul

Modul Generate Gambar membutuhkan beberapa modul sebelumnya:

```text
1. Authentication
   User harus login sebelum generate gambar.

2. User Image Quota
   Sistem perlu mengetahui sisa kuota generate gambar user.

3. Payment / Pricing Plan
   Tidak dipanggil langsung di modul ini, tetapi menjadi sumber penambahan kuota.

4. Cloudflare Workers AI Configuration
   Backend membutuhkan API Token, Account ID, dan nama model.
```

Jika modul quota belum tersedia, implementasi generate gambar sebaiknya ditunda atau dibuat dengan service kontrak sementara. Namun secara desain final, generate gambar wajib bergantung pada kuota.

---

# 5. Aktor Sistem

## 5.1 Registered User

User yang sudah login dapat:

```text
- Mengirim prompt gambar.
- Melihat status proses generate gambar.
- Menerima URL gambar setelah proses selesai.
```

---

## 5.2 System Backend

Backend Laravel bertugas:

```text
- Validasi prompt.
- Cek kepemilikan kuota.
- Mengurangi kuota.
- Membuat record generated image.
- Dispatch queue job.
- Menjalankan request ke Cloudflare Workers AI.
- Menyimpan gambar.
- Update status generate.
- Refund kuota jika terjadi kegagalan provider/sistem.
```

---

## 5.3 Cloudflare Workers AI

Cloudflare Workers AI bertugas:

```text
- Menerima prompt text-to-image.
- Memproses prompt menggunakan model image generation.
- Mengembalikan hasil gambar ke backend.
```

Cloudflare menyediakan beberapa model text-to-image di Workers AI, termasuk model seperti FLUX, Leonardo, Stable Diffusion XL Lightning, DreamShaper, Stable Diffusion XL Base, dan model text-to-image lain di katalog modelnya. ([Cloudflare Docs][2])

---

# 6. Alur Utama Modul

## 6.1 Alur Generate Gambar Berhasil

```text
User login
↓
User mengirim prompt gambar
↓
Backend validasi prompt
↓
Backend cek sisa kuota user
↓
Jika kuota tersedia, backend mengurangi kuota
↓
Backend membuat record generated_images dengan status processing
↓
Backend menjalankan GenerateImageJob
↓
Backend langsung mengembalikan response processing ke frontend
↓
Queue worker memanggil Cloudflare Workers AI
↓
Cloudflare mengembalikan gambar
↓
Backend menyimpan gambar ke storage
↓
Backend update generated_images menjadi completed
↓
Frontend dapat polling status sampai image_url tersedia
```

---

## 6.2 Alur Kuota Habis

```text
User mengirim prompt gambar
↓
Backend validasi prompt
↓
Backend cek kuota user
↓
Jika kuota 0
↓
Backend menolak request
↓
Backend mengembalikan response error kuota habis
```

---

## 6.3 Alur Generate Gagal

```text
User mengirim prompt
↓
Kuota tersedia dan dikurangi
↓
Record generated_images dibuat status processing
↓
GenerateImageJob berjalan
↓
Request ke Cloudflare gagal / timeout / response tidak valid
↓
Backend update generated_images menjadi failed
↓
Backend menyimpan error_message
↓
Backend mengembalikan kuota user
↓
Error dicatat ke log
```

---

# 7. Functional Requirement

---

## FR-01 — Konfigurasi Cloudflare Workers AI

### Deskripsi

Sistem harus menyediakan konfigurasi Cloudflare Workers AI melalui `.env` dan `config/services.php`.

### Environment Variable

```env
CLOUDFLARE_AI_ACCOUNT_ID=
CLOUDFLARE_AI_API_TOKEN=
CLOUDFLARE_AI_BASE_URL=https://api.cloudflare.com/client/v4
CLOUDFLARE_AI_IMAGE_MODEL=@cf/bytedance/stable-diffusion-xl-lightning
CLOUDFLARE_AI_TIMEOUT=60
CLOUDFLARE_AI_RETRY_TIMES=1
CLOUDFLARE_AI_RETRY_SLEEP=500
```

### `config/services.php`

```php
'cloudflare_ai' => [
    'account_id' => env('CLOUDFLARE_AI_ACCOUNT_ID'),
    'api_token' => env('CLOUDFLARE_AI_API_TOKEN'),
    'base_url' => env('CLOUDFLARE_AI_BASE_URL', 'https://api.cloudflare.com/client/v4'),
    'image_model' => env('CLOUDFLARE_AI_IMAGE_MODEL', '@cf/bytedance/stable-diffusion-xl-lightning'),
    'timeout' => env('CLOUDFLARE_AI_TIMEOUT', 60),
    'retry_times' => env('CLOUDFLARE_AI_RETRY_TIMES', 1),
    'retry_sleep' => env('CLOUDFLARE_AI_RETRY_SLEEP', 500),
],
```

### Business Rule

```text
- API token tidak boleh hardcode.
- API token hanya digunakan di backend.
- Frontend tidak boleh memanggil Cloudflare Workers AI langsung.
- Model image generation harus bisa diganti melalui .env.
```

Cloudflare REST API membutuhkan Account ID dan API Token; token harus dikirim sebagai bearer token ketika menjalankan model melalui API. ([Cloudflare Docs][1])

### Acceptance Criteria

```text
- Konfigurasi Cloudflare tersedia di .env.
- Konfigurasi Cloudflare tersedia di config/services.php.
- Tidak ada API token hardcode.
- Model dapat diganti tanpa mengubah source code.
```

---

## FR-02 — Membuat Tabel `generated_images`

### Deskripsi

Sistem harus menyediakan tabel `generated_images` untuk menyimpan data proses dan hasil generate gambar.

### Tabel Utama

```text
generated_images
```

### Kolom

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
seed
error_message
quota_refunded
metadata
started_at
completed_at
failed_at
created_at
updated_at
```

### Status

```text
processing
completed
failed
```

### Business Rule

```text
- Setiap generated image harus dimiliki oleh user.
- Status awal adalah processing.
- Status berubah menjadi completed jika gambar berhasil disimpan.
- Status berubah menjadi failed jika provider gagal, timeout, atau response tidak valid.
- Prompt wajib disimpan untuk kebutuhan riwayat dan galeri.
```

### Acceptance Criteria

```text
- Tabel generated_images tersedia.
- Model GeneratedImage tersedia.
- Data generate gambar dapat tersimpan dengan status processing.
- Data hasil gambar dapat diperbarui menjadi completed atau failed.
```

---

## FR-03 — CloudflareImageService

### Deskripsi

Sistem harus memiliki service khusus untuk komunikasi dengan Cloudflare Workers AI.

### Lokasi File

```text
app/Services/AI/CloudflareImageService.php
```

### Tanggung Jawab

```text
- Membaca konfigurasi Cloudflare Workers AI.
- Membuat endpoint request model.
- Membuat payload text-to-image.
- Mengirim request menggunakan Laravel HTTP Client.
- Menggunakan timeout.
- Menggunakan retry terbatas jika diperlukan.
- Menerima response gambar.
- Menormalisasi response menjadi binary image.
- Melempar exception jika provider gagal.
```

### Method Utama

```php
public function generateImage(string $prompt, array $options = []): string
```

Return method:

```text
Binary image content
```

### Endpoint Cloudflare

```text
{CLOUDFLARE_AI_BASE_URL}/accounts/{ACCOUNT_ID}/ai/run/{MODEL}
```

Contoh pola endpoint REST untuk menjalankan model Cloudflare Workers AI menggunakan `/accounts/{ACCOUNT_ID}/ai/run/{model}` dan bearer token ditunjukkan pada dokumentasi Cloudflare. ([Cloudflare Docs][1])

### Payload Minimal

```json
{
  "prompt": "A futuristic robot drinking coffee in cyberpunk city"
}
```

### Acceptance Criteria

```text
- Service dapat mengirim prompt ke Cloudflare Workers AI.
- Service menggunakan Laravel HTTP Client.
- Service menggunakan Authorization Bearer token.
- Service menerapkan timeout.
- Service tidak menyimpan gambar langsung ke database.
- Service hanya bertanggung jawab ke komunikasi provider.
```

---

## FR-04 — ImageGenerationService

### Deskripsi

Sistem harus memiliki service bisnis yang mengatur alur generate gambar.

### Lokasi File

```text
app/Services/Image/ImageGenerationService.php
```

### Tanggung Jawab

```text
- Validasi business rule generate gambar.
- Cek kuota user.
- Mengurangi kuota user.
- Membuat record generated_images.
- Dispatch GenerateImageJob.
- Mengambil status generated image.
- Memastikan user hanya mengakses data miliknya sendiri.
```

### Method yang Disarankan

```php
public function requestGeneration(User $user, array $data): GeneratedImage

public function getStatus(User $user, int $generatedImageId): GeneratedImage

public function markAsCompleted(GeneratedImage $image, string $path, string $url, array $metadata = []): GeneratedImage

public function markAsFailed(GeneratedImage $image, string $message): GeneratedImage
```

### Acceptance Criteria

```text
- Controller tidak memuat logic kuota dan dispatch job.
- Semua business rule generate gambar berada di ImageGenerationService.
- User tidak bisa mengakses status generated image milik user lain.
```

---

## FR-05 — Endpoint Generate Gambar

### Deskripsi

Sistem harus menyediakan endpoint agar user dapat meminta generate gambar.

### Endpoint

```http
POST /api/images/generate
```

Jika menggunakan versioning:

```http
POST /api/v1/images/generate
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
  "prompt": "A futuristic robot drinking coffee in cyberpunk city",
  "negative_prompt": "blurry, low quality, distorted",
  "width": 1024,
  "height": 1024
}
```

### Validation Rule

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

Catatan: opsi `width` dan `height` harus disesuaikan dengan model yang dipakai. Untuk MVP, boleh dikunci ke default `1024x1024` agar lebih stabil. SDXL-Lightning pada katalog Cloudflare disebut dapat menghasilkan gambar 1024px dalam beberapa langkah. ([Cloudflare Docs][2])

### Response Success

```json
{
  "success": true,
  "message": "Generate gambar sedang diproses.",
  "data": {
    "id": 25,
    "prompt": "A futuristic robot drinking coffee in cyberpunk city",
    "status": "processing",
    "provider": "cloudflare",
    "model": "@cf/bytedance/stable-diffusion-xl-lightning",
    "created_at": "2026-06-21T10:00:00.000000Z"
  }
}
```

### Business Rule

```text
- User harus login.
- Prompt wajib valid.
- User harus memiliki kuota generate gambar.
- Jika kuota habis, request ditolak.
- Jika kuota tersedia, kuota dikurangi.
- Record generated_images dibuat status processing.
- Proses generate gambar dilakukan melalui queue job.
```

### Acceptance Criteria

```text
- Endpoint dapat menerima prompt valid.
- Endpoint menolak prompt kosong.
- Endpoint menolak user tanpa kuota.
- Endpoint membuat generated image status processing.
- Endpoint mendispatch GenerateImageJob.
- Response langsung dikembalikan tanpa menunggu gambar selesai.
```

---

## FR-06 — Cek dan Consume Kuota

### Deskripsi

Sistem harus mengecek kuota user sebelum generate gambar.

### Business Rule

```text
- Jika remaining_quota <= 0, user tidak bisa generate gambar.
- Jika remaining_quota > 0, sistem mengurangi 1 kuota.
- Pengurangan kuota dilakukan sebelum job berjalan.
- Setiap penggunaan kuota harus tercatat di quota history jika modul quota sudah tersedia.
```

### Error Jika Kuota Habis

```json
{
  "success": false,
  "message": "Kuota generate gambar habis. Silakan pilih paket untuk melanjutkan.",
  "errors": null
}
```

### Acceptance Criteria

```text
- User dengan kuota dapat generate gambar.
- User tanpa kuota tidak dapat generate gambar.
- Kuota berkurang 1 saat request generate diterima.
- Kuota tidak boleh menjadi negatif.
```

---

## FR-07 — Refund Kuota Jika Generate Gagal

### Deskripsi

Jika proses generate gagal karena provider error, timeout, atau error sistem, kuota user harus dikembalikan.

### Business Rule

```text
- Refund hanya dilakukan jika kuota sudah dikurangi.
- Refund hanya dilakukan satu kali.
- Field quota_refunded digunakan untuk mencegah refund dobel.
- Jika gagal karena validasi prompt di awal, kuota tidak dikurangi sehingga tidak perlu refund.
```

### Acceptance Criteria

```text
- Jika Cloudflare gagal, status image menjadi failed.
- Kuota user dikembalikan 1.
- quota_refunded menjadi true.
- Job retry tidak menyebabkan refund dobel.
```

---

## FR-08 — GenerateImageJob

### Deskripsi

Proses generate gambar harus berjalan melalui queue job agar request user tidak timeout.

### Lokasi File

```text
app/Jobs/GenerateImageJob.php
```

### Tanggung Jawab

```text
- Mengambil data GeneratedImage.
- Memanggil CloudflareImageService.
- Menerima binary image.
- Menyimpan gambar ke storage.
- Update status menjadi completed.
- Jika gagal, update status menjadi failed.
- Refund kuota jika diperlukan.
- Logging error.
```

### Queue

```env
QUEUE_CONNECTION=database
```

Untuk production, dapat ditingkatkan ke Redis.

### Acceptance Criteria

```text
- Job dapat diproses oleh queue worker.
- Job menyimpan gambar jika berhasil.
- Job mengubah status completed jika sukses.
- Job mengubah status failed jika gagal.
- Job melakukan refund kuota jika gagal.
```

---

## FR-09 — Penyimpanan File Gambar

### Deskripsi

Hasil generate gambar harus disimpan ke Laravel Storage.

### Disk MVP

```text
public
```

### Path Disarankan

```text
generated-images/{user_id}/{generated_image_id}.png
```

Contoh:

```text
storage/app/public/generated-images/5/25.png
```

URL publik:

```text
/storage/generated-images/5/25.png
```

### Business Rule

```text
- File gambar tidak disimpan langsung sebagai blob di database.
- Database hanya menyimpan image_path dan image_url.
- Nama file harus unik.
- Folder dipisah berdasarkan user_id agar lebih rapi.
```

### Acceptance Criteria

```text
- File gambar tersimpan di storage.
- image_path tersimpan di database.
- image_url tersedia untuk frontend.
- URL dapat diakses jika storage link sudah dibuat.
```

Command Laravel:

```bash
php artisan storage:link
```

---

## FR-10 — Endpoint Cek Status Generate Gambar

### Deskripsi

Sistem harus menyediakan endpoint agar frontend dapat mengecek status proses generate gambar.

### Endpoint

```http
GET /api/images/{id}/status
```

Jika menggunakan versioning:

```http
GET /api/v1/images/{id}/status
```

### Authentication

Wajib login.

### Response Saat Processing

```json
{
  "success": true,
  "message": "Status generate gambar berhasil diambil.",
  "data": {
    "id": 25,
    "status": "processing",
    "image_url": null,
    "error_message": null,
    "created_at": "2026-06-21T10:00:00.000000Z",
    "completed_at": null,
    "failed_at": null
  }
}
```

### Response Saat Completed

```json
{
  "success": true,
  "message": "Status generate gambar berhasil diambil.",
  "data": {
    "id": 25,
    "status": "completed",
    "image_url": "http://localhost:8000/storage/generated-images/5/25.png",
    "error_message": null,
    "created_at": "2026-06-21T10:00:00.000000Z",
    "completed_at": "2026-06-21T10:00:20.000000Z",
    "failed_at": null
  }
}
```

### Response Saat Failed

```json
{
  "success": true,
  "message": "Status generate gambar berhasil diambil.",
  "data": {
    "id": 25,
    "status": "failed",
    "image_url": null,
    "error_message": "Gagal generate gambar. Kuota telah dikembalikan.",
    "created_at": "2026-06-21T10:00:00.000000Z",
    "completed_at": null,
    "failed_at": "2026-06-21T10:00:20.000000Z"
  }
}
```

### Business Rule

```text
- User hanya bisa melihat status generated image miliknya.
- Jika generated image bukan milik user, response 404.
- Response tidak boleh membocorkan detail internal provider.
```

### Acceptance Criteria

```text
- Endpoint dapat mengembalikan status processing.
- Endpoint dapat mengembalikan status completed.
- Endpoint dapat mengembalikan status failed.
- User tidak bisa melihat status gambar milik user lain.
```

---

## FR-11 — Error Handling Cloudflare Workers AI

### Deskripsi

Sistem harus menangani error dari Cloudflare Workers AI dengan aman.

### Kondisi Error

```text
- API token kosong
- Account ID kosong
- Model tidak valid
- Request timeout
- Response 401/403
- Response 429 rate limit
- Response 500 dari provider
- Response tidak berupa gambar
- Gagal menyimpan file ke storage
```

Cloudflare mendokumentasikan rate limit Workers AI berdasarkan task type; Text-to-Image memiliki batas default 720 request per menit, dengan beberapa model memiliki batas khusus. Karena batas ini dapat berubah dan tergantung model/akun, backend tetap harus memiliki rate limit internal dan error handling untuk response 429. ([Cloudflare Docs][3])

### Response Error ke User

```json
{
  "success": false,
  "message": "Gagal memproses generate gambar. Silakan coba beberapa saat lagi.",
  "errors": null
}
```

### Acceptance Criteria

```text
- Error provider tidak membuat aplikasi crash.
- Status generated image menjadi failed.
- Error dicatat ke log.
- API token tidak muncul di response atau log.
- Kuota dikembalikan jika sudah terpotong.
```

---

## FR-12 — Rate Limiting Generate Gambar

### Deskripsi

Endpoint generate gambar harus dibatasi karena menggunakan resource AI dan kuota.

### Rekomendasi Rate Limit

```text
POST /api/images/generate
5 request / menit / user
```

### Business Rule

```text
- Rate limit diterapkan di route atau middleware.
- Rate limit internal tetap diperlukan meskipun Cloudflare memiliki limit provider.
- Jika rate limit terlampaui, request ditolak sebelum kuota dikurangi.
```

### Response Rate Limit

```json
{
  "success": false,
  "message": "Terlalu banyak request generate gambar. Silakan coba lagi nanti.",
  "errors": null
}
```

### Acceptance Criteria

```text
- Endpoint generate gambar memiliki rate limit.
- Kuota tidak berkurang jika request ditolak karena rate limit.
```

---

# 8. Struktur Database

## Tabel `generated_images`

### Fungsi

Menyimpan proses dan hasil generate gambar user.

### Kolom Detail

| Kolom           | Tipe                    | Keterangan                      |
| --------------- | ----------------------- | ------------------------------- |
| id              | bigint                  | Primary key                     |
| user_id         | bigint                  | Relasi ke users                 |
| prompt          | text                    | Prompt utama                    |
| negative_prompt | text nullable           | Prompt negatif                  |
| image_path      | string nullable         | Path file di storage            |
| image_url       | string nullable         | URL publik gambar               |
| provider        | string                  | cloudflare                      |
| model           | string                  | Model Workers AI                |
| status          | string                  | processing/completed/failed     |
| width           | integer nullable        | Lebar gambar                    |
| height          | integer nullable        | Tinggi gambar                   |
| seed            | string/integer nullable | Seed jika model mendukung       |
| error_message   | text nullable           | Pesan error aman                |
| quota_refunded  | boolean                 | Status refund kuota             |
| metadata        | json nullable           | Data tambahan provider/internal |
| started_at      | timestamp nullable      | Waktu job mulai                 |
| completed_at    | timestamp nullable      | Waktu selesai                   |
| failed_at       | timestamp nullable      | Waktu gagal                     |
| created_at      | timestamp               | Waktu dibuat                    |
| updated_at      | timestamp               | Waktu diperbarui                |

### Index

```text
user_id
status
provider
created_at
```

---

# 9. Model dan Relasi

## 9.1 User Model

```php
public function generatedImages()
{
    return $this->hasMany(GeneratedImage::class);
}
```

---

## 9.2 GeneratedImage Model

```php
public function user()
{
    return $this->belongsTo(User::class);
}
```

### Fillable

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
    'seed',
    'error_message',
    'quota_refunded',
    'metadata',
    'started_at',
    'completed_at',
    'failed_at',
];
```

### Casts

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

# 10. Struktur File Backend

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
│   │   └── CloudflareImageService.php
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

Migration:

```text
database/migrations/xxxx_xx_xx_xxxxxx_create_generated_images_table.php
```

---

# 11. Service Design

## 11.1 CloudflareImageService

### Method

```php
public function generateImage(string $prompt, array $options = []): string
```

### Tanggung Jawab

```text
- Request ke Cloudflare Workers AI.
- Handle timeout.
- Handle response failed.
- Return binary image.
```

---

## 11.2 ImageGenerationService

### Method

```php
public function requestGeneration(User $user, array $data): GeneratedImage

public function getStatus(User $user, int $id): GeneratedImage

public function complete(GeneratedImage $image, string $path, string $url, array $metadata = []): GeneratedImage

public function fail(GeneratedImage $image, string $message): GeneratedImage
```

### Tanggung Jawab

```text
- Business logic generate image.
- Ownership validation.
- Status management.
- Integrasi kuota.
```

---

## 11.3 ImageQuotaService

Method minimal yang dibutuhkan:

```php
public function hasQuota(User $user): bool

public function consume(User $user, int $amount = 1, array $context = []): void

public function refund(User $user, int $amount = 1, array $context = []): void
```

---

# 12. Controller Design

## ImageGenerationController

Lokasi:

```text
app/Http/Controllers/Api/ImageGenerationController.php
```

Method:

```php
generate(GenerateImageRequest $request)

status($id)
```

Tanggung jawab:

```text
- Menerima request.
- Mengambil user login.
- Memanggil ImageGenerationService.
- Mengembalikan response JSON standar.
```

Controller tidak boleh langsung memanggil Cloudflare API atau mengurangi kuota.

---

# 13. Form Request

## GenerateImageRequest

Lokasi:

```text
app/Http/Requests/Image/GenerateImageRequest.php
```

Rules:

```php
[
    'prompt' => ['required', 'string', 'min:3', 'max:1000'],
    'negative_prompt' => ['nullable', 'string', 'max:1000'],
    'width' => ['nullable', 'integer', 'in:512,768,1024'],
    'height' => ['nullable', 'integer', 'in:512,768,1024'],
]
```

---

# 14. Route Design

Tanpa versioning:

```php
use App\Http\Controllers\Api\ImageGenerationController;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/images/generate', [ImageGenerationController::class, 'generate'])
        ->middleware('throttle:5,1');

    Route::get('/images/{id}/status', [ImageGenerationController::class, 'status']);
});
```

Dengan versioning:

```php
use App\Http\Controllers\Api\ImageGenerationController;

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    Route::post('/images/generate', [ImageGenerationController::class, 'generate'])
        ->middleware('throttle:5,1');

    Route::get('/images/{id}/status', [ImageGenerationController::class, 'status']);
});
```

---

# 15. API Contract Lengkap

## 15.1 Generate Gambar

```http
POST /api/images/generate
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

Body:

```json
{
  "prompt": "A futuristic robot drinking coffee in cyberpunk city",
  "negative_prompt": "blurry, low quality, distorted",
  "width": 1024,
  "height": 1024
}
```

Success response:

```json
{
  "success": true,
  "message": "Generate gambar sedang diproses.",
  "data": {
    "id": 25,
    "prompt": "A futuristic robot drinking coffee in cyberpunk city",
    "status": "processing",
    "provider": "cloudflare",
    "model": "@cf/bytedance/stable-diffusion-xl-lightning",
    "created_at": "2026-06-21T10:00:00.000000Z"
  }
}
```

---

## 15.2 Cek Status Gambar

```http
GET /api/images/25/status
Authorization: Bearer {token}
Accept: application/json
```

Completed response:

```json
{
  "success": true,
  "message": "Status generate gambar berhasil diambil.",
  "data": {
    "id": 25,
    "status": "completed",
    "image_url": "http://localhost:8000/storage/generated-images/5/25.png",
    "error_message": null,
    "completed_at": "2026-06-21T10:00:20.000000Z"
  }
}
```

---

# 16. Response Standard

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

## Validation Error

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

---

# 17. Error Handling

## 17.1 Kuota Habis

```json
{
  "success": false,
  "message": "Kuota generate gambar habis. Silakan pilih paket untuk melanjutkan.",
  "errors": null
}
```

---

## 17.2 Cloudflare Gagal

```json
{
  "success": false,
  "message": "Layanan generate gambar sedang mengalami gangguan. Silakan coba beberapa saat lagi.",
  "errors": null
}
```

---

## 17.3 Generated Image Tidak Ditemukan

```json
{
  "success": false,
  "message": "Data generate gambar tidak ditemukan.",
  "errors": null
}
```

---

## 17.4 Rate Limit

```json
{
  "success": false,
  "message": "Terlalu banyak request generate gambar. Silakan coba lagi nanti.",
  "errors": null
}
```

---

# 18. Security Requirement

```text
- Endpoint generate gambar wajib auth:sanctum.
- User hanya dapat melihat status gambar miliknya.
- API token Cloudflare tidak boleh dikirim ke frontend.
- API token Cloudflare tidak boleh muncul di log.
- Prompt wajib divalidasi.
- File path harus dibuat oleh sistem, bukan dari input user.
- Error provider tidak boleh membocorkan detail internal.
- Rate limit wajib diterapkan pada endpoint generate.
```

---

# 19. Performance Requirement

```text
- Generate gambar wajib menggunakan queue.
- Request HTTP awal tidak menunggu gambar selesai.
- Endpoint status harus ringan.
- File gambar disimpan di storage, bukan database.
- Query status harus difilter berdasarkan user_id.
- Queue worker harus dapat memproses job secara terpisah.
```

Cloudflare Workers AI memiliki pricing dan batas penggunaan tersendiri; dokumentasi pricing menyebut penggunaan Workers AI dihitung dalam “Neurons” dan memiliki alokasi gratis harian, sehingga aplikasi tetap perlu mengontrol penggunaan melalui kuota internal agar biaya dan abuse lebih terkendali. ([Cloudflare Docs][4])

---

# 20. Reliability Requirement

```text
- Jika Cloudflare timeout, status image menjadi failed.
- Jika storage gagal menyimpan file, status image menjadi failed.
- Jika job gagal, error tercatat pada log.
- Jika generate gagal setelah kuota dikurangi, kuota dikembalikan.
- Refund kuota harus idempotent.
- Job retry tidak boleh membuat gambar dobel tanpa kontrol.
```

---

# 21. Logging Requirement

Log yang perlu dicatat:

```text
- Generate image requested
- Cloudflare request failed
- Cloudflare timeout
- Invalid image response
- Storage save failed
- Job failed
- Quota refunded
```

Data log yang boleh dicatat:

```text
generated_image_id
user_id
provider
model
status
error_message
timestamp
```

Data yang tidak boleh dicatat:

```text
CLOUDFLARE_AI_API_TOKEN
Bearer token user
Password user
Data sensitif lain
```

---

# 22. Testing Scenario Backend

## TS-01 — Generate Gambar Berhasil

```text
Given user sudah login
And user memiliki kuota
When user request POST /api/images/generate dengan prompt valid
Then generated_images dibuat status processing
And kuota user berkurang 1
And GenerateImageJob dikirim ke queue
```

---

## TS-02 — Job Generate Berhasil

```text
Given generated image status processing
When GenerateImageJob berhasil menerima gambar dari Cloudflare
Then file gambar disimpan ke storage
And status berubah menjadi completed
And image_url tersimpan
```

---

## TS-03 — Kuota Habis

```text
Given user sudah login
And user tidak memiliki kuota
When user request generate gambar
Then sistem mengembalikan error kuota habis
And generated_images tidak dibuat
And job tidak dikirim
```

---

## TS-04 — Prompt Kosong

```text
Given user sudah login
When user request generate gambar dengan prompt kosong
Then sistem mengembalikan error validasi
And kuota tidak berkurang
```

---

## TS-05 — Cloudflare Timeout

```text
Given generated image status processing
When Cloudflare request timeout
Then status berubah menjadi failed
And kuota dikembalikan
And error dicatat pada log
```

---

## TS-06 — Cek Status Completed

```text
Given generated image milik user status completed
When user request GET /api/images/{id}/status
Then sistem mengembalikan image_url
```

---

## TS-07 — Akses Status Gambar User Lain

```text
Given user A login
And generated image milik user B tersedia
When user A request GET /api/images/{id}/status
Then sistem mengembalikan 404
```

---

## TS-08 — Rate Limit

```text
Given user sudah login
When user melakukan request generate melebihi batas
Then sistem mengembalikan response rate limit
And kuota tidak berkurang
```

---

# 23. Acceptance Criteria Keseluruhan Modul

Modul Generate Gambar Text-to-Image dianggap selesai jika:

```text
- Konfigurasi Cloudflare Workers AI tersedia.
- Tabel generated_images tersedia.
- Model GeneratedImage tersedia.
- CloudflareImageService tersedia.
- ImageGenerationService tersedia.
- GenerateImageJob tersedia.
- Endpoint POST /api/images/generate tersedia.
- Endpoint GET /api/images/{id}/status tersedia.
- Endpoint generate wajib auth.
- Prompt divalidasi.
- Kuota dicek sebelum generate.
- Kuota berkurang saat request diterima.
- Record generated image dibuat dengan status processing.
- Generate gambar berjalan melalui queue.
- Gambar disimpan ke storage jika berhasil.
- Status berubah menjadi completed jika berhasil.
- Status berubah menjadi failed jika gagal.
- Kuota dikembalikan jika gagal karena provider/sistem.
- User hanya bisa melihat status gambar miliknya.
- Response menggunakan format JSON standar.
- Error provider ditangani dengan rapi.
```

---

# 24. Deliverable Backend

```text
1. Migration create_generated_images_table
2. Model GeneratedImage
3. Relasi User → generatedImages
4. CloudflareImageService
5. ImageGenerationService
6. GenerateImageJob
7. GenerateImageRequest
8. ImageGenerationController
9. Route POST /api/images/generate
10. Route GET /api/images/{id}/status
11. Konfigurasi Cloudflare di .env.example
12. Konfigurasi Cloudflare di config/services.php
13. Storage path generated-images
14. Queue processing
15. Status processing/completed/failed
16. Error handling provider
17. Refund kuota jika gagal
18. Logging generate image
```

---

# 25. Prioritas Implementasi

```text
1. Tambahkan konfigurasi Cloudflare Workers AI di .env dan .env.example.
2. Tambahkan konfigurasi Cloudflare di config/services.php.
3. Buat migration generated_images.
4. Buat model GeneratedImage.
5. Tambahkan relasi User → generatedImages.
6. Buat GenerateImageRequest.
7. Buat CloudflareImageService.
8. Buat ImageGenerationService.
9. Buat GenerateImageJob.
10. Buat ImageGenerationController.
11. Tambahkan route generate dan status.
12. Integrasikan ImageQuotaService.
13. Test validasi prompt.
14. Test kuota habis.
15. Test generate status processing.
16. Jalankan queue worker.
17. Test Cloudflare response.
18. Test file tersimpan di storage.
19. Test status completed.
20. Test error provider dan refund kuota.
21. Test ownership status gambar.
```

---

# 26. Catatan Implementasi Penting

## 26.1 Jangan Proses Generate Langsung di Controller

Tidak disarankan:

```php
public function generate(Request $request)
{
    $image = Http::post(...);
}
```

Disarankan:

```text
Controller
↓
ImageGenerationService
↓
GenerateImageJob
↓
CloudflareImageService
↓
Storage
```

---

## 26.2 Kuota Dikurangi Sebelum Job, Refund Jika Gagal

Alur yang disarankan:

```text
Request valid
↓
Cek kuota
↓
Kurangi kuota
↓
Buat generated_images
↓
Dispatch job
↓
Jika job gagal, refund kuota
```

---

## 26.3 Web/App Tidak Boleh Memanggil Cloudflare Langsung

Frontend hanya boleh memanggil backend:

```text
Frontend → Laravel API → Cloudflare Workers AI
```

Bukan:

```text
Frontend → Cloudflare Workers AI
```

Tujuannya agar API token aman dan kuota tetap dikontrol backend.

---

## 26.4 Queue Worker Wajib Berjalan

Untuk menjalankan job:

```bash
php artisan queue:work
```

Jika queue worker tidak berjalan, status akan tetap `processing`.

---

## 26.5 Storage Link Wajib untuk Akses Public

Agar image URL bisa diakses browser:

```bash
php artisan storage:link
```

---

# 27. Kesimpulan

Modul **Generate Gambar Text-to-Image** adalah modul inti untuk fitur AI Image Generation.

Dengan modul ini, backend mampu:

```text
Menerima prompt gambar
↓
Cek kuota user
↓
Kurangi kuota
↓
Buat status processing
↓
Generate gambar via Cloudflare Workers AI
↓
Simpan gambar ke storage
↓
Update status completed/failed
↓
Sediakan status dan image_url untuk frontend
```

Endpoint utama:

```http
POST /api/images/generate
GET  /api/images/{id}/status
```

Modul ini harus dibangun dengan prinsip:

```text
Backend-first
Queue-based
Quota-protected
Provider-safe
Storage-based
Idempotent refund
Siap dikonsumsi frontend
```
