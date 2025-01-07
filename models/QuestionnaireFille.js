const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionnaireFilleSchema = new Schema({
  filleID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true,
  },
  questionnaireActuel: {
    type: Number,
    default: 1, // Commence par le questionnaire 1
  },
  nbreValides: {
    type: Number,
    default: 0, // Nombre de questionnaires validés
  },
  etat: {
    type: String,
    enum: ['en_cours', 'complet'], // Suivi de progression
    default: 'en_cours',
  },
  historiqueValidations: [
    {
      questionnaireID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Questionnaire',
        required: true,
      },
      dateValidation: {
        type: Date,
      },
    },
  ],
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const QuestionnaireFille = mongoose.model('QuestionnaireFille', QuestionnaireFilleSchema);

module.exports = QuestionnaireFille;