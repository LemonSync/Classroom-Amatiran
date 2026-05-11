const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { Lemon } = require("../utils/allFunction");

router.post("/", async (req, res) => {
  const { nama, kelas, email, password } = req.body;
  if (!nama || !kelas || !email || !password)
    return res
      .status(401)
      .json({ message: "Masukkan nama, kelas, email, password" });
  if (!email.includes("@"))
    return res
      .status(401)
      .json({ message: "Harap masukkan format email yang tepat" });
  const siswaAvailable = await Lemon.cekAll(nama, kelas);
  if (!siswaAvailable.success)
    return res.status(401).json({ message: siswaAvailable.message });

  try {
    const [result] = await db.execute(
      "SELECT id FROM siswa WHERE nama LIKE ?",
      ["%" + nama + "%"],
    );
    if (result.length === 0)
      return res.status(400).json({ message: "Nama siswa tidak ditemukan" });

    const id_user = result[0].id;
    const akunAvailable = await Lemon.cekAkun(id_user);
    if (akunAvailable.success)
      return res
        .status(401)
        .json({ message: "Terdapat akun lain atas nama siswa tersebut" });

    const [final] = await db.execute(
      "INSERT INTO akun (id_siswa, email, password) VALUES (?, ?, ?)",
      [id_user, email, password],
    );
    res.status(200).json({ success: true, message: "Berhasil menambahkan akun" });
  } catch (error) {
    res.status(500).json(error.message);
  }
});

module.exports = router;
