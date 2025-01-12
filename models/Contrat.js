const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContratSchema = new Schema({
    contrat: {
        type: String,
        required: false
    },
    utilisateurID: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'La famille associée est requise'],
    },
    isValid: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Contrat = mongoose.model('Contrat', ContratSchema);

module.exports = Contrat;