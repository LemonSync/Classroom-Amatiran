const db = require("../db/connection");

const Lemon = {
  authLogin: async function (email, password) {
    try {
      const [result] = await db.execute(
        "SELECT id_siswa FROM akun WHERE email = ? AND password = ? LIMIT 1",
        [email, password],
      );
      if (result.length === 0)
        return { success: false, message: "Tidak dapat menemukan" };

      return {
        succes: true,
        id: result[0].id,
      };
    } catch (error) {
      return {
        succes: false,
        message: "Sistem Error: " + error.message,
      };
    }
  },
  cekAkun: async function (id) {
    try {
      const [rows] = await db.execute(
        "SELECT email FROM akun WHERE id_siswa = ?",
        [id],
      );

      return {
        success: rows.length > 0,
      };
    } catch (error) {
      return {
        succes: false,
        message: "Sistem Error: " + error.message,
      };
    }
  },
  cekSiswa: async function (nama, kelas) {
    try {
      const [rows] = await db.execute(
        "SELECT id FROM siswa WHERE kelas = ? AND nama LIKE ? LIMIT 1",
        [kelas, "%" + nama + "%"],
      );

      return {
        success: rows.length > 0,
      };
    } catch (error) {
      return {
        succes: false,
        message: "Sistem Error: " + error.message,
      };
    }
  },
  cekKelas: async function (k) {
    const kelas = k.toUpperCase();
    try {
      const [rows] = await db.execute(
        "SELECT id FROM siswa WHERE kelas LIKE ? LIMIT 1",
        ["%" + kelas + "%"],
      );

      return {
        success: rows.length > 0,
      };
    } catch (error) {
      return {
        succes: false,
        message: "Sistem Error: " + error.message,
      };
    }
  },
  cekAll: async function (nama, kelas) {
    try {
      const kelasAvailable = await this.cekKelas(kelas);
      if (!kelasAvailable.success) {
        return {
          success: false,
          message: "Tidak dapat menemukan kelas",
        };
      }

      const namaAvilable = await this.cekSiswa(nama, kelas);
      if (!namaAvilable.success) {
        return {
          success: false,
          message: "Tidak dapat menemukan siswa di kelas tersebut",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: "Sistem Error: " + error.message,
      };
    }
  },
};

module.exports = { Lemon };
