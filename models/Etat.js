const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EtatSchema = new Schema({  
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
    },
    latitude: {
        type: String
    },
    longitude: {
        type: String
    },
    visible: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}
});

const Etat = mongoose.model('Etat', EtatSchema);

module.exports = Etat;