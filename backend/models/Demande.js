const mongoose = require('mongoose')

const demandeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['paye', 'maladie', 'sans_solde'],
      required: true,
    },
    dateDebut: {
      type: Date,
      required: true,
    },
    dateFin: {
      type: Date,
      required: true,
    },
    nbJours: {
      type: Number,
      required: true,
    },
    motif: {
      type: String,
      required: true,
    },
    statut: {
      type: String,
      enum: ['en_attente', 'approuvee', 'refusee', 'annulee'],
      default: 'en_attente',
    },
    commentaire: {
      type: String,
      default: '',
    },
    valideParId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Demande', demandeSchema)
