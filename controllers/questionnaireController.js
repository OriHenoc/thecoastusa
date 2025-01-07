const Questionnaire = require('../models/Questionnaire');
const Question = require('../models/Question');

exports.createQuestionnaire = async (req, res) => {
    try {
        const { titre, categorie, ordre } = req.body;
        const newQuestionnaire = new Questionnaire({ titre, categorie, ordre });
        await newQuestionnaire.save();
        res.status(201).json({
            message : `Le questionnaire a été enregistré !`,
            questionnaire : newQuestionnaire
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllQuestionnaire = async (req, res) => {
    try {
        const questionnaires = await Questionnaire.find().populate('questions');
        const total = await Questionnaire.countDocuments();
        res.status(200).json({
            total : total,
            questionnaires : questionnaires
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getQuestionnairesByCategory = async (req, res) => {
    try {
        const { categorie } = req.params;

        const questionnaires = await Questionnaire.find({ categorie });
        res.status(200).json({
            total: questionnaires.length,
            questionnaires
        });
    } catch (error) {
        res.status(400).json({
            message: 'Une erreur est survenue lors de la récupération des questionnaires.',
            erreur: error.message
        });
    }
};


exports.getQuestionnaireById = async (req, res) => {
    try {
        const questionnaire = await Questionnaire.findById(req.params.id).populate('questions');
        if (!questionnaire) return res.status(404).json('Questionnaire non trouvé !');
        res.status(200).json({
            questionnaire : questionnaire
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updateQuestionnaire = async (req, res) => {
    try {
        const updatedQuestionnaire = await Questionnaire.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedQuestionnaire) return res.status(404).json('Questionnaire non trouvé !');
        res.status(200).json({
            message : `Le questionnaire a été mis à jour !`,
            questionnaire : updatedQuestionnaire
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.addQuestionToQuestionnaire = async (req, res) => {
    try {
        const { questionnaireID, questionID } = req.body;

        // Vérifie si le questionnaire existe
        const questionnaire = await Questionnaire.findById(questionnaireID);
        if (!questionnaire) {
            return res.status(404).json({
                message: 'Questionnaire non trouvé !'
            });
        }

        // Vérifie si la question existe
        const question = await Question.findById(questionID);
        if (!question) {
            return res.status(404).json({
                message: 'Question non trouvée !'
            });
        }

        // Ajoute la question au questionnaire
        if (!questionnaire.questions.includes(questionID)) {
            questionnaire.questions.push(questionID);
            await questionnaire.save();
        }

        res.status(200).json({
            message: 'Question ajoutée au questionnaire avec succès !',
            questionnaire
        });
    } catch (error) {
        res.status(400).json({
            message: "Une erreur est survenue lors de l'ajout de la question.",
            erreur: error.message
        });
    }
};

exports.removeQuestionFromQuestionnaire = async (req, res) => {
    try {
        const { questionnaireID, questionID } = req.body;

        const questionnaire = await Questionnaire.findById(questionnaireID);
        if (!questionnaire) {
            return res.status(404).json({
                message: 'Questionnaire non trouvé !'
            });
        }

        // Supprime la question de la liste
        questionnaire.questions = questionnaire.questions.filter(
            (id) => id.toString() !== questionID
        );
        await questionnaire.save();

        res.status(200).json({
            message: 'Question retirée du questionnaire avec succès !',
            questionnaire
        });
    } catch (error) {
        res.status(400).json({
            message: 'Une erreur est survenue lors de la suppression de la question.',
            erreur: error.message
        });
    }
};


exports.deleteQuestionnaire = async (req, res) => {
    try {
        const deletedQuestionnaire = await Questionnaire.findByIdAndDelete(req.params.id);
        if (!deletedQuestionnaire) return res.status(404).json('Questionnaire non trouvé !');
        res.json('Questionnaire supprimé !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};
