const express = require('express')
const Parametrage = require('../models/Parametrage')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/role')

const router = express.Router()

const parametrageParDefaut = {
  typesConges: [
    { cle: 'paye', label: 'Congé payé', soldeAnnuel: 18 },
    { cle: 'maladie', label: 'Congé maladie', soldeAnnuel: 10 },
    { cle: 'sans_solde', label: 'Congé sans solde', soldeAnnuel: 0 },
  ],
  joursFeries: [],
}

async function getOuCreerParametrage() {
  let parametrage = await Parametrage.findOne()
  if (!parametrage) {
    parametrage = await Parametrage.create(parametrageParDefaut)
  }
  return parametrage
}

router.get('/', verifyToken, async (req, res) => {
  try {
    const parametrage = await getOuCreerParametrage()
    res.json(parametrage)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du paramétrage' })
  }
})

router.put('/', verifyToken, requireRole('rh-admin'), async (req, res) => {
  try {
    const { typesConges, joursFeries, quotaAbsentsSimultanes } = req.body
    const parametrage = await getOuCreerParametrage()

    if (typesConges) parametrage.typesConges = typesConges
    if (joursFeries) parametrage.joursFeries = joursFeries
    if (quotaAbsentsSimultanes !== undefined) parametrage.quotaAbsentsSimultanes = quotaAbsentsSimultanes

    await parametrage.save()
    res.json(parametrage)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du paramétrage' })
  }
})

module.exports = router
