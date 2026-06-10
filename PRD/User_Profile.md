# PRD Backend — Modul 3: User & Profile

## 1. Ringkasan Modul

Modul **User & Profile** adalah modul backend yang menyediakan API agar pengguna yang sudah login dapat melihat dan mengelola data akun miliknya sendiri.

Modul ini hanya berfokus pada backend Laravel. Frontend React tidak termasuk dalam scope implementasi, tetapi endpoint dan response harus disusun secara konsisten agar siap dikonsumsi oleh frontend pada tahap integrasi berikutnya.

Output utama modul ini:

```text
User bisa melihat dan mengubah data akun miliknya.
```

---

# 2. Tujuan Modul

Tujuan pengembangan Modul User & Profile adalah:

```text
1. Menyediakan API untuk melihat profile user yang sedang login.
2. Menyediakan API untuk mengubah nama user.
3. Menyediakan API untuk mengubah password user secara aman.
4. Menyediakan API untuk menampilkan statistik dasar akun user.
5. Memastikan user hanya dapat mengakses data miliknya sendiri.
6. Menyediakan response JSON standar agar mudah dikonsumsi frontend.
```

---

# 3. Scope Backend

## 3.1 In Scope

Yang dikembangkan pada modul ini:

```text
- Endpoint lihat profile
- Endpoint update nama
- Endpoint update password
- Endpoint statistik dasar user
- ProfileController
- ProfileService
- UpdateProfileRequest
- UpdatePasswordRequest
- Validasi input
- Hash password baru
- Pengecekan password lama
- Query statistik dasar user
- Auth middleware
- Response JSON standar
- Error handling
```

---

## 3.2 Out of Scope

Yang tidak dikembangkan pada modul ini:

```text
- Upload foto profile
- Update email
- Verifikasi email
- Reset password via email
- Delete akun
- Role management
- Admin edit user
- UI frontend React
- Komponen frontend
- State management frontend
- Styling halaman profile
```

---

# 4. Aktor Sistem

## 4.1 Registered User

User yang sudah login dapat:

```text
- Melihat profile miliknya
- Mengubah nama akun
- Mengubah password akun
- Melihat statistik dasar akun
```

---

## 4.2 System

Sistem bertugas:

```text
- Mengambil data user berdasarkan token login
- Memvalidasi request update profile
- Memvalidasi request update password
- Mengecek password lama
- Melakukan hashing password baru
- Mengambil statistik dasar milik user
- Mengembalikan response JSON standar
```

---

# 5. Endpoint Modul

Endpoint yang harus tersedia:

```http
GET  /api/profile
PUT  /api/profile
PUT  /api/profile/password
GET  /api/profile/stats
```

Semua endpoint wajib menggunakan middleware:

```text
auth:sanctum
```

Jika menggunakan API versioning, endpoint menjadi:

```http
GET  /api/v1/profile
PUT  /api/v1/profile
PUT  /api/v1/profile/password
GET  /api/v1/profile/stats
```

---

# 6. Functional Requirement

---

## FR-01 — Lihat Profile User

### Deskripsi

Sistem harus menyediakan endpoint untuk mengambil data profile user yang sedang login.

### Endpoint

```http
GET /api/profile
```

### Authentication

Wajib login.

Header:

```http
Authorization: Bearer {token}
Accept: application/json
```

### Response Success

```json
{
  "success": true,
  "message": "Profile berhasil diambil.",
  "data": {
    "id": 1,
    "name": "Dandy Sultana",
    "email": "dandy@example.com",
    "role": "user",
    "created_at": "2026-06-10T10:00:00.000000Z",
    "updated_at": "2026-06-10T10:00:00.000000Z"
  }
}
```

### Business Rule

```text
- Data yang dikembalikan adalah data user yang sedang login.
- Password tidak boleh dikembalikan.
- Token tidak boleh dikembalikan.
- Data user lain tidak boleh bisa diakses.
```

### Acceptance Criteria

```text
- Endpoint hanya bisa diakses oleh user login.
- Response mengembalikan data user yang sesuai dengan token.
- Response tidak mengandung field password.
- Response menggunakan format JSON standar.
```

---

## FR-02 — Update Nama User

### Deskripsi

