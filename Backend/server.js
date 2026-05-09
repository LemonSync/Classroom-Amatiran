const express = require('express')
const app = express()
const db = require('./db/connection')
const PORT = 3000

// Routernya
const login = require('./routes/login')
const daftar = require('./routes/daftar')

app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({ message: "Backend berjalan" })
})

app.use("/login", login)
app.use("/daftar", daftar)

app.listen(PORT, () => {
    console.log(`Sudah berjalan di http://localhost:${PORT}`)
})