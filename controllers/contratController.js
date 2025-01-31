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

exports.getAllContrats = async (req, res) => {
    try {
        const contrats = await Contrat.find().populate('utilisateurID');
        const total = await Contrat.countDocuments();
        res.status(200).json({
            total : total,
            contrats : contrats
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getContratByUtilisateurID = async (req, res) => {
    try {
        const contrat = await Contrat.find({utilisateurID : req.params.id}).populate('utilisateurID');
        if (!contrat) return res.status(404).json('Contrat non trouvé !');
        res.status(200).json({
            contrat : contrat
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

// exports.annulerContrat = async (req, res) => {
//     try {
//         const ct = await Contrat.findById(req.params.id);
//         if (!ct) {
//             return res.status(404).json({
//                 message: 'Contrat non trouvé.',
//             });
//         }

//         // Mettre à jour
//         ct.contrat = '';
//         ct.isValid = false

//         await ct.save();

//         //Informer

//         const utilisateur = await Utilisateur.findById(ct.utilisateurID);

//             await transporter.sendMail({
//                 from: '"The Coast USA" <admin@thecoastusa.com>',
//                 to: utilisateur.email,
//                 subject: "Contrat refusé",
//                 html: `
//                     <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
//                     <p>Vous avez soumis le contrat mais il a été refusé par l'administration !</p>
//                     <p>Vous devez donc vous reconnecter et ressoumettre.</p>
//                 `
//             });

//         return res.status(200).json({
//             message: 'Annulation de contrat effectuée avec succès !',
//             documents: docs,
//         });
//     } catch (error) {
//         console.error('Erreur pour annuler le contrat :', error);
//         return res.status(500).json({
//             message: 'Une erreur interne est survenue.',
//             erreur: error.message,
//         });
//     }
// };

// exports.validerContrat = async (req, res) => {
//     try {

//         const ct = await Contrat.findById(req.params.id);
//         if (!ct) {
//             return res.status(404).json({
//                 message: 'Contrat non trouvé.',
//             });
//         }

//         // Mettre à jour
//         ct.isValid = true

//         await ct.save();

//         //Informer
//         const utilisateur = await Utilisateur.findById(docs.utilisateurID);

//             await transporter.sendMail({
//                 from: '"The Coast USA" <admin@thecoastusa.com>',
//                 to: utilisateur.email,
//                 subject: "Contrat Validé",
//                 html: `
//                     <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
//                     <p>Votre contrat a été validé et vous êtes officiellement des nôtres !</p>
//                     <p>Veuillez suivre les formations et passer les tests pour vous préparer aux mises en relation.</p>
//                     <p>Vous pouvez vous connecter et aller à la rubrique "Formations et Tests" pour procéder.</p>
//                 `
//             });

//         return res.status(200).json({
//             message: 'Contrat validé avec succès !'
//         });
//     } catch (error) {
//         console.error('Erreur pour valider les documents soumis:', error);
//         return res.status(500).json({
//             message: 'Une erreur interne est survenue.',
//             erreur: error.message,
//         });
//     }
// };

exports.updateValidationStatus = async (req, res) => {
    try {
        const { isValid } = req.body;

        // Mettre à jour uniquement le champ isValid et potentiellement vider contrat
        const updateFields = { isValid };
        if (!isValid) {
            updateFields.contrat = ''; // Vider le champ seulement si isValid = false
        }

        const contrat = await Contrat.findByIdAndUpdate(req.params.id, updateFields, { new: true });

        if (!contrat) {
            return res.status(404).json({
                message: 'Contrat non trouvé.',
            });
        }

        // Informer l'utilisateur
        const utilisateur = await Utilisateur.findById(contrat.utilisateurID);
        if (!utilisateur) {
            return res.status(404).json({
                message: 'Utilisateur associé au contrat non trouvé.',
            });
        }

        const subject = isValid ? "Contrat Validé" : "Contrat Refusé";
        const message = isValid
            ? `<h2>Bonjour ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                <p>Votre contrat a été validé...</p>`
            : `<h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                <p>Votre contrat a été refusé...</p>`;

        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: utilisateur.email,
            subject,
            html: message,
        });

        return res.status(200).json({
            message: `Statut du contrat mis à jour avec succès : ${isValid ? 'Validé' : 'Refusé'}.`,
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de validation :', error);
        return res.status(500).json({
            message: 'Une erreur interne est survenue.',
            erreur: error.message,
        });
    }
};


exports.soumettreContrat = async (req, res) => {
    try {
        console.log('Req :', req);
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
            timeout: 10000,  // Timeout de 10 secondes
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

        if (!cont) {
            return res.status(404).json({ message: "Contrat non trouvé pour cet utilisateur." });
        }

        cont.contrat = fichierUrl;
        await cont.save();

        // Envoi du mail aux admins
        const utilisateur = await Utilisateur.findById(utilisateurID);
        const adminEmails = ["info@thecoastusa.com", "inscription@thecoastusa.com", "dossier@thecoastusa.com"];

        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
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

        //mail au concerné :

        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: utilisateur.email,
            subject: "Contrat soumis",
            html: `
                <h2>Bonjour ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                <p>Nous confirmons avoir reçu votre document et procéderons à sa vérification. Veuillez noter que si des informations fournies s'avèrent fausses, cela entraînera votre retrait définitif du programme.</p>
                <p>Merci pour votre collaboration et votre sérieux.</p>
                <p>Cordialement , l'équipe the COAST</p>
            `
        });

        res.status(201).json({
            message: "Contrat envoyé avec succès.",
            contrat : cont,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Une erreur est survenue lors de l'envoi du contrat.",
            erreur: error.message,
        });
    }
};