Sistem harus menyediakan endpoint agar user dapat memperbarui nama akun miliknya.

### Endpoint

```http
PUT /api/profile
```

### Authentication

Wajib login.

Header:

```http
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

### Request Body

```json
{
  "name": "Dandy Sultana Putra"
}
```

### Validation Rule

```text
name:
- required
- string
- min:3
- max:100
```

### Response Success

```json
{
  "success": true,
  "message": "Profile berhasil diperbarui.",
  "data": {
    "id": 1,
    "name": "Dandy Sultana Putra",
    "email": "dandy@example.com",
    "role": "user",
    "updated_at": "2026-06-10T10:20:00.000000Z"
  }
}
```

### Response Validation Error

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "name": [
      "Nama wajib diisi."
    ]
  }
}
```

### Business Rule

```text
- User hanya dapat memperbarui nama miliknya sendiri.
- Endpoint ini hanya memperbarui field name.
- Email tidak boleh diubah melalui endpoint ini.
- Password tidak boleh diubah melalui endpoint ini.
- Role tidak boleh diubah melalui endpoint ini.
```

### Acceptance Criteria

```text
- Nama berhasil diperbarui jika input valid.
- Nama tidak berubah jika validasi gagal.
- Email, password, dan role tidak berubah.
- Response mengembalikan data user terbaru.
```

---

## FR-03 — Update Password User

### Deskripsi

Sistem harus menyediakan endpoint agar user dapat mengganti password akun miliknya secara aman.

### Endpoint

```http
PUT /api/profile/password
```

### Authentication

Wajib login.

Header:

```http
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

### Request Body

```json
{
  "current_password": "password_lama",
  "password": "password_baru",
  "password_confirmation": "password_baru"
}
```

### Validation Rule

```text
current_password:
- required
- string

password:
- required
- string
- min:8
- confirmed
```

Catatan:

```text
Rule confirmed membutuhkan field password_confirmation.
```

### Response Success

```json
{
  "success": true,
  "message": "Password berhasil diperbarui.",
  "data": null
}
```

### Response Jika Password Lama Salah

```json
{
  "success": false,
  "message": "Password lama tidak sesuai.",
  "errors": {
    "current_password": [
      "Password lama tidak sesuai."
    ]
  }
}
```

### Business Rule

```text
- Sistem wajib mengecek current_password sebelum mengganti password.
- Jika current_password salah, password tidak boleh berubah.
- Password baru wajib disimpan dalam bentuk hash.
- Password lama dan password baru tidak boleh muncul di response.
- Endpoint ini hanya mengubah field password.
```

### Acceptance Criteria

```text
- Password berhasil diubah jika current_password benar.
- Password tidak berubah jika current_password salah.
- Password baru tersimpan dalam bentuk hash.
- Response tidak mengembalikan password.
- Response menggunakan format JSON standar.
```

---

## FR-04 — Menampilkan Statistik Dasar User

### Deskripsi

Sistem harus menyediakan endpoint untuk menampilkan statistik dasar akun user.

Statistik digunakan untuk memberikan gambaran singkat tentang aktivitas user di dalam aplikasi.

### Endpoint

```http
GET /api/profile/stats
```

### Authentication

Wajib login.

Header:

```http
Authorization: Bearer {token}
Accept: application/json
```

### Statistik yang Ditampilkan

Statistik dasar yang direkomendasikan:

```text
- Total chat session
- Total pesan user
- Total pesan assistant
- Total seluruh chat message
- Total generated image
- Sisa kuota gambar
- Total kuota gambar yang sudah digunakan
- Total order
- Total order paid
```

Namun karena modul ini bisa dikembangkan sebelum generate image, quota, dan payment selesai, maka data yang belum tersedia dapat dikembalikan dengan nilai `0`.

### Response Success

```json
{
  "success": true,
  "message": "Statistik profile berhasil diambil.",
  "data": {
    "chat": {
      "total_sessions": 12,
      "total_user_messages": 40,
      "total_assistant_messages": 40,
      "total_messages": 80
    },
    "image": {
      "total_generated_images": 0,
      "remaining_quota": 0,
      "total_used_quota": 0
    },
    "payment": {
      "total_orders": 0,
      "total_paid_orders": 0
    }
  }
}
```

### Business Rule

```text
- Statistik hanya dihitung dari data milik user login.
- User tidak boleh melihat statistik user lain.
- Jika tabel/modul tertentu belum tersedia, sistem tidak boleh crash.
- Nilai statistik default adalah 0 jika data belum ada.
```

### Acceptance Criteria

```text
- Endpoint hanya bisa diakses oleh user login.
- Statistik chat dihitung berdasarkan user login.
- Statistik image/payment dikembalikan aman walaupun datanya belum ada.
- Response menggunakan format JSON standar.
```

---

# 7. API Contract Lengkap

## 7.1 GET /api/profile

### Request

```http
GET /api/profile
Authorization: Bearer {token}
Accept: application/json
```

### Success Response

```json
{
  "success": true,
  "message": "Profile berhasil diambil.",
  "data": {
    "id": 1,
    "name": "Dandy Sultana",
    "email": "dandy@example.com",
    "role": "user",
    "created_at": "2026-06-10T10:00:00.000000Z",
    "updated_at": "2026-06-10T10:00:00.000000Z"
  }
}
```

---

## 7.2 PUT /api/profile

### Request

```http
PUT /api/profile
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

