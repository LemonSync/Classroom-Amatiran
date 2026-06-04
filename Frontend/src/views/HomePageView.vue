<script setup>
import { ref, onMounted } from "vue";
import ModalCostume from "../components/ModalCostume.vue";

const BACKEND_URL = "http://localhost:3000";
const userId = ref(localStorage.getItem("id_user") || "Tidak Terdeteksi");
const userRole = ref(localStorage.getItem("role_user") || "siswa");
const userName = ref(localStorage.getItem("nama_user") || "Pengguna");
const userKelas = ref(localStorage.getItem("kelas_user") || "");
const userPassword = ref(localStorage.getItem("pass_user") || "");
const isPasswordVisible = ref(false);
const isLoadingTugas = ref(false);
const errorMessageTugas = ref("");
const tugasTerbaru = ref(null);
const tantanganData = ref(null);
const isSudahMengerjakan = ref(false);
const riwayatData = ref(null);
const isSubmitting = ref(false);
const rankingData = ref([]);
const isLoadingRanking = ref(false);
const quoteData = ref(null);
const isLoadingQuote = ref(false);
const modalConfig = ref({
    isOpen: false,
    judul: "Pemberitahuan",
    pesan: "",
    tipe: "info",
    teksKonfirmasi: "Oke Siap",
});

const pemicuModal = (judul, pesan, tipe, teksKonfirmasi = "Oke Siap") => {
    modalConfig.value = {
        isOpen: true,
        judul,
        pesan,
        tipe,
        teksKonfirmasi,
    };
};

const togglePassword = () => {
    isPasswordVisible.value = !isPasswordVisible.value;
};

const fetchQuoteHariIni = async () => {
    isLoadingQuote.value = true;
    try {
        const response = await fetch(`${BACKEND_URL}/quotes/hari-ini`);
        const result = await response.json();
        if (result.success) {
            quoteData.value = result.data;
        }
    } catch (error) {
        console.error("Gagal memuat data kutipan guru:", error);
    } finally {
        isLoadingQuote.value = false;
    }
};

const fetchRankingTantangan = async () => {
    if (userRole.value !== "siswa") return;
    isLoadingRanking.value = true;
    try {
        const response = await fetch(`${BACKEND_URL}/tantangan/leaderboard`);
        const result = await response.json();
        if (result.success) {
            rankingData.value = result.data;
        }
    } catch (error) {
        console.error("Gagal memuat data peringkat:", error);
    } finally {
        isLoadingRanking.value = false;
    }
};

const fetchTantanganHarian = async () => {
    if (userRole.value !== "siswa") return;

    try {
        const response = await fetch(
            `${BACKEND_URL}/tantangan/hari-ini/${userId.value}`,
        );
        const result = await response.json();

        if (result.success) {
            if (result.sudah_mengerjakan) {
                isSudahMengerjakan.value = true;
                riwayatData.value = result.riwayat;
                tantanganData.value = true;
            } else {
                isSudahMengerjakan.value = false;
                tantanganData.value = result.data;
            }
        }
    } catch (error) {
        console.error("Gagal melakukan sinkronisasi data tantangan:", error);
    }
};

