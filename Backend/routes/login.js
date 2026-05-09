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
  const auth = await Lemon.authLogin(email, password);
  if (!auth)
    return res
      .status(401)
      .json({ message: "Harap masukkan email dan password" });
});

module.exports = router;
