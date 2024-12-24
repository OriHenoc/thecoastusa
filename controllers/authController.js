const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/Utilisateur');
const nodemailer = require('nodemailer');
require('dotenv').config();


// Configuration du transporteur avec le serveur SMTP
/*const transporter = nodemailer.createTransport({
    host: 'mail.committeam.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});*/

// Enregistrement d'un utilisateur
exports.inscription = async (req, res) => {
    try {
        const { nom, prenoms, dateDeNaissance, email, motDePasse, telephone, paysID, role } = req.body;

        const newUtilisateur = new Utilisateur({
            nom,
            prenoms,
            dateDeNaissance,
            email,
            motDePasse,
            telephone,
            paysID,
            role,
        });

        const existingUser = await Utilisateur.findOne({ $or: [{ email }, { telephone }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email ou numéro de téléphone déjà utilisé.' });
        }

        await newUtilisateur.save();

        res.status(201).json({
            message: `Bienvenue ${newUtilisateur.nom} ${newUtilisateur.prenoms} !`,
            utilisateur: newUtilisateur
        });
    } catch (error) {
        res.status(400).json({
            message: 'Une erreur est survenue !',
            erreur: error.message
        });
    }
};

// Connexion d'un utilisateur
exports.connexion = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;
        const utilisateur = await Utilisateur.findOne({ email }).select('+motDePasse');
        if (!utilisateur) {
            return res.status(400).json({ message: 'Utilisateur non trouvé !' });
        }

        if (!utilisateur.compteActif) {
            return res.status(403).json({ message: 'Compte inactif. Veuillez contacter l\'administration.' });
        }

        const isMatch = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
        if (!isMatch) {
            return res.status(400).json({ message: 'Identifiants incorrects !' });
        }

        const token = jwt.sign({ _id: utilisateur._id, role: utilisateur.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({
            token : token,
            utilisateur : utilisateur
        });
    } catch (error) {
        res.status(400).json({
            message: 'Une erreur est survenue !',
            erreur: error.message
        });
    }
};