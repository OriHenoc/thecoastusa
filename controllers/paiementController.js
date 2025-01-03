const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const Paiement = require('../models/Paiement');
const Utilisateur = require('../models/Utilisateur')
const nodemailer = require('nodemailer');
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

        //Mail à l'inscrit(e)

        const utilisateur = await Utilisateur.findById(paiement.utilisateurID);

        await transporter.sendMail({
            from: "admin@thecoastusa.com",
            to: utilisateur.email,
            subject: "Paiement confirmé",
            html: `
                <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                <p>Votre inscription au programme a été validée !</p>
                <p>Vous pouvez désormais vous connecter à votre espace pour la suite du processus avec vos identifiants :</p>
                <ul><li>Email : ${utilisateur.email}</li><li>Mot de passe : celui que vous avez utilisé lors de votre inscription</li></ul>
                <p><a href="https://thecoastusa.com/connexion">JE ME CONNECTE ICI</a></p>
            `
        });

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
//          const apiEndpoint = 'https://backthecoastusa.committeam.com/uploadPreuvePaiement.php';
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


exports.soumettrePaiement = async (req, res) => {
    try {
        if (!req.file || !req.file.filename) {
            return res.status(400).json({ message: "Aucun fichier n'a été fourni." });
        }

        const fichierPath = path.resolve('uploads/images/preuves', req.file.filename);

        const { utilisateurID, moyenID, montant, commentaire } = req.body;

        if (!utilisateurID || !moyenID || !montant) {
            return res.status(400).json({ message: "Certains champs obligatoires sont manquants." });
        }

        let fichierUrl = null;
        const form = new FormData();
        form.append('file', fs.createReadStream(fichierPath));
        const apiEndpoint = 'https://backthecoastusa.committeam.com/uploadPreuvePaiement.php';

        const response = await axios.post(apiEndpoint, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        if (response.data.status !== 'success') {
            throw new Error(response.data.message || 'Erreur lors du téléchargement du fichier');
        }

        fichierUrl = response.data.filePath;
        if (!fichierUrl) {
            return res.status(400).json({ message: "URL de la preuve manquante." });
        }

        const paiement = new Paiement({
            utilisateurID,
            moyenID,
            montant,
            commentaire,
            preuve: fichierUrl,
        });

        await paiement.save();

        //Envoyer mail aux concernés :

            //Mail à l'inscrit(e)

            const utilisateur = await Utilisateur.findById(paiement.utilisateurID);

            await transporter.sendMail({
                from: "admin@thecoastusa.com",
                to: utilisateur.email,
                subject: "Preuve de paiement soumise",
                html: `
                    <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                    <p>Vous avez soumis votre preuve de paiement pour vérification et nous l'avons bien reçue !</p>
                    <p>Vous recevrez une confirmation après validation dans un délai maximum de 72h.</p>
                `
            });

            //Mail aux admins

            adminEmails = ["info@thecoastusa.com", "inscription@thecoastusa.com", "paiement@thecoastusa.com"]

            await transporter.sendMail({
                from: "admin@thecoastusa.com",
                to: adminEmails.join(","),
                subject: "Preuve de paiement soumise",
                html: `
                    <h2>Hello cher administrateur,</h2>
                    <p>${utilisateur.nom} ${utilisateur.prenoms} ayant effectué son inscription en tant que ${utilisateur.role}, 
                    vous a soumis une preuve de paiement pour vérification qui est disponible sur l'espace de gestion !</p>
                    <p>Veuillez vous connecter pour valider si vous l'avez bien reçu.</p>
                    <hr/>
                    <p>Signé : Votre IA adorée</p>
                `
            });

        res.status(201).json({
            message: "Paiement enregistré avec succès.",
            paiement,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Une erreur est survenue lors de l'enregistrement de la soumission.",
            erreur: error.message,
        });
    }
};