### Body

```json
{
  "name": "Dandy Sultana Putra"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Profile berhasil diperbarui.",
  "data": {
    "id": 1,
    "name": "Dandy Sultana Putra",
    "email": "dandy@example.com",
    "role": "user",
    "updated_at": "2026-06-10T10:20:00.000000Z"
  }
}
```

---

## 7.3 PUT /api/profile/password

### Request

```http
PUT /api/profile/password
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

### Body

```json
{
  "current_password": "password_lama",
  "password": "password_baru",
  "password_confirmation": "password_baru"
}
```

### Success Response

```json
{
  "success": true,
  "message": "Password berhasil diperbarui.",
  "data": null
}
```

---

## 7.4 GET /api/profile/stats

### Request

```http
GET /api/profile/stats
Authorization: Bearer {token}
Accept: application/json
```

### Success Response

```json
{
  "success": true,
  "message": "Statistik profile berhasil diambil.",
  "data": {
    "chat": {
      "total_sessions": 12,
      "total_user_messages": 40,
      "total_assistant_messages": 40,
      "total_messages": 80
    },
    "image": {
      "total_generated_images": 0,
      "remaining_quota": 0,
      "total_used_quota": 0
    },
    "payment": {
      "total_orders": 0,
      "total_paid_orders": 0
    }
  }
}
```

---

# 8. Struktur File Backend

Struktur file yang disarankan:

```text
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── ProfileController.php
│   │
│   └── Requests/
│       └── Profile/
│           ├── UpdateProfileRequest.php
│           └── UpdatePasswordRequest.php
│
├── Services/
│   └── Profile/
│       └── ProfileService.php
│
└── Models/
    └── User.php
```

---

# 9. Controller Design

## ProfileController

Lokasi:

```text
app/Http/Controllers/Api/ProfileController.php
```

Method yang dibutuhkan:

```php
show()
update(UpdateProfileRequest $request)
updatePassword(UpdatePasswordRequest $request)
stats()
```

Tanggung jawab controller:

```text
- Menerima request dari API route.
- Mengambil user login dari request.
- Memanggil ProfileService.
- Mengembalikan response JSON standar.
```

Controller tidak boleh berisi logika bisnis panjang seperti pengecekan password manual, hashing password, atau query statistik kompleks. Semua logika tersebut diletakkan pada service.

---

# 10. Service Design

## ProfileService

Lokasi:

```text
app/Services/Profile/ProfileService.php
```

Method yang disarankan:

```php
getProfile(User $user): array

updateProfile(User $user, array $data): User

updatePassword(User $user, string $currentPassword, string $newPassword): void

