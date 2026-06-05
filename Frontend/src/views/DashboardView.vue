<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import ModalCostume from "../components/ModalCostume.vue";

const BACKEND_URL = "https://sembilan-kelas-backend.vercel.app";
const router = useRouter();
const userId = localStorage.getItem("id_user");
const userKelas = localStorage.getItem("kelas_user");
const userRole = localStorage.getItem("role_user");
const tokenUser = localStorage.getItem("token_user");

const daftarTugasSiswa = ref([]);
const daftarMapelGuru = ref([]);
const namaMapelBaru = ref("");
const kelasTargetBaru = ref("");
const isLoading = ref(false);
const isModalOpen = ref(false);
const modalConfig = ref({
    tipe: "info",
    judul: "Pemberitahuan",
    pesan: "",
    teksKonfirmasi: "Oke Siap",
    showCancel: false,
});

const modalAction = ref(null);

const pemicuModal = (
    pesan,
    tipe = "info",
    judul = "Pemberitahuan",
    teksKonfirmasi = "Oke Siap",
    showCancel = false,
    action = null,
) => {
    modalConfig.value = {
        tipe,
        judul,
        pesan,
        teksKonfirmasi,
        showCancel,
    };
    modalAction.value = action;
    isModalOpen.value = true;
};

const handleModalConfirm = () => {
    isModalOpen.value = false;
    if (modalAction.value) {
        modalAction.value();
        modalAction.value = null;
    }
};

const fetchDashboardData = async () => {
    isLoading.value = true;

    try {
        if (userRole === "siswa") {
            const response = await fetch(
                `${BACKEND_URL}/tugas/kelas/${userKelas}?id_siswa=${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${tokenUser}`
                    }
                }
            );
            const result = await response.json();
            if (result.success) {
                daftarTugasSiswa.value = result.data;
            }
        } else if (userRole === "guru") {
            const response = await fetch(
                `${BACKEND_URL}/mapel/guru/${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${tokenUser}`
                    }
                }
            );
            const result = await response.json();
            if (result.success) {
                daftarMapelGuru.value = result.data;
            }
        }
    } catch (error) {
        pemicuModal(
            "Gagal memuat data dari server: " + error.message,
            "error",
            "Koneksi Bermasalah",
        );
    } finally {
        isLoading.value = false;
    }
};

