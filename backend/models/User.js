const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['employe', 'manager', 'rh', 'admin'],
      default: 'employe',
    },
    telephone: {
      type: String,
      default: '',
    },
    cin: {
      type: String,
      default: '',
    },
    dateEmbauche: {
      type: Date,
      default: null,
    },
    departement: {
      type: String,
      default: '',
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actif: {
      type: Boolean,
      default: true,
    },
    documents: [
      {
        nom: { type: String, required: true },
        url: { type: String, required: true },
        dateUpload: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
