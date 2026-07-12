<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store.js'
import { getNotifications, marquerLue, marquerToutLu, supprimerNotification } from '../notifications.js'

const router = useRouter()
const ouvert = ref(false)
const racine = ref(null)

const nonLues = computed(() => store.notifications.filter((n) => !n.lu).length)

function fermerSiExterieur(event) {
  if (racine.value && !racine.value.contains(event.target)) {
    ouvert.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', fermerSiExterieur)
  try {
    const response = await getNotifications()
    store.notifications = response.data
  } catch (error) {
    store.notifications = []
  }
})

onUnmounted(() => {
  document.removeEventListener('click', fermerSiExterieur)
})

function toggle() {
  ouvert.value = !ouvert.value
}

function routeCiblee(notification) {
  if (notification.type === 'demande_creee') {
    return store.user?.role === 'manager' ? 'validations' : 'rh-dashboard'
  }
  return 'mes-demandes'
}

async function ouvrirNotification(notification) {
  ouvert.value = false
  if (!notification.lu) {
    notification.lu = true
    try {
      await marquerLue(notification._id)
    } catch (error) {
      notification.lu = false
    }
  }
  router.push({ name: routeCiblee(notification) })
}

async function toutMarquerLu() {
  const precedent = store.notifications.map((n) => n.lu)
  store.notifications.forEach((n) => (n.lu = true))
  try {
    await marquerToutLu()
  } catch (error) {
    store.notifications.forEach((n, i) => (n.lu = precedent[i]))
  }
}

async function supprimer(notification) {
  const index = store.notifications.findIndex((n) => n._id === notification._id)
  if (index === -1) return
  const [retiree] = store.notifications.splice(index, 1)
  try {
    await supprimerNotification(notification._id)
  } catch (error) {
    store.notifications.splice(index, 0, retiree)
  }
}
</script>

<template>
  <div class="notification-bell" ref="racine">
    <button class="bell-btn" @click="toggle">
      <svg class="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span v-if="nonLues" class="badge">{{ nonLues }}</span>
    </button>

    <div v-if="ouvert" class="dropdown">
      <div class="dropdown-header">
        <span>Notifications</span>
        <button v-if="nonLues" class="mark-all" @click="toutMarquerLu">Tout marquer lu</button>
      </div>
      <p v-if="!store.notifications.length" class="empty">Aucune notification</p>
      <div
        v-for="notification in store.notifications"
        :key="notification._id"
        class="notification-item"
        :class="{ unread: !notification.lu }"
        @click="ouvrirNotification(notification)"
      >
        <button class="delete-btn" title="Supprimer" @click.stop="supprimer(notification)">✕</button>
        <p>{{ notification.message }}</p>
        <span class="date">{{ new Date(notification.createdAt).toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-bell {
  position: relative;
}

.bell-btn {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 10px 14px;
  cursor: pointer;
  color: var(--color-text);
}

.bell-icon {
  width: 18px;
  height: 18px;
}

.badge {
  position: absolute;
  top: 4px;
  right: 8px;
  background: #e5484d;
  color: #fff;
  font-size: 11px;
  border-radius: 999px;
  padding: 1px 6px;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 280px;
  max-height: 320px;
  overflow-y: auto;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}

.mark-all {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.empty {
  padding: 16px 12px;
  color: var(--color-text-light);
  font-size: 14px;
}

.notification-item {
  position: relative;
  padding: 10px 32px 10px 12px;
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--color-text-light);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 2px 4px;
  border-radius: var(--radius);
}

.delete-btn:hover {
  color: #e5484d;
  background: var(--color-bg);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: var(--color-bg);
}

.notification-item p {
  margin: 0 0 4px;
  font-size: 14px;
}

.notification-item.unread p {
  font-weight: 600;
}

.notification-item .date {
  font-size: 12px;
  color: var(--color-text-light);
}
</style>
