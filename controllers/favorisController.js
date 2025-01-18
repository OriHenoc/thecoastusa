const Utilisateur = require('../models/Utilisateur')
const nodemailer = require('nodemailer');
const Favoris = require('../models/Favoris');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'mail.thecoastusa.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});
exports.putFavoris = async (req, res) => {
    try {
        const { familleID, filleID } = req.body;

        // Vérifier les champs requis
        if (!familleID || !filleID) {
            return res.status(400).json({ message: 'familleID et filleID sont requis.' });
        }

        // Utiliser l'option `findOneAndUpdate` pour insérer si non existant
        const newFavoris = await Favoris.findOneAndUpdate(
            { familleID, filleID }, // Condition pour trouver un favori existant
            { familleID, filleID }, // Données à insérer/mettre à jour
            { upsert: true, new: true, setDefaultsOnInsert: true } // Options pour créer si non existant
        );

        res.status(201).json({
            message: 'Ajoutée aux favorites !',
            favori: newFavoris,
        });
    } catch (error) {
        if (error.code === 11000) {
            // Gérer les erreurs liées à l'index unique
            return res.status(400).json({ message: 'Fille déjà en favori.' });
        }

        res.status(400).json({
            message: 'Une erreur est survenue !',
            erreur: error.message,
        });
    }
};


exports.getAllFavoris = async (req, res) => {
    try {
        const favori = await Favoris.find().populate(['familleID', 'filleID']);
        const total = await Favoris.countDocuments();
        res.status(200).json({
            total : total,
            favoris : favori.reverse()
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getFavorisById = async (req, res) => {
    try {
        const fav = await Favoris.findById(req.params.id).populate(['familleID', 'filleID']);
        if (!fav) return res.status(404).json('Favori non trouvé !');
        res.status(200).json({
            favoris : fav
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.getFavorisByFamilleId = async (req, res) => {
    try {
        const fav = await Favoris.find({familleID : req.params.id}).populate(['familleID', 'filleID']);
        if (!fav) return res.status(404).json('Favoris non trouvé !');
        res.status(200).json({
            favoris : fav
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.getFavorisByFilleId = async (req, res) => {
    try {
        const fav = await Favoris.find({filleID : req.params.id}).populate(['familleID', 'filleID']);
        if (!fav) return res.status(404).json('Favoris non trouvé !');
        res.status(200).json({
            favoris : fav
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.getIsFavori = async (req, res) => {
    try {
        const { familleID, filleID } = req.body;

        // Vérifier les champs requis
        if (!familleID || !filleID) {
            return res.status(400).json({ message: 'familleID et filleID sont requis.' });
        }

        const fav = await Favoris.find({filleID : filleID, familleID : familleID}).populate(['familleID', 'filleID']);
        if (!fav) return res.status(404).json('Favoris non trouvé !');
        res.status(200).json({
            favoris : fav
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};


exports.deleteFavoris = async (req, res) => {
    try {
        const deletedFavoris = await Favoris.findByIdAndDelete(req.params.id);
        if (!deletedFavoris) return res.status(404).json('Favoris non trouvé !');
        res.json({message : 'Supprimée des favoris !'});
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};
