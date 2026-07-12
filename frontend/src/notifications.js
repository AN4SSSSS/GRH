import api from './api.js'

function getNotifications() {
  return api.get('/notifications')
}

function marquerLue(id) {
  return api.patch(`/notifications/${id}/lire`)
}

function marquerToutLu() {
  return api.patch('/notifications/lire-tout')
}

function supprimerNotification(id) {
  return api.delete(`/notifications/${id}`)
}

export { getNotifications, marquerLue, marquerToutLu, supprimerNotification }
