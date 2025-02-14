const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RepExamenSchema = new Schema({
    utilisateurID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur', // L'utilisateur qui répond (famille ou fille)
        required: true,
    },
    examenID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examen',
      required: true,
    },
    reponses: [
      {
        questionID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        valeur: {
          type: mongoose.Schema.Types.Mixed, // Peut être un texte, un nombre, etc.
          required: true,
        },
      },
    ],
    statut: {
        type: String,
        enum: ['non_debute', 'en_attente', 'reussi'],
        default: "non_debute"
    },
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const RepExamen = mongoose.model('RepExamen', RepExamenSchema);

module.exports = RepExamen;