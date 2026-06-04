<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
    pesan: {
        type: String,
        required: true,
    },
    tipe: {
        type: String,
        default: "info",
    },
});

const emit = defineEmits(["tutup"]);

const handleClose = () => {
    emit("tutup");
};
</script>

<template>
    <div v-if="pesan" :class="['alert-box', `alert-${tipe}`]">
        <div class="alert-content">
            <span class="alert-icon">
                <strong v-if="tipe === 'error'">[EROR]</strong>
                <strong v-else-if="tipe === 'sukses'">[SUKSES]</strong>
                <strong v-else-if="tipe === 'peringatan'">[PERINGATAN]</strong>
                <strong v-else>[INFO]</strong>
            </span>
            <span class="alert-text">{{ pesan }}</span>
        </div>
        <button
            @click="handleClose"
            class="btn-close-alert"
            title="Tutup Notifikasi"
        >
            X
        </button>
    </div>
</template>

<style scoped>
.alert-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 20px;
    border: 2px solid #1a1a1a;
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    font-size: 14px;
    box-shadow: 4px 4px 0px #1a1a1a;
    box-sizing: border-box;
}

.alert-content {
    display: flex;
    gap: 12px;
    align-items: center;
}

.alert-icon strong {
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 12px;
    display: inline-block;
}

.alert-text {
    line-height: 1.5;
    font-weight: 500;
    color: #1a1a1a;
}

.alert-info {
    background-color: #e0f2fe;
}
.alert-info .alert-icon strong {
    color: #0369a1;
}

.alert-sukses {
    background-color: #dcfce7;
}
.alert-sukses .alert-icon strong {
    color: #15803d;
}

.alert-error {
    background-color: #fee2e2;
}
.alert-error .alert-icon strong {
    color: #b91c1c;
}

.alert-peringatan {
    background-color: #fef9c3;
}
.alert-peringatan .alert-icon strong {
    color: #a16207;
}

.btn-close-alert {
    background-color: transparent;
    color: #1a1a1a;
    border: 2px solid transparent;
    font-weight: 800;
    cursor: pointer;
    padding: 4px 8px;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s ease;
}

.btn-close-alert:hover {
    background-color: #ffffff;
    border-color: #1a1a1a;
    box-shadow: 2px 2px 0px #1a1a1a;
    transform: translate(-1px, -1px);
}

.btn-close-alert:active {
    transform: translate(1px, 1px);
    box-shadow: 0px 0px 0px #1a1a1a;
}
</style>
