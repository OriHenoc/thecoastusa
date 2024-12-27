const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const Paiement = require('../models/Paiement');

const multer = require('multer');

exports.createPaiement = async (req, res) => {
    try {
        const { moyenID, montant, utilisateurID } = req.body;
        const newPaiement = new Paiement({ moyenID, montant, utilisateurID });
        await newPaiement.save();
        res.status(201).json({
            message : `Le paiement a été enregistré !`,
            paiement : newPaiement
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllPaiement = async (req, res) => {
    try {
        const paiements = await Paiement.find().populate(['utilisateurID', 'moyenID']);
        const total = await Paiement.countDocuments();
        const confirmed = await Paiement.countDocuments({ confirmed: true });
        res.status(200).json({
            total : total,
            confirmed : confirmed,
            paiements : paiements
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllConfirmedPaiement = async (req, res) => {
    try {
        const paiements = await Paiement.find({ confirmed: true }).populate(['utilisateurID', 'moyenID']);
        res.status(200).json({
            paiements : paiements
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getPaiementById = async (req, res) => {
    try {
        const paiement = await Paiement.findById(req.params.id).populate(['utilisateurID', 'moyenID']);
        if (!paiement) return res.status(404).json('Paiement non trouvé !');
        res.status(200).json({
            paiement : paiement
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.confirmPaiementStatus = async (req, res) => {
    try {
        const paiement = await Paiement.findById(req.params.id);
        if (!paiement) return res.status(404).json('Paiement non trouvé !');

        paiement.confirmed = true
        await paiement.save();
        let message = `Le paiement a été confirmé ! `
        res.status(200).json({
            message : message,
            paiement : paiement
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

// exports.uploadPreuve = async (req, res) => {
//     try {
//         const paiement = await Paiement.findById(req.params.id);
//         if (!paiement) {
//             return res.status(404).json({ message: 'Paiement non trouvé !' });
//         }
        
//          // Préparer le fichier à envoyer
//          const localFilePath = path.resolve('uploads/images/preuves', req.file.filename);
//          const form = new FormData();
//          form.append('file', fs.createReadStream(localFilePath));
 
//          // Envoyer le fichier à l'API HTTP distante
//          const apiEndpoint = 'https://thecoastusa.com/api/uploadPreuvePaiement.php';
//          const response = await axios.post(apiEndpoint, form, {
//              headers: {
//                  ...form.getHeaders() // Inclut les en-têtes nécessaires pour FormData
//              }
//          });

//         // Vérifier la réponse de l'API
//         if (response.data.status !== 'success') {
//             throw new Error(response.data.message || 'Erreur lors du téléchargement du fichier');
//         }

//         console.log('Fichier transféré avec succès :', response.data);

//         paiement.preuve = `/uploads/images/preuves/${req.file.filename}`;
//         await paiement.save();

//         res.status(200).json({
//             message: 'Le paiement a reçu sa preuve !',
//             paiement: paiement
//         });

//     } catch (error) {
//         res.status(400).json({
//             message: 'Mauvaise requête !',
//             erreur: error.message
//         });
//     }
// };


// Middleware Multer pour stocker le fichier en mémoire
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Endpoint pour uploader directement avec "preuve"
exports.uploadPreuve = async (req, res) => {
    try {
        // Vérifier si le paiement existe
        const paiement = await Paiement.findById(req.params.id);
        if (!paiement) {
            return res.status(404).json({ message: 'Paiement non trouvé !' });
        }

        // Vérifier si le fichier est présent
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier "preuve" reçu !' });
        }

        // Préparer le fichier à envoyer à l'API distante
        const form = new FormData();
        form.append('file', req.file.buffer, req.file.originalname); // Remplacez "file" par le champ attendu côté PHP si différent

        // Envoyer le fichier à l'API PHP distante
        const apiEndpoint = 'https://thecoastusa.com/api/uploadPreuvePaiement.php';
        const response = await axios.post(apiEndpoint, form, {
            headers: {
                ...form.getHeaders(), // Ajouter les en-têtes nécessaires pour le formulaire
            },
        });

        // Vérifier la réponse de l'API distante
        if (response.data.status !== 'success') {
            throw new Error(response.data.message || 'Erreur lors du téléchargement du fichier');
        }

        console.log('Fichier transféré avec succès :', response.data);

        // Mettre à jour le modèle Paiement avec l'URL de la preuve
        paiement.preuve = `/uploads/images/preuves/${req.file.originalname}`; // Ajustez selon la réponse de l'API
        await paiement.save();

        res.status(200).json({
            message: 'Le paiement a reçu sa preuve !',
            paiement: paiement,
        });
    } catch (error) {
        console.error('Erreur dans uploadPreuve:', error.message);
        res.status(400).json({
            message: 'Mauvaise requête !',
            erreur: error.message,
        });
    }
};