# PRD — CampRent: Camping Equipment Rental Management System

| | |
|---|---|
| **Versi** | 1.0 (Draft) |
| **Tanggal** | 14 Oktober 2026 |
| **Status** | Siap dikerjakan (MVP dengan data dummy) |
| **Referensi visual** | Mockup UI CampRent (landing, katalog, detail produk, keranjang, checkout, My Rental, dashboard admin, inventory, kalender, mobile) |

---

## 1. Ringkasan

CampRent adalah **sistem operasional untuk pemilik usaha rental peralatan camping**, bukan marketplace. Customer dapat mencari peralatan berdasarkan tanggal, memesan beberapa item sekaligus, dan memantau status sewa. Owner/staff mengelola inventori per unit, siklus sewa (booking, pickup, return), jaminan identitas dan denda, maintenance, serta kalender ketersediaan.

**Masalah inti yang diselesaikan:**
> Apakah barang X tersedia pada rentang tanggal Y–Z? Dan unit fisik mana yang dipakai?

Ketersediaan dihitung **berdasarkan tanggal dan unit**, bukan sekadar `stock > 0`.

## 2. Tujuan & Non-Tujuan

### Tujuan
1. Availability engine yang akurat berbasis rentang tanggal.
2. Lifecycle sewa lengkap: Pending → Waiting Payment → Confirmed → Ready for Pickup → Rented → Returning → Completed (+ Cancelled, Overdue).
3. Tracking per unit individual (mis. `TND-001`).
4. Inspeksi kondisi saat pickup dan return, termasuk foto.
5. Jaminan identitas dan denda (cleaning, damage, late). Tidak ada deposit uang: denda dibayar saat return, dan jaminan ditahan sampai denda lunas.
6. Maintenance unit yang memengaruhi ketersediaan.
7. Kalender rental untuk owner.
8. Upload gambar produk oleh owner.

### Non-Tujuan (MVP)
- Payment gateway otomatis (pembayaran manual: transfer, bukti dikirim via WhatsApp).
- Marketplace multi-vendor.
- Aplikasi mobile native (cukup web responsif).
- Notifikasi email/SMS otomatis.
- Pembuatan paket camping, invoice PDF, realtime (fase 2).

## 3. Pengguna & Peran

| Peran | Akses |
|---|---|
| **Guest** | Landing, katalog, detail produk, cek ketersediaan, keranjang. Login/daftar diperlukan saat checkout. |
| **Customer** | Semua akses guest + checkout, My Rental, Profile, Notifications. |
| **Staff** | Dashboard, Rental, Inventory, Calendar, Customers, Pickup, Return, Maintenance. Tidak bisa Settings, Reports keuangan, User Management. |
| **Owner** | Akses penuh termasuk Payments, Reports, Settings, manajemen staff. |

## 4. Data Dummy & Gambar Produk

### 4.1 Data dummy
- Seluruh data awal dibuat lewat **seed script** (`prisma/seed.ts`) agar bisa di-reset kapan saja (`npm run db:seed`).
- Isi seed minimal:
  - 3 akun (Owner, Staff, Customer) dibuat lewat **Supabase Admin API** di seed script (kredensial dev ditulis di README), lalu dipetakan ke tabel `Profile`.
  - 7 kategori: Tenda, Sleeping Bag, Matras, Furniture, Cooking, Lighting, Carrier, Accessories.
  - ±15 produk (mis. Tenda Consina Magnum 4P Rp75.000/hari, Tenda Eiger 6P Rp120.000, Tenda Naturehike 2P Rp60.000, Sleeping Bag Consina Rp25.000, Matras Eiger Rp15.000, Kompor Portable Rp30.000).
  - ±80 unit individual dengan kode (`TND-001`, `SB-003`, `STV-001`) dan status bervariasi.
  - ±20 rental dengan berbagai status, tersebar di sekitar tanggal hari ini agar dashboard, kalender, dan availability terlihat hidup.
  - 2–3 record maintenance.
