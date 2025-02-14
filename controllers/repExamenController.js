const Questionnaire = require('../models/Questionnaire');
const QuestionnaireFille = require('../models/QuestionnaireFille');
const QuestionnaireFamille = require('../models/QuestionnaireFamille');
const Utilisateur = require('../models/Utilisateur')
const nodemailer = require('nodemailer');
const DocumentsSoumis = require('../models/DocumentsSoumis');
const Examen = require('../models/Examen');
const RepExamen = require('../models/RepExamen');
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

exports.getAllReponses = async (req, res) => {
  try {

    // Recherche des réponses par utilisateurID et population des champs nécessaires
    const reponses = await RepExamen.find()
      .populate({
        path: 'reponses.questionID', // Chemin de population pour les questions
        select: 'intitule type obligatoire', // Champs spécifiques à inclure
      })
      .populate('utilisateurID')
      .populate('examenID'); // Inclure les détails des tests

    if (reponses.length === 0) {
      return res.status(404).json({ message: 'Aucune réponse trouvée.' });
    }

    res.status(200).json({
      message: 'Réponses récupérées avec succès.',
      reponses: reponses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la récupération des réponses.',
      erreur: error.message,
    });
  }
};


exports.getReponsesByUtilisateur = async (req, res) => {
  try {

    // Recherche des réponses par utilisateurID et population des champs nécessaires
    const reponses = await RepExamen.find({ utilisateurID : req.params.id })
      .populate({
        path: 'reponses.questionID', // Chemin de population pour les questions
        select: 'intitule type obligatoire', // Champs spécifiques à inclure
      })
      .populate('examenID'); // Inclure les détails des tests

    if (reponses.length === 0) {
      return res.status(404).json({ message: 'Aucune réponse trouvée pour cet utilisateur.' });
    }

    res.status(200).json({
      message: 'Réponses récupérées avec succès.',
      reponses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la récupération des réponses.',
      erreur: error.message,
    });
  }
};

exports.getReponsesByExamen = async (req, res) => {
  try {
    // Récupérer l'examen

    const exam = await Examen.findById(req.params.id).populate('questions');
    if (!exam) {
        return res.status(404).json({ message: 'Examen non trouvé.' });
    }

    // Recherche des réponses de tous les utilisateurs pour ce test spécifique
    const reponses = await RepExamen.find({ examenID: exam._id })
      .populate({
        path: 'reponses.questionID', // Population des questions
        select: 'intitule type obligatoire', // Champs spécifiques des questions
      })
      .populate('utilisateurID') // Population des utilisateurs ayant répondu
      .populate('examenID'); // Population des détails du test

    if (reponses.length === 0) {
      return res.status(404).json({ message: 'Aucune réponse trouvée pour ce test.' });
    }

    // Renvoi des réponses regroupées par filleID
    res.status(200).json({
      message: 'Réponses récupérées avec succès.',
      reponses: reponses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la récupération des réponses.',
      erreur: error.message,
    });
  }
};

exports.validerReponses = async (req, res) => {
  try {

    // Récupère la réponse
    const reponse = await RepExamen.findById(req.params.id);
    if (!reponse) {
      return res.status(404).json({ message: 'Réponse non trouvée.' });
    }

    // Met à jour le statut à "reussi"
    reponse.statut = 'reussi';
    await reponse.save();

    const utilisateur = await Utilisateur.findById(reponse.utilisateurID);


      //Mail
        await transporter.sendMail({
          from: '"The Coast USA" <admin@thecoastusa.com>',
          to: utilisateur.email,
          subject: "Test réussi",
          html: `
              <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
              <p>L'administration a validé vos réponses au test soumis précédemment !</p>`
      });

    res.status(200).json({ message: 'Réponse validée avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la validation des réponses.' });
  }
};

exports.refuserReponses = async (req, res) => {
  try {

    // Récupère la réponse et la supprime
    const reponse = await RepExamen.findByIdAndDelete(req.params.id);
    if (!reponse) {
      return res.status(404).json({ message: 'Réponse non trouvée.' });
    }

    const utilisateur = await Utilisateur.findById(reponse.utilisateurID);

    //Mail

    await transporter.sendMail({
        from: '"The Coast USA" <admin@thecoastusa.com>',
        to: utilisateur.email,
        subject: "Test à reprendre",
        html: `
            <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
            <p>L'administration n'a pas validé vos réponses au test soumis précédemment !</p>
            <p>Vous devez vous connecter pour reprendre le test en soumettant des réponses satisfaisantes.</p>`
    });

    res.status(200).json({ message: 'Réponse refusée, le test sera repris.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors du refus des réponses.' });
  }
};