getStats(User $user): array
```

Tanggung jawab service:

```text
- Menyiapkan data profile user.
- Memperbarui nama user.
- Memverifikasi password lama.
- Melakukan hash password baru.
- Menghitung statistik dasar user.
- Menyediakan data yang siap dikembalikan oleh controller.
```

---

# 11. Form Request

## 11.1 UpdateProfileRequest

Lokasi:

```text
app/Http/Requests/Profile/UpdateProfileRequest.php
```

Validation rules:

```php
[
    'name' => ['required', 'string', 'min:3', 'max:100'],
]
```

---

## 11.2 UpdatePasswordRequest

Lokasi:

```text
app/Http/Requests/Profile/UpdatePasswordRequest.php
```

Validation rules:

```php
[
    'current_password' => ['required', 'string'],
    'password' => ['required', 'string', 'min:8', 'confirmed'],
]
```

---

# 12. Database Requirement

Modul ini menggunakan tabel utama:

```text
users
```

Kolom yang digunakan:

```text
id
name
email
password
role
created_at
updated_at
```

Modul ini tidak wajib membuat tabel baru.

Untuk endpoint statistik, sistem dapat membaca tabel berikut jika sudah tersedia:

```text
chat_sessions
chat_messages
generated_images
user_image_quotas
orders
```

Jika sebagian tabel belum tersedia pada saat implementasi, statistik terkait boleh dibuat default `0` atau diimplementasikan bertahap sesuai modul yang sudah tersedia.

---

# 13. Route Design

Jika tanpa versioning:

```php
use App\Http\Controllers\Api\ProfileController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::get('/profile/stats', [ProfileController::class, 'stats']);
});
```

Jika menggunakan versioning:

```php
use App\Http\Controllers\Api\ProfileController;

Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::get('/profile/stats', [ProfileController::class, 'stats']);
});
```

---

# 14. Response Standard

Semua endpoint wajib mengikuti format response standar aplikasi.

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
  "errors": {}
}
```

---

# 15. Error Handling

## 15.1 Unauthenticated

Jika user belum login:

```json
{
  "success": false,
  "message": "Unauthenticated.",
  "errors": null
}
```

---

## 15.2 Validation Error

Jika validasi gagal:

```json
{
  "success": false,
  "message": "Validasi gagal.",
  "errors": {
    "name": [
      "Nama wajib diisi."
    ]
  }
}
```

---

## 15.3 Password Lama Salah

Jika current password tidak sesuai:

```json
{
  "success": false,
  "message": "Password lama tidak sesuai.",
  "errors": {
    "current_password": [
      "Password lama tidak sesuai."
    ]
  }
}
```

---

## 15.4 Server Error

Jika terjadi error tidak terduga:

```json
{
  "success": false,
  "message": "Terjadi kesalahan pada server.",
  "errors": null
}
```

---

# 16. Security Requirement

Modul ini harus memenuhi kebutuhan keamanan berikut:

```text
- Semua endpoint wajib menggunakan auth:sanctum.
- User hanya boleh mengakses data dirinya sendiri.
- Password tidak boleh dikembalikan dalam response API.
- Password baru wajib di-hash sebelum disimpan.
- Password lama wajib diverifikasi sebelum update password.
- Endpoint update password perlu dibatasi dengan rate limit.
- Error response tidak boleh membocorkan stack trace atau data sensitif.
```

Rekomendasi rate limit:

```text
PUT /api/profile/password
5 request / menit / user
```

---

# 17. Performance Requirement

Kebutuhan performa:

```text
- Endpoint GET /api/profile harus ringan.
- Endpoint GET /api/profile/stats harus menggunakan query count, bukan mengambil semua data.
- Response hanya mengembalikan field yang dibutuhkan.
- Statistik tidak boleh melakukan query berlebihan.
```

Contoh pendekatan statistik:

```text
count chat_sessions berdasarkan user_id
count chat_messages role user berdasarkan chat_session milik user
count chat_messages role assistant berdasarkan chat_session milik user
count generated_images berdasarkan user_id
count orders berdasarkan user_id
count orders paid berdasarkan user_id dan status paid
```

---

# 18. Reliability Requirement

Kebutuhan reliabilitas:

```text
- Jika update nama gagal, data lama tetap aman.
- Jika current password salah, password tidak berubah.
- Jika statistik modul lain belum tersedia, endpoint tidak boleh menyebabkan aplikasi crash.
- Jika terjadi error saat update password, sistem harus mengembalikan response error standar.
```

---

# 19. Testing Scenario Backend

## TS-01 — Lihat Profile Berhasil