- Nomor booking format `#CR-YYYY-NNNNN`.

### 4.2 Upload gambar produk
- Owner/Staff dapat **mengunggah 1–6 gambar per produk** dari form tambah/edit produk (drag & drop + tombol pilih file).
- Gambar pertama = gambar utama (bisa diubah urutannya / dihapus).
- Validasi: JPG/PNG/WebP, maks 5 MB per file, resize otomatis ke sisi terpanjang 1600 px, thumbnail 400 px.
- Foto kondisi saat pickup/return juga memakai komponen upload yang sama.
- **Penyimpanan:** **Supabase Storage**. Bucket `product-images` (publik, untuk katalog) dan bucket `condition-photos` (privat, foto kondisi pickup/return, diakses lewat signed URL hanya oleh Owner/Staff). Akses melalui lapisan `StorageService` (`upload/delete/getUrl`) agar mudah diganti bila perlu.
- Produk tanpa gambar menampilkan **placeholder** (ikon tenda di atas latar mint).

## 5. Design System (mengacu pada mockup)

### 5.1 Warna

| Token | Nilai (perkiraan dari mockup) | Pemakaian |
|---|---|---|
| `primary` | `#0F6B3F` | Tombol utama ("Cari Peralatan", "Konfirmasi Pemesanan"), link aktif |
| `primary-dark` | `#0B4F2F` | Hover tombol, grafik batang |
| `sidebar-bg` | `#0F2A22` | Sidebar admin (hijau gelap hampir hitam) |
| `sidebar-active` | `#14543A` | Item menu aktif admin |
| `accent-mint` | `#E6F4EC` | Latar ikon, item aktif sidebar customer, badge ringan |
| `background` | `#F6F8F7` | Latar halaman |
| `surface` | `#FFFFFF` | Kartu, tabel, form |
| `border` | `#E5EAE7` | Garis kartu & input |
| `text` | `#16221D` | Teks utama |
| `text-muted` | `#6B7A73` | Teks sekunder, label |
| `star` | `#F5B301` | Rating bintang |

**Warna status** (badge dan kalender):

| Status | Warna |
|---|---|
| Confirmed / Completed / Available / Pickup | Hijau |
| Returned | Biru |
| Waiting / Pending / Maintenance | Oranye/Kuning |
| Cancelled / Booked / Overdue | Merah |

> Nilai hex dapat disesuaikan setelah diukur langsung dari file mockup; yang penting dikelola sebagai CSS variable / Tailwind theme token, bukan hardcode.

### 5.2 Tipografi & komponen
- Font sans-serif bersih (Inter / Plus Jakarta Sans). Heading tebal, body 14–16 px.
- Sudut membulat (radius 8–12 px), kartu putih dengan border tipis dan bayangan halus.
- Tombol utama hijau solid, tombol sekunder outline hijau ("Detail").
- Ikon: Lucide.
- Komponen: shadcn/ui (Button, Input, Select, Checkbox, Slider, Calendar, Dialog, Table, Tabs, Badge, Dropdown, Toast).

### 5.3 Layout global
- **Area publik/customer:** navbar atas (logo CampRent di kiri; Home, Catalog, About, Contact; ikon search, keranjang, profil di kanan; tombol Login/Register untuk guest).
- **Area admin:** sidebar kiri gelap (Dashboard, Rental, Inventory, Calendar, Customers, Payments, Reports, Settings) + header atas (search, notifikasi, profil).
- **Area My Rental:** sidebar kiri terang (Dashboard, My Rental, Profile, Notifications, Logout).
- Bahasa antarmuka: **Bahasa Indonesia**. Mata uang format `Rp75.000`. Tanggal format `18 Okt 2026`.

## 6. Halaman & Kebutuhan Fungsional

