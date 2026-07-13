<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '../api.js'

const demandes = ref([])
const loading = ref(true)
const errorMessage = ref('')
const demandeRefusId = ref(null)
const commentaireRefus = ref('')

async function charger() {
  loading.value = true
  const response = await api.get('/demandes/equipe')
  demandes.value = response.data
  loading.value = false
}

const demandesEnAttente = computed(() => demandes.value.filter((d) => d.statut === 'en_attente'))

async function valider(id) {
  errorMessage.value = ''
  try {
    await api.patch('/demandes/' + id + '/valider')
    await charger()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors de la validation'
  }
}

function ouvrirRefus(id) {
  demandeRefusId.value = id
  commentaireRefus.value = ''
}

function annulerRefus() {
  demandeRefusId.value = null
  commentaireRefus.value = ''
}

async function confirmerRefus() {
  if (!commentaireRefus.value) return
  errorMessage.value = ''
  try {
    await api.patch('/demandes/' + demandeRefusId.value + '/refuser', {
      commentaire: commentaireRefus.value,
    })
    demandeRefusId.value = null
    await charger()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors du refus'
  }
}

onMounted(charger)
</script>

<template>
  <div>
    <h1 class="page-title">Validations</h1>

    <div class="card">
      <template v-if="loading"></template>
      <table v-else-if="demandesEnAttente.length">
        <thead>
          <tr>
            <th>Employé</th>
            <th>Type</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Motif</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="demande in demandesEnAttente" :key="demande._id">
            <tr>
              <td>{{ demande.userId?.nom }}</td>
              <td>{{ demande.type }}</td>
              <td>{{ new Date(demande.dateDebut).toLocaleDateString() }}</td>
              <td>{{ new Date(demande.dateFin).toLocaleDateString() }}</td>
              <td>{{ demande.nbJours }}</td>
              <td>{{ demande.motif }}</td>
              <td>
                <div v-if="demandeRefusId !== demande._id" class="actions">
                  <button class="btn btn-small" @click="valider(demande._id)">Valider</button>
                  <button class="btn btn-secondary btn-small" @click="ouvrirRefus(demande._id)">Refuser</button>
                </div>
              </td>
            </tr>
            <tr v-if="demandeRefusId === demande._id">
              <td colspan="7">
                <div class="refus-zone">
                  <textarea
                    v-model="commentaireRefus"
                    placeholder="Motif du refus (obligatoire)"
                    rows="2"
                  ></textarea>
                  <button class="btn btn-small" :disabled="!commentaireRefus" @click="confirmerRefus">
                    Confirmer le refus
                  </button>
                  <button class="btn btn-secondary btn-small" @click="annulerRefus">Annuler</button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <p v-else>Aucune demande en attente.</p>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 24px;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
}

.refus-zone {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
}

.refus-zone textarea {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-family: inherit;
}
</style>
