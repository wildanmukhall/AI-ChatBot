# Rencana Fitur

> Dokumentasi ini menjelaskan fitur utama yang dirancang pada proyek **AI Web Chatbot**.

---

## Fitur 1 — Generate Teks

**Role Penanggung Jawab:** `Backend, Frontend`

**Sumber Data:** `Third-Party API — Gemini API`

**Deskripsi & Ekspektasi:**
Fitur generate teks digunakan agar pengguna dapat mengirim prompt atau pertanyaan melalui halaman chatbot. Frontend mengirimkan prompt pengguna ke backend Laravel, kemudian backend meneruskan request tersebut ke Gemini API. Setelah Gemini API menghasilkan respons, backend mengembalikan jawaban ke frontend untuk ditampilkan kepada pengguna.

Ekspektasi dari fitur ini adalah pengguna dapat memperoleh jawaban berbasis teks secara cepat, jelas, dan sesuai dengan prompt yang dikirimkan. Backend juga perlu menyimpan riwayat prompt dan respons ke database agar dapat digunakan sebagai histori percakapan pengguna.

---

## Fitur 2 — Generate Gambar Text-to-Image

**Role Penanggung Jawab:** `Backend, Frontend`

**Sumber Data:** `Third-Party API — Cloudflare Worker AI / Text-to-Image Model`

**Deskripsi & Ekspektasi:**
Fitur generate gambar digunakan untuk menghasilkan gambar berdasarkan deskripsi teks yang dimasukkan oleh pengguna. Pengguna menuliskan prompt gambar melalui antarmuka aplikasi, kemudian backend Laravel mengirimkan prompt tersebut ke endpoint Cloudflare Worker yang memanfaatkan model text-to-image.

Ekspektasi dari fitur ini adalah sistem mampu menghasilkan gambar berdasarkan prompt pengguna, menampilkan hasil gambar pada frontend, serta menyimpan data gambar ke database. Data yang disimpan dapat berupa prompt, URL gambar, waktu generate, dan pemilik gambar.

---

## Fitur 3 — Pricing Plan Generate Gambar

**Role Penanggung Jawab:** `Backend, Frontend`

**Sumber Data:** `Internal System`

**Deskripsi & Ekspektasi:**
Fitur pricing plan digunakan untuk mengatur paket penggunaan fitur generate gambar. Sistem dapat menyediakan beberapa paket, seperti paket gratis dengan kuota terbatas dan paket berbayar dengan jumlah kuota generate gambar yang lebih besar.

Ekspektasi dari fitur ini adalah pengguna dapat melihat daftar paket yang tersedia, memilih paket yang sesuai, serta mengetahui harga dan jumlah kuota generate gambar yang diperoleh. Backend perlu mengelola data paket, harga, kuota, dan status paket yang aktif pada akun pengguna.

---

## Fitur 4 — Autentikasi Pengguna

**Role Penanggung Jawab:** `Backend, Frontend, Security`

**Sumber Data:** `Internal System`

**Deskripsi & Ekspektasi:**
Fitur autentikasi digunakan untuk mengatur akses pengguna ke dalam sistem. Pengguna dapat melakukan registrasi, login, dan logout. Setelah berhasil login, pengguna dapat menggunakan fitur generate teks, generate gambar, melihat galeri, serta melakukan pembelian paket generate gambar.

Ekspektasi dari fitur ini adalah setiap aktivitas pengguna dapat terhubung dengan akun masing-masing. Sistem dapat menyimpan riwayat generate teks, hasil generate gambar, kuota gambar, dan data transaksi berdasarkan identitas pengguna yang sedang login.

---

## Fitur 5 — Galeri Hasil Generate Gambar

**Role Penanggung Jawab:** `Backend, Frontend`

**Sumber Data:** `Internal System`

**Deskripsi & Ekspektasi:**
Fitur galeri digunakan untuk menampilkan kembali hasil gambar yang pernah dibuat oleh pengguna. Setiap gambar hasil generate disimpan ke database bersama informasi prompt, URL gambar, waktu pembuatan, dan pemilik akun.

Ekspektasi dari fitur ini adalah pengguna dapat melihat riwayat gambar yang pernah dihasilkan tanpa harus melakukan generate ulang. Fitur ini juga membantu pengguna mengelola hasil gambar, seperti melihat detail prompt dan mengakses kembali gambar yang sudah dibuat sebelumnya.

---

## Fitur 6 — Payment Gateway Midtrans

**Role Penanggung Jawab:** `Backend, Frontend, DevOps`

**Sumber Data:** `Third-Party API — Midtrans`

**Deskripsi & Ekspektasi:**
Fitur payment gateway digunakan untuk memproses pembayaran paket berbayar pada fitur generate gambar. Ketika pengguna memilih paket premium, backend Laravel membuat transaksi melalui Midtrans dan mengirimkan payment token atau redirect URL ke frontend.

Ekspektasi dari fitur ini adalah pengguna dapat melakukan pembayaran secara aman dan terstruktur. Setelah Midtrans mengirimkan notifikasi pembayaran berhasil, sistem memperbarui status transaksi dan menambahkan kuota generate gambar ke akun pengguna.

---

## Ringkasan Alur Fitur

```text
1. Pengguna melakukan register atau login.
2. Pengguna dapat menggunakan fitur generate teks melalui Gemini API.
3. Pengguna dapat menggunakan fitur generate gambar melalui Cloudflare Worker AI.
4. Jika kuota generate gambar habis, pengguna dapat memilih pricing plan.
5. Pembayaran paket berbayar diproses melalui Midtrans.
6. Setelah pembayaran berhasil, kuota generate gambar pengguna bertambah.
7. Hasil generate gambar disimpan dan ditampilkan pada halaman galeri.
```
