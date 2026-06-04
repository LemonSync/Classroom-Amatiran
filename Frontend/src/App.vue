<script setup>
import Navbar from "./components/Navbar.vue";
</script>

<template>
    <div id="classroom-app">
        <Navbar />

        <main class="app-content">
            <router-view />
        </main>

        <footer class="app-footer">
            <p>
                &copy; 2026 Eres Fran Setia Simbolon - SMKN 9 Web Base
                Application
            </p>
        </footer>
    </div>
</template>

<style>
body {
    margin: 0;
    padding: 0;
    font-family: Arial, sans-serif;
    background-color: #ffffff;
    color: #000000;
}

#classroom-app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.app-content {
    flex: 1;
    max-width: 1200px;
    width: 100%;
    margin: 20px auto;
    padding: 0 20px;
    box-sizing: border-box;
}

.app-footer {
    text-align: center;
    font-size: 12px;
    border-top: 1px solid #cccccc;
    background-color: #fafafa;
    padding: 12px 0;
    margin-top: 20px;
}

.app-footer p {
    margin: 0;
    color: #555555;
}
</style>
