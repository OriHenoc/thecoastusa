const Reponse = require('../models/Reponse');
const Questionnaire = require('../models/Questionnaire');
const QuestionnaireFille = require('../models/QuestionnaireFille');
const QuestionnaireFamille = require('../models/QuestionnaireFamille');
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

exports.submitReponses = async (req, res) => {
  try {
    const { utilisateurID, questionnaireID, reponses } = req.body;

    // Vérifie si le questionnaire existe
    const questionnaire = await Questionnaire.findById(questionnaireID).populate('questions');
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire non trouvé.' });
    }

    // Vérifie si une réponse est déjà en attente de validation pour ce questionnaire
    const reponseExistante = await Reponse.findOne({
      utilisateurID,
      questionnaireID,
      statut: 'en_attente',
    });

    if (reponseExistante) {
      return res.status(400).json({
        message: 'Vous avez déjà soumis vos réponses pour ce questionnaire. Veuillez attendre la validation.',
      });
    }

    // Vérifie si toutes les questions obligatoires ont une réponse
    const obligatoireQuestions = questionnaire.questions.filter(q => q.obligatoire);
    const reponsesObligatoiresIDs = obligatoireQuestions.map(q => q._id.toString());
    const reponsesIDs = reponses.map(r => r.questionID);

    const manquees = reponsesObligatoiresIDs.filter(id => !reponsesIDs.includes(id));
    if (manquees.length > 0) {
      return res.status(400).json({
        message: 'Toutes les questions obligatoires doivent avoir une réponse.',
        questionsManquantes: manquees,
      });
    }

    // Enregistre les réponses dans le modèle Reponse
    const nouvelleReponse = new Reponse({
      utilisateurID,
      questionnaireID,
      reponses,
      statut: 'en_attente',
    });

    await nouvelleReponse.save();
    
    
    const utilisateur = await Utilisateur.findById(utilisateurID);

    if(utilisateur.role == 'fille'){
      // Mettre la progression en attente afin de faire patienter pendant la validation de la reponse
      const progression = await QuestionnaireFille.findOne({ filleID: utilisateurID });
      progression.etat = 'en_attente';

      await progression.save();
    }

    if(utilisateur.role == 'famille'){
      // Mettre la progression en attente afin de faire patienter pendant la validation de la reponse
      const progression = await QuestionnaireFamille.findOne({ familleID: utilisateurID });
      progression.etat = 'en_attente';

      await progression.save();
    }

    // ENVOYER LES MAILS

      //Mail

      await transporter.sendMail({
          from: "admin@thecoastusa.com",
          to: utilisateur.email,
          subject: "Questionnaire soumis",
          html: `
              <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
              <p>Vous avez soumis les réponses à un questionnaire et nous les avons bien reçues !</p>
              <p>Vous recevrez une confirmation après validation.</p>`
      });

      //Mail aux admins

      adminEmails = ["info@thecoastusa.com", "inscription@thecoastusa.com", "dossier@thecoastusa.com"]

      await transporter.sendMail({
          from: "admin@thecoastusa.com",
          to: adminEmails.join(","),
          subject: "Questionnaire soumis et en attente de validation",
          html: `
              <h2>Hello cher administrateur,</h2>
              <p>${utilisateur.nom} ${utilisateur.prenoms} (${utilisateur.role}) a soumis des réponses à un questionnaire.</p>
              <p>Veuillez vous connecter à votre espace de gestion pour valider ou refuser les réponses reçues.</p>
              <hr/>
              <p>Signé : Votre IA adorée</p>
          `
      });

    res.status(201).json({
      message: 'Réponses soumises avec succès, en attente de validation.',
      reponse: nouvelleReponse,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la soumission des réponses.',
      erreur: error.message,
    });
  }
};

