const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    destinataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['demande_creee', 'demande_validee', 'demande_refusee'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    demandeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Demande',
      default: null,
    },
    lu: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Notification', notificationSchema)
