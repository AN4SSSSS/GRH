<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api.js'
import DatePicker from '../components/DatePicker.vue'
import { theme } from '../theme.js'
import { couleurType } from '../typesConges.js'

const typesConges = ref([])
const mesDemandes = ref([])
const type = ref('')
const dateDebut = ref('')
const dateFin = ref('')
const motif = ref('')
const errorMessage = ref('')
const envoyee = ref(false)
const loading = ref(false)
const router = useRouter()

const aujourdhui = new Date()
const aujourdhuiIso = `${aujourdhui.getFullYear()}-${String(aujourdhui.getMonth() + 1).padStart(2, '0')}-${String(aujourdhui.getDate()).padStart(2, '0')}`

function ajusterHauteur(event) {
  const zone = event.target
  zone.style.height = 'auto'
  zone.style.height = zone.scrollHeight + 'px'
}

function couleurDuType(cle) {
  return couleurType(cle, theme.mode === 'dark')
}

const nbJours = computed(() => {
  if (!dateDebut.value || !dateFin.value) return 0
  const debut = new Date(dateDebut.value)
  const fin = new Date(dateFin.value)
  if (fin < debut) return 0

  let count = 0
  const current = new Date(debut)
  while (current <= fin) {
    const jour = current.getDay()
    if (jour !== 0 && jour !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  return count
})

const periodeFormatee = computed(() => {
  if (!dateDebut.value || !dateFin.value) return null
  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  const debut = new Date(dateDebut.value).toLocaleDateString('fr-FR', options)
  const fin = new Date(dateFin.value).toLocaleDateString('fr-FR', options)
  return debut === fin ? debut : `${debut} → ${fin}`
})

const soldeType = computed(() => typesConges.value.find((t) => t.cle === type.value))

const joursDejaPris = computed(() =>
  mesDemandes.value
    .filter((d) => d.type === type.value && ['en_attente', 'approuvee'].includes(d.statut))
    .reduce((total, d) => total + d.nbJours, 0)
)

const soldeAnnuel = computed(() => soldeType.value?.soldeAnnuel ?? null)

const soldeActuel = computed(() => (soldeAnnuel.value ? soldeAnnuel.value - joursDejaPris.value : null))

const periodeSelectionnee = computed(() => Boolean(dateDebut.value && dateFin.value))

const soldeApresDemande = computed(() => {
  if (!periodeSelectionnee.value || !soldeAnnuel.value) return null
  return soldeActuel.value - nbJours.value
})

const pourcentageMeter = computed(() => {
  if (!soldeAnnuel.value) return 0
  const valeur = soldeApresDemande.value !== null ? soldeApresDemande.value : soldeActuel.value
  return Math.max(0, Math.min(100, (valeur / soldeAnnuel.value) * 100))
})

const severiteMeter = computed(() => {
  if (soldeApresDemande.value === null) return 'accent'
  if (soldeApresDemande.value < 0) return 'danger'
  if (soldeAnnuel.value && soldeApresDemande.value <= soldeAnnuel.value * 0.15) return 'warning'
  return 'accent'
})

const depassement = computed(() => soldeApresDemande.value !== null && soldeApresDemande.value < 0)

async function charger() {
  const [reponseParametrage, reponseDemandes] = await Promise.all([
    api.get('/parametrage'),
    api.get('/demandes'),
  ])
  typesConges.value = reponseParametrage.data.typesConges
  mesDemandes.value = reponseDemandes.data
  if (typesConges.value.length) {
    type.value = typesConges.value[0].cle
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await api.post('/demandes', {
      type: type.value,
      dateDebut: dateDebut.value,
      dateFin: dateFin.value,
      nbJours: nbJours.value,
      motif: motif.value,
    })
    envoyee.value = true
    setTimeout(() => router.push({ name: 'mes-demandes' }), 1600)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Erreur lors de l'envoi"
  } finally {
    loading.value = false
  }
}

onMounted(charger)
</script>

<template>
  <div>
    <h1 class="page-title">Nouvelle demande</h1>

    <div v-if="envoyee" class="card confirmation">
      <svg class="check-icon" viewBox="0 0 52 52">
        <circle class="check-cercle" cx="26" cy="26" r="24" fill="none" />
        <path class="check-trait" fill="none" d="M14 27l7 7 16-16" />
      </svg>
      <h2>Demande envoyée</h2>
      <p>Ta demande de {{ soldeType?.label.toLowerCase() }} a bien été transmise à ton manager.</p>
    </div>

    <div v-else class="grille">
      <form class="card form-card" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Type de congé</label>
          <div class="pills">
            <button
              v-for="t in typesConges"
              :key="t.cle"
              type="button"
              class="pill"
              :class="{ active: type === t.cle }"
              :style="{ '--pill-color': couleurDuType(t.cle) }"
              @click="type = t.cle"
            >
              <span class="pill-dot"></span>
              {{ t.label }}
            </button>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date de début</label>
            <DatePicker v-model="dateDebut" :min="aujourdhuiIso" :range-autre="dateFin" />
          </div>
          <div class="form-group">
            <label>Date de retour</label>
            <DatePicker
              v-model="dateFin"
              :min="dateDebut || aujourdhuiIso"
              :range-autre="dateDebut"
              :disabled="!dateDebut"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="motif">Motif</label>
          <textarea
            id="motif"
            v-model="motif"
            rows="2"
            maxlength="300"
            placeholder="Décris brièvement la raison de ta demande..."
            required
            @input="ajusterHauteur"
          ></textarea>
          <p class="compteur">{{ motif.length }}/300</p>
        </div>

        <button class="btn" type="submit" :disabled="loading || nbJours === 0 || depassement">
          {{ loading ? 'Envoi...' : 'Envoyer la demande' }}
        </button>

        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
      </form>

      <aside class="card apercu">
        <p class="apercu-titre">Aperçu</p>

        <div class="apercu-type" v-if="soldeType">
          <span class="pill-dot" :style="{ '--pill-color': couleurDuType(type) }"></span>
          {{ soldeType.label }}
        </div>

        <p class="apercu-periode">{{ periodeFormatee || 'Choisis une période' }}</p>

        <p class="hero-nombre">{{ nbJours }}</p>
        <p class="hero-label">jour{{ nbJours > 1 ? 's' : '' }} ouvré{{ nbJours > 1 ? 's' : '' }} décompté{{ nbJours > 1 ? 's' : '' }}</p>

        <template v-if="soldeAnnuel">
          <div class="meter-fond">
            <div
              class="meter-remplissage"
              :class="severiteMeter"
              :style="{ width: pourcentageMeter + '%' }"
            ></div>
          </div>
          <div class="meter-legende">
            <span>Solde actuel : <strong>{{ soldeActuel }}</strong></span>
            <span v-if="periodeSelectionnee" :class="{ negatif: depassement }">
              Solde restant : <strong>{{ soldeApresDemande }}</strong>
            </span>
          </div>
          <p v-if="depassement" class="alerte">
            Cette demande dépasse ton solde disponible pour ce type de congé.
          </p>
        </template>
        <p v-else class="apercu-note">Pas de plafond de solde pour ce type de congé.</p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 24px;
}

.grille {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 800px) {
  .grille {
    grid-template-columns: 1fr;
  }
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-card);
  color: var(--color-text);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: border-color 0.15s, transform 0.1s;
}

