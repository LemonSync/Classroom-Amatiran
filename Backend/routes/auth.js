const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { Lemon } = require("../utils/allFunction");

router.post("/daftar", async (req, res) => {
  const { nama, kelas, email, password, role } = req.body;
  if (!nama || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Masukkan nama, email, password, dan role" });
  }
  if (!email.includes("@")) {
    return res
      .status(400)
      .json({ message: "Harap masukkan format email yang tepat" });
  }

  try {
    if (role === "guru") {
      const guruAvailable = await Lemon.cekGuru(nama);
      if (!guruAvailable.success) {
        return res
          .status(404)
          .json({ message: "Nama guru tidak terdaftar di sistem sekolah" });
      }

      const [result] = await db.execute(
        "SELECT id FROM guru WHERE nama LIKE ?",
        ["%" + nama + "%"],
      );
      const id_guru = result[0].id;

      const akunAvailable = await Lemon.cekAkun(id_guru, "guru");
      if (akunAvailable.success) {
        return res
          .status(400)
          .json({ message: "Terdapat akun lain atas nama guru tersebut" });
      }

      await db.execute(
        "INSERT INTO akun (id_guru, email, password, role) VALUES (?, ?, ?, 'guru')",
        [id_guru, email, password],
      );
    } else if (role === "siswa") {
      if (!kelas) {
        return res
          .status(400)
          .json({ message: "Siswa wajib menyertakan kelas" });
      }

      const siswaAvailable = await Lemon.cekAll(nama, kelas);
      if (!siswaAvailable.success) {
        return res.status(400).json({ message: siswaAvailable.message });
      }

      const [result] = await db.execute(
        "SELECT id FROM siswa WHERE nama LIKE ? AND kelas = ?",
        ["%" + nama + "%", kelas],
      );
      const id_siswa = result[0].id;

      const akunAvailable = await Lemon.cekAkun(id_siswa, "siswa");
      if (akunAvailable.success) {
        return res
          .status(400)
          .json({ message: "Terdapat akun lain atas nama siswa tersebut" });
      }

      await db.execute(
        "INSERT INTO akun (id_siswa, email, password, role) VALUES (?, ?, ?, 'siswa')",
        [id_siswa, email, password],
      );
    } else {
      return res
        .status(400)
        .json({ message: "Role tidak valid (Harus 'guru' atau 'siswa')" });
    }

    res
      .status(200)
      .json({ success: true, message: "Berhasil menambahkan akun" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/login", async (req, res) => {
  const { email, password } = req.query;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Harap masukkan email dan password" });
  }
  if (!email.includes("@")) {
    return res
      .status(400)
      .json({ message: "Harap masukkan format email yang tepat" });
  }

  const auth = await Lemon.authLogin(email, password);
  if (!auth.success) {
    return res.status(401).json({ message: auth.message });
  }

  res.status(200).json({
    success: true,
    id: auth.id,
    role: auth.role,
    nama: auth.nama,
    kelas: auth.kelas,
    password: password,
  });
});

router.get("/logout", async (req, res) => {
  const { id, role, email, password, method } = req.query;

  if (!method) {
    return res
      .status(400)
      .json({ success: false, message: "Method tidak valid" });
  }

  if (method == "normal") {
    if (!id || !role) {
      return res
        .status(400)
        .json({ success: false, message: "ID dan Role tidak valid" });
    }

    try {
      const remove = await Lemon.removeLogin(id, role);
      if (!remove.success) {
        return res
          .status(400)
          .json({ success: false, message: remove.message });
      }
      res
        .status(200)
        .json({ success: true, message: "Sukses menglogoutkan akun" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else if (method == "paksa") {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Kredensial email & password tidak lengkap",
      });
    }

    try {
      const forceRemove = await Lemon.removeLoginPaksa(email, password);
      if (!forceRemove.success) {
        return res
          .status(400)
          .json({ success: false, message: forceRemove.message });
      }

      res.status(200).json({
        success: true,
        message:
          "Sesi perangkat lain berhasil dikeluarkan! Silakan klik tombol Masuk kembali.",
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

module.exports = router;
