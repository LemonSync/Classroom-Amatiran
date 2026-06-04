const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const multer = require("multer");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "PERINGATAN: Kredensial SUPABASE_URL atau SUPABASE_ANON_KEY belum diatur di file .env!",
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Format dokumen tidak valid, harus berupa file PDF!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post("/submit", upload.single("pdf_tugas"), async (req, res) => {
  const { id_tugas, id_siswa } = req.body;

  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "File PDF tugas wajib dilampirkan" });
  }
  if (!id_tugas || !id_siswa) {
    return res.status(400).json({
      success: false,
      message: "Parameter id_tugas dan id_siswa wajib dikirim",
    });
  }

  try {
    const [tugas] = await db.execute(
      "SELECT tenggat_waktu FROM tugas WHERE id = ? LIMIT 1",
      [id_tugas],
    );

    if (tugas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tugas tidak ditemukan atau telah dihapus",
      });
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const namaFilePdf = `tugas-${uniqueSuffix}.pdf`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("tugas-siswa")
      .upload(namaFilePdf, req.file.buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw new Error(
        `Gagal mengunggah file ke Supabase Storage: ${uploadError.message}`,
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("tugas-siswa").getPublicUrl(namaFilePdf);

    const deadlineTimestamp = new Date(tugas[0].tenggat_waktu).getTime();
    const waktuSekarangTimestamp = Date.now();

    let statusTerlambat = 0;
    if (waktuSekarangTimestamp > deadlineTimestamp) {
      statusTerlambat = 1;
    }

    const waktuSubmitObjek = new Date(waktuSekarangTimestamp);

    await db.execute(
      "INSERT INTO pengumpulan (id_tugas, id_siswa, file_atau_teks, status_terlambat, waktu_submit) VALUES (?, ?, ?, ?, ?)",
      [id_tugas, id_siswa, publicUrl, statusTerlambat, waktuSubmitObjek],
    );

    if (statusTerlambat === 1) {
      return res.status(200).json({
        success: true,
        terlambat: true,
        message:
          "Kamu terlambat mengumpulkan tugas! File PDF tetap tersimpan di cloud dengan catatan.",
      });
    }

    res.status(200).json({
      success: true,
      terlambat: false,
      message: "Berhasil mengumpulkan file PDF tugas tepat waktu!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/tugas/:id_tugas/siswa/:id_siswa", async (req, res) => {
  const { id_tugas, id_siswa } = req.params;

  try {
    const [cekSubmit] = await db.execute(
      `SELECT id AS id_pengumpulan, file_atau_teks, waktu_submit, status_terlambat
       FROM pengumpulan
       WHERE id_tugas = ? AND id_siswa = ?
       LIMIT 1`,
      [id_tugas, id_siswa],
    );

    if (cekSubmit.length === 0) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: cekSubmit[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/tugas/:id_tugas", async (req, res) => {
  const { id_tugas } = req.params;

  try {
    const [daftarPengumpulan] = await db.execute(
      `SELECT
        p.id AS id_pengumpulan,
        p.file_atau_teks,
        p.waktu_submit,
        p.status_terlambat,
        s.nama AS nama_siswa,
        s.kelas
       FROM pengumpulan p
       JOIN siswa s ON p.id_siswa = s.id
       WHERE p.id_tugas = ?
       ORDER BY p.waktu_submit DESC`,
      [id_tugas],
    );

    res.status(200).json({ success: true, data: daftarPengumpulan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
