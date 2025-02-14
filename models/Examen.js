const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExamenSchema = new Schema({
    titre: {
        type: String,
        required: [true, 'La reponse est requise']
    },
    formationID: {
        type: Schema.Types.ObjectId,
        ref: 'Formation',
        required: [true, 'La formation associée est requise'],
    },
    questions: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        },
    ]
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Examen = mongoose.model('Examen', ExamenSchema);

module.exports = Examen;