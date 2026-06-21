# PRD Backend — Modul Image Gallery Hasil Generate Gambar

## 1. Ringkasan Modul

Modul **Image Gallery** adalah modul backend yang digunakan untuk menampilkan, mengelola, dan mengambil data hasil generate gambar milik user.

Modul ini dikembangkan setelah fitur **Generate Gambar Text-to-Image** selesai. Pada modul sebelumnya, sistem sudah mampu membuat gambar, menyimpan file gambar ke storage, dan mencatat datanya ke tabel `generated_images`. Modul Image Gallery akan memanfaatkan data tersebut agar user dapat melihat seluruh hasil generate gambar yang pernah dibuat.

Output utama modul:

```text
User dapat melihat daftar hasil generate gambar miliknya, membuka detail gambar, melakukan pencarian/filter, dan menghapus gambar miliknya sendiri.
```

---

# 2. Tujuan Modul

Tujuan pengembangan Modul Image Gallery adalah:

```text
1. Menyediakan API untuk menampilkan daftar gambar hasil generate milik user.
2. Menyediakan API detail gambar hasil generate.
3. Menyediakan API hapus gambar milik user.
4. Menyediakan fitur search berdasarkan prompt.
5. Menyediakan filter berdasarkan status dan tanggal.
6. Menyediakan pagination agar data galeri tetap ringan.
7. Memastikan user hanya dapat mengakses gambar miliknya sendiri.
8. Menyediakan response JSON standar yang siap dikonsumsi frontend.
```

---

# 3. Scope Backend

## 3.1 In Scope

Yang dikembangkan pada modul ini:

```text
- Endpoint list generated images
- Endpoint detail generated image
- Endpoint delete generated image
- Search berdasarkan prompt
- Filter berdasarkan status
- Filter berdasarkan tanggal
- Pagination
- Sorting data
- Ownership validation
- Delete data generated image
- Delete file gambar dari storage
- Response JSON standar
- Error handling
- GalleryService
- GalleryController
```

---

## 3.2 Out of Scope

Yang tidak dikembangkan pada modul ini:

```text
- Generate gambar baru
- Cloudflare Workers AI
- Queue generate image
- Payment Midtrans
- Pricing plan
- Kuota gambar
- Admin monitoring
- Public marketplace gambar
- Like/share gambar
- Folder/album gallery
- Edit gambar
- Download tracking
- Image moderation lanjutan
- UI frontend React
```

Modul ini hanya fokus pada pengelolaan data hasil generate gambar yang sudah ada.

---

# 4. Ketergantungan Modul

Modul Image Gallery membutuhkan modul sebelumnya:

```text
1. Authentication
   User harus login sebelum mengakses galeri.

2. Generate Gambar Text-to-Image
   Data gambar berasal dari tabel generated_images.

3. Storage
   File gambar sudah disimpan di Laravel Storage atau storage lain.

4. GeneratedImage Model
   Model ini digunakan sebagai sumber data utama galeri.
```

---

# 5. Aktor Sistem

## 5.1 Registered User

User yang sudah login dapat:

```text
- Melihat daftar gambar hasil generate miliknya.
- Melihat detail gambar tertentu.
- Mencari gambar berdasarkan prompt.
- Memfilter gambar berdasarkan status.
- Memfilter gambar berdasarkan tanggal.
- Menghapus gambar miliknya sendiri.
```

---

## 5.2 System Backend

Backend Laravel bertugas:

```text
- Mengambil data generated_images berdasarkan user login.
- Melakukan filtering dan searching.
- Mengembalikan data dengan pagination.
- Mengecek ownership setiap gambar.
- Menghapus data gambar dan file storage.
- Mengembalikan response JSON standar.
```

---

# 6. Alur Utama Modul

## 6.1 Alur Menampilkan Daftar Gallery

```text
User login
↓
User membuka halaman gallery
↓
Frontend request GET /api/images
↓
Backend mengambil generated_images milik user login
↓
Backend menerapkan filter/search/pagination
↓
Backend mengembalikan daftar gambar
↓
Frontend menampilkan gambar dalam bentuk gallery/grid
```

---

## 6.2 Alur Melihat Detail Gambar

