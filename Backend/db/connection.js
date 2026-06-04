const mysql = require('mysql2/promise')

const conn = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    port: 3306,
    database: "db_classroom",
    waitForConnections: true,
    connectionLimit: 10
})

module.exports = conn