const db = require("../db/connection");

const Lemon = {
  removeLogin: async function (id_siswa) {
    if (!id_siswa || id_siswa === 0)
      return { success: false, message: "ID tidak valid" };

    try {
      const [result] = await db.execute(
        "SELECT id FROM siswa WHERE id = ? LIMIT 1",
        [id_siswa],
      );
      if (result.length === 0)
        return { success: false, message: "Tidak dapat menemukan akun" };

      const [auth] = await db.execute(
        "SELECT login FROM siswa WHERE id = ? LIMIT 1",
        [id_siswa],
      );
      if (auth[0].login === 0)
        return {
          success: false,
          message: "Siswa sudah logout dari awal",
        };

      const [final] = await db.execute(
        "UPDATE siswa SET login = ? WHERE id = ?",
        [false, id_siswa],
      );
      return {
        success: true,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  UpdateSesiLogin: async function (method, id_siswa) {
    if (!method) return { success: false, message: "Mana methodnya ?" };
    if (!id_siswa) return { success: false, message: "Mana id siswanya ?" };

    try {
      const [result] = await db.execute(
        "SELECT id FROM siswa WHERE id = ? LIMIT 1",
        [id_siswa],
      );
      if (result.length === 0)
        return { success: false, message: "Tidak dapat menemukan akun" };
      id_siswa = result[0].id;

      if (method === "LOGIN") {
        const [auth] = await db.execute(
          "SELECT login FROM siswa WHERE id = ? LIMIT 1",
          [id_siswa],
        );
        if (auth[0].login === 1)
          return {
            success: false,
            message: "Siswa sudah login dari awal",
          };

        const [final] = await db.execute(
          "UPDATE siswa SET login = ? WHERE id = ?",
          [true, id_siswa],
        );
        return {
          success: true,
        };
      } else if (method === "LOGOUT") {
        const [auth] = await db.execute(
          "SELECT login FROM siswa WHERE id = ? LIMIT 1",
          [id_siswa],
        );
        if (auth[0].login === 0)
          return {
            success: false,
            message: "Siswa sudah logout dari awal",
          };

        const [final] = await db.execute(
          "UPDATE siswa SET login = ? WHERE id = ?",
          [false, id_siswa],
        );
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          message: "Metode tidak tersedia",
        };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  authLogin: async function (email, password) {
    try {
      const [result] = await db.execute(
        "SELECT id_siswa FROM akun WHERE email = ? AND password = ? LIMIT 1",
        [email, password],
      );
      if (result.length === 0)
        return { success: false, message: "Tidak dapat menemukan akun" };

      const id_siswa = result[0].id_siswa;

      const auth = await this.UpdateSesiLogin("LOGIN", id_siswa);
      if (!auth.success)
        return {
          success: false,
          message: "Siswa sedang login di perangkat lain",
        };

      return {
        success: true,
        id: id_siswa,
      };
    } catch (error) {
      return {
        success: false,
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
        success: false,
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
        success: false,
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
        success: false,
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
