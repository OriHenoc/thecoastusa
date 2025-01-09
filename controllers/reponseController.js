const Reponse = require('../models/Reponse');
const Questionnaire = require('../models/Questionnaire');
const QuestionnaireFille = require('../models/QuestionnaireFille');

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
    
    // Mettre la progression en attente afin de faire patienter pendant la validation de la reponse
    const progression = await QuestionnaireFille.findOne({ filleID: utilisateurID });
    progression.etat = 'en_attente';

    await progression.save();

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


exports.validerReponses = async (req, res) => {
  try {
    const { reponseID } = req.body;

    // Récupère la réponse
    const reponse = await Reponse.findById(reponseID);
    if (!reponse) {
      return res.status(404).json({ message: 'Réponse non trouvée.' });
    }

    // Met à jour le statut à "valide"
    reponse.statut = 'valide';
    await reponse.save();

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

    await progression.save();

    res.status(200).json({ message: 'Réponse validée avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la validation des réponses.' });
  }
};

exports.refuserReponses = async (req, res) => {
  try {
    const { reponseID } = req.body;

    // Récupère la réponse et la supprime
    const reponse = await Reponse.findByIdAndDelete(reponseID);
    if (!reponse) {
      return res.status(404).json({ message: 'Réponse non trouvée.' });
    }

    const progression = await QuestionnaireFille.findOne({ filleID: reponse.utilisateurID });

    if (!progression) {
      return res.status(404).json({ message: 'Progression non trouvée.' });
    }

    progression.etat = 'en_cours';

    await progression.save();

    res.status(200).json({ message: 'Réponse refusée, veuillez reprendre.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors du refus des réponses.' });
  }
};
