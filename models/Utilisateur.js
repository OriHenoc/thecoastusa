const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const UtilisateurSchema = new Schema({
    nom: {
        type: String,
        required: [true, 'Le nom de famille est requis'],
        minlength: [3, 'Le nom de famille doit comporter au moins 3 caractères']
    },
    prenoms: {
        type: String,
        required: [true, 'Les prenoms sont requis'],
        minlength: [3, 'Les prenoms doivent comporter au moins 3 caractères']
    },
    dateDeNaissance: {
        type: Date,
        required: true
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Veuillez entrer une adresse email valide']
    },
    motDePasse: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [6, 'Le mot de passe doit comporter au moins 6 caractères'],
        select: false
    },
    telephone: {
        type: String,
        unique: true,
    },
    paysID: {
        type: Schema.Types.ObjectId,
        ref: 'Pays',
        required: [true, 'Le choix du pays est requis'],
    },
    role: {
        type: String,
        enum: ['famille', 'fille', 'admin', 'root'],
        required: true,
    },
    photoDeProfil: {
        type: String,
    },
    dateInscription: {
        type: Date,
        default: Date.now
    },
    compteActif: {
        type: Boolean,
        default: false
    },
    visible: {
        type: Boolean,
        default: true
    },
    //Pour les filles
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
    videoDePresentation: {
        type: String
    },
    photosFille: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'photosFille',
    }],
    //Pour les familles
    nombreEnfants: {
        type: Number,
    },
    etatID: {
        type: Schema.Types.ObjectId,
        ref: 'Etat',
    },
    photosFamille: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PhotosFamille',
    }],
}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
});

// Hachage du mot de passe avant de sauvegarder
UtilisateurSchema.pre('save', async function(next) {
    if (!this.isModified('motDePasse')) return next();
    try {
        const isHashed = /^\$2[aby]\$.{56}$/.test(this.motDePasse);
        if (!isHashed) {
            const salt = await bcrypt.genSalt(10);
            this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
        }
        next();
    } catch (err) {
        next(err);
    }
});

// Comparer le mot de passe pour l'authentification
UtilisateurSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.motDePasse);
};

const Utilisateur = mongoose.model('Utilisateur', UtilisateurSchema);

module.exports = Utilisateur;