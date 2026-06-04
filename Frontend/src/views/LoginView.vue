<template>
    <div class="login-container">
        <div class="login-box">
            <h2>Form Login Classroom</h2>
            <hr />

            <div v-if="errorMessage" class="alert-error">
                <div class="error-content-row">
                    <span><strong>Error:</strong> {{ errorMessage }}</span>

                    <button
                        v-if="isPerangkatLainError"
                        @click="handleLogoutPaksa"
                        class="btn-logout-paksa"
                        :disabled="isLoading"
                    >
                        {{ isLoading ? "Memproses..." : "Keluarkan Paksa" }}
                    </button>
                </div>
            </div>

            <form @submit.prevent="handleLogin">
                <table class="form-table">
                    <tbody>
                        <tr>
                            <td><label for="email">Email</label></td>
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
                                    placeholder="Masukkan password"
                                    :disabled="isLoading"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td>
                                <button type="submit" :disabled="isLoading">
                                    {{ isLoading ? "Memproses..." : "Masuk" }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>

            <hr />
            <p class="reg-link">
                Belum punya akun?
                <router-link :to="{ name: 'daftar' }"
                    >Daftar di sini</router-link
                >
            </p>

            <p
                class="reg-link clickable-link"
                @click="
                    pemicuModal(
                        'Hubungi 082172175234 untuk mendapatkan password',
                        'info',
                        'Pemberitahuan',
                        'Oke Siap',
                    )
                "
            >
                Lupa Password ?
            </p>
        </div>

        <ModalCostume
            :isOpen="isModalOpen"
            :tipe="modalConfig.tipe"
            :judul="modalConfig.judul"
            :pesan="modalConfig.pesan"
            :teksKonfirmasi="modalConfig.teksKonfirmasi"
            :showCancel="modalConfig.showCancel"
            @close="isModalOpen = false"
        />
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import ModalCostume from "../components/ModalCostume.vue";

const BACKEND_URL = "http://localhost:3000";
const router = useRouter();
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const isModalOpen = ref(false);
const modalConfig = ref({
    tipe: "info",
    judul: "Pemberitahuan",
    pesan: "",
    teksKonfirmasi: "Oke Siap",
    showCancel: false,
});

const isPerangkatLainError = computed(() => {
    return (
        errorMessage.value.toLowerCase().includes("perangkat lain") ||
        errorMessage.value.toLowerCase().includes("sedang login")
    );
});

const pemicuModal = (
    pesan,
    tipe = "info",
    judul = "Pemberitahuan",
    teksKonfirmasi = "Oke Siap",
) => {
    modalConfig.value = {
        tipe,
        judul,
        pesan,
        teksKonfirmasi,
        showCancel: false,
    };
    isModalOpen.value = true;
};

const handleLogin = async () => {
    if (!email.value || !password.value) {
        errorMessage.value = "Email dan password wajib diisi!";
        return;
    }

    errorMessage.value = "";
    isLoading.value = true;

    try {
        const response = await fetch(
            `${BACKEND_URL}/auth/login?email=${encodeURIComponent(email.value)}&password=${encodeURIComponent(password.value)}`,
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Gagal melakukan login");
        }

        localStorage.setItem("id_user", result.id);
        localStorage.setItem("role_user", result.role);
        localStorage.setItem("nama_user", result.nama);
        localStorage.setItem("kelas_user", result.kelas);
        localStorage.setItem("pass_user", result.password);

        router.push({ name: "home-page" });
    } catch (error) {
        errorMessage.value = error.message;
    } finally {
        isLoading.value = false;
    }
};

const handleLogoutPaksa = async () => {
    errorMessage.value = "";
    isLoading.value = true;

    try {
        const response = await fetch(
            `${BACKEND_URL}/auth/logout?method=paksa&email=${encodeURIComponent(email.value)}&password=${encodeURIComponent(password.value)}`,
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Gagal mengeluarkan sesi perangkat lain",
            );
        }

        pemicuModal(
            result.message ||
                "Sesi perangkat lain berhasil diputus. Silakan coba masuk kembali.",
            "sukses",
            "Sesi Dibersihkan",
        );
    } catch (error) {
        pemicuModal(
            "Terjadi gangguan sistem: " + error.message,
            "error",
            "Gagal Memproses",
        );
    } finally {
        isLoading.value = false;
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 85vh;
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    background-color: #fafafa;
    padding: 20px;
}

.login-box {
    width: 450px;
    padding: 30px;
    background-color: #ffffff;
    border: 3px solid #1a1a1a;
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

.form-table td:first-child {
    font-weight: 700;
    width: 100px;
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 0.3px;
}

.form-table td:nth-child(2) {
    width: 15px;
    font-weight: bold;
}

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
}

input[type="text"]:focus,
input[type="password"]:focus {
    background-color: #f4f4f5;
}

input::placeholder {
    color: #a1a1aa;
    font-size: 13px;
}

button {
    width: 100%;
    padding: 12px;
    background-color: #fef08a;
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
        box-shadow 0.1s ease;
}

button:hover:not(:disabled) {
    background-color: #fde047;
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

.alert-error {
    padding: 12px 14px;
    background-color: #fee2e2;
    border: 2px solid #1a1a1a;
    color: #b91c1c;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    box-shadow: 3px 3px 0px #1a1a1a;
}

.error-content-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.btn-logout-paksa {
    width: auto;
    padding: 6px 12px;
    background-color: #f87171;
    color: #ffffff;
    border: 2px solid #1a1a1a;
    font-size: 11px;
    font-weight: 800;
    box-shadow: 2px 2px 0px #1a1a1a;
}

.btn-logout-paksa:hover:not(:disabled) {
    background-color: #ef4444;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #1a1a1a;
}

.btn-logout-paksa:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #1a1a1a;
}

.reg-link {
    font-size: 14px;
    text-align: center;
    margin-top: 16px;
    margin-bottom: 0;
    color: #4b5563;
    font-weight: 500;
}

.reg-link a {
    color: #1a1a1a;
    font-weight: 700;
    text-decoration: underline;
    margin-left: 4px;
}

.reg-link a:hover {
    background-color: #1a1a1a;
    color: #ffffff;
    text-decoration: none;
}
</style>
