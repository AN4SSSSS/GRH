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
const showPassword = ref(false)
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
        <div class="password-field">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
          />
          <button
            type="button"
            class="password-toggle"
            :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            @click="showPassword = !showPassword"
          >
            <svg v-if="showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
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

.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-field input {
  width: 100%;
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--color-text-light);
}

.password-toggle:hover {
  color: var(--color-text);
}
</style>
