<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  min: { type: String, default: '' },
  rangeAutre: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const racine = ref(null)
const ouvert = ref(false)

function versDate(iso) {
  if (!iso) return null
  const [annee, mois, jour] = iso.split('-').map(Number)
  return new Date(annee, mois - 1, jour)
}

function versIso(date) {
  const annee = date.getFullYear()
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  return `${annee}-${mois}-${jour}`
}

const dateSelectionnee = computed(() => versDate(props.modelValue))
const dateMin = computed(() => versDate(props.min))
const dateAutre = computed(() => versDate(props.rangeAutre))

const moisAffiche = ref(dateSelectionnee.value || new Date())

const joursSemaine = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di']

const libelleAffiche = computed(() => {
  if (!dateSelectionnee.value) return 'Sélectionner une date'
  return dateSelectionnee.value.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
})

const libelleMois = computed(() =>
  moisAffiche.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
)

const cases = computed(() => {
  const annee = moisAffiche.value.getFullYear()
  const mois = moisAffiche.value.getMonth()
  const nbJours = new Date(annee, mois + 1, 0).getDate()
  const premierJourSemaine = new Date(annee, mois, 1).getDay()
  const decalage = premierJourSemaine === 0 ? 6 : premierJourSemaine - 1

  const liste = []
  for (let i = 0; i < decalage; i++) {
    liste.push(null)
  }
  for (let jour = 1; jour <= nbJours; jour++) {
    const date = new Date(annee, mois, jour)
    liste.push(date)
  }
  return liste
})

function estDesactive(date) {
  if (!dateMin.value) return false
  return date < new Date(dateMin.value.toDateString())
}

function estSelectionne(date) {
  return dateSelectionnee.value && date.toDateString() === dateSelectionnee.value.toDateString()
}

function estAujourdhui(date) {
  return date.toDateString() === new Date().toDateString()
}

function estAutreDate(date) {
  return dateAutre.value && date.toDateString() === dateAutre.value.toDateString()
}

function choisir(date) {
  if (estDesactive(date)) return
  emit('update:modelValue', versIso(date))
  ouvert.value = false
}

function moisPrecedent() {
  moisAffiche.value = new Date(moisAffiche.value.getFullYear(), moisAffiche.value.getMonth() - 1, 1)
}

function moisSuivant() {
  moisAffiche.value = new Date(moisAffiche.value.getFullYear(), moisAffiche.value.getMonth() + 1, 1)
}

function toggle() {
  if (props.disabled) return
  ouvert.value = !ouvert.value
  if (ouvert.value) {
    moisAffiche.value = dateSelectionnee.value || dateAutre.value || dateMin.value || new Date()
  }
}

function gererClicExterieur(event) {
  if (racine.value && !racine.value.contains(event.target)) {
    ouvert.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', gererClicExterieur))
onUnmounted(() => document.removeEventListener('mousedown', gererClicExterieur))
</script>

<template>
  <div ref="racine" class="date-picker">
    <button type="button" class="date-trigger" :disabled="disabled" @click="toggle">
      <span :class="{ placeholder: !dateSelectionnee }">
        {{ disabled ? 'Choisis d\'abord la date de début' : libelleAffiche }}
      </span>
      <svg class="icone-calendrier" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.6" />
        <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
    </button>

    <div v-if="ouvert" class="popover">
      <div class="popover-header">
        <button type="button" class="nav-btn" @click="moisPrecedent">‹</button>
        <span class="libelle-mois">{{ libelleMois }}</span>
        <button type="button" class="nav-btn" @click="moisSuivant">›</button>
      </div>

      <div class="grille-entete">
        <span v-for="jour in joursSemaine" :key="jour" class="entete-jour">{{ jour }}</span>
      </div>
      <div class="grille">
        <template v-for="(date, index) in cases" :key="index">
          <span v-if="!date" class="case vide"></span>
          <button
            v-else
            type="button"
            class="case"
            :class="{
              selectionne: estSelectionne(date),
              aujourdhui: estAujourdhui(date),
              'autre-date': estAutreDate(date) && !estSelectionne(date),
            }"
            :disabled="estDesactive(date)"
            @click="choisir(date)"
          >
            {{ date.getDate() }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-picker {
  position: relative;
}

.date-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-card);
  color: var(--color-text);
  cursor: pointer;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.date-trigger:hover {
  border-color: var(--color-primary);
}

.date-trigger:disabled {
  cursor: not-allowed;
  color: var(--color-text-light);
  background: var(--color-bg);
}

.date-trigger:disabled:hover {
  border-color: var(--color-border);
}

.placeholder {
  color: var(--color-text-light);
}

.icone-calendrier {
  width: 16px;
  height: 16px;
  color: var(--color-text-light);
  flex-shrink: 0;
}

.popover {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  width: 260px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 14px;
}

.popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.libelle-mois {
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
}

.nav-btn {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.nav-btn:hover {
  background: var(--color-bg);
}

.grille-entete {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.entete-jour {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-light);
}

.grille {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 2px;
}

.case {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--color-text);
  border-radius: 50%;
  font-size: 13px;
  cursor: pointer;
}

.case.autre-date {
  box-shadow: inset 0 0 0 1.5px var(--color-primary);
}

.case.vide {
  cursor: default;
}

.case:not(.vide):not(:disabled):hover {
  background: var(--color-bg);
}

.case.aujourdhui {
  font-weight: 700;
  color: var(--color-primary);
}

.case.selectionne {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
}

.case:disabled {
  color: var(--color-border);
  cursor: not-allowed;
}
</style>
