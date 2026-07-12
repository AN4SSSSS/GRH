const express = require('express')
const Demande = require('../models/Demande')
const User = require('../models/User')
const Parametrage = require('../models/Parametrage')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/role')
const { notifier, notifierPlusieurs } = require('../services/notificationService')

const router = express.Router()

async function getOuCreerParametrage() {
  let parametrage = await Parametrage.findOne()
  if (!parametrage) {
    parametrage = await Parametrage.create({
      typesConges: [
        { cle: 'paye', label: 'Congé payé', soldeAnnuel: 18 },
        { cle: 'maladie', label: 'Congé maladie', soldeAnnuel: 10 },
        { cle: 'sans_solde', label: 'Congé sans solde', soldeAnnuel: 0 },
      ],
      joursFeries: [],
    })
  }
  return parametrage
}

function periodesSeChevauchent(debut1, fin1, debut2, fin2) {
  return debut1 <= fin2 && debut2 <= fin1
}

function calculerNbJoursOuvres(dateDebut, dateFin) {
  let count = 0
  const current = new Date(dateDebut)
  current.setHours(0, 0, 0, 0)
  const fin = new Date(dateFin)
  fin.setHours(0, 0, 0, 0)
  while (current <= fin) {
    const jour = current.getDay()
    if (jour !== 0 && jour !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  return count
}

router.post('/', verifyToken, async (req, res) => {
  try {
    const { type, dateDebut, dateFin, motif } = req.body

    const debut = new Date(dateDebut)
    const fin = new Date(dateFin)
    if (Number.isNaN(debut.getTime()) || Number.isNaN(fin.getTime()) || fin < debut) {
      return res.status(400).json({ message: 'Période invalide' })
    }

    const nbJours = calculerNbJoursOuvres(debut, fin)
    if (nbJours <= 0) {
      return res.status(400).json({ message: 'La période sélectionnée ne contient aucun jour ouvré' })
    }

    const parametrage = await getOuCreerParametrage()
    const typeConge = parametrage.typesConges.find((t) => t.cle === type)

    if (typeConge && typeConge.soldeAnnuel) {
      const demandesExistantes = await Demande.find({
        userId: req.userId,
        type,
        statut: { $in: ['en_attente', 'approuvee'] },
      })
      const joursDejaPris = demandesExistantes.reduce((total, d) => total + d.nbJours, 0)
      const soldeRestant = typeConge.soldeAnnuel - joursDejaPris

      if (nbJours > soldeRestant) {
        return res.status(400).json({
          message: `Solde insuffisant : il vous reste ${soldeRestant} jour(s) pour ce type de congé`,
        })
      }
    }

    const demande = await Demande.create({
      userId: req.userId,
      type,
      dateDebut,
      dateFin,
      nbJours,
      motif,
    })

    const auteur = await User.findById(req.userId).select('nom managerId')
    const io = req.app.get('io')
    const message = `${auteur.nom} a créé une nouvelle demande de congé`

    if (auteur.managerId) {
      await notifier(io, {
        destinataire: auteur.managerId,
        type: 'demande_creee',
        message,
        demandeId: demande._id,
      })
    } else {
      const rh = await User.find({ role: 'rh' }).select('_id')
      await notifierPlusieurs(io, rh.map((u) => u._id), {
        type: 'demande_creee',
        message,
        demandeId: demande._id,
      })
    }

    res.status(201).json(demande)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la demande' })
  }
})

router.get('/', verifyToken, async (req, res) => {
  try {
    const demandes = await Demande.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(demandes)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes' })
  }
})

router.get('/equipe', verifyToken, requireRole('manager'), async (req, res) => {
  try {
    const membres = await User.find({ managerId: req.userId }).select('_id')
    const idsMembres = membres.map((membre) => membre._id)
    const demandes = await Demande.find({ userId: { $in: idsMembres } })
      .populate('userId', 'nom')
      .sort({ createdAt: -1 })
    res.json(demandes)
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des demandes de l'équipe" })
  }
})

router.get('/all', verifyToken, requireRole('rh', 'admin'), async (req, res) => {
  try {
    const demandes = await Demande.find().populate('userId', 'nom departement').sort({ createdAt: -1 })
    res.json(demandes)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes' })
  }
})

router.get('/calendrier', verifyToken, async (req, res) => {
  try {
    let idsConcernes = []

    if (req.userRole === 'rh' || req.userRole === 'admin') {
      const tousLesUsers = await User.find().select('_id')
      idsConcernes = tousLesUsers.map((u) => u._id)
    } else if (req.userRole === 'manager') {
      const membres = await User.find({ managerId: req.userId }).select('_id')
      idsConcernes = membres.map((u) => u._id)
      idsConcernes.push(req.userId)
    } else {
      const moi = await User.findById(req.userId)
      const collegues = await User.find({ managerId: moi.managerId }).select('_id')
      idsConcernes = collegues.map((u) => u._id)
    }

    const demandes = await Demande.find({
      userId: { $in: idsConcernes },
      statut: 'approuvee',
    }).populate('userId', 'nom')

    res.json(demandes)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du calendrier' })
  }
})

router.patch('/:id/valider', verifyToken, requireRole('manager'), async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id).populate('userId', 'managerId')
    if (!demande) {
      return res.status(404).json({ message: 'Demande introuvable' })
    }
    if (String(demande.userId.managerId) !== String(req.userId)) {
      return res.status(403).json({ message: "Cette demande n'appartient pas à votre équipe" })
    }

    const parametrage = await getOuCreerParametrage()
    const membres = await User.find({ managerId: req.userId }).select('_id')
    const idsMembres = membres.map((membre) => membre._id)

    const demandesApprouveesEquipe = await Demande.find({
      _id: { $ne: demande._id },
      userId: { $in: idsMembres },
      statut: 'approuvee',
    })

    const nbAbsentsEnMemeTemps = demandesApprouveesEquipe.filter((d) =>
      periodesSeChevauchent(demande.dateDebut, demande.dateFin, d.dateDebut, d.dateFin)
    ).length

    if (nbAbsentsEnMemeTemps >= parametrage.quotaAbsentsSimultanes) {
      return res.status(400).json({
        message: `Quota d'absents simultanés atteint (${parametrage.quotaAbsentsSimultanes}) sur cette période`,
      })
    }

    demande.statut = 'approuvee'
    demande.valideParId = req.userId
    await demande.save()

    await notifier(req.app.get('io'), {
      destinataire: demande.userId._id,
      type: 'demande_validee',
      message: 'Votre demande de congé a été approuvée',
      demandeId: demande._id,
    })

    res.json(demande)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la validation de la demande' })
  }
})

