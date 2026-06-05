const jwt = require("jsonwebtoken");

/**
 * Middleware untuk memverifikasi apakah token JWT valid atau tidak.
 * Digunakan untuk mengunci route agar hanya bisa diakses oleh user yang sudah login.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Akses ditolak! Token tidak ditemukan."
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Token tidak valid atau telah kedaluwarsa."
    });
  }
};

/**
 * Middleware untuk membatasi hak akses berdasarkan role tertentu.
 * @param {Array} allowedRoles - List role yang diizinkan, contoh: ['guru'] atau ['guru', 'siswa']
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak! Anda tidak memiliki izin untuk mengakses halaman ini."
      });
    }

    next();
  };
};

module.exports = { verifyToken, checkRole };
