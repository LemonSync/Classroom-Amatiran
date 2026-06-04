const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.post("/buat", async (req, res) => {
  const { nama_mapel, id_guru, kelas } = req.body;

  if (!nama_mapel || !id_guru || !kelas) {
    return res.status(400).json({
      success: false,
      message: "Data mata pelajaran belum lengkap",
    });
  }

  try {
    const [cekGuru] = await db.execute(
      "SELECT id FROM guru WHERE id = ? LIMIT 1",
      [id_guru],
    );
    if (cekGuru.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data guru tidak ditemukan di sistem sekolah",
      });
    }

    await db.execute(
      "INSERT INTO mapel (nama_mapel, id_guru, kelas) VALUES (?, ?, ?)",
      [nama_mapel, id_guru, kelas.toUpperCase()],
    );

    res.status(200).json({
      success: true,
      message: "Mata pelajaran baru berhasil diterbitkan",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/guru/:id_guru", async (req, res) => {
  const { id_guru } = req.params;

  try {
    const [daftarMapelGuru] = await db.execute(
      "SELECT id, nama_mapel, kelas FROM mapel WHERE id_guru = ? ORDER BY id DESC",
      [id_guru],
    );

    res.status(200).json({
      success: true,
      data: daftarMapelGuru,
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

  try {
    const [daftarMapel] = await db.execute(
      `SELECT m.id AS id_mapel, m.nama_mapel, m.kelas, g.nama AS nama_guru
       FROM mapel m
       JOIN guru g ON m.id_guru = g.id
       WHERE m.kelas = ?
       ORDER BY m.id DESC`,
      [nama_kelas.toUpperCase()],
    );

    res.status(200).json({
      success: true,
      data: daftarMapel,
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
    const [result] = await db.execute("DELETE FROM mapel WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Mata pelajaran tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Mata pelajaran berhasil dihapus dari sistem",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus mata pelajaran: " + error.message,
    });
  }
});

module.exports = router;