### 6.1 Landing Page (`/`)
- Hero: foto camping latar penuh, judul **"Sewa Peralatan Camping untuk Petualanganmu"**, sub-teks, dan **search bar tanggal** (Tanggal Sewa, Tanggal Kembali, tombol **Cari Peralatan**).
- Strip 4 keunggulan: Peralatan Berkualitas, Proses Mudah, Harga Terjangkau, **Pickup di Toko** (menggantikan teks "Pengiriman & Pickup" di mockup, karena belum ada layanan antar).
- Grid kategori (terutama tampilan mobile).
- Submit search menuju `/catalog?start=...&end=...`.

### 6.2 Katalog (`/catalog`)
- **Sidebar filter:** Kategori (dengan jumlah produk), Kapasitas (2/4/6/8 Person, checkbox), Harga per Hari (range slider Rp10.000–Rp200.000).
- Kotak pencarian nama produk, dropdown **Urutkan** (Terpopuler, Harga terendah, Harga tertinggi, Terbaru).
- Grid 3 kolom kartu produk: gambar, nama, rating + jumlah ulasan, harga/hari, **"N unit tersedia"** (dihitung untuk tanggal terpilih), tombol **Detail**.
- Jika tanggal terpilih, produk dengan ketersediaan 0 ditampilkan abu-abu "Tidak tersedia".
- Pagination atau infinite scroll.

### 6.3 Detail Produk (`/catalog/[slug]`)
- Tautan "Kembali ke katalog".
- Galeri: gambar besar + thumbnail (dari upload owner).
- Nama, rating, harga/hari, badge kapasitas dan berat.
- Deskripsi, daftar fasilitas/kelengkapan (Flysheet, Inner, Pole, Peg, Carry Bag), dimensi.
- Panel **Cek Ketersediaan**: kalender bulanan (Tersedia / Terbooked / Maintenance), navigasi bulan, legenda warna.
- Pilih rentang tanggal dan jumlah, lalu tombol **Tambah ke Keranjang**.

### 6.4 Keranjang (`/cart`)
- Daftar item (gambar, nama, harga × qty × hari, subtotal, stepper qty, hapus).
- Panel **Ringkasan**: Subtotal dan Total (tanpa deposit), tombol **Lanjut ke Checkout**, tautan **+ Tambah item lainnya**.
- Validasi ulang ketersediaan setiap kali qty/tanggal berubah.
- Keranjang disimpan di localStorage untuk guest dan dipindahkan saat login.

### 6.5 Checkout / Informasi Pemesanan (`/checkout`)
- Form **Data Penyewa**: Nama Lengkap*, Nomor WhatsApp*, Alamat*, **Jenis Jaminan*** (KTP / SIM / KTM / Kartu Pelajar), Catatan (opsional).
- Info di halaman: jaminan identitas asli wajib diserahkan saat pickup, dan pengambilan barang hanya di toko.
- Panel **Tanggal Sewa** (tanggal sewa → tanggal kembali, durasi otomatis) dan **Ringkasan Pesanan**.
- Tombol **Konfirmasi Pemesanan**: membuat rental berstatus *Waiting Payment* dan mengunci ketersediaan, lalu menampilkan halaman sukses berisi nomor rekening toko dan tombol **Kirim via WhatsApp**.
- Pesan WhatsApp dibuat otomatis (nomor booking, item, tanggal, total, jenis jaminan) menuju nomor WhatsApp owner. **Bukti transfer dikirim customer langsung lewat chat WhatsApp**, bukan diunggah di aplikasi.
- Owner/Staff memeriksa bukti transfer di WhatsApp, lalu menandai pembayaran lunas di admin (status menjadi *Confirmed*).

### 6.6 My Rental (`/account/rentals`)
- Tab: Semua, Aktif, Selesai, Dibatalkan.
- Daftar rental: ikon, nomor booking, rentang tanggal, jumlah item, badge status, tombol **Lihat Detail**.
- Detail rental: stepper progres status (Booking Confirmed → Payment → Ready for Pickup → Rental → Return → Completed), daftar item, rincian biaya (sewa + denda bila ada), jenis jaminan, tombol Batalkan (selama belum Confirmed).
- Menu lain: Profile (edit data), Notifications (daftar sederhana dalam aplikasi).