.pill:hover {
  border-color: var(--pill-color);
}

.pill:active {
  transform: scale(0.97);
}

.pill.active {
  border-color: var(--pill-color);
  background: color-mix(in srgb, var(--pill-color) 12%, var(--color-card));
}

.pill-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--pill-color);
  flex-shrink: 0;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.compteur {
  text-align: right;
  font-size: 12px;
  color: var(--color-text-light);
  margin: 4px 0 0;
}

#motif {
  resize: none;
  overflow: hidden;
}

.apercu {
  position: sticky;
  top: 20px;
  text-align: center;
}

.apercu-titre {
  text-align: left;
  color: var(--color-text-light);
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 16px;
}

.apercu-type {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
}

.apercu-periode {
  color: var(--color-text-light);
  font-size: 13px;
  margin: 0 0 16px;
}

.hero-nombre {
  font-size: 52px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
  line-height: 1;
  transition: color 0.2s;
}

.hero-label {
  color: var(--color-text-light);
  font-size: 13px;
  margin: 4px 0 20px;
}

.meter-fond {
  background: var(--color-bg);
  border-radius: 999px;
  height: 10px;
  overflow: hidden;
}

.meter-remplissage {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease, background 0.25s ease;
  background: var(--color-primary);
}

.meter-remplissage.warning {
  background: #c98a1f;
}

.meter-remplissage.danger {
  background: var(--color-danger);
}

.meter-legende {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-light);
  margin-top: 8px;
}

.meter-legende .negatif strong {
  color: var(--color-danger);
}

.apercu-note {
  color: var(--color-text-light);
  font-size: 13px;
}

.alerte {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--color-danger);
}

.confirmation {
  max-width: 420px;
  margin: 40px auto;
  text-align: center;
  padding: 40px 32px;
}

.confirmation h2 {
  margin: 16px 0 8px;
  color: var(--color-primary);
}

.confirmation p {
  color: var(--color-text-light);
  font-size: 14px;
  margin: 0;
}

.check-icon {
  width: 64px;
  height: 64px;
}

.check-cercle {
  stroke: var(--color-primary);
  stroke-width: 3;
  stroke-dasharray: 151;
  stroke-dashoffset: 151;
  animation: tracer-cercle 0.5s ease forwards;
}

.check-trait {
  stroke: var(--color-primary);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 36;
  stroke-dashoffset: 36;
  animation: tracer-trait 0.3s ease forwards 0.4s;
}

@keyframes tracer-cercle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes tracer-trait {
  to {
    stroke-dashoffset: 0;
  }
}
</style>
