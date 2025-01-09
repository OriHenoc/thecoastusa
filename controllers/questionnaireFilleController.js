const QuestionnaireFille = require('../models/QuestionnaireFille');
const Questionnaire = require('../models/Questionnaire');
const Reponse = require('../models/Reponse');

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

        if(progression.etat == 'en_attente'){
            return res.status(400).json({
                message: 'Vous avez soumis des réponses à un questionnaire qui est en attente de validation. Veuillez patienter !',
                valides: progression.nbreValides
            });
        }

        // Récupérer le premier questionnaire ou celui correspondant à questionnaireActuel

        const questionnaire = await Questionnaire.findOne({
        categorie: 'fille',
        ordre: progression.questionnaireActuel
        }).populate('questions');

        if (!questionnaire) {
            return res.status(404).json({ message: 'Aucun questionnaire trouvé.' });
        }

        // Vérifie si une réponse est déjà en attente de validation pour ce questionnaire
        const reponseExistante = await Reponse.findOne({
            utilisateurID: req.params.id,
            questionnaireID: questionnaire._id,
            statut: 'en_attente',
        });

        if (reponseExistante) {
            return res.status(400).json({
                message: 'Vous avez déjà soumis vos réponses pour ce questionnaire. Veuillez attendre la validation.',
            });
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