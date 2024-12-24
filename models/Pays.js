const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaysSchema = new Schema({  
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
    },
    alpha3: {
        type: String,
        required: [true, 'L\'abreviation est requise'],
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

const Pays = mongoose.model('Pays', PaysSchema);

module.exports = Pays;