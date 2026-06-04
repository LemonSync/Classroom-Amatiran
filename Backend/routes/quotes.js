const express = require("express");
const router = express.Router();
const db = require("../db/connection");

router.get("/hari-ini", async (req, res) => {
  try {
    const query = `
      SELECT id, isi_quote, penulis AS nama_guru
      FROM quotes_harian
      ORDER BY RAND(CAST(CURDATE() AS UNSIGNED))
      LIMIT 1
    `;

    const [quoteResult] = await db.execute(query);

    if (quoteResult.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          id: 0,
          isi_quote:
            "Tetap semangat belajar, batasi mengeluh dan perbanyak coding!",
          nama_guru: "Sistem Akademik",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: quoteResult[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal memproses data quotes harian: " + error.message,
    });
  }
});

module.exports = router;
