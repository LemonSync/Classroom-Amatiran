const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.post("/buat", async (req, res) => {
  const { id_mapel, judul, deskripsi, tenggat_waktu } = req.body;

  if (!id_mapel || !judul || !tenggat_waktu) {
    return res.status(400).json({
      success: false,
      message: "Data tugas (mapel, judul, tenggat) wajib diisi",
    });
  }

  try {
    const [cekMapel] = await db.execute(
      "SELECT id FROM mapel WHERE id = ? LIMIT 1",
      [id_mapel],
    );
    if (cekMapel.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Mata pelajaran tidak ditemukan",
      });
    }

    await db.execute(
      "INSERT INTO tugas (id_mapel, judul, deskripsi, tenggat_waktu) VALUES (?, ?, ?, ?)",
      [id_mapel, judul, deskripsi || null, tenggat_waktu],
    );

    res.status(200).json({
      success: true,
      message: "Tugas baru berhasil diterbitkan!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/detail/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [detailTugas] = await db.execute(
      `SELECT
        t.id AS id_tugas,
        t.judul,
        t.deskripsi,
        t.tenggat_waktu,
        m.nama_mapel
       FROM tugas t
       JOIN mapel m ON t.id_mapel = m.id
       WHERE t.id = ?
       LIMIT 1`,
      [id],
    );

    if (detailTugas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tugas tidak ditemukan di server",
      });
    }

    res.status(200).json({
      success: true,
      data: detailTugas[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/kelas/:nama_kelas", async (req, res) => {
  const { nama_kelas } = req.params;
  const { id_siswa } = req.query;

  if (!id_siswa) {
    return res.status(400).json({
      success: false,
      message: "Parameter id_siswa wajib dikirim untuk memeriksa status tugas",
    });
  }

  try {
    const [daftarTugas] = await db.execute(
      `SELECT
        t.id AS id_tugas,
        t.judul,
        t.deskripsi,
        t.tenggat_waktu,
        t.created_at,
        m.nama_mapel,
        g.nama AS nama_guru,
        p.id AS id_pengumpulan,
        p.status_terlambat,
        -- Logika penentuan status langsung dari kombinasi database & waktu server runtime
        CASE
          WHEN p.id IS NOT NULL AND p.status_terlambat = 0 THEN 'SELESAI'
          WHEN p.id IS NOT NULL AND p.status_terlambat = 1 THEN 'TERLAMBAT'
          WHEN p.id IS NULL AND NOW() > t.tenggat_waktu THEN 'TERLAMBAT'
          ELSE 'BELUM'
        END AS status_tugas
       FROM tugas t
       JOIN mapel m ON t.id_mapel = m.id
       JOIN guru g ON m.id_guru = g.id
       -- Ambil data pengumpulan khusus untuk siswa yang merequest
       LEFT JOIN pengumpulan p ON t.id = p.id_tugas AND p.id_siswa = ?
       WHERE m.kelas = ?
       ORDER BY t.tenggat_waktu ASC`,
      [id_siswa, nama_kelas.toUpperCase()],
    );

    res.status(200).json({
      success: true,
      data: daftarTugas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/mapel/:id_mapel", async (req, res) => {
  const { id_mapel } = req.params;

  try {
    const [tugasMapel] = await db.execute(
      `SELECT
     t.id AS id_tugas,
     t.judul,
     t.deskripsi,
     t.tenggat_waktu,
     m.nama_mapel,
     m.kelas,
     g.nama AS nama_guru
   FROM tugas t
   JOIN mapel m ON t.id_mapel = m.id
   JOIN guru g ON m.id_guru = g.id
   WHERE t.id_mapel = ?
   ORDER BY t.id DESC`,
      [id_mapel],
    );

    res.status(200).json({
      success: true,
      data: tugasMapel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/hapus/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [cekTugas] = await db.execute(
      "SELECT id FROM tugas WHERE id = ? LIMIT 1",
      [id],
    );

    if (cekTugas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tugas tidak ditemukan atau sudah dihapus dari server",
      });
    }

    await db.execute("DELETE FROM tugas WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: "Tugas berhasil dihapus dari sistem",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus tugas: " + error.message,
    });
  }
});

module.exports = router;
