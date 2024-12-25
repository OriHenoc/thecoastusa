const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    nomComplet: {
        type: String,
        required: [true, 'Le nom complet est requis']
    },
    telephone: {
        type: String,
        required: [true, 'Le numéro de télephone est requis']
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Veuillez entrer une adresse email valide']
    },
    sujet: {
        type: String,
        required: [true, 'Le sujet est requis'],
    },
    message: {
        type: String,
        required: [true, 'Le message est requis'],
    }
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

const Contact = mongoose.model('Contact', ContactSchema);

module.exports = Contact;