<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
            <div class="modal-header">
                <span class="modal-title">
                    <strong>[{{ tipe.toUpperCase() }}]</strong> {{ judul }}
                </span>
                <button @click="closeModal" class="btn-close-x">X</button>
            </div>

            <div class="modal-body">
                <p>{{ pesan }}</p>
            </div>

            <div class="modal-footer">
                <button
                    v-if="showCancel"
                    @click="closeModal"
                    class="btn-secondary"
                >
                    Batal
                </button>
                <button
                    @click="confirmModal"
                    :class="['btn-primary', `btn-${tipe}`]"
                >
                    {{ teksKonfirmasi }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
    isOpen: { type: Boolean, required: true },
    judul: { type: String, default: "Pemberitahuan" },
    pesan: { type: String, required: true },
    tipe: { type: String, default: "info" },
    teksKonfirmasi: { type: String, default: "Oke Siap" },
    showCancel: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "confirm"]);

const closeModal = () => {
    emit("close");
};

const confirmModal = () => {
    emit("confirm");
    emit("close");
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.modal-box {
    background-color: #ffffff;
    width: 90%;
    max-width: 450px;
    border: 3px solid #1a1a1a;
    box-shadow: 8px 8px 0px #1a1a1a;
    display: flex;
    flex-direction: column;
    animation: popUp 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes popUp {
    from {
        transform: scale(0.9);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 3px solid #1a1a1a;
    background-color: #f4f4f5;
}

.modal-title {
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    color: #1a1a1a;
}

.btn-close-x {
    background: none;
    border: 2px solid transparent;
    font-weight: 900;
    cursor: pointer;
    font-size: 12px;
    padding: 2px 6px;
}
.btn-close-x:hover {
    background-color: #1a1a1a;
    color: #ffffff;
    border-color: #1a1a1a;
}

.modal-body {
    padding: 20px 16px;
    font-size: 14px;
    color: #1a1a1a;
    line-height: 1.5;
    font-weight: 500;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 12px 16px;
    border-top: 2px solid #1a1a1a;
    background-color: #fafafa;
}

button {
    padding: 8px 16px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    border: 2px solid #1a1a1a;
    cursor: pointer;
    transition:
        transform 0.1s ease,
        box-shadow 0.1s ease;
}

.btn-info {
    background-color: #e0f2fe;
}
.btn-sukses {
    background-color: #dcfce7;
}
.btn-error {
    background-color: #fee2e2;
}
.btn-peringatan {
    background-color: #fef9c3;
}

.btn-secondary {
    background-color: #ffffff;
    color: #4b5563;
}

button:hover {
    transform: translate(-1px, -1px);
    box-shadow: 2px 2px 0px #1a1a1a;
}
button:active {
    transform: translate(1px, 1px);
    box-shadow: 0px 0px 0px #1a1a1a;
}
</style>
