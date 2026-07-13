<script setup>
import { onMounted, ref, computed } from 'vue'
import api from '../api.js'

const membres = ref([])
const demandes = ref([])
const typesConges = ref([])
const loading = ref(true)

async function charger() {
  loading.value = true
  const [reponseMembres, reponseDemandes, reponseParametrage] = await Promise.all([
    api.get('/users/equipe'),
    api.get('/demandes/equipe'),
    api.get('/parametrage'),
  ])
  membres.value = reponseMembres.data
  demandes.value = reponseDemandes.data
  typesConges.value = reponseParametrage.data.typesConges
  loading.value = false
}

const soldesParMembre = computed(() =>
  membres.value.map((membre) => {
    const soldes = typesConges.value.map((type) => {
      const joursPris = demandes.value
        .filter(
          (d) =>
            d.userId?._id === membre._id && d.statut === 'approuvee' && d.type === type.cle
        )
        .reduce((total, d) => total + d.nbJours, 0)
      return { ...type, pris: joursPris, restant: type.soldeAnnuel - joursPris }
    })
    return { membre, soldes }
  })
)

onMounted(charger)
</script>

<template>
  <div>
    <h1 class="page-title">Soldes de l'équipe</h1>

    <div class="card">
      <template v-if="loading"></template>
      <table v-else-if="soldesParMembre.length">
        <thead>
          <tr>
            <th>Employé</th>
            <th v-for="type in typesConges" :key="type.cle">{{ type.label }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ligne in soldesParMembre" :key="ligne.membre._id">
            <td>{{ ligne.membre.nom }}</td>
            <td v-for="solde in ligne.soldes" :key="solde.cle">
              {{ solde.restant }} / {{ solde.soldeAnnuel }} jours
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Aucun membre dans votre équipe.</p>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 24px;
}
</style>
