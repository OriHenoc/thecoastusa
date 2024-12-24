const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhotosFilleSchema = new Schema({
    photoFille: {
        type: String,
        required: [true, 'La photo est requise']
    },
    visible: {
        type: Boolean,
        default: true
    },
    filleID: {
        type: Schema.Types.ObjectId,
        ref: 'Fille',
        required: [true, 'La fille associée est requise'],
    }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const PhotosFille = mongoose.model('PhotosFille', PhotosFilleSchema);

module.exports = PhotosFille;