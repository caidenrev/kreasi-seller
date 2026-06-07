# Kreasi.id — Seller Portal

Ini adalah dashboard khusus kreator / penjual untuk mengatur produk digital mereka, memantau analitik penjualan, dan melakukan pencairan dana (withdraw).

## Prasyarat
Pastikan Anda sudah menjalankan `pnpm install` dari root direktori proyek.

## Konfigurasi Environment Variables

Buat file `.env.local` di dalam folder `seller/` ini, dan isi dengan kredensial Firebase Anda (Kredensial ini sama dengan yang ada di Client):

```env
# Konfigurasi Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Menjalankan Server Development

Karena Storefront Client sudah menggunakan port 3000, jalankan Seller Portal di port 3001. Jalankan perintah berikut di dalam direktori `seller/`:

```bash
pnpm dev --port 3001
```
*(Atau Anda bisa mengedit package.json `"dev": "next dev -p 3001"` dan cukup jalankan `pnpm dev`)*

Aplikasi akan berjalan di [http://localhost:3001](http://localhost:3001).

## Fitur Utama
- **Manajemen Produk:** Upload thumbnail ke Firebase Storage, pengaturan harga, dan link GDrive.
- **Wallet & Saldo:** Menampilkan saldo aktif yang didapat dari pendapatan bersih penjualan (95% setelah dipotong platform fee 5%).
- **Withdrawal:** Request penarikan dana ke rekening bank yang akan diproses oleh Admin.
- **Analytics:** Melacak total penjualan dan produk yang pending / direject oleh admin.
