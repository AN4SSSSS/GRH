const express = require('express')
const path = require('path')
const multer = require('multer')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Demande = require('../models/Demande')
const verifyToken = require('../middleware/auth')
const requireRole = require('../middleware/role')

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
})
const upload = multer({ storage })

function peutAccederFiche(req, id) {
  return req.userRole === 'rh-admin' || req.userId === id
}

router.get('/', verifyToken, requireRole('rh-admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ nom: 1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des employés' })
  }
})

router.get('/equipe', verifyToken, requireRole('manager'), async (req, res) => {
  try {
    const membres = await User.find({ managerId: req.userId }).select('-password').sort({ nom: 1 })
    res.json(membres)
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'équipe" })
  }
})

router.post('/', verifyToken, requireRole('rh-admin'), async (req, res) => {
  try {
    const { nom, username, email, password, role, telephone, cin, dateEmbauche, departement, managerId } = req.body

    const userExistant = await User.findOne({ $or: [{ username }, { email }] })
    if (userExistant) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur ou cet email est déjà utilisé' })
    }

    const passwordHache = await bcrypt.hash(password, 10)

    const user = await User.create({
      nom,
      username,
      email,
      password: passwordHache,
      role: role || 'employe',
      telephone,
      cin,
      dateEmbauche: dateEmbauche || null,
      departement,
      managerId: managerId || null,
    })

    const userSansPassword = user.toObject()
    delete userSansPassword.password

    res.status(201).json(userSansPassword)
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de l'employé" })
  }
})

router.get('/:id', verifyToken, async (req, res) => {
  if (!peutAccederFiche(req, req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé' })
  }
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'Employé introuvable' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de la fiche' })
  }
})

router.put('/:id', verifyToken, async (req, res) => {
  if (!peutAccederFiche(req, req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé' })
  }
  try {
    const cible = await User.findById(req.params.id)
    if (!cible) {
      return res.status(404).json({ message: 'Employé introuvable' })
    }

    let champsAutorises
    if (req.userRole === 'rh-admin') {
      champsAutorises = [
        'nom', 'username', 'email', 'password', 'role',
        'telephone', 'cin', 'dateEmbauche', 'departement', 'managerId', 'actif',
      ]
    } else {
      champsAutorises = ['telephone']
    }

    const updates = {}
    for (const champ of champsAutorises) {
      if (req.body[champ] !== undefined) {
        updates[champ] = req.body[champ]
      }
    }

    if (updates.username || updates.email) {
      const conflit = await User.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(updates.username ? [{ username: updates.username }] : []),
          ...(updates.email ? [{ email: updates.email }] : []),
        ],
      })
      if (conflit) {
        return res.status(400).json({ message: "Ce nom d'utilisateur ou cet email est déjà utilisé" })
      }
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10)
    } else {
      delete updates.password
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la fiche' })
  }
})

router.patch('/:id/desactiver', verifyToken, requireRole('rh-admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'Employé introuvable' })
    }
    user.actif = !user.actif
    await user.save()
    res.json({ id: user._id, actif: user.actif })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' })
  }
})

router.delete('/:id', verifyToken, requireRole('rh-admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'Employé introuvable' })
    }
    await Demande.deleteMany({ userId: user._id })
    await user.deleteOne()
    res.json({ message: 'Compte supprimé définitivement' })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du compte' })
  }
})

router.post('/:id/documents', verifyToken, upload.single('fichier'), async (req, res) => {
  if (!peutAccederFiche(req, req.params.id)) {
    return res.status(403).json({ message: 'Accès refusé' })
  }
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'Employé introuvable' })
    }
    user.documents.push({
      nom: req.file.originalname,
      url: '/uploads/' + req.file.filename,
    })
    await user.save()
    res.status(201).json(user.documents)
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'upload du document" })
  }
})

module.exports = router
