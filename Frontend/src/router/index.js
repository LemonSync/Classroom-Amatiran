import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import DaftarView from "../views/DaftarView.vue";
import DashboardView from "../views/DashboardView.vue";
import MapelDetailView from "../views/MapelDetailView.vue";
import TugasDetailView from "../views/TugasDetailView.vue";
import HomePageView from "../views/HomePageView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/daftar",
      name: "daftar",
      component: DaftarView,
    },
    {
      path: "/",
      name: "home-page",
      component: HomePageView,
      meta: { requiresAuth: true },
    },
    {
      path: "/dash",
      name: "dashboard",
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: "/mapel/:id",
      name: "mapel-detail",
      component: MapelDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: "/tugas/:id",
      name: "tugas-detail",
      component: TugasDetailView,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("id_user") !== null;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "login" });
  } else if ((to.name === "login" || to.name === "daftar") && isAuthenticated) {
    next({ name: "dashboard" });
  } else {
    next();
  }
});

export default router;
