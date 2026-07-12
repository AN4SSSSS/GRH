const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { nom, username, email, password, role } = req.body

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
    })

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: { id: user._id, nom: user.nom, username: user.username, email: user.email, role: user.role },
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création du compte' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' })
    }

    const motDePasseValide = await bcrypt.compare(password, user.password)
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Nom d\'utilisateur ou mot de passe incorrect' })
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    res.json({
      token,
      user: { id: user._id, nom: user.nom, username: user.username, email: user.email, role: user.role },
    })
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la connexion' })
  }
})

module.exports = router