const handleTambahMapel = async () => {
    if (!namaMapelBaru.value || !kelasTargetBaru.value) {
        pemicuModal(
            "Nama Mapel dan Kelas tidak boleh kosong!",
            "peringatan",
            "Input Belum Lengkap",
        );
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/mapel/buat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenUser}`
            },
            body: JSON.stringify({
                nama_mapel: namaMapelBaru.value,
                id_guru: userId,
                kelas: kelasTargetBaru.value,
            }),
        });

        const result = await response.json();
        if (result.success) {
            pemicuModal(
                "Mata pelajaran baru berhasil ditambahkan!",
                "sukses",
                "Berhasil!",
            );

            namaMapelBaru.value = "";
            kelasTargetBaru.value = "";

            fetchDashboardData();
        } else {
            pemicuModal(
                result.message || "Gagal menambahkan mata pelajaran",
                "error",
                "Gagal Menambahkan",
            );
        }
    } catch (error) {
        pemicuModal(
            "Terjadi kesalahan sistem: " + error.message,
            "error",
            "Sistem Error",
        );
    }
};

const konfirmasiHapusMapel = (idMapel, namaMapel) => {
    pemicuModal(
        `Apakah Anda yakin ingin menghapus mata pelajaran "${namaMapel}"? Semua data tugas di dalamnya akan ikut terhapus dari sistem.`,
        "peringatan",
        "Hapus Mapel?",
        "Ya, Hapus",
        true,
        () => aksiHapusMapel(idMapel),
    );
};

const aksiHapusMapel = async (idMapel) => {
    isLoading.value = true;
    try {
        const response = await fetch(`${BACKEND_URL}/mapel/hapus/${idMapel}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${tokenUser}`
            }
        });

        const result = await response.json();
        if (result.success) {
            pemicuModal(
                "Mata pelajaran berhasil dihapus.",
                "sukses",
                "Berhasil",
            );
            fetchDashboardData();
        } else {
            pemicuModal(
                result.message || "Gagal menghapus mata pelajaran",
                "error",
                "Gagal",
            );
        }
    } catch (error) {
        pemicuModal(
            "Terjadi kesalahan sistem: " + error.message,
            "error",
            "Sistem Error",
        );
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchDashboardData();
});
</script>

<template>
    <div class="dashboard-container">
        <button @click="router.push({name: 'home-page'})" class="btn-back">&larr; Kembali ke HomePage</button>
        <h2>Papan Utama (Dashboard)</h2>
        <p>
            Selamat datang di sistem pembelajaran, anda masuk sebagai
            <strong>{{ userRole?.toUpperCase() }}</strong
            >.
        </p>
        <hr />

        <div v-if="isLoading" class="loading-text">
            Sedang memuat data dari server...
        </div>

        <div v-if="userRole === 'siswa' && !isLoading">
            <h3>Daftar Tugas Aktif di Kelasmu ({{ userKelas }})</h3>
            <div class="responsive-table">
                <table class="data-table table-siswa">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Mata Pelajaran</th>
                            <th>Judul Tugas</th>
                            <th>Guru Pengampu</th>
                            <th>Tenggat Waktu</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-if="daftarTugasSiswa.length === 0"
                            class="empty-row"
                        >
                            <td colspan="7" style="text-align: center">
                                Belum ada tugas yang diterbitkan di kelas ini.
                            </td>
                        </tr>
                        <tr
                            v-for="(tugas, index) in daftarTugasSiswa"
                            :key="tugas.id_tugas"
                        >
                            <td data-label="No">{{ index + 1 }}</td>
                            <td data-label="Mata Pelajaran">
                                <strong>{{ tugas.nama_mapel }}</strong>
                            </td>
                            <td data-label="Judul Tugas">{{ tugas.judul }}</td>
                            <td data-label="Guru Pengampu">
                                {{ tugas.nama_guru }}
                            </td>
                            <td
                                data-label="Tenggat Waktu"
                                class="text-danger-wrapper"
                            >
                                <span class="text-danger">
                                    {{
                                        new Date(
                                            tugas.tenggat_waktu,
                                        ).toLocaleString("id-ID")
                                    }}
                                </span>
                            </td>
                            <td data-label="Status">
                                <span
                                    v-if="tugas.status_tugas === 'SELESAI'"
                                    class="badge-status-sukses"
                                >
                                    ✓ TEPAT WAKTU
                                </span>
                                <span
                                    v-else-if="
                                        tugas.status_tugas === 'TERLAMBAT'
                                    "
                                    class="badge-status-gagal"
                                >
                                    ✕ TERLAMBAT
                                </span>
                                <span v-else class="badge-status-kosong">
                                    — BELUM
                                </span>
                            </td>
                            <td data-label="Aksi">
                                <router-link
                                    :to="{
                                        name: 'tugas-detail',
                                        params: { id: tugas.id_tugas },
                                    }"
                                    class="btn-link"
                                >
                                    Buka & Kumpulkan
                                </router-link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="userRole === 'guru' && !isLoading" class="guru-grid">
            <div class="main-panel">
                <h3>Mata Pelajaran yang Anda Ampu</h3>
                <div class="responsive-table">
                    <table class="data-table table-guru">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Mata Pelajaran</th>
                                <th>Kelas Target</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-if="daftarMapelGuru.length === 0"
                                class="empty-row"
                            >
                                <td colspan="4" style="text-align: center">
                                    Anda belum membuat mata pelajaran apapun.
                                </td>
                            </tr>
                            <tr
                                v-for="(mapel, index) in daftarMapelGuru"
                                :key="mapel.id"
                            >
                                <td data-label="No">{{ index + 1 }}</td>
                                <td data-label="Nama Mata Pelajaran">
                                    <strong>{{ mapel.nama_mapel }}</strong>
                                </td>
                                <td data-label="Kelas Target">
                                    {{ mapel.kelas }}
                                </td>
                                <td data-label="Aksi">
                                    <div class="aksi-guru-wrapper">
                                        <router-link
                                            :to="{
                                                name: 'mapel-detail',
                                                params: { id: mapel.id },
                                            }"
                                            class="btn-link"
                                        >
                                            Kelola Tugas
                                        </router-link>
                                        <button
                                            @click="
                                                konfirmasiHapusMapel(
                                                    mapel.id,
                                                    mapel.nama_mapel,
                                                )
                                            "
                                            class="btn-hapel"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="side-panel">
                <h3>Buat Mapel Baru</h3>
                <form @submit.prevent="handleTambahMapel" class="box-form">
                    <label for="nama_mapel">Nama Mata Pelajaran:</label>
                    <input
                        type="text"
                        id="nama_mapel"
                        v-model="namaMapelBaru"
                        placeholder="Misal: Pemrograman Grafik (PG)"
                    />

                    <label for="kelas_target">Kelas Target:</label>
                    <input
                        type="text"
                        id="kelas_target"
                        v-model="kelasTargetBaru"
                        placeholder="Misal: XI-RPL-2"
                    />

                    <button type="submit" class="btn-submit">
                        Terbitkan Mapel
                    </button>
                </form>
            </div>
        </div>

        <ModalCostume
            :isOpen="isModalOpen"
            :tipe="modalConfig.tipe"
            :judul="modalConfig.judul"
            :pesan="modalConfig.pesan"
            :teksKonfirmasi="modalConfig.teksKonfirmasi"
            :showCancel="modalConfig.showCancel"
            @close="isModalOpen = false"
            @confirm="handleModalConfirm"
        />
    </div>
</template>

<style scoped>
.dashboard-container {
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #1a1a1a;
    max-width: 1100px;
    margin: 30px auto;
    padding: 28px;
    background-color: #ffffff;
    border: 3px solid #1a1a1a;
    box-shadow: 6px 6px 0px #1a1a1a;
    box-sizing: border-box;
}

h2 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 26px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

p {
    font-size: 15px;
    color: #4b5563;
    margin-bottom: 16px;
}

p strong {
    color: #1a1a1a;
    background-color: #e0f2fe;
    padding: 2px 6px;
    border: 1px solid #1a1a1a;
    display: inline-block;
}

hr {
    border: none;
    border-top: 3px solid #1a1a1a;
    margin: 24px 0;
}

h3 {
    font-size: 18px;
    font-weight: 800;
    text-transform: uppercase;
    margin-top: 0;
    margin-bottom: 16px;
    letter-spacing: 0.3px;
}

.btn-back {
    background-color: #ffffff;
    color: #1a1a1a;
    border: 2px solid #1a1a1a;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 24px;
    box-shadow: 3px 3px 0px #1a1a1a;
    transition:
        transform 0.1s ease,
        box-shadow 0.1s ease;
}

.btn-back:hover {
    background-color: #f4f4f5;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #1a1a1a;
}

.btn-back:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #1a1a1a;
}

.guru-grid {
    display: flex;
    gap: 28px;
    align-items: flex-start;
}

.main-panel {
    flex: 2;
    width: 100%;
}

.side-panel {
    flex: 1;
    width: 100%;
    background-color: #f3e8ff;
    border: 2px solid #1a1a1a;
    padding: 20px;
    box-shadow: 4px 4px 0px #1a1a1a;
    box-sizing: border-box;
}

.responsive-table {
    width: 100%;
    margin-top: 10px;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    border: 3px solid #1a1a1a;
    box-shadow: 4px 4px 0px #1a1a1a;
}

.data-table th,
.data-table td {
    border: 1px solid #1a1a1a;
    padding: 12px 14px;
    font-size: 14px;
    color: #1a1a1a;
    text-align: left;
}

.data-table th {
    background-color: #f4f4f5;
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 2px solid #1a1a1a;
}

.data-table tbody tr {
    background-color: #ffffff;
}

.data-table tbody tr:hover {
    background-color: #fafafa;
}

.box-form label {
    display: block;
    margin-top: 12px;
    font-weight: 700;
    font-size: 13px;
    text-transform: uppercase;
}

.box-form label:first-of-type {
    margin-top: 0;
}

.box-form input {
    width: 100%;
    padding: 10px 12px;
    margin-top: 6px;
    font-size: 14px;
    font-family: inherit;
    background-color: #ffffff;
    border: 2px solid #1a1a1a;
    box-sizing: border-box;
    outline: none;
}

.box-form input:focus {
    background-color: #fafafa;
}

.box-form input::placeholder {
    color: #a1a1aa;
    font-size: 12px;
}

.btn-submit {
    margin-top: 20px;
    width: 100%;
    padding: 12px;
    background-color: #a3e635;
    color: #1a1a1a;
    border: 2px solid #1a1a1a;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 3px 3px 0px #1a1a1a;
    transition:
        transform 0.1s ease,
        box-shadow 0.1s ease;
}

.btn-submit:hover {
    background-color: #86efac;
    transform: translate(-1px, -1px);
    box-shadow: 4px 4px 0px #1a1a1a;
}

.btn-submit:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px 0px #1a1a1a;
}

.btn-link {
    color: #1a1a1a;
    font-weight: 700;
    text-decoration: underline;
    font-size: 13px;
    text-transform: uppercase;
    display: inline-block;
}

.btn-link:hover {
    background-color: #1a1a1a;
    color: #ffffff;
    text-decoration: none;
    padding: 2px 6px;
    margin: -2px -6px;
}

.aksi-guru-wrapper {
    display: flex;
    gap: 12px;
    align-items: center;
}

.btn-hapel {
    background-color: #fca5a5;
    color: #b91c1c;
    border: 2px solid #1a1a1a;
    padding: 3px 8px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 2px 2px 0px #1a1a1a;
    transition:
        transform 0.05s ease,
        box-shadow 0.05s ease;
}

.btn-hapel:hover {
    background-color: #ef4444;
    color: #ffffff;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #1a1a1a;
}

.btn-hapel:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #1a1a1a;
}

.text-danger-wrapper {
    display: table-cell;
}

.text-danger {
    color: #b91c1c;
    font-weight: 700;
    background-color: #fee2e2;
    padding: 2px 6px;
    border: 1px solid #1a1a1a;
    display: inline-block;
}

.loading-text {
    font-weight: 700;
    color: #1a1a1a;
    padding: 12px;
    background-color: #fef08a;
    border: 2px solid #1a1a1a;
    text-align: center;
    margin-bottom: 20px;
}

.badge-status-sukses {
    background-color: #86efac;
    color: #1a1a1a;
    font-weight: 800;
    font-size: 11px;
    padding: 4px 8px;
    border: 2px solid #1a1a1a;
    box-shadow: 2px 2px 0px #1a1a1a;
    display: inline-block;
    text-transform: uppercase;
}

.badge-status-gagal {
    background-color: #fca5a5;
    color: #b91c1c;
    font-weight: 800;
    font-size: 11px;
    padding: 4px 8px;
    border: 2px solid #1a1a1a;
    box-shadow: 2px 2px 0px #1a1a1a;
    display: inline-block;
    text-transform: uppercase;
}

.badge-status-kosong {
    background-color: #e4e4e7;
    color: #71717a;
    font-weight: 700;
    font-size: 11px;
    padding: 4px 8px;
    border: 1px dashed #71717a;
    display: inline-block;
    text-transform: uppercase;
}

@media (max-width: 768px) {
    .dashboard-container {
        margin: 10px;
        padding: 16px;
        border-width: 2px;
        box-shadow: 4px 4px 0px #1a1a1a;
    }

    h2 {
        font-size: 22px;
    }

    .btn-back {
        width: 100%;
        text-align: center;
        padding: 12px;
        box-sizing: border-box;
    }

    .guru-grid {
        flex-direction: column;
        gap: 20px;
    }

    .aksi-guru-wrapper {
        justify-content: flex-end;
        width: 100%;
    }

    .data-table {
        border: none;
        box-shadow: none;
    }

    .data-table thead {
        display: none;
    }

    .data-table tbody tr:not(.empty-row) {
        display: block;
        border: 2px solid #1a1a1a;
        box-shadow: 4px 4px 0px #1a1a1a;
        margin-bottom: 20px;
        padding: 8px;
        background-color: #ffffff;
    }

    .data-table tbody tr.empty-row td {
        display: block;
        border: 2px solid #1a1a1a;
        padding: 20px;
    }

    .data-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: none;
        border-bottom: 1px dashed #e4e4e7;
        padding: 10px 8px;
        font-size: 13px;
        text-align: right;
    }

    .data-table td:last-child {
        border-bottom: none;
    }

    .data-table td::before {
        content: attr(data-label);
        font-weight: 800;
        text-transform: uppercase;
        font-size: 11px;
        color: #4b5563;
        text-align: left;
        margin-right: 15px;
    }

    .text-danger-wrapper {
        display: flex !important;
    }

    .btn-link:hover {
        padding: 2px 6px;
        margin: 0;
    }
}
</style>
