const QuestionnaireFamille = require('../models/QuestionnaireFamille');
const Questionnaire = require('../models/Questionnaire');

exports.getQuestionnaire = async (req, res) => {
    try {

        let  progression = await QuestionnaireFamille.findOne({ familleID :  req.params.id });

        //Si La famille n'a débuté le questionnaire, initialiser le questionnaire

        if (!progression) {

            progression = new QuestionnaireFamille({
                familleID : req.params.id,
                questionnaireActuel: 1,
                nbreValides: 0,
                etat: 'en_cours'
            });

            await progression.save();
        }

        // Récupérer le questionnaire

        const questionnaire = await Questionnaire.findOne({
        categorie: 'famille',
        }).populate('questions');

        if (!questionnaire) {
            return res.status(404).json({ message: 'Aucun questionnaire trouvé.' });
        }

        // Retourner les questions

        res.status(200).json({
            message: 'Questionnaire récupéré avec succès.',
            informations: progression,
            questionnaire : questionnaire
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération du questionnaire.' });
    }
};

exports.getAllQuestionnaireFamille = async (req, res) => {
    try {
        const questionnaires = await QuestionnaireFamille.find().populate('familleID')
        const total = await QuestionnaireFamille.countDocuments();
        res.status(200).json({
            total : total,
            questionnaires : questionnaires.reverse()
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};