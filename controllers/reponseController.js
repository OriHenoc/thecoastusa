const Reponse = require('../models/Reponse');
const Questionnaire = require('../models/Questionnaire');

exports.submitReponses = async (req, res) => {
  try {
    const { utilisateurID, questionnaireID, reponses } = req.body;

    // Vérifie si le questionnaire existe
    const questionnaire = await Questionnaire.findById(questionnaireID).populate('questions');
    if (!questionnaire) {
      return res.status(404).json({ message: 'Questionnaire non trouvé.' });
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
    });

    await nouvelleReponse.save();

    res.status(201).json({
      message: 'Réponses soumises avec succès.',
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
        select: 'libelle type obligatoire', // Champs spécifiques à inclure
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
