# PRD Backend — Modul Payment Gateway Midtrans Sandbox

## 1. Ringkasan Modul

Modul **Payment Gateway Midtrans Sandbox** adalah modul backend Laravel yang digunakan untuk memproses pembayaran paket generate gambar melalui **Midtrans Snap** pada environment **Sandbox**.

Modul ini akan menghubungkan data **Pricing Plan**, **Order**, **Payment**, dan nantinya **Image Quota**. Fokus utama modul ini adalah membuat alur pembayaran yang aman, rapi, dan siap dikonsumsi frontend React.

Output utama modul:

```text
User dapat melakukan checkout paket, backend membuat Snap Token Midtrans, Midtrans mengirim webhook pembayaran, lalu backend memperbarui status order/payment secara otomatis.
```

Midtrans Snap digunakan dengan pola umum: backend membuat transaksi dan Snap Token, frontend menggunakan token tersebut untuk membuka halaman/popup pembayaran Snap, lalu Midtrans mengirim HTTP notification/webhook ke backend ketika status transaksi berubah. Dokumentasi Midtrans juga menjelaskan bahwa Sandbox digunakan untuk proses testing integrasi, sementara notification/webhook dikirim ke server merchant saat pembayaran selesai atau status transaksi berubah. ([Midtrans Documentation][1])

---

# 2. Tujuan Modul

Tujuan pengembangan modul ini adalah:

```text
1. Menyediakan backend payment flow menggunakan Midtrans Sandbox.
2. Membuat order berdasarkan pricing plan yang dipilih user.
3. Membuat Snap Token dari Midtrans.
4. Menyimpan data order dan payment ke database.
5. Menyediakan endpoint checkout untuk frontend.
6. Menyediakan endpoint webhook untuk menerima notifikasi Midtrans.
7. Memvalidasi signature notification Midtrans.
8. Mengubah status order berdasarkan status transaksi Midtrans.
9. Mencegah webhook diproses berkali-kali secara salah.
10. Menyiapkan integrasi agar kuota gambar bisa ditambah setelah payment sukses.
```

---

# 3. Scope Backend

## 3.1 In Scope

Yang dikembangkan pada modul ini:

```text
- Konfigurasi Midtrans Sandbox
- MidtransService
- PaymentService
- PaymentController
- Order model
- Payment model
- Migration orders
- Migration payments
- Endpoint checkout
- Endpoint detail payment/order
- Endpoint webhook Midtrans
- Generate Snap Token
- Simpan order pending
- Simpan payment record
- Update status order dari webhook
- Validasi signature key Midtrans
- Idempotency webhook
- Error handling payment
- Logging webhook
- Response JSON standar
```

---

## 3.2 Out of Scope

Yang tidak dikembangkan pada modul ini:

```text
- Integrasi Midtrans production
- Refund payment
- Subscription recurring
- Voucher/discount
- Tax/PPN
- Multi-currency
- Generate gambar
- Cloudflare Worker AI
- Galeri gambar
- Frontend React implementation
- UI checkout
- UI payment history
```

Catatan: penambahan kuota gambar setelah payment sukses boleh dibuat sebagai integrasi minimal jika modul quota sudah tersedia. Jika modul quota belum tersedia, cukup siapkan hook/service call agar nanti mudah disambungkan.

---

# 4. Aktor Sistem

## 4.1 Registered User

User yang sudah login dapat:

```text
- Memilih pricing plan
- Melakukan checkout
- Menerima Snap Token
- Membayar melalui Midtrans Snap dari frontend
- Melihat status order/payment miliknya
```

---

## 4.2 Midtrans

Midtrans bertugas:

```text
- Menerima transaksi dari backend
- Membuat Snap Token
- Menyediakan halaman/popup pembayaran Snap
- Mengirim webhook/notifikasi status pembayaran ke backend
```

---

## 4.3 System Backend

Backend Laravel bertugas:

```text
- Membuat order
- Membuat payload transaksi Midtrans
- Request Snap Token ke Midtrans
- Menyimpan data transaksi
- Menerima webhook Midtrans
- Memvalidasi signature webhook
- Mengubah status order/payment
- Menjaga agar webhook tidak diproses dobel
```

---

# 5. Alur Utama Modul

## 5.1 Alur Checkout Payment

```text
User login
↓
User memilih pricing plan
↓
Frontend mengirim pricing_plan_id ke backend
↓
Backend validasi pricing plan aktif
↓
Backend membuat order dengan status pending
↓
Backend membuat payload transaksi Midtrans
↓
Backend meminta Snap Token ke Midtrans Sandbox
↓
Backend menyimpan payment record awal
↓
Backend mengembalikan snap_token dan order_code ke frontend
↓
Frontend membuka Snap payment menggunakan snap_token
```

---

## 5.2 Alur Webhook Midtrans

