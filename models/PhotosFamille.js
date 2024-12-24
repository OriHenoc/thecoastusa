const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhotosFamilleSchema = new Schema({
    photoFamille: {
        type: String,
        required: [true, 'La photo est requise']
    },
    visible: {
        type: Boolean,
        default: true
    },
    familleID: {
        type: Schema.Types.ObjectId,
        ref: 'Famille',
        required: [true, 'La famille associée est requise'],
    }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const PhotosFamille = mongoose.model('PhotosFamille', PhotosFamilleSchema);

module.exports = PhotosFamille;