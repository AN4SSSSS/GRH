require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const demandesRoutes = require('./routes/demandes')
const usersRoutes = require('./routes/users')
const parametrageRoutes = require('./routes/parametrage')
const adminRoutes = require('./routes/admin')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/demandes', demandesRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/parametrage', parametrageRoutes)
app.use('/api/admin', adminRoutes)

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`)
  })
})
