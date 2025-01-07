const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReponseSchema = new Schema({
    utilisateurID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Utilisateur', // L'utilisateur qui répond (famille ou fille)
        required: true,
    },
    questionnaireID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Questionnaire', // Le questionnaire auquel appartient la question
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
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Reponse = mongoose.model('Reponse', ReponseSchema);

module.exports = Reponse;