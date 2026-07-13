<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '../api.js'
import { store } from '../store.js'

const utilisateurs = ref([])
const loading = ref(true)
const errorMessage = ref('')
const afficherFormulaire = ref(false)

const nom = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const role = ref('employe')

async function charger() {
  loading.value = true
  const response = await api.get('/users')
  utilisateurs.value = response.data
  loading.value = false
}

async function ajouterCompte() {
  errorMessage.value = ''
  try {
    await api.post('/users', {
      nom: nom.value,
      username: username.value,
      email: email.value,
      password: password.value,
      role: role.value,
    })
    nom.value = ''
    username.value = ''
    email.value = ''
    password.value = ''
    role.value = 'employe'
    afficherFormulaire.value = false
    await charger()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors de la création'
  }
}

async function changerRole(utilisateur, nouveauRole) {
  errorMessage.value = ''
  try {
    await api.put('/users/' + utilisateur._id, { role: nouveauRole })
    await charger()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors du changement de rôle'
  }
}

async function toggleActif(id) {
  await api.patch('/users/' + id + '/desactiver')
  await charger()
}

async function supprimer(utilisateur) {
  if (!confirm('Supprimer définitivement ce compte (' + utilisateur.nom + ') ?')) return
  errorMessage.value = ''
  try {
    await api.delete('/users/' + utilisateur._id)
    await charger()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors de la suppression'
  }
}

onMounted(charger)
</script>

<template>
  <div>
    <h1 class="page-title">Comptes</h1>

    <div class="card">
      <div class="card-header">
        <h2>Tous les comptes</h2>
        <button class="btn" @click="afficherFormulaire = !afficherFormulaire">
          {{ afficherFormulaire ? 'Annuler' : 'Ajouter un compte' }}
        </button>
      </div>

      <form v-if="afficherFormulaire" class="form-ajout" @submit.prevent="ajouterCompte">
        <div class="form-row">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="nom" type="text" required />
          </div>
          <div class="form-group">
            <label>Nom d'utilisateur</label>
            <input v-model="username" type="text" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input v-model="email" type="email" required />
          </div>
          <div class="form-group">
            <label>Mot de passe</label>
            <input v-model="password" type="password" required />
          </div>
        </div>
        <div class="form-group role-select">
          <label>Rôle</label>
          <select v-model="role">
            <option value="employe">Employé</option>
            <option value="manager">Manager</option>
            <option value="rh">RH</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button class="btn" type="submit">Créer le compte</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>

      <p v-if="loading">Chargement...</p>
      <table v-else-if="utilisateurs.length">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Nom d'utilisateur</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in utilisateurs" :key="u._id">
            <td>{{ u.nom }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>
              <select class="role-select-table" :value="u.role" @change="changerRole(u, $event.target.value)">
                <option value="employe">Employé</option>
                <option value="manager">Manager</option>
                <option value="rh">RH</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td>
              <span class="badge" :class="u.actif ? 'badge-approuvee' : 'badge-refusee'">
                {{ u.actif ? 'Actif' : 'Désactivé' }}
              </span>
            </td>
            <td class="actions">
              <RouterLink class="btn-small" :to="'/profil/' + u._id">Fiche</RouterLink>
              <button class="btn btn-secondary btn-small" @click="toggleActif(u._id)">
                {{ u.actif ? 'Désactiver' : 'Activer' }}
              </button>
              <button
                class="btn btn-secondary btn-small btn-danger"
                :disabled="u._id === store.user?.id"
                @click="supprimer(u)"
              >
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Aucun compte.</p>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.card-header h2 {
  margin: 0;
}

.form-ajout {
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.role-select {
  max-width: 220px;
}

.role-select-table {
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-card);
  color: var(--color-text);
  font-size: 13px;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  display: inline-block;
  padding: 6px 12px;
  border-radius: var(--radius);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background: transparent;
  cursor: pointer;
}

.btn-danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
</style>