```text
User memilih salah satu gambar
↓
Frontend request GET /api/images/{id}
↓
Backend mengecek apakah gambar milik user login
↓
Backend mengambil detail generated image
↓
Backend mengembalikan detail gambar
```

---

## 6.3 Alur Menghapus Gambar

```text
User klik hapus gambar
↓
Frontend request DELETE /api/images/{id}
↓
Backend mengecek ownership gambar
↓
Backend menghapus file gambar dari storage jika tersedia
↓
Backend menghapus data generated_images
↓
Backend mengembalikan response sukses
```

---

# 7. Functional Requirement

---

## FR-01 — Menampilkan Daftar Gallery

### Deskripsi

Sistem harus menyediakan endpoint untuk menampilkan daftar hasil generate gambar milik user login.

### Endpoint

```http
GET /api/images
```

Jika menggunakan versioning:

```http
GET /api/v1/images
```

### Authentication

Wajib login.

```http
Authorization: Bearer {token}
Accept: application/json
```

### Query Parameter

```text
page        optional
per_page    optional
search      optional
status      optional
date_from   optional
date_to     optional
sort_by     optional
sort_order  optional
```

### Contoh Request

```http
GET /api/images?page=1&per_page=12&search=robot&status=completed&date_from=2026-06-01&date_to=2026-06-21
```

### Penjelasan Query Parameter

| Parameter  | Tipe    | Keterangan                                   |
| ---------- | ------- | -------------------------------------------- |
| page       | integer | Halaman data                                 |
| per_page   | integer | Jumlah data per halaman                      |
| search     | string  | Pencarian berdasarkan prompt                 |
| status     | string  | Filter status: processing, completed, failed |
| date_from  | date    | Filter tanggal mulai                         |
| date_to    | date    | Filter tanggal akhir                         |
| sort_by    | string  | Field sorting                                |
| sort_order | string  | asc atau desc                                |

### Default Value

```text
page       = 1
per_page   = 12
sort_by    = created_at
sort_order = desc
```

### Response Success

```json
{
  "success": true,
  "message": "Daftar gambar berhasil diambil.",
  "data": [
    {
      "id": 25,
      "prompt": "A futuristic robot drinking coffee in cyberpunk city",
      "image_url": "http://localhost:8000/storage/generated-images/5/25.png",
      "provider": "cloudflare",
      "model": "@cf/bytedance/stable-diffusion-xl-lightning",
      "status": "completed",
      "width": 1024,
      "height": 1024,
      "created_at": "2026-06-21T10:00:00.000000Z",
      "completed_at": "2026-06-21T10:00:20.000000Z"
    },
    {
      "id": 26,
      "prompt": "A cinematic cat astronaut in space",
      "image_url": null,
      "provider": "cloudflare",
      "model": "@cf/bytedance/stable-diffusion-xl-lightning",
      "status": "processing",
      "width": 1024,
      "height": 1024,
      "created_at": "2026-06-21T10:10:00.000000Z",
      "completed_at": null
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 12,
    "total": 30
  }
}
```

### Business Rule

```text
- User hanya melihat gambar miliknya sendiri.
- Data wajib menggunakan pagination.
- Default data diurutkan dari yang terbaru.
- Search dilakukan berdasarkan prompt.
- Filter status hanya menerima processing, completed, failed.
- Jika tidak ada data, response tetap success dengan data array kosong.
```

### Acceptance Criteria

```text
- Endpoint dapat menampilkan daftar gambar user login.
- Gambar milik user lain tidak tampil.
- Pagination berjalan.
- Search berdasarkan prompt berjalan.
- Filter status berjalan.
- Filter tanggal berjalan.
- Response mengikuti JSON standar.
```

---

## FR-02 — Menampilkan Detail Gambar

### Deskripsi

Sistem harus menyediakan endpoint untuk menampilkan detail satu hasil generate gambar.

### Endpoint

```http
GET /api/images/{id}
```

Jika menggunakan versioning:

```http
GET /api/v1/images/{id}
```

### Authentication

Wajib login.

### Response Success