```text
Given user sudah login
When user mengakses GET /api/profile
Then sistem mengembalikan data profile user login
And response tidak mengandung password
```

---

## TS-02 — Lihat Profile Tanpa Token

```text
Given user belum login
When user mengakses GET /api/profile
Then sistem mengembalikan response unauthenticated
```

---

## TS-03 — Update Nama Berhasil

```text
Given user sudah login
When user mengirim PUT /api/profile dengan name valid
Then sistem memperbarui nama user
And response mengembalikan data user terbaru
```

---

## TS-04 — Update Nama Gagal karena Kosong

```text
Given user sudah login
When user mengirim PUT /api/profile dengan name kosong
Then sistem mengembalikan error validasi
And nama user tidak berubah
```

---

## TS-05 — Update Password Berhasil

```text
Given user sudah login
And current_password benar
When user mengirim PUT /api/profile/password
Then sistem memperbarui password user
And password baru tersimpan dalam bentuk hash
```

---

## TS-06 — Update Password Gagal karena Password Lama Salah

```text
Given user sudah login
And current_password salah
When user mengirim PUT /api/profile/password
Then sistem mengembalikan error password lama tidak sesuai
And password user tidak berubah
```

---

## TS-07 — Update Password Gagal karena Konfirmasi Tidak Sama

```text
Given user sudah login
When password_confirmation tidak sama dengan password
Then sistem mengembalikan error validasi
And password user tidak berubah
```

---

## TS-08 — Lihat Statistik Berhasil

```text
Given user sudah login
When user mengakses GET /api/profile/stats
Then sistem mengembalikan statistik dasar akun user
```

---

# 20. Acceptance Criteria Keseluruhan Modul

Modul User & Profile Backend dianggap selesai jika:

```text
- Endpoint GET /api/profile tersedia.
- Endpoint PUT /api/profile tersedia.
- Endpoint PUT /api/profile/password tersedia.
- Endpoint GET /api/profile/stats tersedia.
- Semua endpoint dilindungi auth:sanctum.
- User dapat melihat data profile miliknya.
- User dapat mengubah nama akun miliknya.
- User dapat mengubah password dengan current_password yang benar.
- Password baru tersimpan dalam bentuk hash.
- Password tidak dikembalikan dalam response.
- User dapat melihat statistik dasar akun.
- Semua response menggunakan format JSON standar.
- Validasi request menggunakan Form Request.
- Logika bisnis berada di ProfileService.
- Controller tetap tipis dan hanya mengatur request-response.
```

---

# 21. Deliverable Backend

File dan komponen backend yang harus tersedia:

```text
1. ProfileController.php
2. ProfileService.php
3. UpdateProfileRequest.php
4. UpdatePasswordRequest.php
5. Route API profile
6. Endpoint GET /api/profile
7. Endpoint PUT /api/profile
8. Endpoint PUT /api/profile/password
9. Endpoint GET /api/profile/stats
10. Validasi update profile
11. Validasi update password
12. Hash password baru
13. Pengecekan current password
14. Query statistik dasar user
15. Response JSON standar
```

---

# 22. Prioritas Implementasi

Urutan implementasi yang disarankan:

```text
1. Buat ProfileService.
2. Buat ProfileController.
3. Buat UpdateProfileRequest.
4. Buat UpdatePasswordRequest.
5. Tambahkan route API profile.
6. Implementasikan GET /api/profile.
7. Implementasikan PUT /api/profile.
8. Implementasikan PUT /api/profile/password.
9. Implementasikan GET /api/profile/stats.
10. Test endpoint dengan Postman/Thunder Client.
11. Pastikan response siap dikonsumsi frontend.
```

---

# 23. Kesimpulan

Modul **User & Profile Backend** bertujuan menyediakan API dasar agar user dapat mengelola akun miliknya sendiri.

Endpoint utama:

```http
GET  /api/profile
PUT  /api/profile
PUT  /api/profile/password
GET  /api/profile/stats
```

Dengan modul ini, backend sudah menyediakan kemampuan dasar untuk:

```text
- Melihat profile
- Update nama
- Update password
- Melihat statistik dasar user
```

Modul ini harus dibangun secara aman, sederhana, dan konsisten agar siap digunakan oleh frontend React pada tahap berikutnya.