```text
User menyelesaikan pembayaran di Snap
↓
Midtrans mengirim HTTP POST notification ke endpoint webhook backend
↓
Backend menerima payload webhook
↓
Backend memvalidasi signature_key
↓
Backend mencari order berdasarkan order_id/order_code
↓
Backend menyimpan/update payment record
↓
Backend memetakan transaction_status ke status order internal
↓
Jika payment sukses, order menjadi paid
↓
Jika payment gagal/expired/cancel, order diperbarui sesuai status
↓
Jika order paid, sistem menyiapkan proses tambah kuota gambar
↓
Backend mengembalikan response 200 ke Midtrans
```

Midtrans menyatakan HTTP(S) notification/webhook dikirim saat customer menyelesaikan pembayaran atau saat status transaksi berubah, sehingga backend harus menjadikan webhook sebagai sumber utama untuk update status pembayaran. ([Midtrans Documentation][2])

---

## 5.3 Alur Cek Status Order

```text
User membuka halaman transaksi
↓
Frontend request detail order/payment ke backend
↓
Backend mengambil order milik user login
↓
Backend mengembalikan status order dan payment
```

---

# 6. Functional Requirement

---

## FR-01 — Konfigurasi Midtrans Sandbox

### Deskripsi

Sistem harus menyediakan konfigurasi Midtrans Sandbox melalui `.env` dan `config/services.php`.

### Environment Variable

```env
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/v1/transactions
MIDTRANS_API_BASE_URL=https://api.sandbox.midtrans.com
```

### Konfigurasi `config/services.php`

```php
'midtrans' => [
    'server_key' => env('MIDTRANS_SERVER_KEY'),
    'client_key' => env('MIDTRANS_CLIENT_KEY'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),
    'is_3ds' => env('MIDTRANS_IS_3DS', true),
    'snap_url' => env('MIDTRANS_SNAP_URL', 'https://app.sandbox.midtrans.com/snap/v1/transactions'),
    'api_base_url' => env('MIDTRANS_API_BASE_URL', 'https://api.sandbox.midtrans.com'),
],
```

### Business Rule

```text
- Server Key tidak boleh hardcode.
- Server Key hanya digunakan di backend.
- Client Key boleh dikirim ke frontend jika diperlukan untuk konfigurasi Snap client.
- Sandbox dan Production key berbeda, sehingga environment harus jelas.
```

Midtrans menjelaskan bahwa Sandbox digunakan untuk testing integrasi dan API keys didapat dari Merchant Administration Portal. Midtrans juga membedakan Sandbox dan Production credentials. ([Midtrans Documentation][3])

### Acceptance Criteria

```text
- Config Midtrans tersedia di .env.
- Config Midtrans tersedia di config/services.php.
- MIDTRANS_IS_PRODUCTION bernilai false untuk sandbox.
- Tidak ada server key yang ditulis langsung di source code.
```

---

## FR-02 — Membuat Tabel Orders

### Deskripsi

Sistem harus menyediakan tabel `orders` untuk menyimpan data pembelian paket oleh user.

### Tabel

```text
orders
```

### Kolom

```text
id
user_id
pricing_plan_id
order_code
amount
image_quota
status
paid_at
expired_at
created_at
updated_at
```

### Status Order Internal

```text
pending
paid
expired
failed
cancelled
denied
refunded
```

### Business Rule

```text
- Order dibuat saat user checkout.
- Order baru default berstatus pending.
- order_code harus unik.
- amount disalin dari pricing_plans.price saat checkout.
- image_quota disalin dari pricing_plans.image_quota saat checkout.
- Data amount dan image_quota harus disalin agar histori order tidak berubah jika pricing plan berubah.
```

### Acceptance Criteria

```text
- Tabel orders tersedia.
- Order dapat dibuat berdasarkan pricing plan aktif.
- Order menyimpan amount dan image_quota saat checkout.
- Order memiliki status pending saat pertama dibuat.
```

---

## FR-03 — Membuat Tabel Payments

### Deskripsi

Sistem harus menyediakan tabel `payments` untuk menyimpan data transaksi Midtrans.

### Tabel

```text
payments
```

### Kolom

```text
id
order_id
provider
transaction_id
payment_type
transaction_status
fraud_status
gross_amount
currency
signature_key
raw_response
paid_at
created_at
updated_at
```

### Business Rule

```text
- provider bernilai midtrans.
- raw_response menyimpan payload webhook dalam format JSON.
- transaction_id berasal dari Midtrans jika tersedia.
- transaction_status mengikuti status dari Midtrans.
- Satu order dapat memiliki satu payment utama untuk MVP.
```

### Acceptance Criteria

```text
- Tabel payments tersedia.
- Payment record dibuat saat checkout atau saat webhook pertama diterima.
- Webhook Midtrans tersimpan ke raw_response.
```

---

## FR-04 — Checkout Pricing Plan

### Deskripsi

Sistem harus menyediakan endpoint agar user dapat melakukan checkout berdasarkan pricing plan aktif.

### Endpoint

```http
POST /api/payments/checkout
```

Jika menggunakan versioning:

```http
POST /api/v1/payments/checkout
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
  "pricing_plan_id": 2
}
```

### Validation Rule

```text
pricing_plan_id:
- required
- integer
- exists:pricing_plans,id
```

### Response Success