```json
{
  "success": true,
  "message": "Detail gambar berhasil diambil.",
  "data": {
    "id": 25,
    "prompt": "A futuristic robot drinking coffee in cyberpunk city",
    "negative_prompt": "blurry, low quality, distorted",
    "image_path": "generated-images/5/25.png",
    "image_url": "http://localhost:8000/storage/generated-images/5/25.png",
    "provider": "cloudflare",
    "model": "@cf/bytedance/stable-diffusion-xl-lightning",
    "status": "completed",
    "width": 1024,
    "height": 1024,
    "seed": null,
    "error_message": null,
    "metadata": {
      "duration": 20
    },
    "started_at": "2026-06-21T10:00:01.000000Z",
    "completed_at": "2026-06-21T10:00:20.000000Z",
    "failed_at": null,
    "created_at": "2026-06-21T10:00:00.000000Z"
  }
}
```

### Business Rule

```text
- User hanya bisa membuka detail gambar miliknya.
- Jika gambar bukan milik user login, response 404.
- Jika gambar tidak ditemukan, response 404.
- Detail boleh menampilkan error_message jika status failed.
- Detail tidak boleh menampilkan data sensitif provider.
```

### Acceptance Criteria

```text
- Detail gambar dapat ditampilkan jika milik user login.
- Gambar milik user lain tidak dapat diakses.
- Response detail lengkap dan siap dikonsumsi frontend.
```

---

## FR-03 — Menghapus Gambar

### Deskripsi

Sistem harus menyediakan endpoint agar user dapat menghapus gambar hasil generate miliknya.

### Endpoint

```http
DELETE /api/images/{id}
```

Jika menggunakan versioning:

```http
DELETE /api/v1/images/{id}
```

### Authentication

Wajib login.

### Response Success

```json
{
  "success": true,
  "message": "Gambar berhasil dihapus.",
  "data": null
}
```

### Business Rule

```text
- User hanya bisa menghapus gambar miliknya sendiri.
- Jika gambar memiliki file di storage, file tersebut harus dihapus.
- Setelah file berhasil dihapus, data generated_images dihapus.
- Jika file tidak ditemukan di storage, data database tetap boleh dihapus.
- Gambar milik user lain tidak boleh terhapus.
```

### Catatan Delete

Ada dua opsi delete:

```text
1. Hard delete
   Data generated_images benar-benar dihapus dari database.

2. Soft delete
   Data tidak benar-benar hilang, hanya diberi deleted_at.
```

Rekomendasi MVP:

```text
Gunakan hard delete jika sistem masih sederhana.
Gunakan soft delete jika ingin menyimpan histori untuk audit/admin.
```

Untuk aplikasi AI SaaS, soft delete lebih aman karena histori penggunaan bisa tetap dilacak.

### Acceptance Criteria

```text
- User dapat menghapus gambar miliknya.
- File gambar ikut dihapus dari storage jika ada.
- Data gambar tidak tampil lagi di endpoint gallery.
- User tidak bisa menghapus gambar milik user lain.
```

---

## FR-04 — Search Gambar Berdasarkan Prompt

### Deskripsi

Sistem harus menyediakan pencarian gambar berdasarkan isi prompt.

### Endpoint

```http
GET /api/images?search=robot
```

### Business Rule

```text
- Search mencari keyword pada kolom prompt.
- Search bersifat optional.
- Search hanya berlaku untuk data milik user login.
- Search dapat dikombinasikan dengan filter status dan tanggal.
```

### Contoh

```http
GET /api/images?search=robot&status=completed
```

### Acceptance Criteria

```text
- User dapat mencari gambar berdasarkan prompt.
- Search tidak menampilkan data milik user lain.
- Search dapat dikombinasikan dengan filter lain.
```

---

## FR-05 — Filter Berdasarkan Status

### Deskripsi

Sistem harus menyediakan filter gallery berdasarkan status generate gambar.

### Status yang Didukung

```text
processing
completed
failed
```

### Endpoint

```http
GET /api/images?status=completed
```

### Business Rule

```text
- Jika status tidak dikirim, tampilkan semua status.
- Jika status tidak valid, kembalikan error validasi.
- Status harus sesuai enum yang didukung.
```

