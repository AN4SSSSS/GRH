<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'
import { setSession } from '../store.js'
import { nomRouteParDefaut } from '../roles.js'
import { theme, toggleTheme } from '../theme.js'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const router = useRouter()

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    const response = await api.post('/auth/login', {
      username: username.value,
      password: password.value,
    })
    setSession(response.data.token, response.data.user)
    router.push({ name: nomRouteParDefaut(response.data.user.role) })
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <button class="theme-toggle login-theme-toggle" @click="toggleTheme">
      {{ theme.mode === 'dark' ? 'Mode clair' : 'Mode sombre' }}
    </button>
    <form class="card login-card" @submit.prevent="handleSubmit">
      <h1>GRH</h1>
      <p class="subtitle">Connexion à votre espace employé</p>

      <div class="form-group">
        <label for="username">Nom d'utilisateur</label>
        <input id="username" v-model="username" type="text" required />
      </div>

      <div class="form-group">
        <label for="password">Mot de passe</label>
        <input id="password" v-model="password" type="password" required />
      </div>

      <button class="btn" type="submit" :disabled="loading">
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.login-theme-toggle {
  position: absolute;
  top: 24px;
  right: 24px;
}

.login-card {
  width: 360px;
}

.login-card h1 {
  color: var(--color-primary);
  margin: 0 0 4px;
}

.subtitle {
  color: var(--color-text-light);
  margin: 0 0 24px;
  font-size: 14px;
}

.btn {
  width: 100%;
}
</style>
