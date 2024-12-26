const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MoyenPaiementSchema = new Schema({  
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
    },
    logo: {
        type: String,
        required: false
    },
    instructions: {
        type: String,
        required: true
    },
    disponible: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}
});

const MoyenPaiement = mongoose.model('MoyenPaiement', MoyenPaiementSchema);

module.exports = MoyenPaiement;