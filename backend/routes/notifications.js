const express = require('express')
const Notification = require('../models/Notification')
const verifyToken = require('../middleware/auth')

const router = express.Router()

router.get('/', verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ destinataire: req.userId })
      .sort({ createdAt: -1 })
      .limit(50)
    res.json(notifications)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des notifications' })
  }
})

router.patch('/:id/lire', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, destinataire: req.userId })
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' })
    }
    notification.lu = true
    await notification.save()
    res.json(notification)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification' })
  }
})

router.patch('/lire-tout', verifyToken, async (req, res) => {
  try {
    await Notification.updateMany({ destinataire: req.userId, lu: false }, { lu: true })
    res.json({ message: 'Notifications marquées comme lues' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des notifications' })
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, destinataire: req.userId })
    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' })
    }
    res.json({ message: 'Notification supprimée' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la notification' })
  }
})

module.exports = router
