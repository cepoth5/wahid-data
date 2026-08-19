# Panduan Lengkap Deployment & Setup Supabase

Aplikasi Wahid Asset Monitoring ini sudah dilengkapi fitur **GPS Tracking Surveyor Lapangan** dan sistem **User Role (Admin/Surveyor)**. Ikuti panduan ini untuk mengaktifkan database Supabase Anda dan mempublikasikan aplikasi ke Vercel melalui GitHub.

---

## BAGIAN 1: Setup Database Supabase

1. Buka dashboard [Supabase](https://supabase.com/) dan buat project baru.
2. Tunggu hingga database selesai dibuat.
3. Di menu sebelah kiri, cari dan buka **SQL Editor**.
4. Klik **New Query**, lalu salin seluruh isi berkas `schema.sql` (berada di folder utama proyek ini) ke editor tersebut.
5. Klik **Run** untuk mengeksekusi script. Ini akan membuat tabel `profiles` dan `assets` serta mengatur kebijakan keamanan (RLS).

### Menambahkan User Demo
1. Masuk ke menu **Authentication** -> **Users** -> Klik **Add User** -> **Create User**.
2. Buat akun pertama untuk **Admin**:
   - Email: `admin@wahid.local` (atau email riil Anda)
   - Password: Pilih password Anda
3. Buat akun kedua untuk **Surveyor**:
   - Email: `surveyor@wahid.local` (atau email lapangan Anda)
   - Password: Pilih password Anda
4. Masuk ke **SQL Editor** Supabase untuk memperbarui role mereka (karena defaultnya adalah surveyor):
   ```sql
   -- Ubah role user admin menjadi 'admin' (ganti email sesuai dengan yang didaftarkan)
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE id IN (
     SELECT id FROM auth.users WHERE email = 'admin@wahid.local'
   );
   ```

---

## BAGIAN 2: Upload Proyek ke GitHub

Buka terminal Anda di direktori proyek ini, lalu jalankan perintah berikut:

1. **Inisialisasi Git Lokal:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Wahid Asset Monitoring dengan GPS Tracking & Supabase"
   ```

2. **Hubungkan ke Repositori GitHub Baru:**
   - Buat repositori baru kosong di GitHub (jangan centang tambahkan README/License).
   - Jalankan perintah di bawah ini (ubah URL repositori Anda):
   ```bash
   git branch -M main
   git remote add origin https://github.com/USERNAME-ANDA/REPOS-ANDA.git
   git push -u origin main
   ```

---

## BAGIAN 3: Deploy ke Vercel

1. Buka dashboard [Vercel](https://vercel.com/) dan masuk menggunakan akun GitHub Anda.
2. Klik **Add New** -> **Project**.
3. Cari repositori GitHub yang baru saja Anda push (`wahid-asset-monitoring`) dan klik **Import**.
4. Di bagian **Environment Variables** (sangat penting!), tambahkan variabel berikut:
   - `VITE_SUPABASE_URL` = (Ambil dari Supabase Project Settings -> API -> Project URL)
   - `VITE_SUPABASE_ANON_KEY` = (Ambil dari Supabase Project Settings -> API -> anon public service key)
5. Klik **Deploy**.

*Aplikasi Anda sekarang aktif! Anda bisa membuka link Vercel yang diberikan di HP Anda untuk mencoba fitur GPS lapangan langsung.*
