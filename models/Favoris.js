const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FavorisSchema = new Schema({
    familleID: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'La famille associée est requise'],
    },
    filleID: {
        type: Schema.Types.ObjectId,
        ref: 'Utilisateur',
        required: [true, 'La fille associée est requise'],
    }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Favoris = mongoose.model('Favoris', FavorisSchema);

module.exports = Favoris;