const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FormationSchema = new Schema({
    titre: {
        type: String,
        required: true
    },
    coursTexte: {
        type: String,
        required: false
    },
    coursVideo: {
        type: String,
        required: false
    },
    test: {
        type: String,
        required: false
    },
    destineeA: {
        type: String,
        enum: ['famille', 'fille', 'admin'],
        required: true,
    },
    visible: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Formation = mongoose.model('Formation', FormationSchema);

module.exports = Formation;