### Response Jika Status Tidak Valid

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "status": [
      "Status tidak valid."
    ]
  }
}
```

### Acceptance Criteria

```text
- Filter status completed berjalan.
- Filter status processing berjalan.
- Filter status failed berjalan.
- Status tidak valid ditolak.
```

---

## FR-06 — Filter Berdasarkan Tanggal

### Deskripsi

Sistem harus menyediakan filter berdasarkan tanggal pembuatan gambar.

### Query Parameter

```text
date_from
date_to
```

### Contoh

```http
GET /api/images?date_from=2026-06-01&date_to=2026-06-21
```

### Business Rule

```text
- date_from dan date_to bersifat optional.
- Jika date_from dikirim, ambil data created_at >= date_from.
- Jika date_to dikirim, ambil data created_at <= date_to.
- Format tanggal harus YYYY-MM-DD.
- Filter tanggal hanya berlaku untuk data milik user login.
```

### Acceptance Criteria

```text
- Filter tanggal mulai berjalan.
- Filter tanggal akhir berjalan.
- Filter rentang tanggal berjalan.
- Format tanggal tidak valid ditolak.
```

---

## FR-07 — Pagination Gallery

### Deskripsi

Daftar gallery wajib menggunakan pagination agar data tetap ringan.

### Query Parameter

```text
page
per_page
```

### Business Rule

```text
- Default per_page adalah 12.
- Maksimal per_page adalah 50.
- Jika per_page lebih dari 50, sistem membatasi ke 50 atau mengembalikan validasi error.
```

### Response Pagination

```json
{
  "success": true,
  "message": "Daftar gambar berhasil diambil.",
  "data": [],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 12,
    "total": 60
  }
}
```

### Acceptance Criteria

```text
- Response list gallery memiliki meta pagination.
- Data tidak diambil seluruhnya sekaligus.
- Pagination siap dikonsumsi frontend.
```

---

## FR-08 — Sorting Gallery

### Deskripsi

Sistem harus menyediakan sorting data gallery.

### Query Parameter

```text
sort_by
sort_order
```

### Field Sorting yang Diizinkan

```text
created_at
completed_at
status
```

### Sort Order

```text
asc
desc
```

### Default

```text
sort_by = created_at
sort_order = desc
```

### Business Rule

```text
- Sorting hanya boleh menggunakan field yang diizinkan.
- Jika sort_by tidak valid, gunakan default atau kembalikan validasi error.
- Sorting tetap hanya pada data milik user login.
```

### Acceptance Criteria

```text
- Sorting terbaru berjalan.
- Sorting terlama berjalan.
- Field sorting tidak valid ditolak atau diarahkan ke default.
```

---

# 8. Struktur Database

Modul ini menggunakan tabel yang sudah dibuat pada modul Generate Gambar:

```text
generated_images
```

## Kolom yang Digunakan

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
metadata
started_at
completed_at
failed_at
created_at
updated_at
```

## Index yang Disarankan

```text
user_id
status
created_at
completed_at
```

Jika ingin pencarian prompt lebih optimal, dapat menambahkan index sesuai kebutuhan database. Untuk MVP, pencarian `LIKE` pada prompt masih cukup.

---

# 9. Model dan Relasi

## User Model

Pastikan relasi berikut tersedia:

```php
public function generatedImages()
{
    return $this->hasMany(GeneratedImage::class);
}
```

---

## GeneratedImage Model

Relasi:

```php
public function user()
{
    return $this->belongsTo(User::class);
}
```

Casts yang disarankan:

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

Struktur file yang disarankan:

```text
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── ImageGalleryController.php
│   │
│   └── Requests/
│       └── Image/
│           └── ImageGalleryIndexRequest.php
│
├── Services/
│   └── Image/
│       └── ImageGalleryService.php
│
└── Models/
    └── GeneratedImage.php
```

Jika `GeneratedImage` sudah dibuat pada modul Generate Gambar, tidak perlu dibuat ulang.

---

# 11. Service Design

## ImageGalleryService

### Lokasi

```text
app/Services/Image/ImageGalleryService.php
```

### Tanggung Jawab

```text
- Mengambil daftar generated images milik user.
- Menerapkan search prompt.
- Menerapkan filter status.
- Menerapkan filter tanggal.
- Menerapkan pagination.
- Mengambil detail gambar.
- Menghapus gambar dan file storage.
- Memastikan ownership user.
```

### Method yang Disarankan

```php
public function getUserImages(User $user, array $filters = [])

public function getImageDetail(User $user, int $imageId): GeneratedImage

public function deleteImage(User $user, int $imageId): void
```

