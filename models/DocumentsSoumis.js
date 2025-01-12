const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DocumentsSoumisSchema = new Schema({
    reconTravail: {
        type: String,
        required: false
    },
    dernierDiplome: {
        type: String,
        required: false
    },
    certificatResidence: {
        type: String,
        required: false
    },
    casierJudiciaire: {
        type: String,
        required: false
    },
    bilanSante: {
        type: String,
        required: false
    },
    typePieceIdentite: {
        type: String,
        required: false
    },
    pieceIdentite: {
        type: String,
        required: false
    },
    utilisateurID: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'L\'utilisateur associé est requis'],
    }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const DocumentsSoumis = mongoose.model('DocumentsSoumis', DocumentsSoumisSchema);

module.exports = DocumentsSoumis;