const Examen = require('../models/Examen');
const Formation = require('../models/Formation');
const Utilisateur = require('../models/Utilisateur');
const Question = require('../models/Question');
const nodemailer = require('nodemailer');
const RepExamen = require('../models/RepExamen');
require('dotenv').config();

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

exports.createExamen = async (req, res) => {
    try {
        const { titre, formationID } = req.body;
        const newExamen = new Examen({ titre, formationID });
        await newExamen.save();
        res.status(201).json({
            message : `Le test a été enregistré !`,
            examen : newExamen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllExamen = async (req, res) => {
    try {
        const examens = await Examen.find().populate(['formationID', 'questions']);
        const total = await Examen.countDocuments();
        res.status(200).json({
            total : total,
            examens : examens
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getExamenById = async (req, res) => {
    try {
        const examen = await Examen.findById(req.params.id).populate(['formationID', 'questions']);
        if (!examen) return res.status(404).json('Examen non trouvé !');
        res.status(200).json({
            examen : examen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.getExamenByFormationID = async (req, res) => {
    try {
        const examen = await Examen.find({formationID : req.params.id}).populate(['utilisateurID', 'formationID', 'questions']);
        if (!examen) return res.status(404).json('Examen non trouvé !');
        res.status(200).json({
            examen : examen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updateExamen = async (req, res) => {
    try {
        const updatedExamen = await Examen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedExamen) return res.status(404).json('Examen non trouvé !');
        res.status(200).json({
            message : `L'examen a été mis à jour !`,
            examen : updatedExamen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.deleteExamen = async (req, res) => {
    try {
        const deletedExamen = await Examen.findByIdAndDelete(req.params.id);
        if (!deletedExamen) return res.status(404).json('Examen non trouvé !');
        res.json('Examen supprimé !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

// exports.validerExamen = async (req, res) => {
//     try {
//         const examen = await Examen.findById(req.params.id);
//         if (!examen) return res.status(404).json('Examen non trouvé !');

//         examen.statut = "reussi"
//         await examen.save();

//         //Mail à l'inscrit(e)

//         const utilisateur = await Utilisateur.findById(examen.utilisateurID);
//         const formation = await Formation.findById(examen.formationID);

//         await transporter.sendMail({
//             from: '"The Coast USA" <admin@thecoastusa.com>',
//             to: utilisateur.email,
//             subject: "Test validé",
//             html: `
//                 <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
//                 <p>Votre test pour la formation ${formation.titre} a été validé !</p>
//             `
//         });

//         let message = `Le test a été validé ! `
//         res.status(200).json({
//             success: true,
//             message : message,
//             examen : examen
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message : 'Mauvaise requête !',
//             erreur : error.message
//         });
//     }
// };

// exports.annulerExamen = async (req, res) => {
//     try {
//         const examen = await Examen.findById(req.params.id);
//         const utilisateur = await Utilisateur.findById(examen.utilisateurID);
//         const formation = await Formation.findById(examen.formationID);

//         //Mail à l'inscrit(e)
//         await transporter.sendMail({
//             from: '"The Coast USA" <admin@thecoastusa.com>',
//             to: utilisateur.email,
//             subject: "Test à reprendre",
//             html: `
//                 <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
//                 <p>Votre test pour la formation ${formation.titre} doit être repris !</p>
//             `
//         });

        
//         const deletedExamen = await Examen.findByIdAndDelete(req.params.id);
//         if (!deletedExamen) return res.status(404).json('Examen non trouvé !');

    
//         let message = `Le test a été refusé ! `
//         res.status(200).json({
//             success: true,
//             message : message,
//             deletedExamen : deletedExamen
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             message : 'Mauvaise requête !',
//             erreur : error.message
//         });
//     }
// };

exports.addQuestionToExamen = async (req, res) => {
    try {
        const { examenID, questionID } = req.body;

        // Vérifie si l'examen existe
        const exam = await Examen.findById(examenID);
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé !'
            });
        }

        // Vérifie si la question existe
        const question = await Question.findById(questionID);
        if (!question) {
            return res.status(404).json({
                message: 'Question non trouvée !'
            });
        }

        // Ajoute la question à l'exam
        if (!exam.questions.includes(questionID)) {
            exam.questions.push(questionID);
            await exam.save();
        }

        res.status(200).json({
            message: 'Question ajoutée au test avec succès !',
            examen : exam
        });
    } catch (error) {
        res.status(400).json({
            message: "Une erreur est survenue lors de l'ajout de la question.",
            erreur: error.message
        });
    }
};

exports.removeQuestionFromExamen = async (req, res) => {
    try {
        const { examenID, questionID } = req.body;

        const exam = await Examen.findById(examenID);
        if (!exam) {
            return res.status(404).json({
                message: 'Examen non trouvé !'
            });
        }

        // Supprime la question de la liste
        exam.questions = exam.questions.filter(
            (id) => id.toString() !== questionID
        );
        await exam.save();

        res.status(200).json({
            message: 'Question retirée du test avec succès !',
            examen : exam
        });
    } catch (error) {
        res.status(400).json({
            message: 'Une erreur est survenue lors de la suppression de la question.',
            erreur: error.message
        });
    }
};


exports.submitReponses = async (req, res) => {
    try {
        const { utilisateurID, examenID, reponses } = req.body;

        // Vérifie si l'examen existe
        const exam = await Examen.findById(examenID).populate('questions');
        if (!exam) {
            return res.status(404).json({ message: 'Examen non trouvé.' });
        }

        // Vérifie si une réponse existe déjà pour cet utilisateur et cet examen
        const existingReponse = await RepExamen.findOne({ utilisateurID, examenID });
        if (existingReponse && existingReponse.statut === 'en_attente') {
            return res.status(400).json({
                message: 'Vous avez déjà soumis vos réponses pour cet examen. Veuillez attendre la validation.',
            });
        }

        // Vérifie si toutes les questions obligatoires ont une réponse
        const obligatoireQuestions = exam.questions.filter(q => q.obligatoire);
        const reponsesObligatoiresIDs = obligatoireQuestions.map(q => q._id.toString());
        const reponsesIDs = reponses.map(r => r.questionID);

        const manquees = reponsesObligatoiresIDs.filter(id => !reponsesIDs.includes(id));
        if (manquees.length > 0) {
            return res.status(400).json({
                message: 'Toutes les questions obligatoires doivent avoir une réponse.',
                questionsManquantes: manquees,
            });
        }

        // Création d'une nouvelle réponse
        const newReponse = new RepExamen({
            utilisateurID,
            examenID,
            reponses,
            statut: 'en_attente',
        });

        await newReponse.save();

        const utilisateur = await Utilisateur.findById(utilisateurID);

        // Envoi de mail à l'utilisateur
        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: utilisateur.email,
            subject: 'Réponses au test',
            html: `
                <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                <p>Vous avez soumis les réponses à un test et nous les avons bien reçues !</p>
                <p>Vous recevrez une confirmation après validation.</p>`
        });

        // Envoi de mail aux administrateurs
        const adminEmails = ["info@thecoastusa.com", "formation@thecoastusa.com", "dossier@thecoastusa.com"];
        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: adminEmails.join(","),
            subject: 'Réponses au test soumises et en attente de validation',
            html: `
                <h2>Hello cher administrateur,</h2>
                <p>${utilisateur.nom} ${utilisateur.prenoms} (${utilisateur.role}) a soumis des réponses à un test.</p>
                <p>Veuillez vous connecter à votre espace de gestion pour valider ou refuser les réponses reçues.</p>
                <hr/>
                <p>Signé : Votre IA adorée</p>`
        });

        res.status(201).json({
            message: 'Réponses soumises avec succès, en attente de validation.',
            reponse: newReponse,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Une erreur est survenue lors de la soumission des réponses.',
            erreur: error.message,
        });
    }
};
