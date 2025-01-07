const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionnaireSchema = new Schema({
    titre: {
      type: String,
      required: true,
    },
    categorie: {
      type: String,
      enum: ['famille', 'fille'],
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    ordre: {
      type: Number, // Ordre pour les questionnaires des filles
      default: 1,
    },
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Questionnaire = mongoose.model('Questionnaire', QuestionnaireSchema);

module.exports = Questionnaire;