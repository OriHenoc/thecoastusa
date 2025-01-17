const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RdvSchema = new Schema({
    familleID: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'La famille associée est requise'],
    },
    filleID: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'La fille associée est requise'],
    },
    commentaire: {
        type: String,
        required: false
    },
    statut: {
        type: String,
        enum: ['en_attente', 'confirme', 'annule', 'termine'],
        default: 'en_attente',
    }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Rdv = mongoose.model('Rdv', RdvSchema);

module.exports = Rdv;