```json
{
  "success": true,
  "message": "Snap token berhasil dibuat.",
  "data": {
    "order": {
      "id": 15,
      "order_code": "ORDER-20260621-000015",
      "status": "pending",
      "amount": 15000,
      "image_quota": 50
    },
    "payment": {
      "provider": "midtrans",
      "snap_token": "midtrans-snap-token",
      "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
    }
  }
}
```

### Business Rule

```text
- User harus login.
- pricing_plan_id harus aktif.
- Backend membuat order pending.
- Backend membuat Snap Token melalui Midtrans Sandbox.
- Backend mengembalikan snap_token ke frontend.
- Jika Midtrans gagal membuat token, order dapat ditandai failed atau tetap pending dengan catatan error sesuai strategi implementasi.
```

### Acceptance Criteria

```text
- User dapat checkout pricing plan aktif.
- User tidak dapat checkout pricing plan nonaktif.
- Order berhasil dibuat.
- Snap Token berhasil dibuat.
- Response siap digunakan frontend untuk membuka Midtrans Snap.
```

---

## FR-05 — MidtransService

### Deskripsi

Sistem harus memiliki service khusus untuk komunikasi dengan Midtrans.

### Lokasi File

```text
app/Services/Payment/MidtransService.php
```

### Tanggung Jawab

```text
- Membaca konfigurasi Midtrans.
- Membuat Snap Token.
- Membuat payload transaksi.
- Memvalidasi signature webhook.
- Mengambil status transaksi dari Midtrans jika diperlukan.
- Menangani error dari Midtrans.
```

### Method yang Disarankan

```php
public function createSnapToken(Order $order, User $user, PricingPlan $plan): array

public function verifySignature(array $payload): bool

public function mapTransactionStatus(array $payload): string

public function getTransactionStatus(string $orderCode): array
```

### Acceptance Criteria

```text
- MidtransService tidak berisi logika controller.
- Semua request ke Midtrans dilakukan melalui MidtransService.
- Server key hanya dipakai di backend.
- Jika request Midtrans gagal, service melempar exception yang dapat ditangani.
```

---

## FR-06 — PaymentService

### Deskripsi

Sistem harus memiliki service bisnis untuk mengatur checkout dan pemrosesan webhook.

### Lokasi File

```text
app/Services/Payment/PaymentService.php
```

### Tanggung Jawab

```text
- Membuat order.
- Memvalidasi pricing plan aktif.
- Meminta Snap Token ke MidtransService.
- Menyimpan payment record.
- Memproses webhook Midtrans.
- Update status order dan payment.
- Menjaga idempotency webhook.
- Menyiapkan integrasi ke quota service.
```

### Method yang Disarankan

```php
public function checkout(User $user, int $pricingPlanId): array

public function handleMidtransNotification(array $payload): void

public function getUserOrder(User $user, int $orderId): Order
```

### Acceptance Criteria

```text
- Controller hanya memanggil PaymentService.
- Logika checkout tidak berada di controller.
- Logika webhook tidak berada di controller.
- PaymentService aman terhadap webhook yang dikirim berulang.
```

---

## FR-07 — Membuat Snap Token

### Deskripsi

Backend harus membuat Snap Token menggunakan data order, user, dan pricing plan.

### Payload Minimal ke Midtrans

```json
{
  "transaction_details": {
    "order_id": "ORDER-20260621-000015",
    "gross_amount": 15000
  },
  "customer_details": {
    "first_name": "Dandy Sultana",
    "email": "dandy@example.com"
  },
  "item_details": [
    {
      "id": "PLAN-2",
      "price": 15000,
      "quantity": 1,
      "name": "Starter"
    }
  ]
}
```

### Business Rule

```text
- order_id Midtrans menggunakan order_code dari tabel orders.
- gross_amount harus sama dengan orders.amount.
- item_details price harus sama dengan amount.
- quantity default 1.
```

### Acceptance Criteria

```text
- Payload transaction_details valid.
- Snap Token berhasil diterima dari Midtrans.
- Snap Token dikembalikan ke frontend.
```

---

## FR-08 — Webhook Midtrans Notification

### Deskripsi

Sistem harus menyediakan endpoint webhook untuk menerima HTTP POST notification dari Midtrans.

### Endpoint

```http
POST /api/payments/midtrans/notification
```

Jika menggunakan versioning:

```http
POST /api/v1/payments/midtrans/notification
```

### Authentication

Tidak menggunakan auth user.

Alasan:

```text
Webhook dikirim langsung oleh Midtrans, bukan oleh user login.
```

### Security

Wajib validasi signature key.

### Contoh Payload Penting dari Midtrans

```json
{
  "transaction_time": "2026-06-21 10:00:00",
  "transaction_status": "settlement",
  "transaction_id": "abc123",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "signature",
  "payment_type": "bank_transfer",
  "order_id": "ORDER-20260621-000015",
  "gross_amount": "15000.00",
  "fraud_status": "accept"
}
```

### Response Success ke Midtrans

```json
{
  "success": true,
  "message": "Notification processed.",
  "data": null
}
```

