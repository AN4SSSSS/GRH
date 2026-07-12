const Notification = require('../models/Notification')

async function notifier(io, { destinataire, type, message, demandeId }) {
  const notification = await Notification.create({ destinataire, type, message, demandeId })
  io.to('user:' + destinataire).emit('notification', notification)
  return notification
}

async function notifierPlusieurs(io, destinataires, { type, message, demandeId }) {
  return Promise.all(
    destinataires.map((destinataire) => notifier(io, { destinataire, type, message, demandeId }))
  )
}

module.exports = { notifier, notifierPlusieurs }