exports.getAllReponses = async (req, res) => {
  try {

    // Recherche des réponses par utilisateurID et population des champs nécessaires
    const reponses = await Reponse.find()
      .populate({
        path: 'reponses.questionID', // Chemin de population pour les questions
        select: 'intitule type obligatoire', // Champs spécifiques à inclure
      })
      .populate('utilisateurID')
      .populate('questionnaireID'); // Inclure les détails des questionnaires

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
    const reponses = await Reponse.find({ utilisateurID : req.params.id })
      .populate({
        path: 'reponses.questionID', // Chemin de population pour les questions
        select: 'intitule type obligatoire', // Champs spécifiques à inclure
      })
      .populate('questionnaireID', 'titre description'); // Inclure les détails des questionnaires

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

// exports.getReponsesByQuestionnaire = async (req, res) => {
//   try {
//     // Récupérer la progression (utilisateur actuel et questionnaire en cours)
//     const progression = await QuestionnaireFille.findById(req.params.id);

//     if (!progression) {
//       return res.status(404).json({ message: 'Progression non trouvée.' });
//     }

//     // Récupérer le questionnaire en cours (en fonction du 'ordre' de progression)
//     const questionnaire = await Questionnaire.findOne({
//       categorie: 'fille',
//       ordre: progression.questionnaireActuel,
//     }).populate('questions');

//     if (!questionnaire) {
//       return res.status(404).json({ message: 'Aucun questionnaire trouvé.' });
//     }

//     // Recherche des réponses de tous les utilisateurs pour ce questionnaire spécifique
//     const reponses = await Reponse.find({ questionnaireID: questionnaire._id })
//       .populate({
//         path: 'reponses.questionID', // Population des questions
//         select: 'intitule type obligatoire', // Champs spécifiques des questions
//       })
//       .populate('utilisateurID') // Population des utilisateurs ayant répondu
//       .populate('questionnaireID', 'ordre titre'); // Population des détails du questionnaire

//     if (reponses.length === 0) {
//       return res.status(404).json({ message: 'Aucune réponse trouvée pour ce questionnaire.' });
//     }

//     // Renvoi des réponses récupérées
//     res.status(200).json({
//       message: 'Réponses récupérées avec succès.',
//       reponses: reponses,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: 'Une erreur est survenue lors de la récupération des réponses.',
//       erreur: error.message,
//     });
//   }
// };

exports.getReponsesByQuestionnaire = async (req, res) => {
  try {
    // Récupérer le questionnaire actuel
    const progression = await QuestionnaireFille.findById(req.params.id);

    if (!progression) {
      return res.status(404).json({ message: 'Progression non trouvée.' });
    }

    // Récupérer le questionnaire en cours (en fonction du 'ordre' de progression)
    const questionnaire = await Questionnaire.findOne({
      categorie: 'fille',
      ordre: progression.questionnaireActuel,
    }).populate('questions');

    if (!questionnaire) {
      return res.status(404).json({ message: 'Aucun questionnaire trouvé.' });
    }

    // Recherche des réponses de tous les utilisateurs pour ce questionnaire spécifique
    const reponses = await Reponse.find({ questionnaireID: questionnaire._id })
      .populate({
        path: 'reponses.questionID', // Population des questions
        select: 'intitule type obligatoire', // Champs spécifiques des questions
      })
      .populate('utilisateurID') // Population des utilisateurs ayant répondu
      .populate('questionnaireID', 'ordre titre'); // Population des détails du questionnaire

    if (reponses.length === 0) {
      return res.status(404).json({ message: 'Aucune réponse trouvée pour ce questionnaire.' });
    }

    // Regroupement des réponses par filleID
    const reponsesGroupedByFille = groupReponsesByFille(reponses);

    // Renvoi des réponses regroupées par filleID
    res.status(200).json({
      message: 'Réponses récupérées avec succès.',
      reponses: reponsesGroupedByFille,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Une erreur est survenue lors de la récupération des réponses.',
      erreur: error.message,
    });
  }
};

// Fonction de regroupement des réponses par filleID
function groupReponsesByFille(reponses) {
  const grouped = [];

  reponses.forEach(reponse => {
    const filleGroup = grouped.find(group => group.filleID._id.toString() === reponse.utilisateurID._id.toString());

    if (filleGroup) {
      // Ajouter la réponse au groupe existant
      filleGroup.reponses.push(reponse);
    } else {
      // Créer un nouveau groupe pour cette fille
      grouped.push({
        filleID: reponse.utilisateurID,
        reponses: [reponse]
      });
    }
  });

  return grouped;
}


exports.validerReponses = async (req, res) => {
  try {

    // Récupère la réponse
    const reponse = await Reponse.findById(req.params.id);
    if (!reponse) {
      return res.status(404).json({ message: 'Réponse non trouvée.' });
    }

    // Met à jour le statut à "valide"
    reponse.statut = 'valide';
    await reponse.save();

    const utilisateur = await Utilisateur.findById(reponse.utilisateurID);

    if(utilisateur.role == 'fille'){
      const progression = await QuestionnaireFille.findOne({ filleID: reponse.utilisateurID });

      if (!progression) {
        return res.status(404).json({ message: 'Progression non trouvée.' });
      }

      // Valider le questionnaire actuel
      if (progression.questionnaireActuel <= progression.nbreValides) {
        return res.status(400).json({ message: 'Ce questionnaire a déjà été validé.' });
      }
      
      // Incrémenter le compteur et mettre à jour l'état
      progression.nbreValides += 1;
      if (progression.nbreValides < 3) {
        progression.questionnaireActuel += 1;
        progression.etat = 'en_cours';
      } else {
        progression.etat = 'complet';
      }

      // garder les traces
      progression.historiqueValidations.push({
        questionnaireID: reponse.questionnaireID,
        dateValidation: new Date(),
      });

      await progression.save();
    }

    if(utilisateur.role == 'famille'){
      const progression = await QuestionnaireFamille.findOne({ familleID: reponse.utilisateurID });

      if (!progression) {
        return res.status(404).json({ message: 'Progression non trouvée.' });
      }

      // Valider le questionnaire actuel
      if (progression.questionnaireActuel <= progression.nbreValides) {
        return res.status(400).json({ message: 'Ce questionnaire a déjà été validé.' });
      }
      
      // Incrémenter le compteur et mettre à jour l'état
      progression.nbreValides += 1;
      if (progression.nbreValides < 3) {
        progression.questionnaireActuel += 1;
        progression.etat = 'en_cours';
      } else {
        progression.etat = 'complet';
      }

      await progression.save();
    }

    if(progression.etat == 'complet'){

      //Mail
        await transporter.sendMail({
          from: "admin@thecoastusa.com",
          to: utilisateur.email,
          subject: "Etape suivante",
          html: `
              <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
              <p>L'administration a validé vos réponses à tous les questionnaires soumis précédemment !</p>
              <p>La prochaine étape consiste à fournir des documents</p>
              <p>Vous pouvez vous connecter et vous rendre dans la partie "Documents" pour poursuivre la composition de votre dossier.</p>`
      });
    }
    else{
      //Mail
      await transporter.sendMail({
        from: "admin@thecoastusa.com",
        to: utilisateur.email,
        subject: "Questionnaire validé",
        html: `
            <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
            <p>L'administration a validé vos réponses au questionnaire soumis précédemment !</p>
            <p>Vous pouvez vous connecter pour poursuivre la composition de votre dossier.</p>`
    });
    }
    

    res.status(200).json({ message: 'Réponse validée avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la validation des réponses.' });
  }
};

exports.refuserReponses = async (req, res) => {
  try {

    // Récupère la réponse et la supprime
    const reponse = await Reponse.findByIdAndDelete(req.params.id);
    if (!reponse) {
      return res.status(404).json({ message: 'Réponse non trouvée.' });
    }

    const utilisateur = await Utilisateur.findById(reponse.utilisateurID);

    if(utilisateur.role == 'fille'){
      const progression = await QuestionnaireFille.findOne({ filleID: reponse.utilisateurID });

      if (!progression) {
        return res.status(404).json({ message: 'Progression non trouvée.' });
      }

      progression.etat = 'en_cours';

      await progression.save();
    }

    if(utilisateur.role == 'famille'){
      const progression = await QuestionnaireFamille.findOne({ familleID: reponse.utilisateurID });

      if (!progression) {
        return res.status(404).json({ message: 'Progression non trouvée.' });
      }

      progression.etat = 'en_cours';

      await progression.save();
    }

    //Mail


    await transporter.sendMail({
        from: "admin@thecoastusa.com",
        to: utilisateur.email,
        subject: "Questionnaire à reprendre",
        html: `
            <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
            <p>L'administration n'a pas validé vos réponses au questionnaire soumis précédemment !</p>
            <p>Vous devez vous connecter pour reprendre le questionnaire en soumettant des réponses satisfaisantes.</p>`
    });

    res.status(200).json({ message: 'Réponse refusée, le questionnaire sera repris.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors du refus des réponses.' });
  }
};
