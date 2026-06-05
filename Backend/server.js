const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const db = require("./db/connection");
require("dotenv").config();
const PORT = 3000;

process.env.JWT_SECRET = process.env.JWT_SECRET;
app.use(cors());
app.use(express.json());

const auth = require("./routes/auth");
const mapel = require("./routes/mapel");
const tugas = require("./routes/tugas");
const pengumpulan = require("./routes/pengumpulan");
const tantangan = require("./routes/tantangan");
const quotes = require("./routes/quotes");

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend Classroom berjalan lancar!",
  });
});

app.use("/auth", auth);
app.use("/mapel", mapel);
app.use("/tugas", tugas);
app.use("/pengumpulan", pengumpulan);
app.use("/tantangan", tantangan);
app.use("/quotes", quotes);

module.exports = app;
