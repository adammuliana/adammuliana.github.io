# Undangan Pernikahan Adam & Muliana

Undangan web statis untuk ponsel, dengan warna merah anggur dan emas, latar 3D, transisi gerbang, foto pasangan beranimasi, dan musik lokal.

## Membuka undangan

Klik dua kali **index.html**, lalu tekan **Buka Undangan**. Tidak perlu memasang aplikasi atau menjalankan server. Simpan semua berkas HTML, CSS, JavaScript, dan folder assets bersama-sama. Paket ZIP dapat diekstrak lalu dibuka dengan cara yang sama.

Untuk membagikan tautan pada ponsel, unggah seluruh isi paket ke hosting web statis pilihan Anda. Undangan ini belum dipublikasikan.

## Nama penerima dari URL

Contoh:
```text
index.html?to=Bpk%20Bagus%20Wirayuda
https://alamat-undangan-anda.example/?to=Bpk%20Bagus%20Wirayuda
```

Ganti nama untuk setiap penerima. %20 berarti spasi dan %26 berarti karakter &. Sapaan atau gelar merupakan bagian dari nama dalam tautan. Parameter nama dan guest juga didukung; prioritasnya to, nama, lalu guest, dengan parameter kosong dilewati. Tanpa nama, sampul menampilkan Tamu Undangan. Nama hanya digunakan pada tampilan, tanpa penyimpanan atau pengiriman ke server.

Setelah dibuka, gerbang 3D beralih ke sampul foto penuh. Kotak penerima dan tombol pembuka hilang. Navigasi Awal kembali ke sampul utama tanpa mengulang transisi.

## Mempelai dan keluarga

- Adam: putra ketiga dari Ibu Warda dan Bapak Andi Aco (Alm.).
- Muliana: putri pertama dari Ibu Darma dan Bapak Arianto.

## Akad nikah

- Minggu, 18 Oktober 2026.
- Pukul 10.00–12.30 WITA.
- Kediaman Mempelai Wanita, Desa Lalonggolosua, Dusun III Talodo (dekat Masjid Al-Ghazali).

Kalender assets/adam-muliana.ics hanya berisi satu agenda akad nikah. Waktu disimpan dalam UTC agar aplikasi kalender menyesuaikannya; di WITA tampil 10.00–12.30. Tombol Maps mencari alamat yang diberikan, tanpa koordinat yang belum dikonfirmasi.

## Musik

Musik menggunakan salinan lokal dari berkas ssstik.io_1791534110543.mp3 yang disediakan pengguna. Aslinya tetap dipertahankan. Musik dicoba mulai ketika Buka Undangan ditekan. Jika browser memerlukan ketukan tambahan, gunakan Putar.

- Putar/Jeda memulai atau menjeda musik.
- Stop menghentikan musik dan mengembalikannya ke awal.
- Kontrol tersedia di atas navigasi bawah setelah undangan dibuka.
- Pemutaran tidak memerlukan internet karena audionya disertakan dalam paket.

## Tanda kasih

- Mandiri — 1620005617778, atas nama ANDI ADAM ERWINDI.
- BRI — 713401035727536, atas nama MULIANA.

Tombol Salin rekening menyalin nomor utuh sebagai teks. Undangan hanya menampilkan rekening dan tidak memproses atau mengirim uang.

## Berkas

- index.html: halaman undangan.
- style.css: desain utama.
- cover-experience.css: sampul dan transisi gerbang.
- celebration.css: keluarga, akad, kado, dan kontrol musik.
- script.js: undangan, nama tamu, hitung mundur, galeri, navigasi.
- celebration.js: musik dan penyalinan rekening.
- assets/photos/: sembilan foto yang dioptimalkan; foto asli tetap ada di folder proyek.
- assets/art/crimson-atelier.jpg: latar 3D khusus.
- assets/art/akad-couple.png: foto pasangan dengan latar transparan untuk akad, dari referensi WhatsApp Image 2026-10-07 at 18.53.59 (1).jpeg.
- assets/art/prompt.txt dan prompt-akad.txt: arahan pembuatan karya.
- assets/audio/wedding-song.mp3: musik lokal.
- assets/fonts/: Cormorant Garamond dan Manrope beserta lisensi SIL OFL.
- assets/adam-muliana.ics: kalender akad nikah.

Foto dan audio disediakan pengguna. Latar 3D dibuat khusus dengan built-in ImageGen. Foto pasangan pada bagian akad disunting dengan built-in ImageGen untuk memisahkan latar sesuai referensi pengguna; pakaian, aksesori, dan pose mengikuti foto tersebut. Animasi menggerakkan pasangan sebagai satu kesatuan secara lembut, tanpa putaran atau perubahan bentuk. Ornamen, ikon, dan animasi antarmuka menggunakan CSS, SVG, dan JavaScript. Pengaturan pengurangan gerakan perangkat dihormati.

Semua aset tersedia lokal. Maps memerlukan internet. Undangan bersifat statis, tanpa formulir RSVP atau basis data. Folder .preview hanya berisi bahan pemeriksaan dan tidak diperlukan untuk menjalankan undangan.
