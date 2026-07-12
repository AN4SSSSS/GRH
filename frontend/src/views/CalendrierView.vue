<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api.js'
import { typesConges } from '../typesConges.js'

const demandes = ref([])
const joursFeries = ref([])
const dateAffichee = ref(new Date())

const feriesParDate = computed(() => {
  const map = new Map()
  joursFeries.value.forEach((j) => {
    map.set(new Date(j.date).toDateString(), j.label)
  })
  return map
})

const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const anneeMois = computed(() => ({
  annee: dateAffichee.value.getFullYear(),
  mois: dateAffichee.value.getMonth(),
}))

const nomMois = computed(() =>
  dateAffichee.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
)

const cases = computed(() => {
  const { annee, mois } = anneeMois.value
  const nbJours = new Date(annee, mois + 1, 0).getDate()
  const premierJourSemaine = new Date(annee, mois, 1).getDay()
  const decalage = premierJourSemaine === 0 ? 6 : premierJourSemaine - 1

  const liste = []
  for (let i = 0; i < decalage; i++) {
    liste.push(null)
  }
  for (let jour = 1; jour <= nbJours; jour++) {
    const date = new Date(annee, mois, jour)
    const absences = demandes.value.filter((d) => {
      const debut = new Date(new Date(d.dateDebut).toDateString())
      const fin = new Date(new Date(d.dateFin).toDateString())
      return date >= debut && date <= fin
    })
    const ferie = feriesParDate.value.get(date.toDateString()) || null
    liste.push({ jour, absences, ferie })
  }
  return liste
})

function moisPrecedent() {
  dateAffichee.value = new Date(anneeMois.value.annee, anneeMois.value.mois - 1, 1)
}

function moisSuivant() {
  dateAffichee.value = new Date(anneeMois.value.annee, anneeMois.value.mois + 1, 1)
}

async function chargerCalendrier() {
  const [reponseDemandes, reponseParametrage] = await Promise.all([
    api.get('/demandes/calendrier'),
    api.get('/parametrage'),
  ])
  demandes.value = reponseDemandes.data
  joursFeries.value = reponseParametrage.data.joursFeries
}

onMounted(chargerCalendrier)
</script>

<template>
  <div>
    <h1 class="page-title">Calendrier des absences</h1>

    <div class="card">
      <div class="calendrier-header">
        <button class="btn btn-secondary" @click="moisPrecedent">←</button>
        <h2>{{ nomMois }}</h2>
        <button class="btn btn-secondary" @click="moisSuivant">→</button>
      </div>

      <div class="legende">
        <div class="legende-item" v-for="type in typesConges" :key="type.cle">
          <span class="legende-puce" :class="'absence-' + type.cle"></span>
          {{ type.label }}
        </div>
        <div class="legende-item">
          <span class="legende-puce ferie-puce"></span>
          Jour férié
        </div>
      </div>

      <div class="grille">
        <div v-for="jour in joursSemaine" :key="jour" class="entete-jour">{{ jour }}</div>
        <div
          v-for="(caseJour, index) in cases"
          :key="index"
          class="case-jour"
          :class="{ vide: !caseJour, ferie: caseJour?.ferie }"
        >
          <template v-if="caseJour">
            <p class="numero-jour">{{ caseJour.jour }}</p>
            <p v-if="caseJour.ferie" class="ferie-label" :title="caseJour.ferie">{{ caseJour.ferie }}</p>
            <div
              class="absence"
              :class="'absence-' + absence.type"
              v-for="absence in caseJour.absences"
              :key="absence._id"
            >
              {{ absence.userId?.nom }}
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 24px;
}

.calendrier-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 20px;
}

.calendrier-header h2 {
  margin: 0;
  text-transform: capitalize;
  min-width: 200px;
  text-align: center;
}

.grille {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.entete-jour {
  text-align: center;
  font-weight: 600;
  color: var(--color-text-light);
  font-size: 13px;
  padding-bottom: 8px;
}

.case-jour {
  min-height: 80px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 6px;
}

.case-jour.vide {
  border: none;
}

.numero-jour {
  margin: 0 0 4px;
  font-size: 13px;
  color: var(--color-text-light);
}

.absence {
  border-radius: 6px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 3px;
}

.legende {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 13px;
  color: var(--color-text-light);
}

.legende-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legende-puce {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
</style>
