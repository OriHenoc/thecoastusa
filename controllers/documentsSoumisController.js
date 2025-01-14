const fs = require('fs-extra');
const path = require('path');
const Utilisateur = require('../models/Utilisateur');
const nodemailer = require('nodemailer');
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const DocumentsSoumis = require('../models/DocumentsSoumis');
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

exports.getAllDocumentsSoumis = async (req, res) => {
    try {
        const docs = await DocumentsSoumis.find().populate('utilisateurID');
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

exports.getDocumentsSoumisByUtilisateur = async (req, res) => {
    try {
        const docs = await DocumentsSoumis.find({ utilisateurID : req.params.id }).populate('utilisateurID')
  
        if (!docs) {
            return res.status(404).json({ message: 'Aucun document trouvé pour cet utilisateur.' });
        }
    
        res.status(200).json({
            message: 'Documents récupérées avec succès.',
            documents: docs,
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Une erreur est survenue lors de la récupération des documents.',
        erreur: error.message,
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

exports.annulerDocumentSoumis = async (req, res) => {
    try {
        const { docsID, documentAreprendre } = req.body;

        // Vérifier si les champs requis sont fournis
        if (!docsID || !documentAreprendre) {
            return res.status(400).json({
                message: 'docsID et documentAreprendre sont requis.',
            });
        }

        // Vérifier si la propriété existe dans le modèle
        const validFields = [
            'reconTravail',
            'dernierDiplome',
            'certificatResidence',
            'casierJudiciaire',
            'bilanSante',
            'pieceIdentite',
        ];

        if (!validFields.includes(documentAreprendre)) {
            return res.status(400).json({
                message: `Le champ '${documentAreprendre}' n'est pas valide.`,
            });
        }

        // Trouver le document par ID
        const docs = await DocumentsSoumis.findById(docsID);
        if (!docs) {
            return res.status(404).json({
                message: 'Document soumis non trouvé.',
            });
        }

        // Mettre à jour le champ cible
        docs[documentAreprendre] = '';

        if (documentAreprendre == 'pieceIdentite')
        docs.typePieceIdentite = '';

        await docs.save();

        //Informer

        let doc = "doc";

        switch (documentAreprendre) {
            case "reconTravail":
                doc = "le document de reconnaissance de travail"
                break;
        
            case "dernierDiplome":
                doc = "la copie du dernier diplôme"
                break;

            case "certificatResidence":
                doc = "le certificat de résidence"
                break;

            case "casierJudiciaire":
                doc = "casier judiciaire"
                break;

            case "bilanSante":
                doc = "Bilan de santé"
                break;

            case "pieceIdentite":
                doc = "la copie de la pièce d'identité."
                break;

            default:
                doc = "Document"
                break;
        }

        const utilisateur = await Utilisateur.findById(docs.utilisateurID);

            await transporter.sendMail({
                from: "admin@thecoastusa.com",
                to: utilisateur.email,
                subject: "Document refusé",
                html: `
                    <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                    <p>Vous avez soumis un document qui a été refusé par l'administration !</p>
                    <p>Vous devez donc vous reconnecter et ressoumettre ${doc}.</p>
                `
            });

        return res.status(200).json({
            message: 'Annulation effectuée avec succès !',
            documents: docs,
        });
    } catch (error) {
        console.error('Erreur pour annuler le document soumis:', error);
        return res.status(500).json({
            message: 'Une erreur interne est survenue.',
            erreur: error.message,
        });
    }
};

exports.validerDocumentSoumis = async (req, res) => {
    try {

        const docs = await DocumentsSoumis.findById(req.params.id);
        if (!docs) {
            return res.status(404).json({
                message: 'Document soumis non trouvé.',
            });
        }

        // Créer un contrat
        const contrat = new Contrat({ utilisateurID : docs.utilisateurID });

        await contrat.save();

        //Informer
        const utilisateur = await Utilisateur.findById(docs.utilisateurID);

            await transporter.sendMail({
                from: "admin@thecoastusa.com",
                to: utilisateur.email,
                subject: "Contrat Disponible",
                html: `
                    <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                    <p>Votre contrat est désormais disponible !</p>
                    <p>Vous pouvez vous connecter et aller à la rubrique "Contrat" pour procéder à la signature.</p>
                `
            });

        return res.status(200).json({
            message: 'Validation effectuée et contrat envoyé avec succès !'
        });
    } catch (error) {
        console.error('Erreur pour valider les documents soumis:', error);
        return res.status(500).json({
            message: 'Une erreur interne est survenue.',
            erreur: error.message,
        });
    }
};