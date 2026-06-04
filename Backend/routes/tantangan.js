const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.get("/hari-ini/:id_siswa", async (req, res) => {
  const { id_siswa } = req.params;

  if (!id_siswa || id_siswa === "Tidak Terdeteksi") {
    return res.status(400).json({
      success: false,
      message: "ID Siswa tidak valid atau tidak terdeteksi di session",
    });
  }

  try {
    const [tantanganResult] = await db.execute(
      `SELECT id, pertanyaan
       FROM tantangan_harian
       ORDER BY RAND(CAST(CURDATE() AS UNSIGNED))
       LIMIT 1`,
    );

    if (tantanganResult.length === 0) {
      return res.status(200).json({
        success: true,
        sudah_mengerjakan: false,
        data: {
          id: 0,
          pertanyaan:
            "Belum ada tantangan yang tersedia untuk hari ini. Tetap semangat!",
        },
      });
    }

    const tantanganHariIni = tantanganResult[0];
    const [cekRiwayat] = await db.execute(
      `SELECT jawaban_siswa, status_jawaban
       FROM pengumpulan_tantangan
       WHERE id_siswa = ? AND tanggal_isi = CURDATE()
       LIMIT 1`,
      [id_siswa],
    );

    if (cekRiwayat.length > 0) {
      return res.status(200).json({
        success: true,
        sudah_mengerjakan: true,
        riwayat: cekRiwayat[0],
        message: "Kamu sudah menyelesaikan tantangan hari ini!",
      });
    }

    res.status(200).json({
      success: true,
      sudah_mengerjakan: false,
      data: tantanganHariIni,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memproses data tantangan harian: " + error.message,
    });
  }
});

router.post("/submit", async (req, res) => {
  const { id_siswa, id_tantangan, jawaban_siswa } = req.body;

  if (!id_siswa || !id_tantangan || !jawaban_siswa) {
    return res.status(400).json({
      success: false,
      message:
        "Payload tidak lengkap (id_siswa, id_tantangan, dan jawaban_siswa wajib diisi)",
    });
  }

  if (jawaban_siswa !== "BENAR" && jawaban_siswa !== "SALAH") {
    return res.status(400).json({
      success: false,
      message:
        "Format jawaban tidak valid (Harus berupa string 'BENAR' atau 'SALAH')",
    });
  }

  try {
    const [cekDuplikat] = await db.execute(
      `SELECT id
       FROM pengumpulan_tantangan
       WHERE id_siswa = ? AND tanggal_isi = CURDATE()`,
      [id_siswa],
    );

    if (cekDuplikat.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Akses ditolak! Anda terdeteksi sudah menjawab tantangan hari ini.",
      });
    }

    const [tantangan] = await db.execute(
      "SELECT jawaban_benar FROM tantangan_harian WHERE id = ? LIMIT 1",
      [id_tantangan],
    );

    if (tantangan.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ID tantangan tidak ditemukan di database server",
      });
    }

    const kunciJawaban = tantangan[0].jawaban_benar;
    const statusJawaban = jawaban_siswa === kunciJawaban ? "TEPAT" : "SALAH";

    await db.execute(
      `INSERT INTO pengumpulan_tantangan
       (id_siswa, id_tantangan, jawaban_siswa, status_jawaban, tanggal_isi)
       VALUES (?, ?, ?, ?, CURDATE())`,
      [id_siswa, id_tantangan, jawaban_siswa, statusJawaban],
    );

    res.status(200).json({
      success: true,
      status_jawaban: statusJawaban,
      message:
        statusJawaban === "TEPAT"
          ? "Jawabanmu BENAR! Pertahankan performa belajarmu!"
          : "Jawabanmu SALAH! Jangan berkecil hati, asah lagi kemampuanmu esok hari!",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Anda sudah mengirimkan jawaban untuk hari ini!",
      });
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kegagalan internal pada server: " + error.message,
    });
  }
});

router.get("/leaderboard", async (req, res) => {
  try {
    const query = `
      SELECT
        s.nama,
        s.kelas,
        COUNT(p.id) as total_tepat,
        MIN(p.waktu_submit) as waktu_awal
      FROM siswa s
      LEFT JOIN pengumpulan_tantangan p
        ON s.id = p.id_siswa AND p.status_jawaban = 'TEPAT'
      GROUP BY s.id, s.nama, s.kelas
      ORDER BY total_tepat DESC, waktu_awal ASC
      LIMIT 5
    `;

    const [rankingResult] = await db.execute(query);

    res.status(200).json({
      success: true,
      data: rankingResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memproses data papan peringkat: " + error.message,
    });
  }
});

module.exports = router;
