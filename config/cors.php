<?php

/*
|--------------------------------------------------------------------------
| Cross-Origin Resource Sharing (CORS) Configuration
|--------------------------------------------------------------------------
|
| Konfigurasi CORS agar React frontend (http://localhost:5173)
| dapat berkomunikasi dengan Laravel API (http://localhost:8000).
|
| Pastikan FRONTEND_URL di .env sudah diisi dengan URL frontend
| yang benar.
|
*/

return [

    /*
    |--------------------------------------------------------------------------
    | Allowed Request Paths
    |--------------------------------------------------------------------------
    |
    | Hanya request ke path yang cocok yang akan mendapatkan
    | header CORS. Menggunakan 'api/*' agar semua endpoint API
    | dapat diakses oleh frontend.
    |
    */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    /*
    |--------------------------------------------------------------------------
    | Allowed HTTP Methods
    |--------------------------------------------------------------------------
    */
    'allowed_methods' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins
    |--------------------------------------------------------------------------
    |
    | Domain yang diizinkan untuk mengakses API.
    | Menggunakan FRONTEND_URL dari .env.
    |
    */
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'allowed_origins_patterns' => [],

    /*
    |--------------------------------------------------------------------------
    | Allowed Headers
    |--------------------------------------------------------------------------
    */
    'allowed_headers' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Exposed Headers
    |--------------------------------------------------------------------------
    */
    'exposed_headers' => [],

    /*
    |--------------------------------------------------------------------------
    | Max Age (seconds)
    |--------------------------------------------------------------------------
    |
    | Berapa lama browser boleh menyimpan cache preflight request.
    |
    */
    'max_age' => 0,

    /*
    |--------------------------------------------------------------------------
    | Supports Credentials
    |--------------------------------------------------------------------------
    |
    | Set true jika menggunakan cookies/session untuk auth.
    | Diperlukan untuk Laravel Sanctum SPA authentication.
    |
    */
    'supports_credentials' => true,

];
