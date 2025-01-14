const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExamenSchema = new Schema({
    reponse: {
        type: String,
        required: [true, 'La reponse est requise']
    },
    formationID: {
        type: Schema.Types.ObjectId,
        ref: 'Formation',
        required: [true, 'La formation associée est requise'],
    },
    utilisateurID: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'La fille associée est requise'],
    },
    resultat: {
        type: String,
        enum: ['en_attente', 'reussi'],
        default: "en_attente"
    }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Examen = mongoose.model('Examen', ExamenSchema);

module.exports = Examen;