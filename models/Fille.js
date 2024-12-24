const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FilleSchema = new Schema({
    biographie: {
        type: String
    },
    experience: {
        type: String
    },
    langues: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Langue',
    }],
    visible: {
        type: Boolean,
        default: true
    },
    utilisateurID: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'L\'utilisateur associé est requis'],
    },
    videoDePresentation: {
        type: String
    },
    photosFille: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'photosFille',
    }],
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Fille = mongoose.model('Fille', FilleSchema);

module.exports = Fille;