---

## 11.1 Method `getUserImages()`

### Tanggung Jawab

```text
1. Query generated_images berdasarkan user_id.
2. Terapkan search jika ada.
3. Terapkan status jika ada.
4. Terapkan date_from/date_to jika ada.
5. Terapkan sorting.
6. Return pagination result.
```

### Business Rule

```text
Query wajib selalu menggunakan user_id dari user login.
```

Contoh prinsip query:

```php
GeneratedImage::where('user_id', $user->id)
```

Jangan menggunakan query tanpa filter user:

```php
GeneratedImage::query()
```

---

## 11.2 Method `getImageDetail()`

### Tanggung Jawab

```text
1. Cari generated image berdasarkan id dan user_id.
2. Jika tidak ditemukan, throw NotFoundException.
3. Return data generated image.
```

Contoh prinsip query:

```php
GeneratedImage::where('user_id', $user->id)->findOrFail($imageId);
```

---

## 11.3 Method `deleteImage()`

### Tanggung Jawab

```text
1. Cari generated image berdasarkan id dan user_id.
2. Jika image_path tersedia, hapus file dari storage.
3. Hapus data generated_images.
4. Return void.
```

### Business Rule

```text
- Jika file tidak ditemukan, proses delete database tetap boleh dilanjutkan.
- Jika storage error, sistem perlu mencatat log.
- Untuk MVP, jika storage error, boleh return error atau tetap hapus database sesuai strategi.
```

Rekomendasi:

```text
Jika storage gagal karena file tidak ada, lanjutkan hapus database.
Jika storage gagal karena error sistem, catat log dan kembalikan error.
```

---

# 12. Controller Design

## ImageGalleryController

### Lokasi

```text
app/Http/Controllers/Api/ImageGalleryController.php
```

### Method

```php
index(ImageGalleryIndexRequest $request)

show($id)

destroy($id)
```

### Tanggung Jawab Controller

```text
- Menerima request API.
- Mengambil user login.
- Memanggil ImageGalleryService.
- Mengembalikan response JSON standar.
```

Controller tidak boleh berisi query kompleks, filter, atau logic delete file secara langsung.

---

# 13. Form Request

## ImageGalleryIndexRequest

### Lokasi

```text
app/Http/Requests/Image/ImageGalleryIndexRequest.php
```

### Rules

```php
[
    'page' => ['nullable', 'integer', 'min:1'],
    'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
    'search' => ['nullable', 'string', 'max:255'],
    'status' => ['nullable', 'string', 'in:processing,completed,failed'],
    'date_from' => ['nullable', 'date_format:Y-m-d'],
    'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
    'sort_by' => ['nullable', 'string', 'in:created_at,completed_at,status'],
    'sort_order' => ['nullable', 'string', 'in:asc,desc'],
]
```

---

# 14. Route Design

Tanpa versioning:

```php
use App\Http\Controllers\Api\ImageGalleryController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/images', [ImageGalleryController::class, 'index']);
    Route::get('/images/{id}', [ImageGalleryController::class, 'show']);
    Route::delete('/images/{id}', [ImageGalleryController::class, 'destroy']);
});
```

Dengan versioning:

```php
use App\Http\Controllers\Api\ImageGalleryController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get('/images', [ImageGalleryController::class, 'index']);
    Route::get('/images/{id}', [ImageGalleryController::class, 'show']);
    Route::delete('/images/{id}', [ImageGalleryController::class, 'destroy']);
});
```

Catatan penting:

Endpoint berikut sudah digunakan oleh modul Generate Gambar:

```http
POST /api/images/generate
GET  /api/images/{id}/status
```

Maka route gallery perlu disusun agar tidak konflik.

Rekomendasi route final:

```php
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::post('/images/generate', [ImageGenerationController::class, 'generate']);
    Route::get('/images/{id}/status', [ImageGenerationController::class, 'status']);

    Route::get('/images', [ImageGalleryController::class, 'index']);
    Route::get('/images/{id}', [ImageGalleryController::class, 'show']);
    Route::delete('/images/{id}', [ImageGalleryController::class, 'destroy']);
});
```

---

# 15. API Contract Lengkap

## 15.1 List Gallery

