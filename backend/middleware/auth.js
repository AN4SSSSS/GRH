const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Accès refusé, token manquant' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.userId).select('actif')
    if (!user || !user.actif) {
      return res.status(403).json({ message: 'Ce compte a été désactivé' })
    }

    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' })
  }
}

module.exports = verifyToken
