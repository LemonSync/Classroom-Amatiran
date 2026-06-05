-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for db_classroom
CREATE DATABASE IF NOT EXISTS `db_classroom` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_classroom`;

-- Dumping structure for table db_classroom.akun
CREATE TABLE IF NOT EXISTS `akun` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_siswa` int DEFAULT NULL,
  `id_guru` int DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(225) NOT NULL,
  `role` enum('guru','siswa') NOT NULL DEFAULT 'siswa',
  PRIMARY KEY (`id`),
  KEY `id_siswa` (`id_siswa`),
  KEY `id_guru` (`id_guru`),
  CONSTRAINT `akun_ibfk_1` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `akun_ibfk_2` FOREIGN KEY (`id_guru`) REFERENCES `guru` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_classroom.akun: ~0 rows (approximately)

-- Dumping structure for table db_classroom.guru
CREATE TABLE IF NOT EXISTS `guru` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `nip` varchar(50) DEFAULT NULL,
  `login` tinyint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_classroom.guru: ~9 rows (approximately)
INSERT INTO `guru` (`id`, `nama`, `nip`, `login`) VALUES
	(1, 'NOVELMAN MANURUNG', NULL, 0),
	(2, 'ROY HENDRO SIBURIAN', NULL, 0),
	(3, 'GIRA BERLIAN GABRIELA HTG', NULL, 0),
	(4, 'HERBET HELVI ROBERTO BAKKARA', NULL, 0),
	(5, 'PIRMANDO GULTOM', NULL, 0),
	(6, 'ANNISAH HUSNI DAULAY', NULL, 0),
	(7, 'ARDIANSYAH', NULL, 0),
	(8, 'SENTY LIASTANOVA SEMBIRING', NULL, 0),
	(9, 'SHINTA HASTIA PUTRI', NULL, 0);

-- Dumping structure for table db_classroom.mapel
CREATE TABLE IF NOT EXISTS `mapel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_mapel` varchar(100) NOT NULL,
  `id_guru` int NOT NULL,
  `kelas` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_guru` (`id_guru`),
  CONSTRAINT `mapel_ibfk_1` FOREIGN KEY (`id_guru`) REFERENCES `guru` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_classroom.mapel: ~0 rows (approximately)

-- Dumping structure for table db_classroom.pengumpulan
CREATE TABLE IF NOT EXISTS `pengumpulan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_tugas` int NOT NULL,
  `id_siswa` int NOT NULL,
  `file_atau_teks` text NOT NULL,
  `waktu_submit` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status_terlambat` tinyint DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_tugas` (`id_tugas`),
  KEY `id_siswa` (`id_siswa`),
  CONSTRAINT `pengumpulan_ibfk_1` FOREIGN KEY (`id_tugas`) REFERENCES `tugas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pengumpulan_ibfk_2` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_classroom.pengumpulan: ~0 rows (approximately)

-- Dumping structure for table db_classroom.pengumpulan_tantangan
CREATE TABLE IF NOT EXISTS `pengumpulan_tantangan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_siswa` int NOT NULL,
  `id_tantangan` int NOT NULL,
  `jawaban_siswa` enum('BENAR','SALAH') COLLATE utf8mb4_general_ci NOT NULL,
  `status_jawaban` enum('TEPAT','SALAH') COLLATE utf8mb4_general_ci NOT NULL,
  `tanggal_isi` date NOT NULL,
  `waktu_submit` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `siswa_per_hari` (`id_siswa`,`tanggal_isi`),
  KEY `id_siswa` (`id_siswa`),
  KEY `id_tantangan` (`id_tantangan`),
  CONSTRAINT `fk_tantangan_konten` FOREIGN KEY (`id_tantangan`) REFERENCES `tantangan_harian` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tantangan_siswa` FOREIGN KEY (`id_siswa`) REFERENCES `siswa` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table db_classroom.pengumpulan_tantangan: ~0 rows (approximately)

