<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const BACKEND_URL = "http://localhost:3000";
const router = useRouter();
const nama = ref("");
const kelas = ref("");
const email = ref("");
const password = ref("");
const role = ref("siswa");
const errorMessage = ref("");
const successMessage = ref("");
const isLoading = ref(false);

const handleDaftar = async () => {
    if (!nama.value || !email.value || !password.value || !role.value) {
        errorMessage.value =
            "Semua kolom wajib diisi (kecuali kelas untuk guru)!";
        return;
    }

    if (role.value === "siswa" && !kelas.value) {
        errorMessage.value = "Siswa wajib mengisi kolom kelas!";
        return;
    }

    errorMessage.value = "";
    successMessage.value = "";
    isLoading.value = true;

    try {
        const response = await fetch(`${BACKEND_URL}/auth/daftar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nama: nama.value.toUpperCase(),
                kelas: role.value === "siswa" ? kelas.value : undefined,
                email: email.value,
                password: password.value,
                role: role.value,
            }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Gagal melakukan pendaftaran akun",
            );
        }

        successMessage.value =
            "Pendaftaran berhasil! Mengalihkan ke halaman login...";

        nama.value = "";
        kelas.value = "";
        email.value = "";
        password.value = "";

        setTimeout(() => {
            router.push({ name: "login" });
        }, 2000);
    } catch (error) {
        errorMessage.value = error.message;
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="daftar-container">
        <div class="daftar-box">
            <h2>Form Daftar Akun Classroom</h2>
            <hr />

            <div v-if="errorMessage" class="alert-error">
                <strong>Error:</strong> {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="alert-success">
                <strong>Sukses:</strong> {{ successMessage }}
            </div>

            <form @submit.prevent="handleDaftar">
                <table class="form-table">
                    <tbody>
                        <tr>
                            <td><label for="role">Daftar Sebagai</label></td>
                            <td>:</td>
                            <td>
                                <select
                                    id="role"
                                    v-model="role"
                                    :disabled="isLoading"
                                >
                                    <option value="siswa">Siswa</option>
                                    <option value="guru">
                                        Guru (Mata Pelajaran)
                                    </option>
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td><label for="nama">Nama Lengkap</label></td>
                            <td>:</td>
                            <td>
                                <input
                                    type="text"
                                    id="nama"
                                    v-model="nama"
                                    placeholder="Gunakan HURUF KAPITAL sesuai data sekolah"
                                    :disabled="isLoading"
                                />
                            </td>
                        </tr>

                        <tr v-if="role === 'siswa'">
                            <td><label for="kelas">Kelas</label></td>
                            <td>:</td>
                            <td>
                                <input
                                    type="text"
                                    id="kelas"
                                    v-model="kelas"
                                    placeholder="Contoh: XI-RPL-2"
                                    :disabled="isLoading"
                                />
                            </td>
                        </tr>

                        <tr>
                            <td><label for="email">Email Baru</label></td>
                            <td>:</td>
                            <td>
                                <input
                                    type="text"
                                    id="email"
                                    v-model="email"
                                    placeholder="contoh@gmail.com"
                                    :disabled="isLoading"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td><label for="password">Password</label></td>
                            <td>:</td>
                            <td>
                                <input
                                    type="password"
                                    id="password"
                                    v-model="password"
                                    placeholder="Buat password unik"
                                    :disabled="isLoading"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td>
                                <button type="submit" :disabled="isLoading">
                                    {{
                                        isLoading
                                            ? "Mendaftarkan..."
                                            : "Daftar Sekarang"
                                    }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>

            <hr />
            <p class="login-link">
                Sudah memiliki akun?
                <router-link :to="{ name: 'login' }">Login di sini</router-link>
            </p>
        </div>
    </div>
</template>

<style scoped>
/* Main Container - Background Centering */
.daftar-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    background-color: #fafafa;
    padding: 20px;
}

/* Card Box Utama */
.daftar-box {
    width: 500px;
    padding: 30px;
    background-color: #ffffff;
    border: 3px solid #1a1a1a;
    /* Bayangan padat khas Soft Neo-Brutalism */
    box-shadow: 6px 6px 0px #1a1a1a;
    box-sizing: border-box;
}

h2 {
    margin-top: 0;
    margin-bottom: 16px;
    font-size: 22px;
    font-weight: 800;
    text-align: center;
    text-transform: uppercase;
    color: #1a1a1a;
    letter-spacing: 0.3px;
}

hr {
    border: none;
    border-top: 3px solid #1a1a1a;
    margin: 20px 0;
}

/* Form Layout (Menggunakan Table Bawaan) */
.form-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
}

.form-table td {
    padding: 10px 4px;
    vertical-align: middle;
    color: #1a1a1a;
    font-size: 14px;
}

/* Mengatur kolom label & titik dua agar rapi */
.form-table td:first-child {
    font-weight: 700;
    width: 130px;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 0.3px;
}

.form-table td:nth-child(2) {
    width: 15px;
    font-weight: bold;
}

/* Inputs, Select, & Textfields Controls */
select,
input[type="text"],
input[type="password"] {
    width: 100%;
    padding: 10px 12px;
    font-size: 14px;
    font-family: inherit;
    color: #1a1a1a;
    background-color: #ffffff;
    border: 2px solid #1a1a1a;
    box-sizing: border-box;
    outline: none;
    transition: background-color 0.1s ease;
}

/* Efek fokus yang bersih */
select:focus,
input[type="text"]:focus,
input[type="password"]:focus {
    background-color: #f4f4f5;
}

/* Placeholder styling */
input::placeholder {
    color: #a1a1aa;
    font-size: 12px;
}

/* Submit Button */
button {
    width: 100%;
    padding: 12px;
    background-color: #dcfce7; /* Hijau mint/pastel soft */
    color: #1a1a1a;
    border: 2px solid #1a1a1a;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    box-shadow: 3px 3px 0px #1a1a1a;
    transition:
        transform 0.1s ease,
        box-shadow 0.1s ease,
        background-color 0.1s ease;
}

button:hover:not(:disabled) {
    background-color: #bbf7d0; /* Hijau sedikit lebih gelap saat hover */
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #1a1a1a;
}

button:active:not(:disabled) {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #1a1a1a;
}

button:disabled {
    background-color: #e4e4e7;
    color: #a1a1aa;
    border-color: #a1a1aa;
    box-shadow: 0px 0px 0px #1a1a1a;
    cursor: not-allowed;
}

/* Alerts (Error & Success Messages) */
.alert-error {
    padding: 12px 14px;
    background-color: #fee2e2; /* Merah pastel */
    border: 2px solid #1a1a1a;
    color: #b91c1c;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    box-shadow: 3px 3px 0px #1a1a1a;
}

.alert-success {
    padding: 12px 14px;
    background-color: #dcfce7; /* Hijau pastel */
    border: 2px solid #1a1a1a;
    color: #15803d;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    box-shadow: 3px 3px 0px #1a1a1a;
}

/* Footer Link (Login) */
.login-link {
    font-size: 14px;
    text-align: center;
    margin-top: 16px;
    margin-bottom: 0;
    color: #4b5563;
    font-weight: 500;
}

.login-link a {
    color: #1a1a1a;
    font-weight: 700;
    text-decoration: underline;
    margin-left: 4px;
}

.login-link a:hover {
    background-color: #1a1a1a;
    color: #ffffff;
    text-decoration: none;
}
</style>
