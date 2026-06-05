<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ModalCostume from "../components/ModalCostume.vue";

const BACKEND_URL = "https://sembilan-kelas-backend.vercel.app";
const route = useRoute();
const router = useRouter();
const idTugas = route.params.id;
const userId = localStorage.getItem("id_user");
const userRole = localStorage.getItem("role_user");
const tokenUser = localStorage.getItem("token_user");

const dataTugas = ref(null);
const listPengumpulanGuru = ref([]);
const dataSubmitSiswa = ref(null);
const filePdf = ref(null);
const isLoading = ref(false);
const isModalOpen = ref(false);
const modalConfig = ref({
    tipe: "info",
    judul: "Pemberitahuan",
    pesan: "",
    teksKonfirmasi: "Oke Siap",
    showCancel: false,
    aksiKonfirmasi: null,
});

const pemicuModal = (
    pesan,
    tipe = "info",
    judul = "Pemberitahuan",
    teksKonfirmasi = "Oke Siap",
    showCancel = false,
    aksi = null,
) => {
    modalConfig.value = {
        tipe,
        judul,
        pesan,
        teksKonfirmasi,
        showCancel,
        aksiKonfirmasi: aksi,
    };
    isModalOpen.value = true;
};

const handleModalConfirm = () => {
    if (modalConfig.value.aksiKonfirmasi) {
        modalConfig.value.aksiKonfirmasi();
    }
    isModalOpen.value = false;
};

const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
        if (selectedFile.type !== "application/pdf") {
            pemicuModal(
                "Format berkas harus berupa PDF!",
                "error",
                "Format Salah",
            );
            filePdf.value = null;
            event.target.value = "";
            return;
        }
        filePdf.value = selectedFile;
    }
};

const fetchDetailTugas = async () => {
    isLoading.value = true;

    try {
        const responseTugas = await fetch(
            `${BACKEND_URL}/tugas/detail/${idTugas}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${tokenUser}`
                }
            }
        );
        const resultTugas = await responseTugas.json();

        if (resultTugas.success) {
            dataTugas.value = resultTugas.data;
        } else {
            pemicuModal(
                resultTugas.message || "Gagal memuat detail tugas",
                "error",
                "Gagal Memuat",
            );
            return;
        }

        if (userRole === "guru") {
            const responseGuru = await fetch(
                `${BACKEND_URL}/pengumpulan/tugas/${idTugas}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${tokenUser}`
                    }
                }
            );
            const resultGuru = await responseGuru.json();
            if (resultGuru.success) {
                listPengumpulanGuru.value = resultGuru.data;
            }
        } else if (userRole === "siswa") {
            const responseSiswa = await fetch(
                `${BACKEND_URL}/pengumpulan/tugas/${idTugas}/siswa/${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${tokenUser}`
                    }
                }
            );
            const resultSiswa = await responseSiswa.json();
            if (resultSiswa.success && resultSiswa.data) {
                dataSubmitSiswa.value = resultSiswa.data;
            }
        }
    } catch (error) {
        pemicuModal(
            "Koneksi API bermasalah: " + error.message,
            "error",
            "Koneksi Bermasalah",
        );
    } finally {
        isLoading.value = false;
    }
};