### Request

```http
GET /api/images?page=1&per_page=12&status=completed&search=robot
Authorization: Bearer {token}
Accept: application/json
```

### Response Success

```json
{
  "success": true,
  "message": "Daftar gambar berhasil diambil.",
  "data": [
    {
      "id": 25,
      "prompt": "A futuristic robot drinking coffee in cyberpunk city",
      "image_url": "http://localhost:8000/storage/generated-images/5/25.png",
      "provider": "cloudflare",
      "model": "@cf/bytedance/stable-diffusion-xl-lightning",
      "status": "completed",
      "width": 1024,
      "height": 1024,
      "created_at": "2026-06-21T10:00:00.000000Z",
      "completed_at": "2026-06-21T10:00:20.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 12,
    "total": 1
  }
}
```

---

## 15.2 Detail Image

### Request

```http
GET /api/images/25
Authorization: Bearer {token}
Accept: application/json
```

### Response Success

```json
{
  "success": true,
  "message": "Detail gambar berhasil diambil.",
  "data": {
    "id": 25,
    "prompt": "A futuristic robot drinking coffee in cyberpunk city",
    "negative_prompt": "blurry, low quality, distorted",
    "image_url": "http://localhost:8000/storage/generated-images/5/25.png",
    "provider": "cloudflare",
    "model": "@cf/bytedance/stable-diffusion-xl-lightning",
    "status": "completed",
    "width": 1024,
    "height": 1024,
    "seed": null,
    "error_message": null,
    "metadata": {
      "duration": 20
    },
    "started_at": "2026-06-21T10:00:01.000000Z",
    "completed_at": "2026-06-21T10:00:20.000000Z",
    "failed_at": null,
    "created_at": "2026-06-21T10:00:00.000000Z"
  }
}
```

---

## 15.3 Delete Image

### Request

```http
DELETE /api/images/25
Authorization: Bearer {token}
Accept: application/json
```

### Response Success

```json
{
  "success": true,
  "message": "Gambar berhasil dihapus.",
  "data": null
}
```

---

# 16. Response Standard

Semua endpoint wajib mengikuti response standar aplikasi.

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
    "per_page": 12,
    "total": 30
  }
}
```

---

# 17. Error Handling

## 17.1 Unauthenticated

```json
{
  "success": false,
  "message": "Unauthenticated.",
  "errors": null
}
```

---

## 17.2 Image Tidak Ditemukan

```json
{
  "success": false,
  "message": "Gambar tidak ditemukan.",
  "errors": null
}
```

Kondisi:

```text
- Gambar tidak ada.
- Gambar ada tetapi milik user lain.
```

Rekomendasi gunakan response 404 untuk keduanya agar tidak membocorkan data user lain.

---

## 17.3 Validation Error

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "status": [
      "Status tidak valid."
    ]
  }
}
```

---

## 17.4 Delete Storage Error

```json
{
  "success": false,
  "message": "Gagal menghapus file gambar. Silakan coba lagi.",
  "errors": null
}
```

Catatan:

Jika file tidak ditemukan, tidak perlu dianggap sebagai error besar. Namun jika storage gagal karena permission/server error, sistem boleh mengembalikan error.

---

# 18. Security Requirement

Kebutuhan keamanan modul:

```text
- Semua endpoint gallery wajib menggunakan auth:sanctum.
- User hanya dapat melihat gambar miliknya sendiri.
- User hanya dapat menghapus gambar miliknya sendiri.
- Query wajib difilter berdasarkan user_id.
- image_path tidak boleh berasal dari input user.
- Response tidak boleh menampilkan path internal sensitif server.
- Error response tidak boleh menampilkan stack trace.
- Raw metadata provider tidak boleh berisi token/API key.
```

Prinsip ownership query:

```php
GeneratedImage::where('user_id', $user->id)->findOrFail($imageId);
```

Jangan menggunakan:

```php
GeneratedImage::findOrFail($imageId);
```

Karena itu berpotensi membuka akses ke data user lain.

---

# 19. Performance Requirement

Kebutuhan performa:

```text
- Endpoint list wajib menggunakan pagination.
- Default per_page 12.
- Maksimal per_page 50.
- Query list tidak mengambil data terlalu besar.
- Gunakan index pada user_id, status, dan created_at.
- Detail gambar diambil hanya saat user membuka gambar tertentu.
- Search prompt menggunakan LIKE untuk MVP.
```

