<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '../api.js'
import { formaterStatut } from '../statuts.js'

const demandes = ref([])
const loading = ref(true)
const filtreStatut = ref('')
const filtreType = ref('')
const errorMessage = ref('')

async function chargerDemandes() {
  loading.value = true
  const response = await api.get('/demandes')
  demandes.value = response.data
  loading.value = false
}

const demandesFiltrees = computed(() =>
  demandes.value.filter((demande) => {
    if (filtreStatut.value && demande.statut !== filtreStatut.value) return false
    if (filtreType.value && demande.type !== filtreType.value) return false
    return true
  })
)

function peutAnnuler(demande) {
  return demande.statut === 'en_attente' || demande.statut === 'approuvee'
}

async function annuler(id) {
  errorMessage.value = ''
  try {
    await api.patch('/demandes/' + id + '/annuler')
    await chargerDemandes()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Erreur lors de l'annulation"
  }
}

onMounted(chargerDemandes)
</script>

<template>
  <div>
    <h1 class="page-title">Mes demandes</h1>

    <div class="card">
      <div class="filtres">
        <div class="form-group">
          <label>Statut</label>
          <select v-model="filtreStatut">
            <option value="">Tous</option>
            <option value="en_attente">En attente</option>
            <option value="approuvee">Approuvée</option>
            <option value="refusee">Refusée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select v-model="filtreType">
            <option value="">Tous</option>
            <option value="paye">Congé payé</option>
            <option value="maladie">Congé maladie</option>
            <option value="sans_solde">Congé sans solde</option>
          </select>
        </div>
      </div>

      <template v-if="loading"></template>
      <table v-else-if="demandesFiltrees.length">
        <thead>
          <tr>
            <th>Type</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Motif</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="demande in demandesFiltrees" :key="demande._id">
            <td>{{ demande.type }}</td>
            <td>{{ new Date(demande.dateDebut).toLocaleDateString() }}</td>
            <td>{{ new Date(demande.dateFin).toLocaleDateString() }}</td>
            <td>{{ demande.nbJours }}</td>
            <td>{{ demande.motif }}</td>
            <td>
              <span class="badge" :class="'badge-' + demande.statut">{{ formaterStatut(demande.statut) }}</span>
            </td>
            <td>
              <button v-if="peutAnnuler(demande)" class="btn-secondary btn-small" @click="annuler(demande._id)">
                Annuler
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Aucune demande pour le moment.</p>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 24px;
}

.filtres {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}

.filtres .form-group {
  width: 220px;
}

.btn-small {
  display: inline-block;
  padding: 6px 12px;
  border-radius: var(--radius);
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}
</style>
