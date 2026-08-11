# Manual Verification Checklist Post-ORM Migration (Prisma -> Sequelize)

Berkas ini berisi daftar verifikasi manual untuk menguji endpoint-endpoint utama setelah migrasi dari Prisma ke Sequelize.

## 1. Authentication & User Management (`/api/users`)
- [ ] **POST /api/users/signup**
  - Payload: `{ username, email, fullname, password }`
  - Memastikan user baru berhasil terdaftar di tabel `users` dan wallet otomatis dibuat di tabel `wallet` dengan `balance: 0`.
- [ ] **POST /api/users/login**
  - Payload: `{ username, password }`
  - Memastikan autentikasi Passport (local strategy) berhasil membaca password hash dan menyimpan session.
- [ ] **GET /api/users/getme**
  - Memastikan data user beserta nested wallet balance berhasil diambil (`include: Wallet`).
- [ ] **PUT /api/users/edit-bio**
  - Payload: `{ username, email, fullname, password }`
  - Memastikan update bio user berfungsi dengan benar.
- [ ] **GET /api/users/all**
  - Memastikan list seluruh user terambil dengan sorting `role DESC`.
- [ ] **DELETE /api/users/:id**
  - Memastikan transaksi penghapusan user beserta wallet (`sequelize.transaction`) berjalan aman (cascading / manual destroy).

## 2. Wallet Management (`/api/wallet`)
- [ ] **GET /api/wallet/user**
  - Memastikan saldo wallet user ter-login dapat diambil.
- [ ] **PUT /api/wallet/edit-balance**
  - Payload: `{ balance, id_user }`
  - Memastikan penambahan/perubahan saldo wallet berhasil diupdate.

## 3. Brand & Category Management (`/api/brands` & `/api/category`)
- [ ] **POST /api/brands** & **POST /api/category**
  - Memastikan pemrosesan image (BLOB medium) dan pencatatan nama brand/kategori berhasil.
- [ ] **GET /api/brands** & **GET /api/category**
  - Memastikan query filter `name_brand` / `category` menggunakan `Op.like` bekerja dengan baik.
- [ ] **PUT /api/brands** & **PUT /api/category**
  - Memastikan update data dan photo berjalan tanpa kendala.
- [ ] **DELETE /api/brands/:id_brand** & **DELETE /api/category/:id_category**
  - Memastikan data terhapus dari tabel.

## 4. Item / Product Management (`/api/items`)
- [ ] **POST /api/items**
  - Memastikan item baru berhasil dibuat dengan relasi `id_brand` dan `id_category`.
- [ ] **GET /api/items**
  - Query: `?withPhoto=yes` atau default.
  - Memastikan eager loading `brand` dan `category` mengembalikan nama brand dan kategori yang tepat.
- [ ] **POST /api/items/search**
  - Payload: `{ brands, categories, name, harga_gte, harga_lte }`
  - Memastikan filter pencarian (Op.like, Op.in, Op.gte, Op.lte) berfungsi dengan presisi.
- [ ] **POST /api/items/buy**
  - Payload: `{ items: [{ id_item, quantity }] }`
  - Memastikan transaksi database (`sequelize.transaction`):
    1. Pengurangan stok item di tabel `items`.
    2. Pemotongan saldo wallet user di tabel `wallet`.
    3. Pembuatan record transaksi di tabel `penjualan`.
    4. Pembuatan detail item terjual di tabel `item_terjual` (`bulkCreate`).
    5. Rollback transaksi jika saldo tidak mencukupi atau stok tidak cukup.

## 5. Penjualan & Order History (`/api/penjualan`)
- [ ] **GET /api/penjualan**
  - Query: `?diterima=true` atau default.
  - Memastikan eager loading 3 tingkat (`Penjualan -> ItemTerjual -> Item`) mengembalikan detail barang terjual beserta foto dan nama user.
- [ ] **PATCH /api/penjualan/:id_penjualan**
  - Payload: `{ status }`
  - Memastikan update status transaksi (pengemasan, dikirim, sampai, diterima) berhasil.
- [ ] **GET /api/penjualan/history**
  - Memastikan riwayat pembelian user berhasil diambil.

## 6. Preview Routes (`/api/preview`)
- [ ] **POST /api/preview** & **GET /api/preview/:category**
  - Memastikan pembuatan dan penarikan data preview barang (limit 5) berfungsi normal.
