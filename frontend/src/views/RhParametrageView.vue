<script setup>
import { onMounted, ref } from 'vue'
import api from '../api.js'

const typesConges = ref([])
const joursFeries = ref([])
const quotaAbsentsSimultanes = ref(2)
const loading = ref(true)
const successMessage = ref('')

async function charger() {
  loading.value = true
  const response = await api.get('/parametrage')
  typesConges.value = response.data.typesConges
  joursFeries.value = response.data.joursFeries.map((j) => ({
    ...j,
    date: j.date ? j.date.slice(0, 10) : '',
  }))
  quotaAbsentsSimultanes.value = response.data.quotaAbsentsSimultanes
  loading.value = false
}

function ajouterType() {
  typesConges.value.push({ cle: '', label: '', soldeAnnuel: 0 })
}

function supprimerType(index) {
  typesConges.value.splice(index, 1)
}

function ajouterJourFerie() {
  joursFeries.value.push({ date: '', label: '' })
}

function supprimerJourFerie(index) {
  joursFeries.value.splice(index, 1)
}

async function enregistrer() {
  successMessage.value = ''
  await api.put('/parametrage', {
    typesConges: typesConges.value,
    joursFeries: joursFeries.value,
    quotaAbsentsSimultanes: quotaAbsentsSimultanes.value,
  })
  successMessage.value = 'Paramétrage enregistré'
}

onMounted(charger)
</script>

<template>
  <div>
    <h1 class="page-title">Paramétrage</h1>

    <p v-if="loading">Chargement...</p>

    <template v-else>
      <div class="card section">
        <h2>Types de congés</h2>
        <div v-for="(type, index) in typesConges" :key="index" class="ligne">
          <input v-model="type.cle" type="text" placeholder="clé" />
          <input v-model="type.label" type="text" placeholder="Libellé" />
          <input v-model.number="type.soldeAnnuel" type="number" placeholder="Solde annuel" />
          <button class="btn-secondary btn-small" @click="supprimerType(index)">Supprimer</button>
        </div>
        <button class="btn btn-secondary" @click="ajouterType">Ajouter un type</button>
      </div>

      <div class="card section">
        <h2>Jours fériés</h2>
        <div v-for="(jour, index) in joursFeries" :key="index" class="ligne">
          <input v-model="jour.date" type="date" />
          <input v-model="jour.label" type="text" placeholder="Libellé" />
          <button class="btn-secondary btn-small" @click="supprimerJourFerie(index)">Supprimer</button>
        </div>
        <button class="btn btn-secondary" @click="ajouterJourFerie">Ajouter un jour férié</button>
      </div>

      <div class="card section">
        <h2>Quota d'absents simultanés</h2>
        <div class="form-group quota-group">
          <label>Nombre maximum de membres d'une même équipe absents en même temps</label>
          <input v-model.number="quotaAbsentsSimultanes" type="number" min="0" />
        </div>
      </div>

      <button class="btn" @click="enregistrer">Enregistrer le paramétrage</button>
      <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
    </template>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 24px;
}

.section {
  margin-bottom: 24px;
}

.ligne {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.ligne input {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
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
  white-space: nowrap;
}

.success-message {
  color: var(--color-primary);
  font-size: 14px;
  margin-top: 8px;
}

.quota-group {
  max-width: 320px;
}
</style>
