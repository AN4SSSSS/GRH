const express = require('express')
const mongoose = require('mongoose')
const User = require('../models/User')
const Demande = require('../models/Demande')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/role')

const router = express.Router()

router.get('/stats', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const roles = ['employe', 'manager', 'rh', 'admin']
    const comptesParRole = {}
    for (const role of roles) {
      comptesParRole[role] = await User.countDocuments({ role })
    }

    const statuts = ['en_attente', 'approuvee', 'refusee', 'annulee']
    const demandesParStatut = {}
    for (const statut of statuts) {
      demandesParStatut[statut] = await Demande.countDocuments({ statut })
    }

    const etatsConnexion = ['déconnecté', 'connecté', 'connexion en cours', 'déconnexion en cours']

    res.json({
      totalComptes: await User.countDocuments(),
      comptesParRole,
      totalDemandes: await Demande.countDocuments(),
      demandesParStatut,
      mongoStatut: etatsConnexion[mongoose.connection.readyState],
      nomBaseDeDonnees: mongoose.connection.name,
      uptimeSecondes: Math.floor(process.uptime()),
      versionNode: process.version,
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' })
  }
})

module.exports = router
