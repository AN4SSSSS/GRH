<script setup>
import { onMounted, ref } from 'vue'
import api from '../api.js'
import { formaterStatut } from '../statuts.js'

const stats = ref(null)
const loading = ref(true)

function formatDuree(secondes) {
  const heures = Math.floor(secondes / 3600)
  const minutes = Math.floor((secondes % 3600) / 60)
  return `${heures}h ${minutes}min`
}

async function charger() {
  loading.value = true
  const response = await api.get('/admin/stats')
  stats.value = response.data
  loading.value = false
}

onMounted(charger)
</script>

<template>
  <div>
    <h1 class="page-title">Administration du système</h1>

    <p v-if="loading">Chargement...</p>

    <template v-else-if="stats">
      <div class="cards-grid">
        <div class="card indicateur">
          <p class="label">Comptes au total</p>
          <p class="valeur">{{ stats.totalComptes }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Demandes au total</p>
          <p class="valeur">{{ stats.totalDemandes }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Base de données</p>
          <p class="valeur valeur-texte">{{ stats.mongoStatut }}</p>
          <p class="detail">{{ stats.nomBaseDeDonnees }}</p>
        </div>
        <div class="card indicateur">
          <p class="label">Serveur actif depuis</p>
          <p class="valeur valeur-texte">{{ formatDuree(stats.uptimeSecondes) }}</p>
          <p class="detail">Node {{ stats.versionNode }}</p>
        </div>
      </div>

      <div class="card">
        <h2>Comptes par rôle</h2>
        <table>
          <thead>
            <tr>
              <th>Rôle</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(nombre, role) in stats.comptesParRole" :key="role">
              <td>{{ role }}</td>
              <td>{{ nombre }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <h2>Demandes par statut</h2>
        <table>
          <thead>
            <tr>
              <th>Statut</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(nombre, statut) in stats.demandesParStatut" :key="statut">
              <td>
                <span class="badge" :class="'badge-' + statut">{{ formaterStatut(statut) }}</span>
              </td>
              <td>{{ nombre }}</td>
            </tr>
          </tbody>
        </table>
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
  grid-template-columns: repeat(4, 1fr);
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
</style>
