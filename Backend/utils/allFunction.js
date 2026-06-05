const db = require("../db/connection");

const Lemon = {
<<<<<<< HEAD
  removeLogin: async function (id, role = "siswa") {
    if (!id || id === 0) return { success: false, message: "ID tidak valid" };

    const tabel = role === "guru" ? "guru" : "siswa";

    try {
      const [result] = await db.execute(
        `SELECT id, login FROM ${tabel} WHERE id = ? LIMIT 1`,
        [id],
=======
  removeLogin: async function (id_siswa) {
    if (!id_siswa || id_siswa === 0)
      return { success: false, message: "ID tidak valid" };

    try {
      const [result] = await db.execute(
        "SELECT id FROM siswa WHERE id = ? LIMIT 1",
        [id_siswa],
>>>>>>> c1b9cc013a524f42c8e2d49c19d4f74e1b121de6
      );
      if (result.length === 0)
        return { success: false, message: "Tidak dapat menemukan akun" };

<<<<<<< HEAD
      if (result[0].login === 0)
        return {
          success: false,
          message: `${role === "guru" ? "Guru" : "Siswa"} sudah logout dari awal`,
        };

      await db.execute(`UPDATE ${tabel} SET login = ? WHERE id = ?`, [
        false,
        id,
      ]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  removeLoginPaksa: async function (email, password) {
    if (!email || !password) {
      return { success: false, message: "Email dan password wajib diisi" };
    }

    try {
      const [akun] = await db.execute(
        "SELECT id_siswa, id_guru, role FROM akun WHERE email = ? AND password = ? LIMIT 1",
        [email, password],
      );

      if (akun.length === 0) {
        return { success: false, message: "Email atau password salah" };
      }

      const dataAkun = akun[0];
      const tabelTarget = dataAkun.role === "guru" ? "guru" : "siswa";
      const idTarget =
        dataAkun.role === "guru" ? dataAkun.id_guru : dataAkun.id_siswa;

      await db.execute(`UPDATE ${tabelTarget} SET login = 0 WHERE id = ?`, [
        idTarget,
      ]);

      return {
        success: true,
        message: "Berhasil merilis sesi perangkat lain. Silakan login kembali!",
=======
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
>>>>>>> c1b9cc013a524f42c8e2d49c19d4f74e1b121de6
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
<<<<<<< HEAD

  UpdateSesiLogin: async function (method, id, role = "siswa") {
    if (!method) return { success: false, message: "Mana methodnya ?" };
    if (!id) return { success: false, message: "Mana id usernanya ?" };

    const tabel = role === "guru" ? "guru" : "siswa";
    const statusSesi = method === "LOGIN" ? 1 : 0;

    try {
      const [auth] = await db.execute(
        `SELECT login FROM ${tabel} WHERE id = ? LIMIT 1`,
        [id],
      );
      if (auth.length === 0)
        return { success: false, message: "Tidak dapat menemukan profil" };

      if (auth[0].login === statusSesi) {
        return {
          success: false,
          message: `User sudah ${method.toLowerCase()} dari awal`,
        };
      }

      await db.execute(`UPDATE ${tabel} SET login = ? WHERE id = ?`, [
        method === "LOGIN",
        id,
      ]);
      return { success: true };
=======
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
>>>>>>> c1b9cc013a524f42c8e2d49c19d4f74e1b121de6
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
<<<<<<< HEAD

  authLogin: async function (email, password) {
    try {
      const [result] = await db.execute(
        `SELECT
             a.id_siswa,
             a.id_guru,
             a.role,
             g.nama AS nama_guru,
             s.nama AS nama_siswa,
             s.kelas AS kelas_siswa
           FROM akun a
           LEFT JOIN guru g ON a.id_guru = g.id
           LEFT JOIN siswa s ON a.id_siswa = s.id
           WHERE a.email = ? AND a.password = ?
           LIMIT 1`,
        [email, password],
      );

      if (result.length === 0)
        return { success: false, message: "Tidak dapat menemukan akun" };

      const user = result[0];
      const id_target = user.role === "guru" ? user.id_guru : user.id_siswa;

      const auth = await this.UpdateSesiLogin("LOGIN", id_target, user.role);
      if (!auth.success) {
        return {
          success: false,
          message: `${user.role === "guru" ? "Guru" : "Siswa"} sedang login di perangkat lain`,
        };
      }

      return {
        success: true,
        id: id_target,
        role: user.role,
        nama: user.role === "guru" ? user.nama_guru : user.nama_siswa,
        kelas: user.role === "siswa" ? user.kelas_siswa : "GURU",
=======
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
>>>>>>> c1b9cc013a524f42c8e2d49c19d4f74e1b121de6
      };
    } catch (error) {
      return {
        success: false,
        message: "Sistem Error: " + error.message,
      };
    }
  },
<<<<<<< HEAD

  cekAkun: async function (id, role = "siswa") {
    const kolomId = role === "guru" ? "id_guru" : "id_siswa";
    try {
      const [rows] = await db.execute(
        `SELECT email FROM akun WHERE ${kolomId} = ?`,
        [id],
      );
      return { success: rows.length > 0 };
    } catch (error) {
      return { success: false, message: "Sistem Error: " + error.message };
    }
  },

=======
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
>>>>>>> c1b9cc013a524f42c8e2d49c19d4f74e1b121de6
  cekSiswa: async function (nama, kelas) {
    try {
      const [rows] = await db.execute(
        "SELECT id FROM siswa WHERE kelas = ? AND nama LIKE ? LIMIT 1",
        [kelas, "%" + nama + "%"],
      );
<<<<<<< HEAD
      return { success: rows.length > 0 };
    } catch (error) {
      return { success: false, message: "Sistem Error: " + error.message };
    }
  },

  cekGuru: async function (nama) {
    try {
      const [rows] = await db.execute(
        "SELECT id FROM guru WHERE nama LIKE ? LIMIT 1",
        ["%" + nama + "%"],
      );
      return { success: rows.length > 0 };
    } catch (error) {
      return { success: false, message: "Sistem Error: " + error.message };
    }
  },

=======

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
>>>>>>> c1b9cc013a524f42c8e2d49c19d4f74e1b121de6
  cekKelas: async function (k) {
    const kelas = k.toUpperCase();
    try {
      const [rows] = await db.execute(
        "SELECT id FROM siswa WHERE kelas LIKE ? LIMIT 1",
        ["%" + kelas + "%"],
      );
<<<<<<< HEAD
      return { success: rows.length > 0 };
    } catch (error) {
      return { success: false, message: "Sistem Error: " + error.message };
    }
  },

=======

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
>>>>>>> c1b9cc013a524f42c8e2d49c19d4f74e1b121de6
  cekAll: async function (nama, kelas) {
    try {
      const kelasAvailable = await this.cekKelas(kelas);
      if (!kelasAvailable.success) {
<<<<<<< HEAD
        return { success: false, message: "Tidak dapat menemukan kelas" };
=======
        return {
          success: false,
          message: "Tidak dapat menemukan kelas",
        };
>>>>>>> c1b9cc013a524f42c8e2d49c19d4f74e1b121de6
      }

      const namaAvilable = await this.cekSiswa(nama, kelas);
      if (!namaAvilable.success) {
        return {
          success: false,
          message: "Tidak dapat menemukan siswa di kelas tersebut",
        };
      }

<<<<<<< HEAD
      return { success: true };
    } catch (error) {
      return { success: false, message: "Sistem Error: " + error.message };
=======
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message: "Sistem Error: " + error.message,
      };
>>>>>>> c1b9cc013a524f42c8e2d49c19d4f74e1b121de6
    }
  },
};

module.exports = { Lemon };
