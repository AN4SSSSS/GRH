<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api.js'
import { store } from '../store.js'

const route = useRoute()
const utilisateur = ref(null)
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const fichier = ref(null)
const uploadLoading = ref(false)
const nouveauMotDePasse = ref('')
const autresUtilisateurs = ref([])

const baseUrl = api.defaults.baseURL.replace('/api', '')

const estRhAdmin = computed(() => store.user?.role === 'rh-admin')
const estSoi = computed(() => utilisateur.value && store.user?.id === utilisateur.value._id)

async function chargerProfil() {
  loading.value = true
  errorMessage.value = ''
  nouveauMotDePasse.value = ''
  try {
    const response = await api.get('/users/' + route.params.id)
    utilisateur.value = response.data
    if (store.user?.role === 'rh-admin') {
      const reponseUsers = await api.get('/users')
      autresUtilisateurs.value = reponseUsers.data.filter((u) => u._id !== utilisateur.value._id)
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors du chargement de la fiche'
  } finally {
    loading.value = false
  }
}

async function enregistrer() {
  successMessage.value = ''
  errorMessage.value = ''
  try {
    const payload = {
      nom: utilisateur.value.nom,
      username: utilisateur.value.username,
      telephone: utilisateur.value.telephone,
      cin: utilisateur.value.cin,
      dateEmbauche: utilisateur.value.dateEmbauche,
      departement: utilisateur.value.departement,
    }
    if (estRhAdmin.value) {
      payload.email = utilisateur.value.email
      payload.role = utilisateur.value.role
      payload.actif = utilisateur.value.actif
      payload.managerId = utilisateur.value.managerId || null
      if (nouveauMotDePasse.value) {
        payload.password = nouveauMotDePasse.value
      }
    }
    const response = await api.put('/users/' + utilisateur.value._id, payload)
    utilisateur.value = response.data
    nouveauMotDePasse.value = ''
    successMessage.value = 'Fiche mise à jour'
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors de la mise à jour'
  }
}

function onFichierChange(event) {
  fichier.value = event.target.files[0] || null
}

async function envoyerDocument() {
  if (!fichier.value) return
  uploadLoading.value = true
  errorMessage.value = ''
  try {
    const formData = new FormData()
    formData.append('fichier', fichier.value)
    const response = await api.post('/users/' + utilisateur.value._id + '/documents', formData)
    utilisateur.value.documents = response.data
    fichier.value = null
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Erreur lors de l'upload"
  } finally {
    uploadLoading.value = false
  }
}

async function supprimerDocument(doc) {
  if (!confirm('Supprimer le document "' + doc.nom + '" ?')) return
  errorMessage.value = ''
  try {
    const response = await api.delete('/users/' + utilisateur.value._id + '/documents/' + doc._id)
    utilisateur.value.documents = response.data
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors de la suppression du document'
  }
}

watch(() => route.params.id, chargerProfil)
onMounted(chargerProfil)
</script>

<template>
  <div>
    <h1 class="page-title">Fiche employé</h1>

    <template v-if="loading"></template>
    <p v-else-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <template v-else-if="utilisateur">
      <div class="card info-card">
        <h2>Informations personnelles</h2>

        <div class="form-row">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="utilisateur.nom" type="text" :disabled="!estRhAdmin" />
          </div>
          <div class="form-group">
            <label>Nom d'utilisateur</label>
            <input v-model="utilisateur.username" type="text" :disabled="!estRhAdmin" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input v-model="utilisateur.email" type="email" :disabled="!estRhAdmin" />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input v-model="utilisateur.telephone" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>CIN</label>
            <input v-model="utilisateur.cin" type="text" :disabled="!estRhAdmin" />
          </div>
          <div class="form-group">
            <label>Date d'embauche</label>
            <input v-model="utilisateur.dateEmbauche" type="date" :disabled="!estRhAdmin" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Département</label>
            <input v-model="utilisateur.departement" type="text" :disabled="!estRhAdmin" />
          </div>
          <div class="form-group">
            <label>Rôle</label>
            <select v-if="estRhAdmin" v-model="utilisateur.role">
              <option value="employe">Employé</option>
              <option value="manager">Manager</option>
              <option value="rh-admin">RH-Admin</option>
            </select>
            <input v-else :value="utilisateur.role" type="text" disabled />
          </div>
        </div>

        <div v-if="estRhAdmin" class="form-row">
          <div class="form-group">
            <label>Manager</label>
            <select v-model="utilisateur.managerId">
              <option :value="null">Aucun</option>
              <option v-for="u in autresUtilisateurs" :key="u._id" :value="u._id">{{ u.nom }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Nouveau mot de passe</label>
            <input v-model="nouveauMotDePasse" type="password" placeholder="Laisser vide pour ne pas changer" />
          </div>
        </div>

        <div v-if="estRhAdmin" class="form-group form-group-inline">
          <label>
            <input v-model="utilisateur.actif" type="checkbox" />
            Compte actif
          </label>
        </div>

        <button class="btn" @click="enregistrer">Enregistrer</button>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>

      <div class="card">
        <h2>Documents</h2>

        <table v-if="utilisateur.documents?.length">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in utilisateur.documents" :key="doc._id">
              <td>{{ doc.nom }}</td>
              <td>{{ new Date(doc.dateUpload).toLocaleDateString() }}</td>
              <td class="actions">
                <a class="btn-secondary btn-small" :href="baseUrl + doc.url" target="_blank" download>Télécharger</a>
                <button class="btn-secondary btn-small btn-danger" @click="supprimerDocument(doc)">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-message">Aucun document.</p>

        <div v-if="estRhAdmin || estSoi" class="upload-zone">
          <input type="file" @change="onFichierChange" />
          <button class="btn btn-secondary" :disabled="!fichier || uploadLoading" @click="envoyerDocument">
            {{ uploadLoading ? 'Envoi...' : 'Ajouter le document' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 24px;
}

.info-card {
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.form-group-inline {
  margin-bottom: 16px;
}

.form-group-inline label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  cursor: pointer;
}

.form-group-inline input[type='checkbox'] {
  width: 18px;
  height: 18px;
  flex: none;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.empty-message {
  color: var(--color-text-light);
}

.upload-zone {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}

.btn-small {
  display: inline-block;
  padding: 6px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.success-message {
  color: var(--color-primary);
  font-size: 14px;
  margin-top: 8px;
}
</style>
