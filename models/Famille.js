const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FamilleSchema = new Schema({
    nombreEnfants: {
        type: Number,
        required: [true, 'Le nombre d\'enfants est requis']
    },
    visible: {
        type: Boolean,
        default: true
    },
    etatID: {
        type: Schema.Types.ObjectId,
        ref: 'Etat',
        required: [true, 'Le choix de l\'etat est requis'],
    },
    utilisateurID: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'L\'utilisateur associé est requis'],
    },
    photosFamille: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PhotosFamille',
    }],
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Famille = mongoose.model('Famille', FamilleSchema);

module.exports = Famille;