### Business Rule

```text
- Endpoint webhook harus menerima POST.
- Endpoint webhook tidak boleh membutuhkan bearer token.
- Webhook harus divalidasi signature_key.
- Jika signature tidak valid, proses ditolak.
- Jika order_id tidak ditemukan, log error dan return response yang sesuai.
- Jika webhook valid, update payment dan order.
- Return HTTP 200 jika webhook berhasil diproses.
```

Midtrans menyebut webhook sebagai HTTP(S) POST notification yang dikirim ke server merchant saat status transaksi berubah; notification URL dikonfigurasi di Dashboard. ([Midtrans Documentation][2])

### Acceptance Criteria

```text
- Webhook dapat menerima payload Midtrans.
- Signature valid diproses.
- Signature tidak valid ditolak.
- Status order berubah sesuai transaction_status.
- Webhook yang sama tidak menambah efek dobel.
```

---

## FR-09 — Validasi Signature Key Midtrans

### Deskripsi

Sistem harus memvalidasi `signature_key` dari payload Midtrans.

### Rumus Signature

Untuk notification standar Midtrans, signature umumnya divalidasi dengan:

```text
SHA512(order_id + status_code + gross_amount + server_key)
```

### Data yang Digunakan

```text
order_id
status_code
gross_amount
MIDTRANS_SERVER_KEY
```

### Business Rule

```text
- Signature dari payload dibandingkan dengan hasil hash backend.
- Jika tidak sama, webhook tidak boleh diproses.
- Server key tidak boleh masuk log.
```

### Acceptance Criteria

```text
- Signature valid menghasilkan true.
- Signature invalid menghasilkan false.
- Webhook invalid tidak mengubah order/payment.
```

---

## FR-10 — Mapping Transaction Status Midtrans ke Status Order Internal

### Deskripsi

Sistem harus memetakan status transaksi Midtrans menjadi status order internal.

### Status Midtrans yang Perlu Ditangani

```text
capture
settlement
pending
deny
cancel
expire
failure
refund
partial_refund
```

Midtrans menyediakan siklus status transaksi dan status API; status seperti `settlement`, `capture`, `pending`, `deny`, `cancel`, dan `expire` digunakan untuk menentukan kondisi transaksi. Dokumentasi juga menjelaskan fraud status seperti `accept` dan `deny`. ([Midtrans Documentation][4])

### Mapping Internal

| Midtrans `transaction_status` | `fraud_status` | Order Internal |
| ----------------------------- | -------------- | -------------- |
| settlement                    | any/accept     | paid           |
| capture                       | accept         | paid           |
| capture                       | challenge      | pending        |
| pending                       | any            | pending        |
| deny                          | any            | denied         |
| cancel                        | any            | cancelled      |
| expire                        | any            | expired        |
| failure                       | any            | failed         |
| refund                        | any            | refunded       |
| partial_refund                | any            | refunded       |

### Business Rule

```text
- settlement dianggap pembayaran berhasil.
- capture dianggap berhasil hanya jika fraud_status accept.
- pending tetap pending.
- expire mengubah order menjadi expired.
- cancel mengubah order menjadi cancelled.
- deny mengubah order menjadi denied.
- failure mengubah order menjadi failed.
```

### Acceptance Criteria

```text
- Semua status utama Midtrans dapat dipetakan.
- Status order internal konsisten.
- Status tidak dikenal dicatat ke log.
```

---

## FR-11 — Idempotency Webhook

### Deskripsi

Webhook Midtrans dapat dikirim lebih dari satu kali. Sistem harus aman terhadap duplikasi.

### Business Rule

```text
- Jika order sudah paid, webhook settlement/capture berikutnya tidak boleh menambah kuota dua kali.
- Update payment boleh dilakukan, tetapi efek bisnis tidak boleh dobel.
- Jika status sudah final, jangan downgrade status sembarangan.
```

### Final Status

```text
paid
expired
failed
cancelled
denied
refunded
```

### Acceptance Criteria

```text
- Webhook settlement yang sama dikirim dua kali tidak menambah efek dua kali.
- Order paid tidak berubah kembali menjadi pending.
- Setiap webhook tetap dapat disimpan/log untuk audit.
```

---

## FR-12 — Menambahkan Kuota Setelah Payment Sukses

### Deskripsi

Jika modul Image Quota sudah tersedia, sistem harus menambah kuota gambar setelah order menjadi paid.

### Business Rule

```text
- Kuota ditambah hanya ketika order berubah dari non-paid menjadi paid.
- Jumlah kuota berasal dari orders.image_quota.
- Penambahan kuota harus idempotent.
- Jika quota module belum tersedia, cukup siapkan TODO/integration point.
```

### Acceptance Criteria

```text
- Jika order pertama kali menjadi paid, kuota bertambah satu kali.
- Jika webhook paid dikirim ulang, kuota tidak bertambah lagi.
- Jika modul quota belum dibuat, payment tetap bisa berjalan tanpa crash.
```

---

## FR-13 — Detail Order/Payment User

### Deskripsi

