require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const http = require('http')
const jwt = require('jsonwebtoken')
const { Server } = require('socket.io')
const connectDB = require('./config/db')
const User = require('./models/User')
const authRoutes = require('./routes/auth')
const demandesRoutes = require('./routes/demandes')
const usersRoutes = require('./routes/users')
const parametrageRoutes = require('./routes/parametrage')
const adminRoutes = require('./routes/admin')
const notificationsRoutes = require('./routes/notifications')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/demandes', demandesRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/parametrage', parametrageRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/notifications', notificationsRoutes)

const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' },
})

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('actif')
    if (!user || !user.actif) {
      return next(new Error('Ce compte a été désactivé'))
    }
    socket.userId = decoded.userId
    next()
  } catch (error) {
    next(new Error('Token invalide ou expiré'))
  }
})

io.on('connection', (socket) => {
  socket.join('user:' + socket.userId)
})

app.set('io', io)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`)
  })
})
