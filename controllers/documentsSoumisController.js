const fs = require('fs-extra');
const path = require('path');
const Utilisateur = require('../models/Utilisateur');
const nodemailer = require('nodemailer');
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const DocumentsSoumis = require('../models/DocumentsSoumis');

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

exports.getAllDocumentsSoumis = async (req, res) => {
    try {
        const docs = await DocumentsSoumis.find();
        const total = await DocumentsSoumis.countDocuments();
        res.status(200).json({
            total : total,
            docs : docs
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.soumettreDocument = async (req, res) => {
    try {
        if (!req.file || !req.file.filename) {
            return res.status(400).json({ message: "Aucun fichier n'a été fourni." });
        }

        const fichierPath = path.resolve('uploads/documents', req.file.filename);

        const { utilisateurID, nomDoc, typePieceIdentite } = req.body;

        if (!utilisateurID || !nomDoc) {
            return res.status(400).json({ message: "L'utilisateur ou le type de document est manquant." });
        }        

        let fichierUrl = null;
        const form = new FormData();
        form.append('file', fs.createReadStream(fichierPath));
        const apiEndpoint = 'https://backthecoastusa.committeam.com/uploadDoc.php';

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
            return res.status(400).json({ message: "URL du document manquante." });
        }

        let docs = await DocumentsSoumis.findOne({ utilisateurID : utilisateurID });

        //Si L'utilisateur n'a d'espace documents, initialiser

        if (!docs) {
            docs = new DocumentsSoumis({ utilisateurID : req.body.utilisateurID });
            await docs.save();
        }
        
        const champsMapping = {
            reconTravail: 'reconTravail',
            dernierDiplome: 'dernierDiplome',
            certificatResidence: 'certificatResidence',
            casierJudiciaire: 'casierJudiciaire',
            bilanSante: 'bilanSante',
            pieceIdentite: 'pieceIdentite',
        };
        
        if (champsMapping[nomDoc]) {
            docs[champsMapping[nomDoc]] = fichierUrl;
        }
        
        if (nomDoc === 'pieceIdentite') {
            if (!typePieceIdentite) {
                return res.status(400).json({ message: "Le type de pièce d'identité est requis." });
            }
            docs.typePieceIdentite = typePieceIdentite;
            docs.pieceIdentite = fichierUrl;
        }
        
        await docs.save();

            //Mail aux admins

            
            const utilisateur = await Utilisateur.findById(utilisateurID);

            adminEmails = ["info@thecoastusa.com", "inscription@thecoastusa.com", "dossier@thecoastusa.com"]

            await transporter.sendMail({
                from: "admin@thecoastusa.com",
                to: adminEmails.join(","),
                subject: "Document soumis",
                html: `
                    <h2>Hello cher administrateur,</h2>
                    <p>${utilisateur.nom} ${utilisateur.prenoms} ayant effectué son inscription en tant que ${utilisateur.role}, 
                    vous a soumis un document pour vérification et validation qui est disponible sur l'espace de gestion !</p>
                    <p>Veuillez vous connecter pour valider si vous l'avez bien reçu.</p>
                    <hr/>
                    <p>Signé : Votre IA adorée</p>
                `
            });

        res.status(201).json({
            message: "Document envoyé avec succès.",
            docs,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Une erreur est survenue lors de l'envoi du document.",
            erreur: error.message,
        });
    }
};