Sistem harus menyediakan endpoint agar user dapat melihat detail order/payment miliknya.

### Endpoint

```http
GET /api/payments/{order}
```

Atau lebih eksplisit:

```http
GET /api/orders/{order}
```

Rekomendasi modul ini:

```http
GET /api/payments/{order}
```

### Authentication

Wajib login.

### Response Success

```json
{
  "success": true,
  "message": "Detail payment berhasil diambil.",
  "data": {
    "order": {
      "id": 15,
      "order_code": "ORDER-20260621-000015",
      "amount": 15000,
      "image_quota": 50,
      "status": "paid",
      "paid_at": "2026-06-21T10:05:00.000000Z"
    },
    "payment": {
      "provider": "midtrans",
      "transaction_id": "abc123",
      "payment_type": "bank_transfer",
      "transaction_status": "settlement",
      "fraud_status": "accept"
    }
  }
}
```

### Business Rule

```text
- User hanya bisa melihat order miliknya.
- User tidak bisa melihat order user lain.
```

### Acceptance Criteria

```text
- Detail payment dapat diambil.
- Ownership validation berjalan.
- Response tidak menampilkan raw_response penuh kecuali endpoint admin.
```

---

# 7. Struktur Database

## 7.1 Tabel `orders`

```text
id
user_id
pricing_plan_id
order_code
amount
image_quota
status
paid_at
expired_at
created_at
updated_at
```

### Detail Kolom

| Kolom           | Tipe               | Keterangan                                            |
| --------------- | ------------------ | ----------------------------------------------------- |
| id              | bigint             | Primary key                                           |
| user_id         | bigint             | Relasi ke users                                       |
| pricing_plan_id | bigint             | Relasi ke pricing_plans                               |
| order_code      | varchar unique     | ID order untuk Midtrans                               |
| amount          | unsigned integer   | Nominal pembayaran                                    |
| image_quota     | unsigned integer   | Kuota yang dibeli                                     |
| status          | varchar            | pending/paid/expired/failed/cancelled/denied/refunded |
| paid_at         | timestamp nullable | Waktu sukses bayar                                    |
| expired_at      | timestamp nullable | Waktu expired jika tersedia                           |
| created_at      | timestamp          | Waktu dibuat                                          |
| updated_at      | timestamp          | Waktu diperbarui                                      |

### Index

```text
user_id
pricing_plan_id
order_code unique
status
created_at
```

---

## 7.2 Tabel `payments`

```text
id
order_id
provider
transaction_id
payment_type
transaction_status
fraud_status
gross_amount
currency
signature_key
raw_response
paid_at
created_at
updated_at
```

### Detail Kolom

| Kolom              | Tipe               | Keterangan                   |
| ------------------ | ------------------ | ---------------------------- |
| id                 | bigint             | Primary key                  |
| order_id           | bigint             | Relasi ke orders             |
| provider           | varchar            | midtrans                     |
| transaction_id     | varchar nullable   | ID transaksi Midtrans        |
| payment_type       | varchar nullable   | bank_transfer/qris/gopay/dll |
| transaction_status | varchar nullable   | Status dari Midtrans         |
| fraud_status       | varchar nullable   | Fraud status dari Midtrans   |
| gross_amount       | decimal/integer    | Nominal dari Midtrans        |
| currency           | varchar nullable   | IDR                          |
| signature_key      | varchar nullable   | Signature dari payload       |
| raw_response       | json nullable      | Payload webhook              |
| paid_at            | timestamp nullable | Waktu payment sukses         |
| created_at         | timestamp          | Waktu dibuat                 |
| updated_at         | timestamp          | Waktu diperbarui             |

### Index

```text
order_id
transaction_id
transaction_status
payment_type
```

---

# 8. Model dan Relasi

## 8.1 User Model

```php
public function orders()
{
    return $this->hasMany(Order::class);
}
```

---

## 8.2 PricingPlan Model

```php
public function orders()
{
    return $this->hasMany(Order::class);
}
```

---

## 8.3 Order Model

```php
public function user()
{
    return $this->belongsTo(User::class);
}

public function pricingPlan()
{
    return $this->belongsTo(PricingPlan::class);
}

public function payment()
{
    return $this->hasOne(Payment::class);
}
```

---

## 8.4 Payment Model

```php
public function order()
{
    return $this->belongsTo(Order::class);
}
```

---

# 9. Struktur File Backend

```text
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       └── PaymentController.php
│   │
│   └── Requests/
│       └── Payment/
│           └── CheckoutRequest.php
│
├── Services/
│   └── Payment/
│       ├── MidtransService.php
│       └── PaymentService.php
│
├── Models/
│   ├── Order.php
│   └── Payment.php
│
└── Exceptions/
    └── PaymentGatewayException.php
```

Migration:

```text
database/migrations/xxxx_xx_xx_xxxxxx_create_orders_table.php
database/migrations/xxxx_xx_xx_xxxxxx_create_payments_table.php
```

---

# 10. Service Design

## 10.1 MidtransService

### Tanggung Jawab

