const express = require('express')
const app = express()
const db = require('./db/connection')
const PORT = 3000

// Routernya
const login = require('./routes/login')

app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({ message: "Backend berjalan" })
})

app.get("/ambil-akun", async (req, res) => {
    try {
        
        const [result] = await db.query("SELECT users.id, users.nama, akun.email, akun.password FROM akun INNER JOIN users ON akun.id_user = users.id WHERE users.nama LIKE ?", ["%Reymond%"])
        res.status(200).json({ message: result })
    } catch (error) {
        res.status(500).json({ message: "Error: " + error.message })
    }
})

app.use("/login", login)

app.listen(PORT, () => {
    console.log(`Sudah berjalan di http://localhost:${PORT}`)
})