-- Dumping structure for table db_classroom.quotes_harian
CREATE TABLE IF NOT EXISTS `quotes_harian` (
  `id` int NOT NULL AUTO_INCREMENT,
  `isi_quote` text NOT NULL,
  `penulis` varchar(100) DEFAULT 'Anonim',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_classroom.quotes_harian: ~100 rows (approximately)
INSERT INTO `quotes_harian` (`id`, `isi_quote`, `penulis`, `created_at`) VALUES
	(1, 'Satu-satunya cara untuk melakukan pekerjaan hebat adalah dengan mencintai apa yang kamu lakukan.', 'Steve Jobs', '2026-06-01 13:32:36'),
	(2, 'Pendidikan adalah senjata paling mematikan di dunia, karena dengan pendidikan, Anda dapat mengubah dunia.', 'Nelson Mandela', '2026-06-01 13:32:36'),
	(3, 'Hidup itu seperti mengendarai sepeda. Untuk menjaga keseimbangan, Anda harus terus bergerak.', 'Albert Einstein', '2026-06-01 13:32:36'),
	(4, 'Jangan tanyakan apa yang negara ganti lakukan untuk Anda, tapi tanyakan apa yang dapat Anda lakukan untuk negara Anda.', 'John F. Kennedy', '2026-06-01 13:32:36'),
	(5, 'Usaha dan keberanian tidak cukup tanpa tujuan dan arah tindakan.', 'John F. Kennedy', '2026-06-01 13:32:36'),
	(6, 'Sukses bukanlah akhir, kegagalan bukanlah fatal: yang terpenting adalah keberanian untuk melanjutkan.', 'Winston Churchill', '2026-06-01 13:32:36'),
	(7, 'Banyak dari kegagalan hidup adalah orang-orang yang tidak menyadari seberapa dekat mereka dengan kesuksesan saat mereka menyerah.', 'Thomas A. Edison', '2026-06-01 13:32:36'),
	(8, 'Anda kehilangan 100% dari tembakan yang tidak pernah Anda ambil.', 'Wayne Gretzky', '2026-06-01 13:32:36'),
	(9, 'Masa depan adalah milik mereka yang percaya pada keindahan impian mereka.', 'Eleanor Roosevelt', '2026-06-01 13:32:36'),
	(10, 'Jangan biarkan hari kemarin menyita terlalu banyak hari ini.', 'Will Rogers', '2026-06-01 13:32:36'),
	(11, 'Kita belajar dari kegagalan, bukan dari kesuksesan.', 'Bram Stoker', '2026-06-01 13:32:36'),
	(12, 'Cara terbaik untuk memprediksi masa depan adalah dengan menciptakannya.', 'Peter Drucker', '2026-06-01 13:32:36'),
	(13, 'Kesuksesan biasanya datang kepada mereka yang terlalu sibuk untuk mencarinya.', 'Henry David Thoreau', '2026-06-01 13:32:36'),
	(14, 'Kegagalan adalah kesempatan untuk memulai kembali dengan lebih cerdas.', 'Henry Ford', '2026-06-01 13:32:36'),
	(15, 'Hambatan tidak bisa menghentikan Anda. Jika Anda menabrak dinding, jangan berbalik dan menyerah. Cari tahu cara memanjatnya.', 'Michael Jordan', '2026-06-01 13:32:36'),
	(16, 'Waktu Anda terbatas, jadi jangan sia-siakan dengan menjalani hidup orang lain.', 'Steve Jobs', '2026-06-01 13:32:36'),
	(17, 'Jangan takut melepaskan yang baik untuk mengejar yang terbaik.', 'John D. Rockefeller', '2026-06-01 13:32:36'),
	(18, 'Percayalah Anda bisa dan Anda sudah setengah jalan di sana.', 'Theodore Roosevelt', '2026-06-01 13:32:36'),
	(19, 'Satu-satunya batasan bagi pencapaian kita hari esok adalah keraguan kita hari ini.', 'Franklin D. Roosevelt', '2026-06-01 13:32:36'),
	(20, 'Kebaikan adalah bahasa yang bisa didengar oleh orang tuli dan dilihat oleh orang buta.', 'Mark Twain', '2026-06-01 13:32:36'),
	(21, 'Rahasia untuk maju adalah dengan memulai.', 'Mark Twain', '2026-06-01 13:32:36'),
	(22, 'Seseorang yang tidak pernah membuat kesalahan tidak pernah mencoba sesuatu yang baru.', 'Albert Einstein', '2026-06-01 13:32:36'),
	(23, 'Kebahagiaan bukanlah sesuatu yang sudah jadi. Itu berasal dari tindakan Anda sendiri.', 'Dalai Lama', '2026-06-01 13:32:36'),
	(24, 'Bukan masalah jika Anda berjalan lambat, asalkan Anda tidak berhenti.', 'Konfusius', '2026-06-01 13:32:36'),
	(25, 'Permata tidak bisa dipoles tanpa gesekan, demikian juga manusia tidak bisa sukses tanpa tantangan.', 'Konfusius', '2026-06-01 13:32:36'),
	(26, 'Semua impian kita bisa menjadi kenyataan jika kita memiliki keberanian untuk mengejarnya.', 'Walt Disney', '2026-06-01 13:32:36'),
	(27, 'Cara untuk memulai adalah berhenti berbicara dan mulai melakukan.', 'Walt Disney', '2026-06-01 13:32:36'),
	(28, 'Kecerdasan tanpa ambisi adalah burung tanpa sayap.', 'Salvador Dali', '2026-06-01 13:32:36'),
	(29, 'Satu-satunya kegagalan nyata dalam hidup adalah tidak belajar dari kegagalan itu sendiri.', 'Anthony Robbins', '2026-06-01 13:32:36'),
	(30, 'Berubahlah sebelum Anda dipaksa untuk berubah.', 'Jack Welch', '2026-06-01 13:32:36'),
	(31, 'Hanya saya yang bisa mengubah hidup saya. Tidak ada orang lain yang bisa melakukannya untuk saya.', 'Carol Burnett', '2026-06-01 13:32:36'),
	(32, 'Mengetahui diri sendiri adalah awal dari semua kebijaksanaan.', 'Aristoteles', '2026-06-01 13:32:36'),
	(33, 'Kita adalah apa yang kita lakukan berulang kali. Keunggulan, bukanlah sebuah tindakan, melainkan sebuah kebiasaan.', 'Aristoteles', '2026-06-01 13:32:36'),
	(34, 'Tindakan berbicara lebih keras daripada kata-kata.', 'Abraham Lincoln', '2026-06-01 13:32:36'),
	(35, 'Pada akhirnya, bukan tahun-tahun dalam hidupmu yang dihitung, melainkan kehidupan dalam tahun-mu itu.', 'Abraham Lincoln', '2026-06-01 13:32:36'),
	(36, 'Ubah pikiranmu dan kamu akan mengubah duniamu.', 'Norman Vincent Peale', '2026-06-01 13:32:36'),
	(37, 'Keberhasilan adalah kemampuan untuk melewati kegagalan demi kegagalan tanpa kehilangan antusiasme.', 'Winston Churchill', '2026-06-01 13:32:36'),
	(38, 'Mimpi tidak menjadi kenyataan melalui sihir; itu membutuhkan keringat, tekad, dan kerja keras.', 'Colin Powell', '2026-06-01 13:32:36'),
	(39, 'Tujuan hidup kita adalah menjadi bahagia.', 'Dalai Lama', '2026-06-01 13:32:36'),
	(40, 'Hidup adalah apa yang terjadi ketika Anda sibuk membuat rencana lain.', 'John Lennon', '2026-06-01 13:32:36'),
	(41, 'Jangan pernah menyesali sehari pun dalam hidupmu. Hari-hari baik memberimu kebahagiaan, hari-hari buruk memberimu pengalaman.', 'Anonim', '2026-06-01 13:32:36'),
	(42, 'Jangan melihat jam; lakukan apa yang dilakukannya. Teruslah berjalan.', 'Sam Levenson', '2026-06-01 13:32:36'),
	(43, 'Definisi kegilaan adalah melakukan hal yang sama berulang-ulang dan mengharapkan hasil yang berbeda.', 'Albert Einstein', '2026-06-01 13:32:36'),
	(44, 'Jika kamu tidak merancang rencana hidupmu sendiri, kemungkinan besar kamu akan jatuh ke dalam rencana orang lain.', 'Jim Rohn', '2026-06-01 13:32:36'),
	(45, 'Disiplin adalah jembatan antara tujuan dan pencapaian.', 'Jim Rohn', '2026-06-01 13:32:36'),
	(46, 'Keberuntungan adalah pertemuan antara persiapan dan kesempatan.', 'Seneca', '2026-06-01 13:32:36'),
	(47, 'Pikiran yang besar mendiskusikan ide; pikiran yang rata-rata mendiskusikan peristiwa; pikiran yang kecil mendiskusikan orang.', 'Eleanor Roosevelt', '2026-06-01 13:32:36'),
	(48, 'Balas dendam terbaik adalah kesuksesan yang masif.', 'Frank Sinatra', '2026-06-01 13:32:36'),
	(49, 'Kreativitas adalah kecerdasan yang bersenang-senang.', 'Albert Einstein', '2026-06-01 13:32:36'),
	(50, 'Kesulitan sebenarnya adalah peluang untuk menunjukkan kemampuan terbaik kita.', 'Duke Ellington', '2026-06-01 13:32:36'),
	(51, 'Bermimpilah setinggi langit. Jika kamu jatuh, kamu akan jatuh di antara bintang-bintang.', 'Ir. Soekarno', '2026-06-01 13:32:47'),
	(52, 'Bangsa yang besar adalah bangsa yang menghormati jasa pahlawannya.', 'Ir. Soekarno', '2026-06-01 13:32:47'),
	(53, 'Jangan melihat ke belakang dengan penyesalan, lihat ke depan dengan harapan.', 'Anonim', '2026-06-01 13:32:47'),
	(54, 'Gantungkan cita-citamu setinggi langit! Bermimpilah setinggi langit.', 'Ir. Soekarno', '2026-06-01 13:32:47'),
	(55, 'Orang awam hanya berpikir bagaimana cara menghabiskan waktu, orang pintar berpikir bagaimana cara menggunakannya.', 'Arthur Schopenhauer', '2026-06-01 13:32:47'),
	(56, 'Kesuksesan bukanlah kunci kebahagiaan. Kebahagiaanlah kunci kesuksesan.', 'Albert Schweitzer', '2026-06-01 13:32:47'),
	(57, 'Menghargai waktu adalah langkah awal menuju kesuksesan besar.', 'Anonim', '2026-06-01 13:32:47'),
	(58, 'Jangan biarkan opini orang lain menenggelamkan suara batin Anda sendiri.', 'Steve Jobs', '2026-06-01 13:32:47'),
	(59, 'Tetaplah lapar, tetaplah bodoh.', 'Steve Jobs', '2026-06-01 13:32:47'),
	(60, 'Jika kamu ingin hidup bahagia, ikatkan itu pada tujuan, bukan pada orang atau benda.', 'Albert Einstein', '2026-06-01 13:32:47'),
	(61, 'Ilmu tanpa agama adalah lumpuh, agama tanpa ilmu adalah buta.', 'Albert Einstein', '2026-06-01 13:32:47'),
	(62, 'Belajar dari masa lalu, hidup untuk masa depan, berharap untuk hari ini.', 'Anonim', '2026-06-01 13:32:47'),
	(63, 'Tidak ada jalan pintas ke tempat mana pun yang layak dituju.', 'Beverly Sills', '2026-06-01 13:32:47'),
	(64, 'Kesalahan terbesar yang bisa dibuat seseorang adalah takut membuat kesalahan.', 'Elbert Hubbard', '2026-06-01 13:32:47'),
	(65, 'Fokuslah pada tempat yang ingin Anda tuju, bukan pada apa yang Anda takuti.', 'Anthony Robbins', '2026-06-01 13:32:47'),
	(66, 'Kekuatan tidak datang dari kapasitas fisik. Ia datang dari kemauan yang gigih.', 'Mahatma Gandhi', '2026-06-01 13:32:47'),
	(67, 'Hiduplah seolah-olah kamu akan mati besok. Belajarlah seolah-olah kamu akan hidup selamanya.', 'Mahatma Gandhi', '2026-06-01 13:32:47'),
	(68, 'Jadilah perubahan yang ingin kamu lihat di dunia ini.', 'Mahatma Gandhi', '2026-06-01 13:32:47'),
	(69, 'Investasi dalam pengetahuan menghasilkan bunga terbaik.', 'Benjamin Franklin', '2026-06-01 13:32:47'),
	(70, 'Kamu tidak akan pernah menang jika kamu tidak pernah memulai.', 'Helen Gahagan Douglas', '2026-06-01 13:32:47'),
	(71, 'Optimisme adalah kepercayaan yang mengarah pada pencapaian.', 'Helen Keller', '2026-06-01 13:32:47'),
	(72, 'Hanya ada satu hal yang membuat impian mustahil dicapai: ketakutan akan kegagalan.', 'Paulo Coelho', '2026-06-01 13:32:47'),
	(73, 'Ketika Anda menginginkan sesuatu, seluruh alam semesta bersatu padu untuk membantu Anda mencapainya.', 'Paulo Coelho', '2026-06-01 13:32:47'),
	(74, 'Bakat memenangkan pertandingan, tetapi kerja tim dan kecerdasan memenangkan kejuaraan.', 'Michael Jordan', '2026-06-01 13:32:47'),
	(75, 'Tantangan membuat hidup menarik dan mengatasinya membuat hidup bermakna.', 'Joshua J. Marine', '2026-06-01 13:32:47'),
	(76, 'Ingatlah bahwa tidak mendapatkan apa yang Anda inginkan terkadang merupakan keberuntungan yang luar biasa.', 'Dalai Lama', '2026-06-01 13:32:47'),
	(77, 'Jangan bandingkan prosesmu dengan proses orang lain. Semua buah matang pada musimnya masing-masing.', 'Anonim', '2026-06-01 13:32:47'),
	(78, 'Setiap seniman awalnya adalah seorang amatir.', 'Ralph Waldo Emerson', '2026-06-01 13:32:47'),
	(79, 'Satu-satunya tempat di mana kesuksesan datang sebelum kerja adalah di kamus.', 'Vidal Sassoon', '2026-06-01 13:32:47'),
	(80, 'Kesuksesan adalah kumpulan dari upaya-upaya kecil yang diulangi hari demi hari.', 'Robert Collier', '2026-06-01 13:32:47'),
	(81, 'Jangan menunggu kesempatan datang. Ciptakan kesempatan itu.', 'Anonim', '2026-06-01 13:32:47'),
	(82, 'Batasanmu hanyalah imajinasimu sendiri.', 'Anonim', '2026-06-01 13:32:47'),
	(83, 'Dorong dirimu sendiri, karena tidak ada orang lain yang akan melakukannya untukmu.', 'Anonim', '2026-06-01 13:32:47'),
	(84, 'Terkadang nanti bisa menjadi tidak pernah. Lakukan sekarang.', 'Anonim', '2026-06-01 13:32:47'),
	(85, 'Hal-hal besar tidak pernah datang dari zona nyaman.', 'Anonim', '2026-06-01 13:32:47'),
	(86, 'Bermimpilah, lalu eksekusi.', 'Anonim', '2026-06-01 13:32:47'),
	(87, 'Jangan berhenti ketika kamu lelah. Berhentilah ketika kamu selesai.', 'Anonim', '2026-06-01 13:32:47'),
	(88, 'Bangun dengan tekad, tidur dengan kepuasan.', 'Anonim', '2026-06-01 13:32:47'),
	(89, 'Lakukan sesuatu hari ini yang akan membuat dirimu di masa depan berterima kasih.', 'Anonim', '2026-06-01 13:32:47'),
	(90, 'Sedikit kemajuan setiap hari menambah hasil yang besar.', 'Anonim', '2026-06-01 13:32:47'),
	(91, 'Ini akan sulit, tetapi sulit bukan berarti tidak mungkin.', 'Anonim', '2026-06-01 13:32:47'),
	(92, 'Jangan batasi tantanganmu. Tantang batasanmu.', 'Anonim', '2026-06-01 13:32:47'),
	(93, 'Kamu tidak perlu menjadi hebat untuk memulai, tetapi kamu harus memulai untuk menjadi hebat.', 'Zig Ziglar', '2026-06-01 13:32:47'),
	(94, 'Tidak ada yang akan berhasil kecuali Anda melakukannya.', 'Maya Angelou', '2026-06-01 13:32:47'),
	(95, 'Kunci sukses adalah memfokuskan pikiran sadar kita pada hal-hal yang kita inginkan, bukan hal-hal yang kita takuti.', 'Brian Tracy', '2026-06-01 13:32:47'),
	(96, 'Kritik adalah sesuatu yang dapat kita hindari dengan mudah dengan tidak mengatakan apa-apa, tidak melakukan apa-apa, dan tidak menjadi apa-apa.', 'Aristoteles', '2026-06-01 13:32:47'),
	(97, 'Percayalah pada dirimu sendiri dan semua yang kamu miliki. Ketahuilah bahwa ada sesuatu di dalam dirimu yang lebih besar dari rintangan apa pun.', 'Christian D. Larson', '2026-06-01 13:32:47'),
	(98, 'Dunia ini penuh dengan orang-orang baik. Jika kamu tidak dapat menemukannya, jadilah salah satunya.', 'Nishan Panwar', '2026-06-01 13:32:47'),
	(99, 'Kebahagiaan adalah ketika apa yang Anda pikirkan, apa yang Anda katakan, dan apa yang Anda lakukan berada dalam keharmonisan.', 'Mahatma Gandhi', '2026-06-01 13:32:47'),
	(100, 'Hari esok adalah halaman kosong pertama dari buku setebal 365 halaman. Tulislah halaman yang bagus.', 'Brad Paisley', '2026-06-01 13:32:47');

-- Dumping structure for table db_classroom.siswa
CREATE TABLE IF NOT EXISTS `siswa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `kelas` varchar(100) NOT NULL,
  `login` tinyint DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_classroom.siswa: ~35 rows (approximately)
INSERT INTO `siswa` (`id`, `nama`, `kelas`, `login`) VALUES
	(1, 'ADITYA HABIB', 'XI-RPL-2', 0),
	(2, 'AHMAD ZANKI ISTHABARA', 'XI-RPL-2', 0),
	(3, 'AMELIA SUKMA SIANIPAR', 'XI-RPL-2', 0),
	(4, 'ANDINI DESTI YANTI', 'XI-RPL-2', 0),
	(5, 'ANGGA KLOSE', 'XI-RPL-2', 0),
	(6, 'ASYIFA AZZAHRA', 'XI-RPL-2', 0),
	(7, 'CAESAR PRATAMA HUTAJALU', 'XI-RPL-2', 0),
	(8, 'DAVI ARIFIN', 'XI-RPL-2', 0),
	(9, 'DINDA MAYANG SARI BR MELIALA', 'XI-RPL-2', 0),
	(10, 'ELISYA NAIRA', 'XI-RPL-2', 0),
	(11, 'ERES FRAN SETIA SIMBOLON', 'XI-RPL-2', 0),
	(12, 'FIOLA AMANDA', 'XI-RPL-2', 0),
	(13, 'HERNANDO PARDEDE', 'XI-RPL-2', 0),
	(14, 'HUBERT ANJU YEHEZKIEL SILITONGA', 'XI-RPL-2', 0),
	(15, 'JERIKO ABED NEGO NAPITUPULU', 'XI-RPL-2', 0),
	(16, 'JESIKA ALOYA SIHOMBING', 'XI-RPL-2', 0),
	(17, 'JIHAN KHAIRANI', 'XI-RPL-2', 0),
	(18, 'JOLI IRAWAN ZAI', 'XI-RPL-2', 0),
	(19, 'JOSIA ARGA LUMBAN TOBING', 'XI-RPL-2', 0),
	(20, 'MARCELLINO FEBRIAN HUTABARAT', 'XI-RPL-2', 0),
	(21, 'MARVIN ELDON SYAHBANA', 'XI-RPL-2', 0),
	(22, 'MIA SANTIKA SARI', 'XI-RPL-2', 0),
	(23, 'MUHAMMAD RADITYA ATHA ZAHRAN', 'XI-RPL-2', 0),
	(24, 'PARTOGI IMMANUEL SIANTURI', 'XI-RPL-2', 0),
	(25, 'RENO WINATA', 'XI-RPL-2', 0),
	(26, 'REYMOND LEONARD', 'XI-RPL-2', 0),
	(27, 'REYNA KASIH', 'XI-RPL-2', 0),
	(28, 'RUDOLV JECONIAH SILITONGA', 'XI-RPL-2', 0),
	(29, 'SATYA DHARMA SAHRONI SIMARMATA', 'XI-RPL-2', 0),
	(30, 'STEVEN LUCAS FELIANSEN PANJAITAN', 'XI-RPL-2', 0),
	(31, 'TALITHA SYAKIRAH ANNAYA RIYADI', 'XI-RPL-2', 0),
	(32, 'WEDDFRI ZAPAN HUT SIMANJUNTAK', 'XI-RPL-2', 0),
	(33, 'ZAHARATU SYIFA MATONDANG', 'XI-RPL-2', 0),
	(34, 'ZEVANYA NADYA LUMBANGAOL', 'XI-RPL-2', 0),
	(35, 'ZUHAIRI ZUHDI', 'XI-RPL-2', 0);

-- Dumping structure for table db_classroom.tantangan_harian
CREATE TABLE IF NOT EXISTS `tantangan_harian` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pertanyaan` text COLLATE utf8mb4_general_ci NOT NULL,
  `jawaban_benar` enum('BENAR','SALAH') COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table db_classroom.tantangan_harian: ~50 rows (approximately)
INSERT INTO `tantangan_harian` (`id`, `pertanyaan`, `jawaban_benar`) VALUES
	(1, 'Lagu kebangsaan Indonesia Raya diciptakan oleh W.R. Soepratman.', 'BENAR'),
	(2, 'Benua terbesar di dunia berdasarkan luas wilayahnya adalah Benua Afrika.', 'SALAH'),
	(3, 'Sudut siku-siku memiliki besar sudut tepat 90 derajat.', 'BENAR'),
	(4, 'Mamalia darat terbesar di dunia yang masih hidup saat ini adalah gajah asia.', 'SALAH'),
	(5, 'Oksigen adalah unsur gas yang paling melimpah di atmosfer bumi.', 'SALAH'),
	(6, 'Negara Swiss terkenal karena tidak memiliki wilayah laut sama sekali (landlocked).', 'BENAR'),
	(7, 'Planet terdekat dari matahari di tata surya kita adalah Venus.', 'SALAH'),
	(8, 'Vitamin C adalah jenis vitamin yang larut dalam air, bukan dalam lemak.', 'BENAR'),
	(9, 'Mata uang resmi negara Jepang adalah Yuan.', 'SALAH'),
	(10, 'Suku asli yang mendiami benua Australia adalah suku Aborigin.', 'BENAR'),
	(11, 'Gunung tertinggi di dunia adalah Gunung Everest yang terletak di pegunungan Himalaya.', 'BENAR'),
	(12, 'Manusia bernapas mengeluarkan gas oksigen dan menghirup karbon dioksida.', 'SALAH'),
	(13, 'Penemu lampu pijar yang paling terkenal dalam sejarah adalah Thomas Alva Edison.', 'BENAR'),
	(14, 'Samudra terluas di dunia adalah Samudra Atlantik.', 'SALAH'),
	(15, 'Ibu kota dari negara Australia adalah Sydney.', 'SALAH'),
	(16, 'Hewan mamalia bertelur satu-satunya di dunia adalah platypus dan echidna.', 'BENAR'),
	(17, 'Kupu-kupu mengalami metamorfosis sempurna dalam siklus hidupnya.', 'BENAR'),
	(18, 'Air memiliki rumus kimia H2O yang berarti terdiri dari 2 atom Hidrogen dan 1 atom Oksigen.', 'BENAR'),
	(19, 'Negara dengan jumlah penduduk terbanyak di dunia saat ini adalah Vatikan.', 'SALAH'),
	(20, 'Patung Sphinx yang terkenal di Mesir memiliki tubuh singka dan kepala manusia.', 'BENAR'),
	(21, 'Planet Mars sering disebut sebagai Planet Merah karena kandungan besi oksida di permukaannya.', 'BENAR'),
	(22, 'Candi Borobudur adalah candi Hindu terbesar yang terletak di Jawa Tengah.', 'SALAH'),
	(23, 'Satu abad sama dengan jangka waktu selama 1000 tahun.', 'SALAH'),
	(24, 'Pengarah kompas selalu menunjuk ke arah utara karena pengaruh medan magnet bumi.', 'BENAR'),
	(25, 'Kaktus adalah tumbuhan yang daunnya bermutasi menjadi duri untuk mengurangi penguapan air.', 'BENAR'),
	(26, 'Lambang negara Indonesia adalah burung Garuda dengan perisai di dadanya.', 'BENAR'),
	(27, 'Hewan yang bisa hidup di dua alam (darat dan air) disebut sebagai hewan reptil.', 'SALAH'),
	(28, 'Negara penghasil kopi terbesar di dunia secara global adalah Brazil.', 'BENAR'),
	(29, 'Garis khatulistiwa adalah garis khayal yang membelah bumi menjadi kutub utara dan selatan.', 'SALAH'),
	(30, 'Sel darah merah berfungsi untuk mengangkut oksigen ke seluruh tubuh manusia.', 'BENAR'),
	(31, 'Benua Antartika adalah wilayah gurun terluas dan terdingin di dunia.', 'BENAR'),
	(32, 'Menara Pisa yang miring terletak di negara Prancis.', 'SALAH'),
	(33, 'Bunyi merambat lebih cepat di dalam air dibandingkan di udara bebas.', 'BENAR'),
	(34, 'Pengarah arus listrik searah dikenal dengan istilah AC (Alternating Current).', 'SALAH'),
	(35, 'Bunglon mengubah warna kulitnya terutama untuk berkomunikasi dan mengatur suhu tubuh.', 'BENAR'),
	(36, 'Novel terkenal "Laskar Pelangi" adalah karya tulis dari Andrea Hirata.', 'BENAR'),
	(37, 'Logam cair yang sering digunakan di dalam termometer konvensional adalah raksa.', 'BENAR'),
	(38, 'Pulau terbesar di wilayah Indonesia adalah Pulau Jawa.', 'SALAH'),
	(39, 'Satu-satunya satelit alami yang dimiliki oleh planet Bumi adalah Bulan.', 'BENAR'),
	(40, 'Penyakit malaria ditularkan melalui gigitan nyamuk Aedes aegypti.', 'SALAH'),
	(41, 'Albert Einstein adalah ilmuwan fisikawan yang mengemukakan Teori Relativitas.', 'BENAR'),
	(42, 'Sungai terpanjang di dunia yang mengalir di benua Afrika adalah Sungai Amazon.', 'SALAH'),
	(43, 'Hewan omnivora adalah kelompok hewan yang hanya memakan daging hewan lain.', 'SALAH'),
	(44, 'Sila pertama dari dasar negara Pancasila berbunyi Ketuhanan Yang Maha Esa.', 'BENAR'),
	(45, 'Intan atau berlian merupakan material alami yang paling keras di bumi.', 'BENAR'),
	(46, 'Negara Thailand adalah satu-satunya negara di Asia Tenggara yang tidak pernah dijajah Eropa.', 'BENAR'),
	(47, 'Jumlah susunan tulang rusuk yang dimiliki manusia normal adalah 20 pasang.', 'SALAH'),
	(48, 'Paus biru adalah hewan terbesar yang pernah diketahui hidup di planet bumi.', 'BENAR'),
	(49, 'Krypton adalah nama planet nyata yang berada di dalam tata surya kita.', 'SALAH'),
	(50, 'Garam dapur yang sering kita gunakan sehari-hari memiliki nama kimia Natrium Klorida.', 'BENAR');

-- Dumping structure for table db_classroom.tugas
CREATE TABLE IF NOT EXISTS `tugas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_mapel` int NOT NULL,
  `judul` varchar(255) NOT NULL,
  `deskripsi` text,
  `tenggat_waktu` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_mapel` (`id_mapel`),
  CONSTRAINT `tugas_ibfk_1` FOREIGN KEY (`id_mapel`) REFERENCES `mapel` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table db_classroom.tugas: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
