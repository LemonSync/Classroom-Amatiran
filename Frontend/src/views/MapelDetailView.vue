<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ModalCostume from "../components/ModalCostume.vue";

const BACKEND_URL = "https://sembilan-kelas-backend.vercel.app";
const route = useRoute();
const router = useRouter();
const idMapel = route.params.id;
const userRole = localStorage.getItem("role_user");
const tokenUser = localStorage.getItem("token_user");

const detailMapel = ref(null);
const daftarTugas = ref([]);
const judulTugas = ref("");
const deskripsiTugas = ref("");
const tenggatWaktu = ref("");
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

const fetchMapelData = async () => {
    isLoading.value = true;

    try {
        const responseTugas = await fetch(
            `${BACKEND_URL}/tugas/mapel/${idMapel}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${tokenUser}`
                }
            }
        );
        const resultTugas = await responseTugas.json();

        if (resultTugas.success) {
            daftarTugas.value = resultTugas.data;

            if (resultTugas.data.length > 0) {
                detailMapel.value = {
                    nama_mapel: resultTugas.data[0].nama_mapel,
                    kelas: resultTugas.data[0].kelas,
                    nama_guru: resultTugas.data[0].nama_guru,
                };
            } else {
                detailMapel.value = {
                    nama_mapel: "Mata Pelajaran #" + idMapel,
                    kelas: "-",
                    nama_guru: "-",
                };
            }
        } else {
            pemicuModal(
                resultTugas.message || "Gagal memuat daftar tugas",
                "error",
                "Gagal Memuat",
            );
        }
    } catch (error) {
        pemicuModal(
            "Terjadi gangguan koneksi: " + error.message,
            "error",
            "Koneksi Bermasalah",
        );
    } finally {
        isLoading.value = false;
    }
};

