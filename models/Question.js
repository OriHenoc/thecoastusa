const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
    intitule: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['texte', 'commentaire', 'tel', 'email', 'choix_simple', 'choix_multiple', 'selection', 'date', 'nombre', 'oui_non'],
        required: true,
    },
    options: [{
        type: String,
    }],
    obligatoire: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;