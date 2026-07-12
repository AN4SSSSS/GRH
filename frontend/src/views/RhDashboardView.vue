<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '../api.js'

const utilisateurs = ref([])
const demandes = ref([])
const loading = ref(true)

async function charger() {
  loading.value = true
  const [reponseUsers, reponseDemandes] = await Promise.all([
    api.get('/users'),
    api.get('/demandes/all'),
  ])
  utilisateurs.value = reponseUsers.data
  demandes.value = reponseDemandes.data
  loading.value = false
}

const employesActifs = computed(() => utilisateurs.value.filter((u) => u.actif).length)
const enAttente = computed(() => demandes.value.filter((d) => d.statut === 'en_attente').length)
const approuvees = computed(() => demandes.value.filter((d) => d.statut === 'approuvee').length)
const refusees = computed(() => demandes.value.filter((d) => d.statut === 'refusee').length)

const repartitionParType = computed(() => {
  const types = ['paye', 'maladie', 'sans_solde']
  const total = demandes.value.length || 1
  return types.map((type) => {
    const count = demandes.value.filter((d) => d.type === type).length
    return { type, count, pourcentage: Math.round((count / total) * 100) }
  })
})

function exporterCsv() {
  const entetes = ['Employe', 'Departement', 'Type', 'Debut', 'Fin', 'Jours', 'Statut']
  const lignes = demandes.value.map((d) =>
    [
      d.userId?.nom || '',
      d.userId?.departement || '',
      d.type,
      new Date(d.dateDebut).toLocaleDateString(),
      new Date(d.dateFin).toLocaleDateString(),
      d.nbJours,
      d.statut,
    ].join(',')
  )
  const contenu = [entetes.join(','), ...lignes].join('\n')
  const blob = new Blob([contenu], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = 'demandes.csv'
  lien.click()
  URL.revokeObjectURL(url)
}

onMounted(charger)
</script>

<template>
  <div>
    <h1 class="page-title">Tableau de bord RH</h1>

    <p v-if="loading">Chargement...</p>

    <template v-else>
      <div class="cards-grid">
        <div class="card indicateur">
          <p class="label">Employés actifs</p>
          <p class="valeur">{{ employesActifs }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Demandes en attente</p>
          <p class="valeur">{{ enAttente }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Demandes approuvées</p>
          <p class="valeur">{{ approuvees }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Demandes refusées</p>
          <p class="valeur">{{ refusees }}</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Répartition par type de congé</h2>
          <button class="btn btn-secondary" @click="exporterCsv">Exporter en CSV</button>
        </div>

        <div v-for="ligne in repartitionParType" :key="ligne.type" class="barre-ligne">
          <p class="barre-label">{{ ligne.type }} ({{ ligne.count }})</p>
          <div class="barre-fond">
            <div class="barre-remplissage" :style="{ width: ligne.pourcentage + '%' }"></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 24px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.indicateur .label {
  color: var(--color-text-light);
  font-size: 14px;
  margin: 0 0 8px;
}

.indicateur .valeur {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
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

.barre-ligne {
  margin-bottom: 14px;
}

.barre-label {
  margin: 0 0 6px;
  font-size: 14px;
  text-transform: capitalize;
}

.barre-fond {
  background: var(--color-bg);
  border-radius: 999px;
  height: 12px;
  overflow: hidden;
}

.barre-remplissage {
  background: var(--color-primary);
  height: 100%;
  border-radius: 999px;
}
</style>