### 6.7 Dashboard Admin (`/admin`)
- Sapaan "Good morning, Owner" dan tanggal hari ini.
- 4 kartu statistik: **Total Booking, Pickup, Return, Revenue** beserta persentase perubahan dari kemarin.
- Tabel **Rental Terbaru** (No. Order, Nama, Tanggal, Status).
- Grafik batang **Pendapatan 7 Hari Terakhir**.

### 6.8 Manajemen Rental (`/admin/rentals`)
- Tabel dengan filter status, pencarian, dan rentang tanggal.
- Detail rental dengan aksi sesuai status (konfirmasi pembayaran, tetapkan unit, **Pickup**, **Return**, batalkan).
- Alur status:

```
Pending → Waiting Payment → Confirmed → Ready for Pickup → Rented → Returning → Completed
                     └──────────────→ Cancelled            Rented → Overdue (otomatis bila lewat tanggal kembali)
```

### 6.9 Inventory (`/admin/inventory`)
- Tabel produk: **Produk, Total Unit, Tersedia, Rented, Cleaning, Maintenance, Reserved, Status**, plus menu aksi.
- Tombol **+ Tambah Produk**, pencarian, filter kategori.
- Form produk: nama, kategori, kapasitas, deskripsi, dimensi, berat, kelengkapan, harga/hari, **waktu pembersihan setelah return (hari, mis. tenda 2, lainnya 1 atau 0)**, **upload gambar** (lihat 4.2).
- Halaman detail produk admin: daftar **unit individual** (kode, status Available / Reserved / Rented / Cleaning / Maintenance, catatan), tambah/hapus unit, ubah status manual.

### 6.10 Pickup / Check-out
- Pilih unit spesifik untuk setiap item rental (checkbox per kode unit).
- **Condition check** per item: Good / Minor Damage / Damaged + catatan + upload foto.
- **Pencatatan jaminan:** jenis (KTP / SIM / KTM / Kartu Pelajar), nama pada kartu, dan status "Diterima / Ditahan di toko". Pickup tidak dapat dikonfirmasi sebelum jaminan dicatat diterima.
- Tombol **Confirm Pickup** mengubah status unit menjadi Rented.

### 6.11 Return / Check-in
- Per unit: returned (ya/tidak), kondisi (Good / Dirty / Minor Damage / Damaged), foto, catatan.
- Penambahan biaya: **Cleaning Fee, Damage Fee, Late Fee** (late fee dapat dihitung otomatis per hari keterlambatan).
- Total denda dihitung dari Cleaning/Damage/Late Fee dan **dibayar customer saat return** (tunai/transfer). Jaminan identitas **tetap ditahan sampai denda lunas**.
- **Complete Rental**: jaminan ditandai "Dikembalikan ke customer" (dan wajib dicentang sebelum rental dapat diselesaikan).
- Status unit setelah return:
  - Kondisi Good/Dirty/Minor Damage → **Cleaning** selama `cleaningDays` produk tersebut (mis. tenda 2 hari), lalu otomatis **Available** pada tanggal `availableAfter`. Staff dapat menandai siap lebih awal secara manual.
  - Kondisi Damaged → otomatis **Maintenance**.

### 6.12 Maintenance
- Pencatatan: unit, masalah, estimasi biaya, tanggal mulai, estimasi siap, status (Open / In Progress / Done).
- Unit dalam maintenance **tidak dihitung tersedia** pada rentang tanggalnya dan tampil kuning di kalender.

### 6.13 Rental Calendar (`/admin/calendar`)
- Tampilan timeline: baris = produk (bisa di-expand ke unit), kolom = tanggal.
- Toggle **Mingguan / Bulanan**, navigasi periode.
- Blok warna: hijau Available, merah Booked (berisi nomor rental), kuning Maintenance, abu-biru Cleaning (masa pembersihan setelah return); klik blok membuka detail rental.
- Legenda di bawah.

