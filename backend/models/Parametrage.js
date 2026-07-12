const mongoose = require('mongoose')

const parametrageSchema = new mongoose.Schema({
  typesConges: [
    {
      cle: { type: String, required: true },
      label: { type: String, required: true },
      soldeAnnuel: { type: Number, required: true },
    },
  ],
  joursFeries: [
    {
      date: { type: Date, required: true },
      label: { type: String, required: true },
    },
  ],
  quotaAbsentsSimultanes: {
    type: Number,
    default: 2,
  },
})

module.exports = mongoose.model('Parametrage', parametrageSchema)
