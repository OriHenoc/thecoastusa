const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LangueSchema = new Schema({  
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
    },
    visible: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}
});

const Langue = mongoose.model('Langue', LangueSchema);

module.exports = Langue;