### 6.14 Halaman admin lain
- **Customers:** daftar customer, riwayat rental.
- **Payments:** daftar pembayaran manual, tombol tandai lunas, dan unggahan tangkapan layar bukti transfer (opsional, sebagai arsip karena bukti asli diterima lewat WhatsApp).
- **Reports** (Owner): pendapatan per periode, produk terpopuler (sederhana).
- **Settings** (Owner): nama usaha, nomor WhatsApp owner, tarif late fee per hari, tarif cleaning fee default, manajemen staff.

### 6.15 Responsif
- Semua halaman publik responsif; mobile menampilkan hero, search tanggal, dan grid kategori seperti mockup.
- Admin utama untuk desktop/tablet; sidebar collapse di layar kecil.

## 7. Availability Engine (inti sistem)

**Aturan:**
1. Rental memakai rentang tanggal `[start_date, end_date]`. Setelah `end_date`, unit memasuki **masa pembersihan** selama `cleaningDays` produk (mis. tenda 2 hari). Jadi rentang yang diblokir untuk satu unit adalah `[start_date, end_date + cleaningDays]`, dan unit baru bisa dipesan lagi mulai hari setelahnya.
2. Unit dianggap **tidak tersedia** pada rentang tertentu jika:
   - sudah terikat ke rental aktif (Waiting Payment, Confirmed, Ready for Pickup, Rented, Returning, Overdue) yang tanggalnya bertumpuk, atau
   - memiliki maintenance aktif yang tanggalnya bertumpuk, atau
   - berada dalam masa pembersihan (Cleaning) yang bertumpuk dengan rentang yang diminta, atau
   - status unit dinonaktifkan.
3. **Ketersediaan produk** = jumlah unit tersedia − jumlah item yang sudah direservasi (booking belum ditetapkan unit) pada rentang tersebut.
4. Saat booking, sistem mereservasi **jumlah per produk**; unit spesifik ditetapkan saat pickup (atau lebih awal oleh staff).
5. **Anti double-booking:** pembuatan rental dilakukan dalam satu transaksi database dengan penguncian (`SELECT ... FOR UPDATE` pada produk terkait) dan pengecekan ulang ketersediaan.
6. Rental berstatus Waiting Payment **kedaluwarsa otomatis** (default 24 jam) dan melepas reservasi.
7. Logika berada di satu modul (`lib/availability.ts`) dengan **unit test** untuk: tumpang tindih, booking tepat setelah masa pembersihan, return terlambat yang menggeser masa pembersihan, maintenance di tengah periode, qty melebihi stok, dan pembatalan.

## 8. Model Data (ringkas)

```
Profile(id = Supabase auth.users.id, name, role[OWNER|STAFF|CUSTOMER])
Customer(id, profileId, phone, address)
Category(id, name, slug)
Product(id, categoryId, name, slug, description, capacity, dimension, weightKg,
        pricePerDay, cleaningDays, includedItems[], ratingAvg, ratingCount, isActive)
ProductImage(id, productId, url, position)
ProductUnit(id, productId, code, status[AVAILABLE|RESERVED|RENTED|CLEANING|MAINTENANCE|INACTIVE],
            availableAfter, notes)
Rental(id, code, customerId, startDate, endDate, status, subtotal,
       extraFees, total, notes, expiresAt, createdAt)
RentalItem(id, rentalId, productId, quantity, pricePerDay, days, subtotal)
RentalItemUnit(id, rentalItemId, unitId)
Payment(id, rentalId, amount, method, proofUrl, status, paidAt)
Checklist(id, rentalId, type[PICKUP|RETURN], unitId, condition, notes, photoUrls[], createdBy)
Fee(id, rentalId, type[CLEANING|DAMAGE|LATE], amount, notes)
Collateral(id, rentalId, type[KTP|SIM|KTM|STUDENT_CARD], holderName, status[PLANNED|HELD|RETURNED],
           receivedAt, returnedAt)
Maintenance(id, unitId, issue, estimatedCost, startDate, expectedReadyDate, status)
Notification(id, userId, title, body, readAt)
Setting(key, value)
```

