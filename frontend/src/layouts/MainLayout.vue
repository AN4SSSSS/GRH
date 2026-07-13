<script setup>
import { onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { store, clearSession } from '../store.js'
import { theme, toggleTheme } from '../theme.js'
import { connecterSocket, deconnecterSocket } from '../socket.js'
import NotificationBell from '../components/NotificationBell.vue'

const router = useRouter()

onMounted(() => {
  connecterSocket()
})

function logout() {
  deconnecterSocket()
  clearSession()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>GRH</h2>
        <p v-if="store.user">{{ store.user.nom }}</p>
        <NotificationBell />
      </div>
      <nav class="sidebar-nav">
        <template v-if="store.user?.role === 'employe'">
          <RouterLink to="/dashboard">Tableau de bord</RouterLink>
          <RouterLink to="/demande">Nouvelle demande</RouterLink>
          <RouterLink to="/mes-demandes">Mes demandes</RouterLink>
          <RouterLink to="/calendrier">Calendrier</RouterLink>
          <RouterLink :to="'/profil/' + store.user.id">Mon profil</RouterLink>
        </template>

        <template v-if="store.user?.role === 'manager'">
          <RouterLink to="/validations">Validations</RouterLink>
          <RouterLink to="/soldes-equipe">Soldes équipe</RouterLink>
          <RouterLink to="/calendrier">Calendrier</RouterLink>
          <RouterLink :to="'/profil/' + store.user.id">Mon profil</RouterLink>
        </template>

        <template v-if="store.user?.role === 'rh-admin'">
          <RouterLink to="/rh-admin/dashboard">Tableau de bord</RouterLink>
          <RouterLink to="/rh-admin/employes">Employés</RouterLink>
          <RouterLink to="/rh-admin/parametrage">Paramétrage</RouterLink>
          <RouterLink to="/calendrier">Calendrier</RouterLink>
          <RouterLink :to="'/profil/' + store.user.id">Mon profil</RouterLink>
        </template>
      </nav>
      <button class="theme-toggle" @click="toggleTheme">
        {{ theme.mode === 'dark' ? 'Mode clair' : 'Mode sombre' }}
      </button>
      <button class="btn btn-secondary logout-btn" @click="logout">Déconnexion</button>
    </aside>
    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  overflow-y: auto;
  background: var(--color-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
}

.sidebar-header h2 {
  color: var(--color-primary);
  margin: 0 0 4px;
}

.sidebar-header p {
  color: var(--color-text-light);
  font-size: 14px;
  margin: 0 0 12px;
}

.sidebar-header .notification-bell {
  margin-bottom: 12px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.sidebar-nav a {
  padding: 10px 14px;
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
}

.sidebar-nav a:hover {
  background: var(--color-bg);
}

.sidebar-nav a.router-link-active {
  background: var(--color-primary);
  color: #fff;
}

.theme-toggle {
  width: 100%;
  margin-bottom: 8px;
  justify-content: center;
}

.logout-btn {
  width: 100%;
}

.content {
  flex: 1;
  margin-left: 240px;
  padding: 32px;
}
</style>
