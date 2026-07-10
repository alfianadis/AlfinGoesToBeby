-- Seed data (dummy — data asli diganti untuk kebutuhan portofolio)
begin;
-- wipe default seed
delete from transaksi;
delete from checklist;
delete from kua;
delete from seserahan;
delete from tamu;
delete from rundown;
delete from notes;
delete from moodboard;
delete from vendor;
delete from kategori;
update config set value='2025-06-01' where key='tanggal_pernikahan';
update config set value='Budi' where key='nama_pasangan_1';
update config set value='Sari' where key='nama_pasangan_2';

-- kategori
insert into kategori (nama, budget_rencana) values ('Venue', 50000000);
insert into kategori (nama, budget_rencana) values ('Dekorasi', 20000000);
insert into kategori (nama, budget_rencana) values ('Busana', 15000000);
insert into kategori (nama, budget_rencana) values ('Dokumentasi', 10000000);
insert into kategori (nama, budget_rencana) values ('Undangan', 3000000);
insert into kategori (nama, budget_rencana) values ('MUA', 8000000);
insert into kategori (nama, budget_rencana) values ('Entertainment', 5000000);
insert into kategori (nama, budget_rencana) values ('Souvenir', 5000000);
insert into kategori (nama, budget_rencana) values ('Lain-lain', 4000000);
insert into kategori (nama, budget_rencana) values ('Wedding Organizer', 15000000);

-- vendor (dummy)
insert into vendor (id, nama, kategori, kontak, harga_deal, status, dp_dibayar, catatan, link) values
  ('11111111-1111-1111-1111-111111111111', 'Gedung Serbaguna Makmur', 'Venue', '08111000001', 50000000, 'deal', 10000000, null, null);
insert into vendor (id, nama, kategori, kontak, harga_deal, status, dp_dibayar, catatan, link) values
  ('22222222-2222-2222-2222-222222222222', 'WO Bahagia Bersama', 'Wedding Organizer', '08222000002', 15000000, 'deal', 3000000, null, null);
insert into vendor (id, nama, kategori, kontak, harga_deal, status, dp_dibayar, catatan, link) values
  ('33333333-3333-3333-3333-333333333333', 'Studio Kenangan Foto', 'Dokumentasi', '08333000003', 10000000, 'kandidat', 0, null, null);

-- transaksi (dummy)
insert into transaksi (tanggal, tipe, kategori, deskripsi, jumlah, dibayar_oleh, vendor_id, catatan) values
  ('2025-01-01', 'pemasukan', null, 'Tabungan bersama', 30000000, 'Budi', null, null);
insert into transaksi (tanggal, tipe, kategori, deskripsi, jumlah, dibayar_oleh, vendor_id, catatan) values
  ('2025-01-15', 'pengeluaran', 'Venue', 'DP Gedung Serbaguna Makmur', 10000000, 'Budi', '11111111-1111-1111-1111-111111111111', null);
insert into transaksi (tanggal, tipe, kategori, deskripsi, jumlah, dibayar_oleh, vendor_id, catatan) values
  ('2025-01-20', 'pengeluaran', 'Wedding Organizer', 'DP WO Bahagia Bersama', 3000000, 'Sari', '22222222-2222-2222-2222-222222222222', null);

-- checklist (fase & deadline generik, tidak terkait tanggal pribadi)
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Tentukan tanggal & estimasi tanggal pernikahan', '12+ Bulan', null, null, 'selesai', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Susun anggaran/budget total pernikahan', '12+ Bulan', null, null, 'selesai', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Buat draft daftar tamu (estimasi jumlah)', '12+ Bulan', null, null, 'proses', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Tentukan konsep & tema pernikahan', '12+ Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Survey & booking venue (akad & resepsi)', '12+ Bulan', null, null, 'selesai', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Cari & booking vendor catering', '9-12 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Cari & booking fotografer / videografer', '9-12 Bulan', null, null, 'proses', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Cari & booking dekorasi', '9-12 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Cari & booking MUA (Make Up Artist)', '9-12 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Tentukan wedding organizer (jika pakai)', '9-12 Bulan', null, null, 'selesai', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Pesan / sewa baju pengantin & keluarga', '6-9 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Pilih & pesan cincin pernikahan', '6-9 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Cari entertainment / musik (band, MC)', '6-9 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Finalisasi daftar tamu', '6-9 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Booking souvenir pernikahan', '6-9 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Desain & cetak undangan', '3-6 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Urus dokumen administrasi (KUA/Catatan Sipil)', '3-6 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Jadwalkan tes kesehatan / suntik TT', '3-6 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Fitting baju pengantin pertama', '3-6 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Rencana bulan madu / honeymoon', '3-6 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Sebar undangan ke tamu', '1-3 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Konfirmasi ulang semua vendor', '1-3 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Susun rundown acara hari-H', '1-3 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Bayar DP / pelunasan vendor', '1-3 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Fitting baju final', '1-3 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Gladi bersih / technical meeting', '1-3 Bulan', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Konfirmasi kehadiran tamu penting', '1 Minggu', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Siapkan seserahan & mahar', '1 Minggu', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Pelunasan akhir semua vendor', '1 Minggu', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Siapkan amplop/tip untuk vendor & panitia', '1 Minggu', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Istirahat cukup & perawatan diri', '1 Minggu', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Siapkan dokumen akad (buku nikah dll)', 'Hari-H', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Koordinasi dengan WO / panitia', 'Hari-H', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Bawa kotak P3K & perlengkapan darurat', 'Hari-H', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Nikmati hari bahagiamu! 💕', 'Hari-H', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Kirim ucapan terima kasih ke tamu & vendor', 'Setelah', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Urus pencatatan & legalisir dokumen nikah', 'Setelah', null, null, 'belum', null);
insert into checklist (task, kategori, deadline, pic, status, catatan) values ('Review & beri testimoni vendor', 'Setelah', null, null, 'belum', null);

-- kua
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Fotokopi KTP', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Fotokopi Kartu Keluarga (KK)', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Fotokopi akta kelahiran', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Fotokopi ijazah terakhir', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Pas foto 2x3 (4 lembar, latar biru)', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Pas foto 3x4 (4 lembar, latar biru)', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Surat pengantar nikah dari RT/RW', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Surat keterangan untuk menikah (N1) dari kelurahan', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Surat keterangan asal-usul (N2) dari kelurahan', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Surat keterangan tentang orang tua (N4) dari kelurahan', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Surat persetujuan mempelai (N3)', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Surat izin orang tua (N5) jika usia < 21 tahun', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Surat rekomendasi nikah dari KUA asal (jika beda kecamatan)', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Akta cerai / surat kematian pasangan (jika pernah menikah)', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Surat dispensasi pengadilan (jika usia di bawah ketentuan)', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Surat izin komandan (bagi TNI/POLRI)', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Surat keterangan imunisasi TT (dari puskesmas)', false, false, null);
insert into kua (syarat, status_cpp, status_cpw, catatan) values ('Membayar biaya nikah (jika di luar KUA / luar jam kerja)', false, false, null);
commit;
