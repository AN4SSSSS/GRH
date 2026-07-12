function requireRole(...rolesAutorises) {
  return function (req, res, next) {
    if (!rolesAutorises.includes(req.userRole)) {
      return res.status(403).json({ message: 'Accès refusé pour ce rôle' })
    }
    next()
  }
}

module.exports = requireRole