const submitJawaban = async (pilihan) => {
    if (!tantanganData.value?.id || isSubmitting.value) return;

    isSubmitting.value = true;
    try {
        const response = await fetch(`${BACKEND_URL}/tantangan/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_siswa: userId.value,
                id_tantangan: tantanganData.value.id,
                jawaban_siswa: pilihan,
            }),
        });

        const result = await response.json();

        if (result.success) {
            const tipeModal =
                result.status_jawaban === "TEPAT" ? "sukses" : "error";
            const judulModal =
                result.status_jawaban === "TEPAT"
                    ? "Jawaban Tepat"
                    : "Jawaban Salah";
            pemicuModal(judulModal, result.message, tipeModal, "Lanjutkan");
        } else {
            pemicuModal("Gagal Mengirim", result.message, "peringatan");
        }

        await fetchTantanganHarian();
        await fetchRankingTantangan();
    } catch (error) {
        pemicuModal(
            "Gangguan Sistem",
            "Terjadi gangguan koneksi sistem saat mengirimkan data jawaban.",
            "error",
        );
        console.error(error);
    } finally {
        isSubmitting.value = false;
    }
};

const fetchTugasTerbaru = async () => {
    if (userRole.value !== "siswa") return;

    isLoadingTugas.value = true;
    errorMessageTugas.value = "";

    try {
        const response = await fetch(
            `${BACKEND_URL}/tugas/kelas/${userKelas.value}?id_siswa=${userId.value}`,
        );

        const result = await response.json();

        if (result.success && result.data.length > 0) {
            const tugasTerurut = result.data.sort((a, b) => {
                return new Date(b.created_at) - new Date(a.created_at);
            });

            tugasTerbaru.value = tugasTerurut[0];
        } else {
            tugasTerbaru.value = null;
        }
    } catch (error) {
        errorMessageTugas.value =
            "Gagal memuat tugas terbaru: " + error.message;
    } finally {
        isLoadingTugas.value = false;
    }
};

onMounted(() => {
    fetchQuoteHariIni();
    fetchTugasTerbaru();
    fetchTantanganHarian();
    fetchRankingTantangan();
});
</script>

<template>
    <div class="homepage-container">
        <div class="welcome-box">
            <h2>Selamat Datang, {{ userName }}!</h2>
            <p>
                Konfigurasi dan rangkuman aktivitas akun Anda di platform portal
                akademik. <br />Diawasi oleh
                <strong>Eres Simbolon yang kece bwanget</strong> dan dijalankan
                menggunakan NodeJS (<s>PHP</s> jelek soalnya).
            </p>
            <div class="navigation-row">
                <router-link to="/dash" class="btn-dashboard">
                    📊 Buka Dashboard Utama
                </router-link>
            </div>
        </div>

        <div class="homepage-grid">
            <div class="profile-card">
                <h3>Profil Akun</h3>
                <table class="profile-table">
                    <tbody>
                        <tr>
                            <td>ID Pengguna</td>
                            <td>:</td>
                            <td>
                                <strong>{{ userId }}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>Nama Lengkap</td>
                            <td>:</td>
                            <td>
                                <strong>{{ userName }}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>Hak Akses</td>
                            <td>:</td>
                            <td>
                                <span class="role-badge">{{
                                    userRole?.toUpperCase()
                                }}</span>
                            </td>
                        </tr>
                        <tr v-if="userRole === 'siswa'">
                            <td>Kelas</td>
                            <td>:</td>
                            <td>
                                <strong>{{ userKelas || "-" }}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>Password</td>
                            <td>:</td>
                            <td>
                                <span class="password-masked">
                                    {{
                                        isPasswordVisible
                                            ? userPassword
                                            : "••••••••"
                                    }}
                                </span>
                                <button
                                    @click="togglePassword"
                                    class="btn-toggle-pass"
                                >
                                    {{
                                        isPasswordVisible
                                            ? "Sembunyikan"
                                            : "Lihat"
                                    }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div
                v-if="userRole === 'guru'"
                class="quote-container"
                style="flex: 1; margin-bottom: 0"
            >
                <div class="quote-header">
                    <span class="badge-brutal emerald"
                        >💬 KATA MOTIVASI HARI INI</span
                    >
                </div>

                <div v-if="isLoadingQuote" class="loading-box">
                    Memuat pesan motivasi...
                </div>

                <div v-else-if="quoteData" class="quote-content-box">
                    <p class="quote-text">"{{ quoteData.isi_quote }}"</p>
                    <p class="quote-author">
                        — Oleh: <strong>{{ quoteData.nama_guru }}</strong>
                    </p>
                </div>
            </div>

            <div v-if="userRole === 'siswa'" class="task-summary-panel">
                <h3>Tugas Terbaru Hari Ini</h3>

                <div v-if="isLoadingTugas" class="loading-box">
                    Memuat tugas terbaru...
                </div>

                <div v-else-if="errorMessageTugas" class="alert-error-mini">
                    {{ errorMessageTugas }}
                </div>

                <div v-else-if="tugasTerbaru" class="latest-task-card">
                    <div class="task-badge-row">
                        <span class="mapel-badge">{{
                            tugasTerbaru.nama_mapel
                        }}</span>
                        <span class="deadline-badge">
                            Tenggat:
                            {{
                                new Date(
                                    tugasTerbaru.tenggat_waktu,
                                ).toLocaleString("id-ID")
                            }}
                        </span>
                    </div>
                    <h4>{{ tugasTerbaru.judul }}</h4>
                    <p class="guru-name">
                        Oleh: <strong>{{ tugasTerbaru.nama_guru }}</strong>
                    </p>

                    <router-link
                        :to="{
                            name: 'tugas-detail',
                            params: { id: tugasTerbaru.id_tugas },
                        }"
                        class="btn-action-task"
                    >
                        Buka & Kerjakan Tugas
                    </router-link>
                </div>

                <div v-else class="empty-task-box">
                    <p>
                        Belum ada tugas terbaru yang dikirimkan oleh guru untuk
                        kelas Anda saat ini.
                    </p>
                </div>
            </div>
        </div>

        <div
            v-if="userRole === 'siswa' && tantanganData"
            class="tantangan-daily-container"
        >
            <div class="tantangan-header">
                <span class="badge-brutal">🎯 MINI TANTANGAN HARIAN</span>
            </div>

            <div v-if="!isSudahMengerjakan">
                <p class="isi-tantangan">{{ tantanganData.pertanyaan }}</p>
                <div class="action-quiz-row">
                    <button
                        @click="submitJawaban('BENAR')"
                        class="btn-quiz btn-benar"
                        :disabled="isSubmitting"
                    >
                        BENAR
                    </button>
                    <button
                        @click="submitJawaban('SALAH')"
                        class="btn-quiz btn-salah"
                        :disabled="isSubmitting"
                    >
                        SALAH
                    </button>
                </div>
            </div>

            <div v-else class="done-quiz-box">
                <p class="status-quiz-title">
                    Kamu sudah menjawab hari ini! Status:
                    <strong
                        :class="
                            riwayatData.status_jawaban === 'TEPAT'
                                ? 'text-hijau'
                                : 'text-merah'
                        "
                    >
                        {{ riwayatData.status_jawaban }}
                    </strong>
                </p>
                <p class="jawaban-summary-text">
                    Jawaban yang kamu kirimkan:
                    <strong>{{ riwayatData.jawaban_siswa }}</strong
                    >. Tantangan baru berikutnya akan diperbarui secara otomatis
                    esok hari!
                </p>
            </div>
        </div>

        <div v-if="userRole === 'siswa'" class="ranking-container">
            <div class="ranking-header">
                <span class="badge-brutal kuning"
                    >🏆 TOP 5 MASTER TANTANGAN</span
                >
            </div>

            <div v-if="isLoadingRanking" class="loading-box">
                Memuat papan peringkat...
            </div>

            <div v-else-if="rankingData.length === 0" class="empty-task-box">
                Belum ada data pengerjaan tantangan dari siswa.
            </div>

            <div v-else class="ranking-table-wrapper">
                <table class="ranking-table">
                    <thead>
                        <tr>
                            <th style="width: 70px">Rank</th>
                            <th>Nama Siswa</th>
                            <th>Kelas</th>
                            <th style="text-align: center; width: 150px">
                                Skor Tepat
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(rank, index) in rankingData"
                            :key="index"
                            :class="{ 'my-rank-row': rank.nama === userName }"
                        >
                            <td>
                                <span
                                    class="rank-number"
                                    :class="'top-' + (index + 1)"
                                >
                                    #{{ index + 1 }}
                                </span>
                            </td>
                            <td>
                                <strong>{{ rank.nama }}</strong>
                                <span
                                    v-if="rank.nama === userName"
                                    class="you-badge"
                                    >Kamu</span
                                >
                            </td>
                            <td>{{ rank.kelas }}</td>
                            <td style="text-align: center">
                                <span class="score-badge"
                                    >{{ rank.total_tepat }} 🔥</span
                                >
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <ModalCostume
            :isOpen="modalConfig.isOpen"
            :judul="modalConfig.judul"
            :pesan="modalConfig.pesan"
            :tipe="modalConfig.tipe"
            :teksKonfirmasi="modalConfig.teksKonfirmasi"
            @close="modalConfig.isOpen = false"
        />
    </div>
</template>

<style scoped>
.homepage-container {
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #1a1a1a;
    max-width: 1100px;
    margin: 30px auto;
    padding: 28px;
    background-color: #ffffff;
    border: 3px solid #1a1a1a;
    box-shadow: 6px 6px 0px #1a1a1a;
}

.quote-container {
    background-color: #f0fdf4;
    border: 3px solid #1a1a1a;
    padding: 24px;
    margin-bottom: 28px;
    box-shadow: 6px 6px 0px #1a1a1a;
}

.quote-header {
    margin-bottom: 14px;
}

.badge-brutal.emerald {
    background-color: #047857;
    color: #ffffff;
}

.quote-content-box {
    background-color: #ffffff;
    border: 2px dashed #1a1a1a;
    padding: 20px;
}

.quote-text {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-style: italic;
    font-weight: 700;
    line-height: 1.6;
    color: #111827;
}

.quote-author {
    margin: 0;
    font-size: 13px;
    color: #374151;
    text-align: right;
}

.welcome-box {
    background-color: #f4f4f5;
    border: 2px solid #1a1a1a;
    padding: 20px;
    margin-bottom: 28px;
    box-shadow: 4px 4px 0px #1a1a1a;
}

.welcome-box h2 {
    margin: 0 0 6px 0;
    font-size: 24px;
    font-weight: 800;
    text-transform: uppercase;
}

.welcome-box p {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #4b5563;
}

.navigation-row {
    display: flex;
    justify-content: flex-start;
}

.btn-dashboard {
    display: inline-block;
    padding: 10px 20px;
    background-color: #a7f3d0;
    color: #1a1a1a;
    border: 2px solid #1a1a1a;
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    text-decoration: none;
    box-shadow: 3px 3px 0px #1a1a1a;
    transition:
        transform 0.05s,
        box-shadow 0.05s;
}

.btn-dashboard:hover {
    background-color: #6ee7b7;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #1a1a1a;
}

.btn-dashboard:active {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0px #1a1a1a;
}

.tantangan-daily-container {
    background-color: #f8fafc;
    border: 3px solid #1a1a1a;
    padding: 24px;
    margin-bottom: 28px;
    box-shadow: 6px 6px 0px #1a1a1a;
}

.tantangan-header {
    margin-bottom: 14px;
}

.badge-brutal {
    background-color: #1a1a1a;
    color: #ffffff;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.5px;
    display: inline-block;
    border: 1px solid #1a1a1a;
}

.badge-brutal.kuning {
    background-color: #fef08a;
    color: #1a1a1a;
}

.isi-tantangan {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    line-height: 1.5;
    color: #1a1a1a;
}

.action-quiz-row {
    display: flex;
    gap: 16px;
    margin-top: 18px;
}

.btn-quiz {
    flex: 1;
    padding: 12px;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
    border: 2px solid #1a1a1a;
    box-shadow: 3px 3px 0px #1a1a1a;
    text-transform: uppercase;
    transition:
        transform 0.05s,
        box-shadow 0.05s;
}

.btn-benar {
    background-color: #86efac;
}
.btn-benar:hover:not(:disabled) {
    background-color: #4ade80;
}

.btn-salah {
    background-color: #fca5a5;
}
.btn-salah:hover:not(:disabled) {
    background-color: #f87171;
}

.btn-quiz:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0px #1a1a1a;
}

.btn-quiz:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.done-quiz-box {
    background-color: #ffffff;
    border: 2px dashed #1a1a1a;
    padding: 18px;
}

.status-quiz-title {
    margin: 0 0 8px 0;
    font-weight: 900;
    font-size: 14px;
    text-transform: uppercase;
}

.jawaban-summary-text {
    margin: 0;
    font-size: 13px;
    color: #4b5563;
    line-height: 1.4;
}

.text-hijau {
    color: #16a34a;
    font-weight: 900;
}
.text-merah {
    color: #dc2626;
    font-weight: 900;
}

.ranking-container {
    background-color: #ffffff;
    border: 3px solid #1a1a1a;
    padding: 24px;
    margin-bottom: 28px;
    box-shadow: 6px 6px 0px #1a1a1a;
}

.ranking-header {
    margin-bottom: 16px;
}

.ranking-table-wrapper {
    overflow-x: auto;
}

.ranking-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid #1a1a1a;
}

.ranking-table th {
    background-color: #e2e8f0;
    color: #1a1a1a;
    text-align: left;
    padding: 10px 12px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    border-bottom: 2px solid #1a1a1a;
    border-right: 1px solid #1a1a1a;
}

.ranking-table td {
    padding: 10px 12px;
    font-size: 14px;
    border-bottom: 1px solid #1a1a1a;
    border-right: 1px solid #1a1a1a;
    vertical-align: middle;
}

.ranking-table tr:last-child td {
    border-bottom: none;
}

.my-rank-row {
    background-color: #fef08a !important;
}

.rank-number {
    display: inline-block;
    padding: 2px 6px;
    font-weight: 900;
    font-size: 12px;
    border: 1px solid #1a1a1a;
}

.rank-number.top-1 {
    background-color: #fde047;
}
.rank-number.top-2 {
    background-color: #cbd5e1;
}
.rank-number.top-3 {
    background-color: #cd7f32;
    color: white;
}

.score-badge {
    background-color: #1a1a1a;
    color: #ffffff;
    padding: 4px 8px;
    font-weight: 800;
    font-size: 12px;
    border-radius: 0;
}

.you-badge {
    background-color: #ef4444;
    color: white;
    font-size: 10px;
    font-weight: 900;
    padding: 1px 4px;
    margin-left: 6px;
    text-transform: uppercase;
    border: 1px solid #1a1a1a;
}

.homepage-grid {
    display: flex;
    gap: 28px;
    align-items: flex-start;
}

@media (max-width: 768px) {
    .homepage-grid {
        flex-direction: column;
    }
}

.profile-card,
.task-summary-panel {
    flex: 1;
    width: 100%;
}

h3 {
    font-size: 16px;
    font-weight: 800;
    text-transform: uppercase;
    margin-top: 0;
    margin-bottom: 16px;
    letter-spacing: 0.3px;
}

.profile-table {
    width: 100%;
    border-collapse: collapse;
    border: 2px solid #1a1a1a;
    box-shadow: 4px 4px 0px #1a1a1a;
}

.profile-table td {
    padding: 12px;
    font-size: 14px;
    border: 1px solid #1a1a1a;
    background-color: #ffffff;
    vertical-align: middle;
}

.profile-table tr td:first-child {
    font-weight: 700;
    width: 130px;
    background-color: #fafafa;
    text-transform: uppercase;
    font-size: 12px;
}

.profile-table tr td:nth-child(2) {
    width: 15px;
    text-align: center;
    font-weight: bold;
}

.role-badge {
    background-color: #e0f2fe;
    color: #1a1a1a;
    padding: 3px 8px;
    font-weight: 700;
    border: 1px solid #1a1a1a;
    font-size: 12px;
    display: inline-block;
}

.mapel-badge {
    background-color: #f3e8ff;
    color: #1a1a1a;
    padding: 4px 8px;
    font-weight: 700;
    border: 1px solid #1a1a1a;
    font-size: 12px;
}

.deadline-badge {
    background-color: #fee2e2;
    color: #b91c1c;
    padding: 4px 8px;
    font-weight: 700;
    border: 1px solid #1a1a1a;
    font-size: 12px;
}

.password-masked {
    font-family: monospace;
    font-size: 14px;
    font-weight: bold;
    margin-right: 10px;
}

.btn-toggle-pass {
    background-color: #ffffff;
    border: 1px solid #1a1a1a;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    text-transform: uppercase;
}

.btn-toggle-pass:hover {
    background-color: #1a1a1a;
    color: #ffffff;
}

.latest-task-card {
    background-color: #ffffff;
    border: 2px solid #1a1a1a;
    padding: 20px;
    box-shadow: 4px 4px 0px #1a1a1a;
    box-sizing: border-box;
}

.task-badge-row {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
}

.latest-task-card h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 800;
    line-height: 1.4;
    color: #1a1a1a;
}

.guru-name {
    margin: 0 0 20px 0;
    font-size: 13px;
    color: #4b5563;
}

.btn-action-task {
    display: block;
    text-align: center;
    padding: 10px;
    background-color: #fef08a;
    color: #1a1a1a;
    border: 2px solid #1a1a1a;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    text-decoration: none;
    box-shadow: 2px 2px 0px #1a1a1a;
    transition:
        transform 0.1s ease,
        box-shadow 0.1s ease;
}

.btn-action-task:hover {
    background-color: #fde047;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #1a1a1a;
}

.btn-action-task:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #1a1a1a;
}

.empty-task-box {
    background-color: #ffffff;
    border: 2px dashed #a1a1aa;
    padding: 30px 20px;
    text-align: center;
    color: #71717a;
    font-size: 14px;
}

.loading-box {
    padding: 20px;
    background-color: #fef08a;
    border: 2px solid #1a1a1a;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 13px;
    text-align: center;
    box-shadow: 4px 4px 0px #1a1a1a;
}

.alert-error-mini {
    padding: 15px;
    background-color: #fee2e2;
    border: 2px solid #1a1a1a;
    color: #b91c1c;
    font-size: 13px;
    font-weight: 600;
    box-shadow: 4px 4px 0px #1a1a1a;
}
</style>