## 9. Tech Stack

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui + Lucide |
| Data | Supabase Postgres + Prisma (diakses dari server saja) |
| Auth | Supabase Auth (email + password), peran disimpan di tabel `Profile` |
| Storage | Supabase Storage (`product-images` publik, `condition-photos` privat) |
| Validasi | Zod + React Hook Form |
| Grafik | Recharts |
| Test | Vitest (availability engine), Playwright (alur booking, opsional) |
| Deploy | Vercel + Supabase |

## 10. Kebutuhan Non-Fungsional
- **Performa:** halaman katalog < 2 detik pada data seed; query ketersediaan memakai indeks pada `(unitId, startDate, endDate)`.
- **Keamanan:** proteksi route berdasarkan role (middleware + pengecekan di setiap server action), validasi server-side semua input, validasi tipe/ukuran file upload. Karena Prisma terhubung langsung ke Postgres (melewati RLS), otorisasi dijaga di kode server; tabel tetap diaktifkan RLS sebagai lapisan cadangan. Data jaminan identitas hanya dicatat sebagai jenis dan nama, tanpa menyimpan foto atau nomor kartu.
- **Aksesibilitas:** kontras warna memadai, label form jelas, navigasi keyboard pada komponen utama.
- **Maintainability:** struktur modular per fitur, storage dan data access di balik abstraksi.

## 11. Fase Pengerjaan

| Fase | Cakupan |
|---|---|
| **0. Fondasi** | Setup proyek, design tokens, layout publik/admin, skema Prisma, seed data dummy, auth + role |
| **1. Availability & Katalog** | Availability engine + unit test, katalog + filter, detail produk + kalender, upload gambar |
| **2. Booking** | Keranjang, checkout, halaman sukses + WhatsApp, My Rental |
| **3. Operasional** | Dashboard, manajemen rental, inventory + unit, pickup, return, jaminan & denda |
| **4. Pelengkap** | Maintenance, Rental Calendar, Customers, Payments, Reports, Settings |
| **5. Fase 2 (opsional)** | Paket camping, invoice PDF, realtime, payment gateway, notifikasi email/WhatsApp, ulasan |

## 12. Kriteria Keberhasilan MVP
- Customer dapat mencari berdasarkan tanggal, memesan beberapa item, dan melihat status.
- Dua booking bersamaan untuk unit terakhir tidak pernah menyebabkan double-booking.
- Owner dapat menambah produk dengan **upload gambar sendiri** dan melihatnya langsung di katalog.
- Alur lengkap bisa didemokan memakai data dummy: booking → konfirmasi → pickup → return dengan denda → jaminan dikembalikan.
- Tampilan sesuai mockup (warna, tata letak) di desktop dan mobile.

## 13. Asumsi & Pertanyaan Terbuka

| # | Topik | Asumsi saat ini |
|---|---|---|
| 1 | Pembayaran | Manual: transfer, bukti dikirim via WhatsApp, admin menandai lunas (**diputuskan**) |
| 2 | Penyimpanan gambar | Supabase Storage (**diputuskan**) |
| 3 | Auth | Supabase Auth (**diputuskan**) |
| 4 | Masa pembersihan | Per produk, mis. tenda 2 hari, unit baru siap setelahnya (**diputuskan**) |
| 5 | Deposit | Tidak ada deposit uang; jaminan identitas + denda dibayar saat return (**diputuskan**) |
| 6 | Pengiriman | Hanya pickup di toko (**diputuskan**) |
| 7 | Rating & ulasan | Data dummy saja di MVP (**diputuskan**) |
| 8 | Jaminan identitas | KTP/SIM/KTM/Kartu Pelajar, diserahkan saat pickup dan dikembalikan saat return (**diputuskan**) |
| 9 | Akun customer | Checkout tetap memakai akun agar My Rental berfungsi (**asumsi**) |
