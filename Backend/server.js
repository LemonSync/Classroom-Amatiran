<<<<<<< HEAD
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
=======
const express = require('express')
const app = express()
const db = require('./db/connection')
const PORT = 3000

// Routernya
const login = require('./routes/login')
const daftar = require('./routes/daftar')
const removeLogin = require('./routes/removeLogin')

app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({ message: "Backend berjalan" })
})

app.use("/login", login)
app.use("/daftar", daftar)
app.use("/remove-login", removeLogin)

app.listen(PORT, () => {
    console.log(`Sudah berjalan di http://localhost:${PORT}`)
})
>>>>>>> c1b9cc013a524f42c8e2d49c19d4f74e1b121de6