const handleTambahTugas = async () => {
    if (!judulTugas.value || !tenggatWaktu.value) {
        pemicuModal(
            "Judul tugas dan tenggat waktu wajib ditentukan!",
            "peringatan",
            "Input Belum Lengkap",
        );
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/tugas/buat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${tokenUser}`
            },
            body: JSON.stringify({
                id_mapel: idMapel,
                judul: judulTugas.value,
                deskripsi: deskripsiTugas.value,
                tenggat_waktu: tenggatWaktu.value,
            }),
        });

        const result = await response.json();
        if (result.success) {
            pemicuModal(
                "Tugas baru berhasil disiarkan ke siswa!",
                "sukses",
                "Berhasil Disiarkan",
            );

            judulTugas.value = "";
            deskripsiTugas.value = "";
            tenggatWaktu.value = "";

            fetchMapelData();
        } else {
            pemicuModal(
                result.message || "Gagal menerbitkan tugas baru",
                "error",
                "Gagal Menerbitkan",
            );
        }
    } catch (error) {
        pemicuModal(
            "Eror sistem backend: " + error.message,
            "error",
            "Sistem Bermasalah",
        );
    }
};

const konfirmasiHapusTugas = (idTugas, judul) => {
    pemicuModal(
        `Apakah Anda yakin ingin menghapus tugas "${judul}"? Seluruh berkas pengumpulan siswa pada tugas ini juga akan terhapus secara permanen.`,
        "peringatan",
        "Hapus Tugas?",
        "Ya, Hapus",
        true,
        () => aksiHapusTugas(idTugas),
    );
};

const aksiHapusTugas = async (idTugas) => {
    isLoading.value = true;
    try {
        const response = await fetch(`${BACKEND_URL}/tugas/hapus/${idTugas}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${tokenUser}`
            }
        });

        const result = await response.json();
        if (result.success) {
            pemicuModal(
                "Tugas berhasil dihapus dari sistem.",
                "sukses",
                "Berhasil Dihapus",
            );
            fetchMapelData();
        } else {
            pemicuModal(
                result.message || "Gagal menghapus tugas",
                "error",
                "Gagal",
            );
        }
    } catch (error) {
        pemicuModal(
            "Gagal memproses permintaan: " + error.message,
            "error",
            "Sistem Bermasalah",
        );
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchMapelData();
});
</script>

<template>
    <div class="mapel-detail-container">
        <button @click="router.push({ name: 'dashboard' })" class="btn-back">
            &larr; Kembali ke Dashboard
        </button>

        <div v-if="detailMapel" class="info-header-box">
            <h2>Mata Pelajaran: {{ detailMapel.nama_mapel }}</h2>
            <p>
                Kelas Target: <strong>{{ detailMapel.kelas }}</strong>
                <span class="divider">|</span> Guru Pengampu:
                <strong>{{ detailMapel.nama_guru }}</strong>
            </p>
        </div>
        <hr />

        <div v-if="isLoading" class="loading-text">
            Sedang menyinkronkan data tugas...
        </div>

        <div class="mapel-grid" v-if="!isLoading">
            <div class="tugas-list-panel">
                <h3>Daftar Tugas Terbit</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Judul Tugas</th>
                            <th>Deskripsi Singkat</th>
                            <th>Batas Selesai (Tenggat)</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="daftarTugas.length === 0" class="empty-row">
                            <td
                                colspan="5"
                                style="text-align: center; font-style: italic"
                            >
                                Belum ada tugas yang diarsipkan pada mapel ini.
                            </td>
                        </tr>
                        <tr
                            v-for="(tugas, index) in daftarTugas"
                            :key="tugas.id_tugas"
                        >
                            <td data-label="No">{{ index + 1 }}</td>
                            <td data-label="Judul Tugas">
                                <strong>{{ tugas.judul }}</strong>
                            </td>
                            <td data-label="Deskripsi Singkat">
                                {{ tugas.deskripsi || "-" }}
                            </td>
                            <td
                                data-label="Batas Selesai"
                                class="text-danger-cell"
                            >
                                <span class="text-danger">
                                    {{
                                        new Date(
                                            tugas.tenggat_waktu,
                                        ).toLocaleString("id-ID")
                                    }}
                                </span>
                            </td>
                            <td data-label="Aksi">
                                <div class="aksi-wrapper-flex">
                                    <router-link
                                        :to="{
                                            name: 'tugas-detail',
                                            params: { id: tugas.id_tugas },
                                        }"
                                        class="btn-action"
                                    >
                                        {{
                                            userRole === "guru"
                                                ? "Periksa Pengumpulan"
                                                : "Buka Tugas"
                                        }}
                                    </router-link>

                                    <button
                                        v-if="userRole === 'guru'"
                                        @click="
                                            konfirmasiHapusTugas(
                                                tugas.id_tugas,
                                                tugas.judul,
                                            )
                                        "
                                        class="btn-delete-task"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="tugas-form-panel" v-if="userRole === 'guru'">
                <h3>Terbitkan Tugas Baru</h3>
                <form @submit.prevent="handleTambahTugas" class="classic-form">
                    <label for="judul">Judul Tugas / Materi:</label>
                    <input
                        type="text"
                        id="judul"
                        v-model="judulTugas"
                        placeholder="Contoh: Membuat CRUD Node.js"
                    />

                    <label for="deskripsi">Instruksi / Deskripsi Tugas:</label>
                    <textarea
                        id="deskripsi"
                        v-model="deskripsiTugas"
                        rows="4"
                        placeholder="Tuliskan petunjuk pengerjaan di sini..."
                    ></textarea>

                    <label for="tenggat">Tenggat Waktu (Deadline):</label>
                    <input
                        type="datetime-local"
                        id="tenggat"
                        v-model="tenggatWaktu"
                    />

                    <button type="submit" class="btn-submit">
                        Kirim ke Kelas
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
.mapel-detail-container {
    font-family: Arial, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 15px;
    box-sizing: border-box;
}
.btn-back {
    background-color: #ffffff;
    border: 1px solid #000000;
    padding: 8px 14px;
    cursor: pointer;
    margin-bottom: 15px;
    font-size: 14px;
}
.btn-back:hover {
    background-color: #f0f0f0;
}
.info-header-box {
    background-color: #fafafa;
    padding: 15px;
    border: 1px dashed #777;
}
.info-header-box h2 {
    margin: 0 0 8px 0;
    font-size: 22px;
}
.info-header-box p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
}
.mapel-grid {
    display: flex;
    gap: 25px;
    margin-top: 15px;
    align-items: flex-start;
}
.tugas-list-panel {
    flex: 2;
    width: 100%;
}
.tugas-form-panel {
    flex: 1;
    width: 100%;
    border: 1px solid #000;
    padding: 15px;
    background-color: #f9f9f9;
    box-sizing: border-box;
}
.data-table {
    width: 100%;
    border-collapse: collapse;
}
.data-table th,
.data-table td {
    border: 1px solid #000;
    padding: 10px 12px;
    font-size: 14px;
    text-align: left;
}
.data-table th {
    background-color: #f0f0f0;
    font-weight: bold;
}
.classic-form label {
    display: block;
    margin-top: 12px;
    font-weight: bold;
    font-size: 13px;
}
.classic-form input[type="text"],
.classic-form input[type="datetime-local"],
.classic-form textarea {
    width: 100%;
    padding: 8px;
    margin-top: 4px;
    border: 1px solid #777;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    font-size: 14px;
}
.btn-submit {
    margin-top: 15px;
    width: 100%;
    padding: 10px;
    background-color: #e1e1e1;
    border: 1px solid #000;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
}
.btn-submit:hover {
    background-color: #ccc;
}
.btn-action {
    color: #0000ee;
    text-decoration: none;
    font-weight: bold;
    display: inline-block;
}
.btn-action:hover {
    text-decoration: underline;
}
.text-danger {
    color: #c00;
    font-weight: bold;
}
.loading-text {
    font-style: italic;
    color: #666;
    padding: 10px 0;
}
.alert-error {
    padding: 10px;
    background-color: #fdd;
    border: 1px solid #f00;
    color: #c00;
    margin-bottom: 15px;
}
.alert-success {
    padding: 10px;
    background-color: #dfd;
    border: 1px solid #0a0;
    color: #060;
    margin-bottom: 15px;
}

.aksi-wrapper-flex {
    display: flex;
    gap: 12px;
    align-items: center;
}

.btn-delete-task {
    background-color: #fee2e2;
    color: #b91c1c;
    border: 1px solid #000;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: bold;
    cursor: pointer;
}

.btn-delete-task:hover {
    background-color: #ef4444;
    color: #ffffff;
}

@media (max-width: 768px) {
    .btn-back {
        width: 100%;
        text-align: center;
        padding: 12px;
    }

    .info-header-box h2 {
        font-size: 18px;
    }

    .info-header-box p .divider {
        display: block;
        height: 5px;
        visibility: hidden;
    }

    .mapel-grid {
        flex-direction: column;
        gap: 20px;
    }

    .data-table thead {
        display: none;
    }

    .data-table tbody tr:not(.empty-row) {
        display: block;
        border: 1px solid #000;
        margin-bottom: 15px;
        background-color: #fff;
        padding: 5px;
    }

    .data-table tbody tr.empty-row td {
        display: block;
        border: 1px solid #000;
        padding: 15px;
    }

    .data-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border: none;
        border-bottom: 1px dotted #ccc;
        padding: 10px 8px;
        text-align: right;
    }

    .data-table td:last-child {
        border-bottom: none;
        justify-content: flex-end;
        background-color: #f9f9f9;
        margin-top: 5px;
        padding: 12px;
    }

    .aksi-wrapper-flex {
        width: 100%;
        justify-content: space-between;
    }

    .data-table td::before {
        content: attr(data-label);
        font-weight: bold;
        color: #555;
        text-align: left;
        font-size: 12px;
        padding-right: 10px;
    }

    .text-danger-cell {
        display: flex !important;
    }
}
</style>