Untuk MVP, search sederhana:

```php
where('prompt', 'like', "%{$search}%")
```

Untuk skala besar, dapat dikembangkan ke full-text search.

---

# 20. Reliability Requirement

Kebutuhan reliabilitas:

```text
- Jika file gambar sudah tidak ada di storage, detail tetap boleh menampilkan data dengan image_url null atau tetap sesuai database.
- Delete data database tidak boleh menghapus file user lain.
- Delete file storage harus berdasarkan image_path yang tersimpan di database.
- Jika proses delete gagal, sistem mencatat log.
- Gallery tidak boleh crash jika ada data status processing atau failed.
```

---

# 21. Logging Requirement

Log yang perlu dicatat:

```text
- User mencoba mengakses gambar milik user lain.
- Gagal menghapus file dari storage.
- Gambar tidak ditemukan saat delete.
- Error query gallery.
```

Data log yang boleh dicatat:

```text
user_id
generated_image_id
image_path
status
error_message
timestamp
```

Data yang tidak boleh dicatat:

```text
API token Cloudflare
Bearer token user
Password user
Data sensitif lain
```

---

# 22. Testing Scenario Backend

## TS-01 — List Gallery Berhasil

```text
Given user sudah login
And user memiliki beberapa generated images
When user request GET /api/images
Then sistem mengembalikan daftar gambar milik user
And response memiliki pagination meta
```

---

## TS-02 — List Gallery Kosong

```text
Given user sudah login
And user belum memiliki generated images
When user request GET /api/images
Then sistem mengembalikan data array kosong
And response tetap success
```

---

## TS-03 — Search Berdasarkan Prompt

```text
Given user sudah login
And user memiliki gambar dengan prompt mengandung kata "robot"
When user request GET /api/images?search=robot
Then sistem mengembalikan gambar yang prompt-nya sesuai
```

---

## TS-04 — Filter Status Completed

```text
Given user sudah login
And user memiliki gambar completed dan failed
When user request GET /api/images?status=completed
Then sistem hanya mengembalikan gambar dengan status completed
```

---

## TS-05 — Filter Tanggal

```text
Given user sudah login
And user memiliki gambar dari beberapa tanggal
When user request GET /api/images?date_from=2026-06-01&date_to=2026-06-21
Then sistem mengembalikan gambar dalam rentang tanggal tersebut
```

---

## TS-06 — Detail Gambar Berhasil

```text
Given user sudah login
And generated image milik user tersedia
When user request GET /api/images/{id}
Then sistem mengembalikan detail gambar
```

---

## TS-07 — Detail Gambar User Lain

```text
Given user A login
And generated image milik user B tersedia
When user A request GET /api/images/{id}
Then sistem mengembalikan 404
```

---

## TS-08 — Delete Gambar Berhasil

```text
Given user sudah login
And generated image milik user tersedia
And file gambar tersedia di storage
When user request DELETE /api/images/{id}
Then file gambar dihapus
And data generated image dihapus
And response success
```

---

## TS-09 — Delete Gambar Milik User Lain

```text
Given user A login
And generated image milik user B tersedia
When user A request DELETE /api/images/{id}
Then sistem mengembalikan 404
And data user B tidak terhapus
And file user B tidak terhapus
```

---

## TS-10 — Status Tidak Valid

```text
Given user sudah login
When user request GET /api/images?status=unknown
Then sistem mengembalikan error validasi
```

---

# 23. Acceptance Criteria Keseluruhan Modul

Modul Image Gallery Backend dianggap selesai jika:

```text
- Endpoint GET /api/images tersedia.
- Endpoint GET /api/images/{id} tersedia.
- Endpoint DELETE /api/images/{id} tersedia.
- Semua endpoint wajib menggunakan auth:sanctum.
- User dapat melihat daftar gambar miliknya.
- User dapat melihat detail gambar miliknya.
- User dapat menghapus gambar miliknya.
- User tidak dapat melihat gambar milik user lain.
- User tidak dapat menghapus gambar milik user lain.
- List gallery menggunakan pagination.
- Search berdasarkan prompt berjalan.
- Filter berdasarkan status berjalan.
- Filter berdasarkan tanggal berjalan.
- Sorting berjalan.
- File gambar ikut dihapus saat delete jika tersedia.
- Response menggunakan JSON standar.
- Error handling berjalan dengan rapi.
- Controller tetap tipis.
- Logic gallery berada di ImageGalleryService.
```

