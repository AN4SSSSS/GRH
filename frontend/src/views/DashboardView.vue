<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api.js'
import { store } from '../store.js'
import { formaterStatut } from '../statuts.js'

const typesConges = ref([])

const soldes = computed(() =>
  typesConges.value.map((type) => {
    const joursPris = store.demandes
      .filter((d) => d.type === type.cle && d.statut === 'approuvee')
      .reduce((total, d) => total + d.nbJours, 0)
    return {
      ...type,
      pris: joursPris,
      illimite: !type.soldeAnnuel,
      restant: type.soldeAnnuel - joursPris,
    }
  })
)

const demandesRecentes = computed(() => store.demandes.slice(0, 5))

async function chargerDemandes() {
  const [reponseParametrage, reponseDemandes] = await Promise.all([
    api.get('/parametrage'),
    api.get('/demandes'),
  ])
  typesConges.value = reponseParametrage.data.typesConges
  store.demandes = reponseDemandes.data
}

onMounted(chargerDemandes)
</script>

<template>
  <div>
    <h1 class="page-title">Tableau de bord</h1>

    <div class="cards-grid">
      <div v-for="type in soldes" :key="type.cle" class="card solde-card">
        <p class="solde-label">{{ type.label }}</p>
        <p class="solde-valeur" v-if="!type.illimite">{{ type.restant }} <span>jours restants</span></p>
        <p class="solde-valeur" v-else><span>Illimité</span></p>
        <p class="solde-detail" v-if="!type.illimite">{{ type.pris }} jours pris sur {{ type.soldeAnnuel }}</p>
        <p class="solde-detail" v-else>{{ type.pris }} jours pris</p>
      </div>
    </div>

    <div class="card">
      <h2>Demandes récentes</h2>
      <table v-if="demandesRecentes.length">
        <thead>
          <tr>
            <th>Type</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Jours</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="demande in demandesRecentes" :key="demande._id">
            <td>{{ demande.type }}</td>
            <td>{{ new Date(demande.dateDebut).toLocaleDateString() }}</td>
            <td>{{ new Date(demande.dateFin).toLocaleDateString() }}</td>
            <td>{{ demande.nbJours }}</td>
            <td>
              <span class="badge" :class="'badge-' + demande.statut">{{ formaterStatut(demande.statut) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty-message">Aucune demande pour le moment.</p>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 24px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.solde-label {
  color: var(--color-text-light);
  font-size: 14px;
  margin: 0 0 8px;
}

.solde-valeur {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 4px;
}

.solde-valeur span {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-light);
}

.solde-detail {
  font-size: 13px;
  color: var(--color-text-light);
  margin: 0;
}

.empty-message {
  color: var(--color-text-light);
}
</style>
