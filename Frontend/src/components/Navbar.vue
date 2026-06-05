<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import ModalCostume from "./ModalCostume.vue";

const BACKEND_URL = "http://localhost:3000";
const router = useRouter();
const route = useRoute();
const userId = ref(null);
const userNama = ref(null);
const userKelas = ref(null);
const userRole = ref(null);
const isModalOpen = ref(false);
const modalConfig = ref({
    tipe: "info",
    judul: "Pemberitahuan",
    pesan: "",
    teksKonfirmasi: "Oke",
    showCancel: false,
    aksiKonfirmasi: null,
});

const pemicuModal = (
    pesan,
    tipe = "info",
    judul = "Pemberitahuan",
    teksKonfirmasi = "Oke",
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

const updateAuthStatus = () => {
    userId.value = localStorage.getItem("id_user");
    userNama.value = localStorage.getItem("nama_user");
    userKelas.value = localStorage.getItem("kelas_user");
    userRole.value = localStorage.getItem("role_user");
};

watch(
    () => route.path,
    () => {
        updateAuthStatus();
    },
);

onMounted(() => {
    updateAuthStatus();
});

const eksekusiLogout = async () => {
    try {
        const password = localStorage.getItem("pass_user") || "";
        const tokenUser = localStorage.getItem("token_user") || "";

        await fetch(
            `${BACKEND_URL}/auth/logout?method=normal&id=${userId.value}&password=${encodeURIComponent(password)}&role=${userRole.value}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${tokenUser}`
                }
            }
        );
    } catch (error) {
        console.error("Gagal sinkronisasi logout ke server:", error);
    } finally {
        localStorage.clear();

        userId.value = null;
        userRole.value = null;
        userNama.value = null;
        userKelas.value = null;

        router.push({ name: "login" });
    }
};

const handleLogout = () => {
    pemicuModal(
        "Apakah kamu yakin ingin keluar dari platform? Sesi kamu akan segera diakhiri.",
        "peringatan",
        "Konfirmasi Logout",
        "Ya, Keluar",
        true,
        eksekusiLogout,
    );
};
</script>

<template>
    <header class="app-navbar" v-if="userId">
        <div class="nav-container">
            <div class="brand-wrapper">
                <div class="brand">
                    <router-link :to="{ name: 'dashboard' }" class="brand-link">
                        <strong><span>Sembilan</span><span style="color:dodgerblue">Kelas</span></strong>
                    </router-link>
                </div>
                <div class="user-sub-info">
                    <span class="user-name">{{ userNama?.toUpperCase() }}</span>
                    <span v-if="userKelas" class="user-class">{{
                        userKelas
                    }}</span>
                </div>
            </div>

            <nav class="nav-links">
                <router-link :to="{ name: 'home-page' }" class="link-item"
                    >Home</router-link
                >
                <router-link :to="{ name: 'dashboard' }" class="link-item"
                    >Dashboard</router-link
                >
                <button @click="handleLogout" class="btn-logout">Keluar</button>
            </nav>
        </div>
    </header>

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
</template>

<style scoped>
.app-navbar {
    background-color: #ffffff;
    border-bottom: 3px solid #1a1a1a;
    padding: 10px 0;
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    position: sticky;
    top: 0;
    z-index: 100;
}

.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
}

.brand-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.brand-link {
    color: #1a1a1a;
    text-decoration: none;
    font-size: 25px;
    letter-spacing: 0.5px;
    display: inline-block;
}

.brand-link:hover {
    background-color: #fef08a;
    text-decoration: underline;
}

.user-sub-info {
    display: flex;
    gap: 6px;
    align-items: center;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.user-name {
    background-color: #e0f2fe;
    color: #1a1a1a;
    border: 1px solid #1a1a1a;
    padding: 1px 6px;
}

.user-class {
    background-color: #f3e8ff;
    color: #1a1a1a;
    border: 1px solid #1a1a1a;
    padding: 1px 6px;
}

.nav-links {
    display: flex;
    align-items: center;
    font-size: 14px;
    gap: 12px;
}

.link-item {
    color: #1a1a1a;
    text-decoration: underline;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 13px;
    padding: 6px 10px;
}

.link-item:hover {
    background-color: #1a1a1a;
    color: #ffffff;
    text-decoration: none;
}

.btn-logout {
    background-color: #fee2e2;
    color: #b91c1c;
    border: 2px solid #1a1a1a;
    padding: 6px 14px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    box-shadow: 2px 2px 0px #1a1a1a;
    transition:
        transform 0.1s ease,
        box-shadow 0.1s ease;
}

.btn-logout:hover {
    background-color: #fca5a5;
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0px #1a1a1a;
}

.btn-logout:active {
    transform: translate(2px, 2px);
    box-shadow: 0px 0px 0px #1a1a1a;
}
</style>