const eksekusiKumpulTugas = async () => {
    try {
        isLoading.value = true;

        const formData = new FormData();
        formData.append("id_tugas", idTugas);
        formData.append("id_siswa", userId);
        formData.append("pdf_tugas", filePdf.value);

        const response = await fetch(`${BACKEND_URL}/pengumpulan/submit`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${tokenUser}`
            },
            body: formData,
        });

        const result = await response.json();
        if (result.success) {
            pemicuModal(
                result.message || "Tugas Anda berhasil dikirim!",
                "sukses",
                "Berhasil dikirim",
            );
            filePdf.value = null;
            await fetchDetailTugas();
        } else {
            pemicuModal(
                result.message || "Gagal mengirimkan tugas",
                "error",
                "Pengiriman Gagal",
            );
        }
    } catch (error) {
        pemicuModal(
            "Sistem eror saat mengirim: " + error.message,
            "error",
            "Sistem Error",
        );
    } finally {
        isLoading.value = false;
    }
};

const handleKumpulTugas = () => {
    if (!filePdf.value) {
        pemicuModal(
            "Silakan pilih berkas PDF tugas Anda terlebih dahulu!",
            "peringatan",
            "Berkas Kosong",
        );
        return;
    }

    pemicuModal(
        "Kirim berkas PDF sekarang? Sistem akan mencatat waktu submit Anda secara presisi.",
        "peringatan",
        "Konfirmasi Kirim Tugas",
        "Ya, Kirim",
        true,
        eksekusiKumpulTugas,
    );
};

onMounted(() => {
    fetchDetailTugas();
});
</script>

<template>
    <div class="tugas-detail-container">
        <button @click="router.back()" class="btn-back">&larr; Kembali</button>

        <div v-if="dataTugas" class="tugas-header-box">
            <span class="badge-mapel">{{ dataTugas.nama_mapel }}</span>
            <h2>Materi: {{ dataTugas.judul }}</h2>
            <p class="deadline-text">
                Batas Pengumpulan:
                <strong>{{
                    new Date(dataTugas.tenggat_waktu).toLocaleString("id-ID")
                }}</strong>
            </p>
            <div class="deskripsi-box">
                <strong>Instruksi Tugas:</strong>
                <p class="text-isi">
                    {{
                        dataTugas.deskripsi ||
                        "Tidak ada instruksi tertulis khusus."
                    }}
                </p>
            </div>
        </div>

        <hr />

        <div v-if="isLoading" class="loading-text">
            Sedang memproses data lembar kerja...
        </div>

        <div v-if="userRole === 'siswa' && !isLoading" class="siswa-work-panel">
            <h3>Lembar Pengumpulan Tugas Anda</h3>

            <div class="form-container-box">
                <form @submit.prevent="handleKumpulTugas">
                    <label for="file_pdf"
                        >Unggah Berkas Lembar Jawaban (Format .PDF
                        wajib):</label
                    >
                    <input
                        type="file"
                        id="file_pdf"
                        accept="application/pdf"
                        @change="handleFileChange"
                        :disabled="dataSubmitSiswa !== null"
                        style="display: block; margin: 15px 0; padding: 10px"
                    />

                    <button
                        v-if="!dataSubmitSiswa"
                        type="submit"
                        class="btn-submit-tugas"
                    >
                        Unggah Tugas Sekarang
                    </button>
                </form>
            </div>

            <div v-if="dataSubmitSiswa" class="status-submission-box">
                <h4>Informasi Pengumpulan Anda:</h4>
                <div class="responsive-info-table">
                    <table class="info-table">
                        <tbody>
                            <tr>
                                <td>File Anda</td>
                                <td>
                                    <a
                                        :href="dataSubmitSiswa.file_atau_teks"
                                        target="_blank"
                                        class="link-external"
                                    >
                                        Buka Lembar Jawaban PDF &rarr;
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td>Waktu Submit</td>
                                <td>
                                    {{
                                        new Date(
                                            dataSubmitSiswa.waktu_submit,
                                        ).toLocaleString("id-ID")
                                    }}
                                </td>
                            </tr>
                            <tr>
                                <td>Status Ketepatan</td>
                                <td>
                                    <span
                                        :class="
                                            dataSubmitSiswa.status_terlambat ===
                                            1
                                                ? 'badge-late'
                                                : 'badge-ontime'
                                        "
                                    >
                                        {{
                                            dataSubmitSiswa.status_terlambat ===
                                            1
                                                ? "TERLAMBAT"
                                                : "TEPAT WAKTU"
                                        }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="note-lock">
                    *Tugas telah terkunci di server karena sudah dikumpulkan.
                </p>
            </div>
        </div>

        <div v-if="userRole === 'guru' && !isLoading" class="guru-review-panel">
            <h3>Daftar Hasil Pengumpulan Siswa</h3>
            <div class="responsive-table">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Siswa</th>
                            <th>Kelas</th>
                            <th>Berkas Dokumen Tugas</th>
                            <th>Waktu Mengumpulkan</th>
                            <th>Status Ketepatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-if="listPengumpulanGuru.length === 0"
                            class="empty-row"
                        >
                            <td
                                colspan="6"
                                style="text-align: center; font-style: italic"
                            >
                                Belum ada siswa yang mengumpulkan tugas ini.
                            </td>
                        </tr>
                        <tr
                            v-for="(submit, index) in listPengumpulanGuru"
                            :key="submit.id_pengumpulan"
                        >
                            <td data-label="No">{{ index + 1 }}</td>
                            <td data-label="Nama Siswa">
                                <strong>{{ submit.nama_siswa }}</strong>
                            </td>
                            <td data-label="Kelas">{{ submit.kelas }}</td>
                            <td data-label="Berkas Dokumen Tugas">
                                <a
                                    :href="submit.file_atau_teks"
                                    target="_blank"
                                    class="link-external"
                                >
                                    Lihat PDF Siswa &rarr;
                                </a>
                            </td>
                            <td data-label="Waktu Mengumpulkan">
                                {{
                                    new Date(
                                        submit.waktu_submit,
                                    ).toLocaleString("id-ID")
                                }}
                            </td>
                            <td data-label="Status Ketepatan">
                                <span
                                    :class="
                                        submit.status_terlambat === 1
                                            ? 'badge-late'
                                            : 'badge-ontime'
                                    "
                                >
                                    {{
                                        submit.status_terlambat === 1
                                            ? "TERLAMBAT"
                                            : "TEPAT WAKTU"
                                    }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
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
.tugas-detail-container {
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    color: #1a1a1a;
    max-width: 950px;
    margin: 30px auto;
    padding: 28px;
    background-color: #ffffff;
    border: 3px solid #1a1a1a;
    box-shadow: 6px 6px 0px #1a1a1a;
    box-sizing: border-box;
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

.tugas-header-box {
    background-color: #f4f4f5;
    border: 2px solid #1a1a1a;
    padding: 24px;
    margin-top: 5px;
    box-shadow: 4px 4px 0px #1a1a1a;
}

.badge-mapel {
    background-color: #1a1a1a;
    color: #ffffff;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-block;
}

.tugas-header-box h2 {
    margin: 14px 0 8px 0;
    color: #1a1a1a;
    font-size: 24px;
    font-weight: 800;
}

.deadline-text {
    margin: 0 0 20px 0;
    font-size: 14px;
    color: #4b5563;
}

.deadline-text strong {
    color: #000000;
    background-color: #fee2e2;
    padding: 2px 6px;
    border: 1px solid #1a1a1a;
    display: inline-block;
}

.deskripsi-box {
    background-color: #ffffff;
    border: 2px dashed #1a1a1a;
    padding: 16px;
}

.deskripsi-box strong {
    color: #1a1a1a;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: block;
    margin-bottom: 6px;
}

.text-isi {
    margin: 0;
    white-space: pre-line;
    font-size: 14px;
    color: #374151;
    line-height: 1.6;
}

hr {
    border: none;
    border-top: 3px solid #1a1a1a;
    margin: 32px 0;
}

.siswa-work-panel h3,
.guru-review-panel h3 {
    font-size: 18px;
    color: #1a1a1a;
    margin-bottom: 16px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.form-container-box {
    background-color: #e0f2fe;
    border: 2px solid #1a1a1a;
    padding: 20px;
    box-shadow: 4px 4px 0px #1a1a1a;
}

.form-container-box label {
    display: block;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 12px;
    font-size: 14px;
}

.form-container-box input[type="file"] {
    width: 100%;
    padding: 12px !important;
    background-color: #ffffff;
    border: 2px solid #1a1a1a !important;
    color: #1a1a1a;
    font-weight: 600;
    cursor: pointer;
    box-sizing: border-box;
}

.form-container-box input[type="file"]:hover:not(:disabled) {
    background-color: #f9fafb;
}

.form-container-box input[type="file"]:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
}

.btn-submit-tugas {
    margin-top: 16px;
    padding: 10px 20px;
    background-color: #1a1a1a;
    color: #ffffff;
    border: 2px solid #1a1a1a;
    cursor: pointer;
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    transition: all 0.1s ease;
    box-shadow: 3px 3px 0px #ffffff;
}

.btn-submit-tugas:hover {
    background-color: #ffffff;
    color: #1a1a1a;
    box-shadow: 3px 3px 0px #1a1a1a;
    transform: translate(-3px, -3px);
}

.status-submission-box {
    margin-top: 24px;
    background-color: #ffffff;
    border: 2px solid #1a1a1a;
    padding: 20px;
    box-shadow: 4px 4px 0px #1a1a1a;
}

.status-submission-box h4 {
    margin: 0 0 14px 0;
    color: #1a1a1a;
    font-size: 15px;
    font-weight: 700;
}

.info-table {
    width: 100%;
    border-collapse: collapse;
}

.info-table td {
    padding: 10px 12px;
    font-size: 14px;
    color: #1a1a1a;
    border: 2px solid #1a1a1a;
}

.info-table td:first-child {
    font-weight: 700;
    width: 180px;
    background-color: #f3e8ff;
}

.note-lock {
    font-size: 12px;
    color: #dc2626;
    font-weight: 600;
    margin: 12px 0 0 0;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    border: 3px solid #1a1a1a;
    box-shadow: 5px 5px 0px #1a1a1a;
}

.data-table th,
.data-table td {
    padding: 12px 14px;
    font-size: 14px;
    text-align: left;
    border: 1px solid #1a1a1a;
    color: #1a1a1a;
}

.data-table th {
    background-color: #f3e8ff;
    font-weight: 700;
    text-transform: uppercase;
    border-bottom: 2px solid #1a1a1a;
}

.data-table tbody tr {
    background-color: #ffffff;
}

.data-table tbody tr:hover {
    background-color: #fef08a;
}

.badge-late {
    background-color: #fee2e2;
    color: #b91c1c;
    border: 1px solid #1a1a1a;
    padding: 3px 8px;
    font-weight: 700;
    font-size: 11px;
    display: inline-block;
}

.badge-ontime {
    background-color: #dcfce7;
    color: #15803d;
    border: 1px solid #1a1a1a;
    padding: 3px 8px;
    font-weight: 700;
    font-size: 11px;
    display: inline-block;
}

.link-external {
    color: #1a1a1a;
    font-weight: 700;
    text-decoration: underline;
    font-size: 13px;
}

.link-external:hover {
    background-color: #1a1a1a;
    color: #ffffff;
}

.loading-text {
    font-weight: 700;
    color: #1a1a1a;
    padding: 12px;
    background-color: #fef08a;
    border: 2px solid #1a1a1a;
    text-align: center;
}

.alert-error {
    padding: 14px;
    background-color: #fee2e2;
    border: 2px solid #1a1a1a;
    color: #b91c1c;
    font-weight: 600;
    margin-bottom: 20px;
    box-shadow: 3px 3px 0px #1a1a1a;
}

.alert-success {
    padding: 14px;
    background-color: #dcfce7;
    border: 2px solid #1a1a1a;
    color: #15803d;
    font-weight: 600;
    margin-bottom: 20px;
    box-shadow: 3px 3px 0px #1a1a1a;
}

@media (max-width: 768px) {
    .tugas-detail-container {
        margin: 15px 10px;
        padding: 16px;
        border-width: 2px;
        box-shadow: 4px 4px 0px #1a1a1a;
    }

    .btn-back {
        width: 100%;
        text-align: center;
        padding: 12px;
        box-sizing: border-box;
    }

    .tugas-header-box {
        padding: 16px;
    }

    .tugas-header-box h2 {
        font-size: 20px;
    }

    .info-table td {
        display: block;
        width: 100% !important;
        box-sizing: border-box;
    }

    .info-table tr td:first-child {
        background-color: #f3e8ff;
        border-bottom: none;
        font-size: 12px;
        text-transform: uppercase;
        padding: 6px 12px;
    }

    .info-table tr td:last-child {
        border-top: none;
        padding-bottom: 14px;
    }

    .responsive-table {
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
}
</style>
