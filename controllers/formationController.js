const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');
const path = require('path');
const Formation = require('../models/Formation');
const Examen = require('../models/Examen');
const Utilisateur = require('../models/Utilisateur');
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

exports.createFormation = async (req, res) => {
    try {
        console.log(req.body);
        const { titre, destineeA } = req.body;
        const newFormation = new Formation({ titre, destineeA });
        const existingFormation = await Formation.findOne({ $and: [{ titre }, { destineeA }] });
        if (existingFormation) {
            return res.status(400).json({ message: 'Formation déjà enregistrée.' });
        }
        await newFormation.save();
        res.status(201).json({
            message : `Le formation a été enregistrée !`,
            formation : newFormation
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllFormation = async (req, res) => {
    try {
        const formations = await Formation.find();
        const total = await Formation.countDocuments();
        const visibles = await Formation.countDocuments({ visible: true });
        res.status(200).json({
            total : total,
            visibles : visibles,
            formations : formations
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllVisibledFormation = async (req, res) => {
    try {
        const formations = await Formation.find({ visible: true });
        res.status(200).json({
            formations : formations
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getFormationById = async (req, res) => {
    try {
        const formation = await Formation.findById(req.params.id);
        if (!formation) return res.status(404).json('Formation non trouvée !');
        res.status(200).json({
            formation : formation
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updateFormation = async (req, res) => {
    try {
        const updatedFormation = await Formation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedFormation) return res.status(404).json('Formation non trouvée !');
        res.status(200).json({
            message : `La formation a été mise à jour !`,
            formation : updatedFormation
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.deleteFormation = async (req, res) => {
    try {
        const deletedFormation = await Formation.findByIdAndDelete(req.params.id);
        if (!deletedFormation) return res.status(404).json('Formation non trouvée !');
        res.json('Formation supprimée !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.toggleFormationStatus = async (req, res) => {
    try {
        const formation = await Formation.findById(req.params.id);
        if (!formation) return res.status(404).json('Formation non trouvée !');

        formation.visible = !formation.visible;
        await formation.save();
        let message = `La visibilité de la formation a été mise à jour ! `
        let statut = formation.visible;
        if(statut){
            message += `La formation a été rendu visible !`
        }
        else{
            message += `La formation a été rendu invisible !`
        }
        res.status(200).json({
            message : message,
            formation : formation
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.uploadCoursTexte = async (req, res) => {
    try {
        console.log('Req :', req);
        if (!req.file || !req.file.filename) {
            return res.status(400).json({ message: "Aucun fichier n'a été fourni." });
        }

        const fichierPath = path.resolve('uploads/formations', req.file.filename);

        let fichierUrl = null;
        const form = new FormData();
        form.append('file', fs.createReadStream(fichierPath));
        const apiEndpoint = 'https://backthecoastusa.committeam.com/uploadFormation.php';

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
            return res.status(400).json({ message: "URL du cours manquante." });
        }

        let formation = await Formation.findById(req.params.id);

        if (!formation) {
            return res.status(404).json({ message: "Formation non trouvée." });
        }

        formation.coursTexte = fichierUrl;
        await formation.save();

        res.status(201).json({
            message: "Formation mise à jour avec succès.",
            formation : formation,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Mauvaise requête !',
            erreur: error.message
        });
    }
};

exports.uploadTest = async (req, res) => {
    try {
        console.log('Req :', req);
        if (!req.file || !req.file.filename) {
            return res.status(400).json({ message: "Aucun fichier n'a été fourni." });
        }

        const fichierPath = path.resolve('uploads/formations', req.file.filename);

        let fichierUrl = null;
        const form = new FormData();
        form.append('file', fs.createReadStream(fichierPath));
        const apiEndpoint = 'https://backthecoastusa.committeam.com/uploadFormation.php';

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
            return res.status(400).json({ message: "URL du test manquante." });
        }

        let formation = await Formation.findById(req.params.id);

        if (!formation) {
            return res.status(404).json({ message: "Formation non trouvée." });
        }

        formation.test = fichierUrl;
        await formation.save();

        res.status(201).json({
            message: "Formation mise à jour avec succès.",
            formation : formation,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Mauvaise requête !',
            erreur: error.message
        });
    }
};

exports.uploadCoursVideo = async (req, res) => {
    try {
        console.log('Requête reçue:', req.body); // Log du corps de la requête

        const { coursVideo } = req.body;

        let formation = await Formation.findById(req.params.id);

        if (!formation) {
            console.log('Formation non trouvée pour ID:', req.params.id);
            return res.status(404).json({ message: "Formation non trouvée." });
        }

        console.log('Formation trouvée:', formation);

        formation.coursVideo = coursVideo;
        await formation.save();

        console.log('Formation mise à jour:', formation);

        res.status(201).json({
            message: "Formation mise à jour avec succès.",
            formation: formation,
        });
    } catch (error) {
        console.error('Erreur dans uploadCoursVideo:', error.message);
        res.status(400).json({
            message: 'Mauvaise requête !',
            erreur: error.message
        });
    }
};

exports.soumettreTest = async (req, res) => {
    try {
        if (!req.file || !req.file.filename) {
            return res.status(400).json({ message: "Aucun fichier n'a été fourni." });
        }

        const fichierPath = path.resolve('uploads/tests', req.file.filename);

        const { utilisateurID, formationID } = req.body;

        if (!utilisateurID || !formationID) {
            return res.status(400).json({ message: "Certains éléments obligatoires sont manquants." });
        }

        let fichierUrl = null;
        const form = new FormData();
        form.append('file', fs.createReadStream(fichierPath));
        const apiEndpoint = 'https://backthecoastusa.committeam.com/uploadReponseTest.php';

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
            return res.status(400).json({ message: "URL de la reponse manquante." });
        }

        const examen = new Examen({
            utilisateurID,
            formationID,
            reponse: fichierUrl
        });

        await examen.save();

        const utilisateur = await Utilisateur.findById(utilisateurID);

            //Mail aux admins
            adminEmails = ["info@thecoastusa.com", "inscription@thecoastusa.com", "formation@thecoastusa.com"]

            await transporter.sendMail({
                from: '"The Coast USA" <admin@thecoastusa.com>',
                to: adminEmails.join(","),
                subject: "Reponse de test",
                html: `
                    <h2>Hello cher administrateur,</h2>
                    <p>${utilisateur.nom} ${utilisateur.prenoms} vous a soumis des réponses à un test pour vérification qui est disponible sur l'espace de gestion !</p>
                    <p>Veuillez vous connecter pour valider si vous l'avez bien reçu.</p>
                    <hr/>
                    <p>Signé : Votre IA adorée</p>
                `
            });

        res.status(201).json({
            message: "Test enregistré avec succès.",
            examen,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Une erreur est survenue lors de l'enregistrement de la soumission.",
            erreur: error.message,
        });
    }
};