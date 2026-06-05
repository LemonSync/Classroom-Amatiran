const express = require("express");
const router = express.Router();
const { Lemon } = require("../utils/allFunction");

router.get("/", async (req, res) => {
  const { id } = req.query;
  if (!id || id === 0)
    return res.status(401).json({ success: false, message: "ID tidak valid" });

  try {
    const remove = await Lemon.removeLogin(id);

    if (!remove.success)
      return res.status(401).json({ success: false, message: remove.message });

    res
      .status(200)
      .json({ success: true, message: "Sukses menglogoutkan akun" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