```text
- Membuat Snap Token.
- Membuat request ke Midtrans Sandbox.
- Validasi signature notification.
- Mapping status Midtrans.
- Optional: cek status transaksi ke Midtrans Status API.
```

### Method

```php
public function createSnapTransaction(Order $order, User $user): array

public function verifySignature(array $payload): bool

public function mapStatus(array $payload): string

public function getStatus(string $orderCode): array
```

---

## 10.2 PaymentService

### Tanggung Jawab

```text
- Membuat order dari pricing plan.
- Memanggil MidtransService untuk Snap Token.
- Menyimpan payment record.
- Memproses webhook.
- Update status order/payment.
- Menjaga idempotency.
```

### Method

```php
public function checkout(User $user, int $pricingPlanId): array

public function handleNotification(array $payload): void

public function getPaymentDetail(User $user, int $orderId): Order

protected function markOrderAsPaid(Order $order, array $payload): void

protected function updatePayment(Order $order, array $payload): Payment
```

---

# 11. Controller Design

## PaymentController

Lokasi:

```text
app/Http/Controllers/Api/PaymentController.php
```

Method:

```php
checkout(CheckoutRequest $request)
show($orderId)
notification(Request $request)
```

Tanggung jawab controller:

```text
- Menerima request.
- Mengambil user login.
- Memanggil PaymentService.
- Mengembalikan ApiResponse.
```

Controller tidak boleh berisi logic signature, mapping status, atau update order secara langsung.

---

# 12. Form Request

## CheckoutRequest

Lokasi:

```text
app/Http/Requests/Payment/CheckoutRequest.php
```

Rules:

```php
[
    'pricing_plan_id' => ['required', 'integer', 'exists:pricing_plans,id'],
]
```

Business validation tambahan di service:

```text
- Pricing plan harus aktif.
```

---

# 13. Route Design

Tanpa versioning:

```php
use App\Http\Controllers\Api\PaymentController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/payments/checkout', [PaymentController::class, 'checkout']);
    Route::get('/payments/{order}', [PaymentController::class, 'show']);
});

Route::post('/payments/midtrans/notification', [PaymentController::class, 'notification']);
```

Dengan versioning:

```php
use App\Http\Controllers\Api\PaymentController;

Route::prefix('v1')->group(function () {
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/payments/checkout', [PaymentController::class, 'checkout']);
        Route::get('/payments/{order}', [PaymentController::class, 'show']);
    });

    Route::post('/payments/midtrans/notification', [PaymentController::class, 'notification']);
});
```

---

# 14. API Contract Lengkap

## 14.1 Checkout

```http
POST /api/payments/checkout
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

Body:

```json
{
  "pricing_plan_id": 2
}
```

Success response:

```json
{
  "success": true,
  "message": "Snap token berhasil dibuat.",
  "data": {
    "order": {
      "id": 15,
      "order_code": "ORDER-20260621-000015",
      "status": "pending",
      "amount": 15000,
      "image_quota": 50
    },
    "payment": {
      "provider": "midtrans",
      "snap_token": "midtrans-snap-token",
      "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/..."
    }
  }
}
```

---

## 14.2 Detail Payment

```http
GET /api/payments/15
Authorization: Bearer {token}
Accept: application/json
```

Success response:

```json
{
  "success": true,
  "message": "Detail payment berhasil diambil.",
  "data": {
    "order": {
      "id": 15,
      "order_code": "ORDER-20260621-000015",
      "amount": 15000,
      "image_quota": 50,
      "status": "pending",
      "paid_at": null
    },
    "payment": {
      "provider": "midtrans",
      "transaction_id": null,
      "payment_type": null,
      "transaction_status": "pending",
      "fraud_status": null
    }
  }
}
```

---

## 14.3 Webhook Notification

```http
POST /api/payments/midtrans/notification
Accept: application/json
Content-Type: application/json
```

Payload dari Midtrans:

```json
{
  "transaction_time": "2026-06-21 10:00:00",
  "transaction_status": "settlement",
  "transaction_id": "abc123",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "signature",
  "payment_type": "bank_transfer",
  "order_id": "ORDER-20260621-000015",
  "gross_amount": "15000.00",
  "fraud_status": "accept"
}
```

Success response:

```json
{
  "success": true,
  "message": "Notification processed.",
  "data": null
}
```

---

# 15. Response Standard

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
    "pricing_plan_id": [
      "Pricing plan wajib dipilih."
    ]
  }
}
```

---

# 16. Error Handling

## 16.1 Pricing Plan Tidak Aktif

```json
{
  "success": false,
  "message": "Pricing plan tidak tersedia.",
  "errors": null
}
```

---

## 16.2 Midtrans Gagal Membuat Snap Token

```json
{
  "success": false,
  "message": "Gagal membuat transaksi pembayaran. Silakan coba lagi.",
  "errors": null
}
```

---

## 16.3 Signature Webhook Tidak Valid

```json
{
  "success": false,
  "message": "Invalid payment signature.",
  "errors": null
}
```

---

## 16.4 Order Tidak Ditemukan

```json
{
  "success": false,
  "message": "Order tidak ditemukan.",
  "errors": null
}
```

