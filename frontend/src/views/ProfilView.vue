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

const baseUrl = api.defaults.baseURL.replace('/api', '')

const estRh = computed(() => store.user?.role === 'rh' || store.user?.role === 'admin')
const estSoi = computed(() => utilisateur.value && store.user?.id === utilisateur.value._id)

async function chargerProfil() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/users/' + route.params.id)
    utilisateur.value = response.data
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
    const response = await api.put('/users/' + utilisateur.value._id, {
      nom: utilisateur.value.nom,
      username: utilisateur.value.username,
      telephone: utilisateur.value.telephone,
      cin: utilisateur.value.cin,
      dateEmbauche: utilisateur.value.dateEmbauche,
      departement: utilisateur.value.departement,
    })
    utilisateur.value = response.data
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

watch(() => route.params.id, chargerProfil)
onMounted(chargerProfil)
</script>

<template>
  <div>
    <h1 class="page-title">Fiche employé</h1>

    <p v-if="loading">Chargement...</p>
    <p v-else-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <template v-else-if="utilisateur">
      <div class="card info-card">
        <h2>Informations personnelles</h2>

        <div class="form-row">
          <div class="form-group">
            <label>Nom</label>
            <input v-model="utilisateur.nom" type="text" :disabled="!estRh" />
          </div>
          <div class="form-group">
            <label>Nom d'utilisateur</label>
            <input v-model="utilisateur.username" type="text" :disabled="!estRh" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input :value="utilisateur.email" type="email" disabled />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input v-model="utilisateur.telephone" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>CIN</label>
            <input v-model="utilisateur.cin" type="text" :disabled="!estRh" />
          </div>
          <div class="form-group">
            <label>Date d'embauche</label>
            <input v-model="utilisateur.dateEmbauche" type="date" :disabled="!estRh" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Département</label>
            <input v-model="utilisateur.departement" type="text" :disabled="!estRh" />
          </div>
          <div class="form-group">
            <label>Rôle</label>
            <input :value="utilisateur.role" type="text" disabled />
          </div>
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
              <td>
                <a class="btn-secondary btn-small" :href="baseUrl + doc.url" target="_blank" download>Télécharger</a>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-message">Aucun document.</p>

        <div v-if="estRh || estSoi" class="upload-zone">
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
}

.success-message {
  color: var(--color-primary);
  font-size: 14px;
  margin-top: 8px;
}
</style>
