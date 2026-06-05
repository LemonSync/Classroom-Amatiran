const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { Lemon } = require("../utils/allFunction");

router.get("/", async (req, res) => {
  const { email, password } = req.query;
  if (!email || !password)
    return res
      .status(401)
      .json({ message: "Harap masukkan email dan password" });
  if (!email.includes("@"))
    return res
      .status(401)
      .json({ message: "Harap masukkan format email yang tepat" });
  const auth = await Lemon.authLogin(email, password);
  if (!auth.success)
    return res
      .status(401)
      .json({ message: auth.message });

      const id_user = auth.id
      res.status(200).json({
        success: true,
        id: id_user
      })
});

module.exports = router;