---

## 16.5 Akses Detail Order User Lain

```json
{
  "success": false,
  "message": "Order tidak ditemukan.",
  "errors": null
}
```

Rekomendasi gunakan 404 agar tidak membocorkan keberadaan order milik user lain.

---

# 17. Security Requirement

```text
- Server Key hanya disimpan di .env.
- Server Key tidak boleh dikirim ke frontend.
- Client Key boleh dikirim ke frontend jika dibutuhkan Snap client.
- Webhook wajib validasi signature_key.
- Endpoint checkout wajib auth:sanctum.
- User hanya dapat melihat order miliknya sendiri.
- Endpoint webhook tidak memakai auth user, tetapi wajib signature validation.
- Error response tidak boleh membocorkan server key.
- Raw webhook boleh disimpan, tetapi jangan ditampilkan ke user biasa.
```

---

# 18. Performance Requirement

```text
- Checkout harus merespons cepat setelah Snap Token diterima.
- Webhook harus diproses efisien dan mengembalikan HTTP 200 jika berhasil.
- Query detail payment harus berdasarkan user_id untuk ownership.
- Jangan melakukan proses berat di webhook.
- Jika ada penambahan kuota kompleks, proses dapat dipisahkan ke service/job.
```

---

# 19. Reliability Requirement

```text
- Webhook harus idempotent.
- Jika webhook dikirim ulang, order tidak boleh diproses ganda.
- Jika update payment gagal, error harus dicatat.
- Jika order sudah paid, jangan downgrade ke pending.
- Jika payment sukses, paid_at harus terisi.
- Jika Midtrans timeout saat checkout, sistem harus mengembalikan error rapi.
```

---

# 20. Logging Requirement

Log yang perlu dicatat:

```text
- Checkout gagal
- Request Midtrans gagal
- Webhook diterima
- Signature invalid
- Order tidak ditemukan saat webhook
- Status transaksi tidak dikenal
- Payment sukses
```

Data log yang boleh dicatat:

```text
order_code
order_id
transaction_id
transaction_status
fraud_status
payment_type
gross_amount
```

Data yang tidak boleh dicatat:

```text
MIDTRANS_SERVER_KEY
Bearer token user
Password user
Data sensitif kartu
```

---

# 21. Testing Sandbox Requirement

Midtrans Sandbox menyediakan simulator berbasis web untuk mensimulasikan respons bank/payment provider tanpa pembayaran sungguhan. Ini berguna untuk menguji skenario payment sebelum production. ([Midtrans Documentation][5])

## Skenario Testing

```text
1. Checkout pricing plan aktif.
2. Pastikan Snap Token diterima.
3. Buka Snap payment dari frontend/testing client.
4. Simulasikan pembayaran sukses di Midtrans Sandbox.
5. Pastikan webhook masuk ke backend.
6. Pastikan order berubah dari pending menjadi paid.
7. Simulasikan expired/cancel/deny jika tersedia.
8. Pastikan mapping status berjalan.
9. Kirim webhook yang sama dua kali.
10. Pastikan efek bisnis tidak dobel.
```

---

# 22. Testing Scenario Backend

## TS-01 — Checkout Berhasil

```text
Given user sudah login
And pricing plan aktif tersedia
When user request POST /api/payments/checkout
Then order dibuat dengan status pending
And Snap Token dikembalikan
```

---

## TS-02 — Checkout Pricing Plan Nonaktif

```text
Given user sudah login
And pricing plan nonaktif tersedia
When user request checkout
Then sistem mengembalikan error pricing plan tidak tersedia
And order tidak dibuat
```

---

## TS-03 — Checkout Tanpa Login

```text
Given user belum login
When user request POST /api/payments/checkout
Then sistem mengembalikan unauthenticated
```

---

## TS-04 — Webhook Settlement Berhasil

```text
Given order pending tersedia
And webhook Midtrans valid dengan transaction_status settlement
When webhook diterima
Then order berubah menjadi paid
And payment record diperbarui
And paid_at terisi
```

---

## TS-05 — Webhook Capture Accept

```text
Given order pending tersedia
And webhook valid dengan transaction_status capture dan fraud_status accept
When webhook diterima
Then order berubah menjadi paid
```

---

## TS-06 — Webhook Pending

```text
Given order pending tersedia
And webhook valid dengan transaction_status pending
When webhook diterima
Then order tetap pending
And payment transaction_status menjadi pending
```

---

## TS-07 — Webhook Expire

```text
Given order pending tersedia
And webhook valid dengan transaction_status expire
When webhook diterima
Then order berubah menjadi expired
```

---

## TS-08 — Webhook Signature Invalid

```text
Given webhook Midtrans dengan signature salah
When webhook diterima
Then sistem menolak request
And order/payment tidak berubah
```

---

## TS-09 — Webhook Duplikat

```text
Given order sudah paid
When webhook settlement yang sama diterima lagi
Then order tetap paid
And efek bisnis tidak diproses dua kali
```

---

## TS-10 — User Mengakses Order Orang Lain

