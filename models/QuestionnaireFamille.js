const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionnaireFamilleSchema = new Schema({
  familleID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Utilisateur',
    required: true,
  },
  questionnaireActuel: {
    type: Number,
    default: 1,
  },
  nbreValides: {
    type: Number,
    default: 0,
  },
  etat: {
    type: String,
    enum: ['en_cours', 'en_attente', 'complet'],
    default: 'en_cours',
  }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const QuestionnaireFamille = mongoose.model('QuestionnaireFamille', QuestionnaireFamilleSchema);

module.exports = QuestionnaireFamille;