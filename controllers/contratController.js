const fs = require('fs-extra');
const path = require('path');
const Utilisateur = require('../models/Utilisateur');
const nodemailer = require('nodemailer');
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const Contrat = require('../models/Contrat');

// Configuration du transporteur avec le serveur SMTP
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

exports.annulerContrat = async (req, res) => {
    try {
        const ct = await Contrat.findById(req.params.id);
        if (!ct) {
            return res.status(404).json({
                message: 'Contrat non trouvé.',
            });
        }

        // Mettre à jour
        ct.contrat = '';
        ct.isValid = false

        await ct.save();

        //Informer

        const utilisateur = await Utilisateur.findById(ct.utilisateurID);

            await transporter.sendMail({
                from: "admin@thecoastusa.com",
                to: utilisateur.email,
                subject: "Contrat refusé",
                html: `
                    <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                    <p>Vous avez soumis le contrat mais il a été refusé par l'administration !</p>
                    <p>Vous devez donc vous reconnecter et ressoumettre.</p>
                `
            });

        return res.status(200).json({
            message: 'Annulation de contrat effectuée avec succès !',
            documents: docs,
        });
    } catch (error) {
        console.error('Erreur pour annuler le contrat :', error);
        return res.status(500).json({
            message: 'Une erreur interne est survenue.',
            erreur: error.message,
        });
    }
};

exports.validerContrat = async (req, res) => {
    try {

        const ct = await Contrat.findById(req.params.id);
        if (!ct) {
            return res.status(404).json({
                message: 'Contrat non trouvé.',
            });
        }

        // Mettre à jour
        ct.isValid = true

        await ct.save();

        //Informer
        const utilisateur = await Utilisateur.findById(docs.utilisateurID);

            await transporter.sendMail({
                from: "admin@thecoastusa.com",
                to: utilisateur.email,
                subject: "Contrat Validé",
                html: `
                    <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                    <p>Votre contrat a été validé et vous êtes officiellement des nôtres !</p>
                    <p>Veuillez suivre les formations et passer les tests pour vous préparer aux mises en relation.</p>
                    <p>Vous pouvez vous connecter et aller à la rubrique "Formations et Tests" pour procéder.</p>
                `
            });

        return res.status(200).json({
            message: 'Contrat validé avec succès !'
        });
    } catch (error) {
        console.error('Erreur pour valider les documents soumis:', error);
        return res.status(500).json({
            message: 'Une erreur interne est survenue.',
            erreur: error.message,
        });
    }
};


exports.soumettreContrat = async (req, res) => {
    try {
        if (!req.file || !req.file.filename) {
            return res.status(400).json({ message: "Aucun fichier n'a été fourni." });
        }

        const fichierPath = path.resolve('uploads/contrats', req.file.filename);

        const { utilisateurID } = req.body;

        if (!utilisateurID) {
            return res.status(400).json({ message: "L'utilisateur est manquant." });
        }        

        let fichierUrl = null;
        const form = new FormData();
        form.append('file', fs.createReadStream(fichierPath));
        const apiEndpoint = 'https://backthecoastusa.committeam.com/uploadContrat.php';

        const response = await axios.post(apiEndpoint, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log('Réponse de l\'API PHP :', response.data);
        
        if (response.data.status !== 'success') {
            throw new Error(response.data.message || 'Erreur lors du téléchargement du fichier');
        }

        fichierUrl = response.data.filePath;
        if (!fichierUrl) {
            return res.status(400).json({ message: "URL du contrat manquante." });
        }

        let cont = await Contrat.findOne({ utilisateurID : utilisateurID });
        
        cont.contrat = fichierUrl;
        
        
        await cont.save();

            //Mail aux admins

            const utilisateur = await Utilisateur.findById(utilisateurID);

            adminEmails = ["info@thecoastusa.com", "inscription@thecoastusa.com", "dossier@thecoastusa.com"]

            await transporter.sendMail({
                from: "admin@thecoastusa.com",
                to: adminEmails.join(","),
                subject: "Contrat soumis",
                html: `
                    <h2>Hello cher administrateur,</h2>
                    <p>${utilisateur.nom} ${utilisateur.prenoms} ayant effectué son inscription en tant que ${utilisateur.role}, 
                    vous a soumis son contrat pour vérification et validation qui est disponible sur l'espace de gestion !</p>
                    <p>Veuillez vous connecter pour valider si vous l'avez bien reçu.</p>
                    <hr/>
                    <p>Signé : Votre IA adorée</p>
                `
            });

        res.status(201).json({
            message: "Contrat envoyé avec succès.",
            docs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Une erreur est survenue lors de l'envoi du contrat.",
            erreur: error.message,
        });
    }
};