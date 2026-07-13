<script setup>
import { onMounted, ref, computed } from 'vue'
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
const departement = ref('')
const managerId = ref('')

const managers = computed(() => utilisateurs.value.filter((u) => u.role === 'manager'))

const equipes = computed(() =>
  managers.value.map((manager) => ({
    manager,
    membres: utilisateurs.value.filter((u) => u.managerId === manager._id),
  }))
)

const sansEquipe = computed(() =>
  utilisateurs.value.filter((u) => u.role !== 'manager' && !u.managerId)
)

async function charger() {
  loading.value = true
  const response = await api.get('/users')
  utilisateurs.value = response.data
  loading.value = false
}

async function ajouterEmploye() {
  errorMessage.value = ''
  try {
    await api.post('/users', {
      nom: nom.value,
      username: username.value,
      email: email.value,
      password: password.value,
      role: role.value,
      departement: departement.value,
      managerId: managerId.value || null,
    })
    nom.value = ''
    username.value = ''
    email.value = ''
    password.value = ''
    role.value = 'employe'
    departement.value = ''
    managerId.value = ''
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
    <h1 class="page-title">Employés</h1>

    <div class="card">
      <div class="card-header">
        <h2>Liste des employés</h2>
        <button class="btn" @click="afficherFormulaire = !afficherFormulaire">
          {{ afficherFormulaire ? 'Annuler' : 'Ajouter un employé' }}
        </button>
      </div>

      <form v-if="afficherFormulaire" class="form-ajout" @submit.prevent="ajouterEmploye">
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
        <div class="form-row">
          <div class="form-group">
            <label>Rôle</label>
            <select v-model="role">
              <option value="employe">Employé</option>
              <option value="manager">Manager</option>
              <option value="rh-admin">RH-Admin</option>
            </select>
          </div>
          <div class="form-group">
            <label>Département</label>
            <input v-model="departement" type="text" />
          </div>
          <div class="form-group">
            <label>Manager</label>
            <select v-model="managerId">
              <option value="">Aucun</option>
              <option v-for="manager in managers" :key="manager._id" :value="manager._id">
                {{ manager.nom }}
              </option>
            </select>
          </div>
        </div>
        <button class="btn" type="submit">Créer le compte</button>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>


      <template v-if="loading"></template>
      <template v-else-if="utilisateurs.length">
        <div v-for="groupe in equipes" :key="groupe.manager._id" class="groupe">
          <div class="groupe-header">
            <h3>{{ groupe.manager.nom }}</h3>
            <select
              class="role-select-table"
              :value="groupe.manager.role"
              @change="changerRole(groupe.manager, $event.target.value)"
            >
              <option value="employe">Employé</option>
              <option value="manager">Manager</option>
              <option value="rh-admin">RH-Admin</option>
            </select>
            <RouterLink class="btn-small" :to="'/profil/' + groupe.manager._id">Fiche</RouterLink>
            <button
              class="btn btn-secondary btn-small btn-danger"
              :disabled="groupe.manager._id === store.user?.id"
              @click="supprimer(groupe.manager)"
            >
              Supprimer
            </button>
          </div>

          <table v-if="groupe.membres.length">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Nom d'utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Département</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in groupe.membres" :key="u._id">
                <td>{{ u.nom }}</td>
                <td>{{ u.username }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <select class="role-select-table" :value="u.role" @change="changerRole(u, $event.target.value)">
                    <option value="employe">Employé</option>
                    <option value="manager">Manager</option>
                    <option value="rh-admin">RH-Admin</option>
                  </select>
                </td>
                <td>{{ u.departement }}</td>
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
          <p v-else class="empty-message">Aucun équipier.</p>
        </div>

        <div class="groupe">
          <div class="groupe-header">
            <h3>Sans manager assigné</h3>
          </div>
          <table v-if="sansEquipe.length">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Nom d'utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Département</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in sansEquipe" :key="u._id">
                <td>{{ u.nom }}</td>
                <td>{{ u.username }}</td>
                <td>{{ u.email }}</td>
                <td>
                  <select class="role-select-table" :value="u.role" @change="changerRole(u, $event.target.value)">
                    <option value="employe">Employé</option>
                    <option value="manager">Manager</option>
                    <option value="rh-admin">RH-Admin</option>
                  </select>
                </td>
                <td>{{ u.departement }}</td>
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
          <p v-else class="empty-message">Aucun compte sans manager.</p>
        </div>
      </template>
      <p v-else>Aucun employé.</p>

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

.groupe {
  margin-bottom: 28px;
}

.groupe:last-child {
  margin-bottom: 0;
}

.groupe-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.groupe-header h3 {
  margin: 0;
  font-size: 15px;
}

.badge-manager {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}

.empty-message {
  color: var(--color-text-light);
  font-size: 13px;
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