```text
Given user A login
And order milik user B tersedia
When user A request GET /api/payments/{order}
Then sistem mengembalikan 404
```

---

# 23. Acceptance Criteria Keseluruhan Modul

Modul Payment Gateway Midtrans Sandbox dianggap selesai jika:

```text
- Konfigurasi Midtrans Sandbox tersedia.
- Tabel orders tersedia.
- Tabel payments tersedia.
- Model Order tersedia.
- Model Payment tersedia.
- Endpoint checkout tersedia.
- Endpoint detail payment tersedia.
- Endpoint webhook Midtrans tersedia.
- User dapat checkout pricing plan aktif.
- Backend dapat membuat Snap Token.
- Order pending tersimpan saat checkout.
- Payment record tersimpan.
- Webhook Midtrans dapat diterima.
- Webhook divalidasi dengan signature_key.
- Status order berubah berdasarkan transaction_status.
- Settlement/capture accept mengubah order menjadi paid.
- Pending tetap pending.
- Expire/cancel/deny/failure dipetakan dengan benar.
- Webhook duplikat tidak memproses efek bisnis dua kali.
- User hanya bisa melihat order miliknya sendiri.
- Response menggunakan JSON standar aplikasi.
- Error payment ditangani dengan rapi.
```

---

# 24. Deliverable Backend

```text
1. Migration create_orders_table
2. Migration create_payments_table
3. Model Order
4. Model Payment
5. Relasi User → orders
6. Relasi PricingPlan → orders
7. Relasi Order → payment
8. PaymentGatewayException
9. CheckoutRequest
10. MidtransService
11. PaymentService
12. PaymentController
13. Route POST /api/payments/checkout
14. Route GET /api/payments/{order}
15. Route POST /api/payments/midtrans/notification
16. Konfigurasi Midtrans di .env.example
17. Konfigurasi Midtrans di config/services.php
18. Signature validation
19. Status mapping
20. Idempotency handling
21. Logging payment/webhook
```

---

# 25. Prioritas Implementasi

```text
1. Tambahkan konfigurasi Midtrans Sandbox di .env dan .env.example.
2. Tambahkan konfigurasi Midtrans di config/services.php.
3. Buat migration orders.
4. Buat migration payments.
5. Buat model Order dan Payment.
6. Tambahkan relasi model.
7. Buat CheckoutRequest.
8. Buat PaymentGatewayException.
9. Buat MidtransService.
10. Implementasikan createSnapTransaction().
11. Implementasikan verifySignature().
12. Implementasikan mapStatus().
13. Buat PaymentService.
14. Implementasikan checkout().
15. Implementasikan handleNotification().
16. Implementasikan getPaymentDetail().
17. Buat PaymentController.
18. Tambahkan routes.
19. Test checkout dengan pricing plan aktif.
20. Test Snap Token dari Sandbox.
21. Test webhook sukses.
22. Test webhook invalid signature.
23. Test webhook duplikat.
24. Test ownership detail order.
```

---

# 26. Catatan Implementasi Penting

## 26.1 Jangan Buat Payment Tanpa Order

Order harus dibuat lebih dulu karena `order_code` menjadi `order_id` di Midtrans.

```text
orders.order_code = transaction_details.order_id
```

---

## 26.2 Simpan Harga Saat Checkout

Jangan hanya mengandalkan harga dari pricing plan secara live.

Saat checkout:

```text
orders.amount = pricing_plans.price
orders.image_quota = pricing_plans.image_quota
```

Tujuannya agar jika harga paket berubah, transaksi lama tetap valid.

---

## 26.3 Webhook Adalah Sumber Status Utama

Frontend callback dari Snap boleh digunakan untuk tampilan UI, tetapi backend tetap harus memperbarui status berdasarkan webhook Midtrans.

```text
Frontend callback = untuk UI
Webhook = untuk update database
```

---

## 26.4 Jangan Tambah Kuota dari Frontend Callback

Kuota tidak boleh ditambah berdasarkan event frontend seperti `onSuccess`.

Kuota hanya boleh ditambah setelah backend menerima webhook valid dari Midtrans.

---

## 26.5 Signature Validation Wajib

Endpoint webhook tidak memakai auth user, maka validasi signature adalah lapisan keamanan utama.

---

# 27. Kesimpulan

Modul **Payment Gateway Midtrans Sandbox** adalah modul backend penting yang menghubungkan sistem pricing plan dengan pembayaran.

Dengan modul ini, backend mampu:

```text
Membuat order
↓
Membuat Snap Token Midtrans
↓
Mengirim Snap Token ke frontend
↓
Menerima webhook Midtrans
↓
Validasi signature
↓
Update status order/payment
↓
Menyiapkan penambahan kuota setelah pembayaran sukses
```

Endpoint utama:

```http
POST /api/payments/checkout
GET  /api/payments/{order}
POST /api/payments/midtrans/notification
```

Modul ini harus dibangun dengan prinsip:

```text
Aman
Idempotent
Backend-first
Webhook-based
Siap sandbox testing
Siap dikembangkan ke production
```