<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '../api.js'
import { formaterStatut } from '../statuts.js'
import { formaterRole } from '../roles.js'

const stats = ref(null)
const utilisateurs = ref([])
const demandes = ref([])
const joursFeries = ref([])
const loading = ref(true)

async function charger() {
  loading.value = true
  const [reponseStats, reponseUsers, reponseDemandes, reponseParametrage] = await Promise.all([
    api.get('/admin/stats'),
    api.get('/users'),
    api.get('/demandes/all'),
    api.get('/parametrage'),
  ])
  stats.value = reponseStats.data
  utilisateurs.value = reponseUsers.data
  demandes.value = reponseDemandes.data
  joursFeries.value = reponseParametrage.data.joursFeries
  loading.value = false
}

const employesActifs = computed(() => utilisateurs.value.filter((u) => u.actif).length)

const absentsAujourdhui = computed(() => {
  const aujourdhui = new Date().toDateString()
  return demandes.value.filter((d) => {
    if (d.statut !== 'approuvee') return false
    const debut = new Date(new Date(d.dateDebut).toDateString())
    const fin = new Date(new Date(d.dateFin).toDateString())
    const jour = new Date(aujourdhui)
    return jour >= debut && jour <= fin
  }).length
})

const prochainJourFerie = computed(() => {
  const aujourdhui = new Date(new Date().toDateString())
  const prochains = joursFeries.value
    .map((j) => ({ ...j, dateObj: new Date(j.date) }))
    .filter((j) => j.dateObj >= aujourdhui)
    .sort((a, b) => a.dateObj - b.dateObj)
  return prochains[0] || null
})

const comptesParRoleListe = computed(() => {
  if (!stats.value) return []
  const max = Math.max(...Object.values(stats.value.comptesParRole), 1)
  return Object.entries(stats.value.comptesParRole).map(([role, nombre]) => ({
    role,
    nombre,
    pourcentage: Math.round((nombre / max) * 100),
  }))
})

const demandesParStatutListe = computed(() => {
  if (!stats.value) return []
  const max = Math.max(...Object.values(stats.value.demandesParStatut), 1)
  return Object.entries(stats.value.demandesParStatut).map(([statut, nombre]) => ({
    statut,
    nombre,
    pourcentage: Math.round((nombre / max) * 100),
  }))
})

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
    <h1 class="page-title">Tableau de bord RH-Admin</h1>

    <p v-if="loading">Chargement...</p>

    <template v-else-if="stats">
      <div class="cards-grid">
        <div class="card indicateur">
          <p class="label">Comptes au total</p>
          <p class="valeur">{{ stats.totalComptes }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Employés actifs</p>
          <p class="valeur">{{ employesActifs }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Demandes au total</p>
          <p class="valeur">{{ stats.totalDemandes }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Demandes en attente</p>
          <p class="valeur">{{ stats.demandesParStatut?.en_attente ?? 0 }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Absents aujourd'hui</p>
          <p class="valeur">{{ absentsAujourdhui }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Prochain jour férié</p>
          <template v-if="prochainJourFerie">
            <p class="valeur valeur-texte">{{ prochainJourFerie.label }}</p>
            <p class="detail">{{ prochainJourFerie.dateObj.toLocaleDateString('fr-FR') }}</p>
          </template>
          <p v-else class="valeur valeur-texte">Aucun</p>
        </div>
      </div>

      <div class="card">
        <h2>Comptes par rôle</h2>
        <div class="bar-chart">
          <div v-for="ligne in comptesParRoleListe" :key="ligne.role" class="bar-row">
            <span class="bar-label">{{ formaterRole(ligne.role) }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                :class="'bar-fill-' + ligne.role"
                :style="{ width: ligne.pourcentage + '%' }"
              ></div>
            </div>
            <span class="bar-value">{{ ligne.nombre }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Demandes par statut</h2>
        <div class="bar-chart">
          <div v-for="ligne in demandesParStatutListe" :key="ligne.statut" class="bar-row">
            <span class="bar-label">{{ formaterStatut(ligne.statut) }}</span>
            <div class="bar-track">
              <div
                class="bar-fill"
                :class="'bar-fill-' + ligne.statut"
                :style="{ width: ligne.pourcentage + '%' }"
              ></div>
            </div>
            <span class="bar-value">{{ ligne.nombre }}</span>
          </div>
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
  grid-template-columns: repeat(3, 1fr);
  align-items: stretch;
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 900px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }
}

.indicateur {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 112px;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
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

.indicateur .valeur-texte {
  font-size: 18px;
  text-transform: capitalize;
}

.indicateur .detail {
  font-size: 13px;
  color: var(--color-text-light);
  margin: 4px 0 0;
}

h2 {
  margin: 0 0 16px;
}

.card + .card {
  margin-top: 20px;
}

.cards-grid .card + .card {
  margin-top: 0;
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

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 130px;
  flex-shrink: 0;
  font-size: 14px;
  color: var(--color-text);
}

.bar-track {
  flex: 1;
  background: var(--color-bg);
  border-radius: 999px;
  height: 14px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s;
}

.bar-value {
  width: 28px;
  flex-shrink: 0;
  text-align: right;
  font-weight: 600;
  font-size: 14px;
}
</style>
