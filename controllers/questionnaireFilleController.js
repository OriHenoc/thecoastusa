const QuestionnaireFille = require('../models/QuestionnaireFille');
const Questionnaire = require('../models/Questionnaire');

exports.getQuestionnaire = async (req, res) => {
    try {

        let  progression = await QuestionnaireFille.findOne({ filleID :  req.params.id });

        //Si La fille n'a débuté aucun questionnaire, initialiser avec le premier questionnaire

        if (!progression) {

            progression = new QuestionnaireFille({
                filleID : req.params.id,
                questionnaireActuel: 1,
                nbreValides: 0,
                etat: 'en_cours'
            });

            await progression.save();
        }

        // Récupérer le premier questionnaire ou celui correspondant à questionnaireActuel

        const questionnaire = await Questionnaire.findOne({
        categorie: 'fille',
        ordre: progression.questionnaireActuel
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