---

# 24. Deliverable Backend

File dan komponen backend yang harus tersedia:

```text
1. ImageGalleryController.php
2. ImageGalleryService.php
3. ImageGalleryIndexRequest.php
4. Route GET /api/images
5. Route GET /api/images/{id}
6. Route DELETE /api/images/{id}
7. Search prompt
8. Filter status
9. Filter tanggal
10. Sorting
11. Pagination
12. Ownership validation
13. Delete file dari storage
14. Response JSON standar
15. Error handling gallery
16. Logging error gallery
```

---

# 25. Prioritas Implementasi

Urutan implementasi yang disarankan:

```text
1. Pastikan model GeneratedImage sudah tersedia.
2. Pastikan relasi User → generatedImages tersedia.
3. Buat ImageGalleryIndexRequest.
4. Buat ImageGalleryService.
5. Implementasikan getUserImages().
6. Implementasikan getImageDetail().
7. Implementasikan deleteImage().
8. Buat ImageGalleryController.
9. Tambahkan route GET /api/images.
10. Tambahkan route GET /api/images/{id}.
11. Tambahkan route DELETE /api/images/{id}.
12. Test list gallery.
13. Test pagination.
14. Test search prompt.
15. Test filter status.
16. Test filter tanggal.
17. Test detail gambar.
18. Test delete gambar.
19. Test ownership user.
20. Test storage delete.
```

---

# 26. Catatan Implementasi Penting

## 26.1 Jangan Mengambil Semua Data Sekaligus

Tidak disarankan:

```php
GeneratedImage::where('user_id', $user->id)->get();
```

Disarankan:

```php
GeneratedImage::where('user_id', $user->id)->paginate($perPage);
```

Karena data gambar bisa terus bertambah.

---

## 26.2 Endpoint Gallery Tidak Melakukan Generate Gambar

Modul gallery hanya membaca dan mengelola data yang sudah ada.

Jangan memanggil:

```text
CloudflareImageService
GenerateImageJob
ImageQuotaService
```

pada endpoint gallery, kecuali ada kebutuhan khusus di masa depan.

---

## 26.3 Delete Harus Aman

Saat menghapus gambar, pastikan query berdasarkan `user_id`.

Tidak aman:

```php
$image = GeneratedImage::findOrFail($id);
```

Aman:

```php
$image = GeneratedImage::where('user_id', $user->id)
    ->findOrFail($id);
```

---

## 26.4 File Storage Boleh Tidak Ada

Jika database masih menyimpan `image_path`, tetapi file sudah tidak ada di storage, delete data tetap boleh dilakukan.

Namun kondisi tersebut perlu dicatat ke log agar bisa dicek.

---

## 26.5 Response List Harus Ringan

Endpoint list gallery tidak perlu mengembalikan semua field detail seperti `metadata`, `error_message` panjang, atau `image_path` internal.

Untuk list cukup:

```text
id
prompt
image_url
provider
model
status
width
height
created_at
completed_at
```

Detail gambar boleh mengembalikan data lebih lengkap.

---

# 27. Kesimpulan

Modul **Image Gallery** adalah modul backend untuk menampilkan dan mengelola hasil generate gambar user.

Dengan modul ini, backend mampu:

```text
Mengambil daftar gambar user
↓
Melakukan search dan filter
↓
Menampilkan detail gambar
↓
Menghapus gambar dan file storage
↓
Menjamin user hanya mengakses data miliknya sendiri
```

Endpoint utama:

```http
GET    /api/images
GET    /api/images/{id}
DELETE /api/images/{id}
```

Modul ini harus dibangun dengan prinsip:

```text
Backend-only
Auth-protected
Ownership-safe
Pagination-first
Storage-aware
Frontend-ready
```

Setelah modul ini selesai, frontend sudah bisa mengambil data galeri gambar dari backend dan menampilkannya dalam bentuk halaman gallery/grid.