router.patch('/:id/refuser', verifyToken, requireRole('manager'), async (req, res) => {
  try {
    const { commentaire } = req.body
    if (!commentaire) {
      return res.status(400).json({ message: 'Un commentaire est obligatoire en cas de refus' })
    }

    const demande = await Demande.findById(req.params.id).populate('userId', 'managerId')
    if (!demande) {
      return res.status(404).json({ message: 'Demande introuvable' })
    }
    if (String(demande.userId.managerId) !== String(req.userId)) {
      return res.status(403).json({ message: "Cette demande n'appartient pas à votre équipe" })
    }

    demande.statut = 'refusee'
    demande.commentaire = commentaire
    demande.valideParId = req.userId
    await demande.save()

    await notifier(req.app.get('io'), {
      destinataire: demande.userId._id,
      type: 'demande_refusee',
      message: `Votre demande de congé a été refusée : ${commentaire}`,
      demandeId: demande._id,
    })

    res.json(demande)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du refus de la demande' })
  }
})

router.patch('/:id/annuler', verifyToken, async (req, res) => {
  try {
    const demande = await Demande.findById(req.params.id)
    if (!demande) {
      return res.status(404).json({ message: 'Demande introuvable' })
    }
    if (String(demande.userId) !== String(req.userId)) {
      return res.status(403).json({ message: "Cette demande ne vous appartient pas" })
    }
    if (!['en_attente', 'approuvee'].includes(demande.statut)) {
      return res.status(400).json({ message: 'Cette demande ne peut plus être annulée' })
    }

    demande.statut = 'annulee'
    await demande.save()

    res.json(demande)
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'annulation de la demande" })
  }
})

module.exports = router
