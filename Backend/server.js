const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const db = require("./db/connection");
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`==================================================`);
  console.log(` SERVER BACKEND CLASSROOM READY TO ROCK!           `);
  console.log(` Berjalan di URL: http://localhost:${PORT}        `);
  console.log(`==================================================`);
});
