const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaiementSchema = new Schema({
    montant: {
        type: Number,
        required: [true, 'Le montant est requis']
    },
    preuve: {
        type: String,
        required: [true, 'La preuve est requise']
    },
    utilisateurID: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'L\'utilisateur associé est requis'],
    },
    moyenID: {
        type: Schema.Types.ObjectId,
        ref: 'MoyenPaiement',
        required: [true, 'Le moyen associé est requis'],
    },
    confirmed: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Paiement = mongoose.model('Paiement', PaiementSchema);

module.exports = Paiement;