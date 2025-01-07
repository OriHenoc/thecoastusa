const Question = require('../models/Question');

exports.createQuestion = async (req, res) => {
    try {
        const { intitule, type, obligatoire } = req.body;
        const newQuestion = new Question({ intitule, type, obligatoire });
        await newQuestion.save();
        res.status(201).json({
            message : `La question a été enregistrée !`,
            question : newQuestion
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllQuestion = async (req, res) => {
    try {
        const questions = await Question.find();
        const total = await Question.countDocuments();
        res.status(200).json({
            total : total,
            questions : questions
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getQuestionsByType = async (req, res) => {
    try {
        const { type } = req.params;

        const questions = await Question.find({ type });
        res.status(200).json({
            total: questions.length,
            questions
        });
    } catch (error) {
        res.status(400).json({
            message: 'Une erreur est survenue lors de la récupération des questions.',
            erreur: error.message
        });
    }
};

exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json('Question non trouvée !');
        res.status(200).json({
            question : question
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updateQuestion = async (req, res) => {
    try {
        const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedQuestion) return res.status(404).json('Question non trouvée !');
        res.status(200).json({
            message : `Le question a été mise à jour !`,
            question : updatedQuestion
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.addOptionToQuestion = async (req, res) => {
    try {
        const { option, questionID } = req.body;

        if (!option || typeof option !== 'string') {
            return res.status(400).json({ message: "Option invalide !" });
        }

        const question = await Question.findById(questionID);
        if (!question) {
            return res.status(404).json({ message: 'Question non trouvée !' });
        }

        if (!question.options.includes(option)) {
            question.options.push(option);
            await question.save();
        }

        res.status(200).json({
            message: 'Option ajoutée à la question avec succès !',
            question
        });
    } catch (error) {
        res.status(400).json({
            message: "Une erreur est survenue lors de l'ajout de l'option.",
            erreur: error.message
        });
    }
};

exports.removeOptionFromQuestion = async (req, res) => {
    try {
        const { option, questionID } = req.body;

        if (!option || typeof option !== 'string') {
            return res.status(400).json({ message: "Option invalide !" });
        }

        const question = await Question.findById(questionID);
        if (!question) {
            return res.status(404).json({ message: 'Question non trouvée !' });
        }

        const initialLength = question.options.length;
        question.options = question.options.filter((opt) => opt !== option);

        if (question.options.length === initialLength) {
            return res.status(400).json({ message: "Option non trouvée dans la liste des options." });
        }

        await question.save();

        res.status(200).json({
            message: 'Option retirée de la question avec succès !',
            question
        });
    } catch (error) {
        res.status(400).json({
            message: "Une erreur est survenue lors de la suppression de l'option.",
            erreur: error.message
        });
    }
};


exports.deleteQuestion = async (req, res) => {
    try {
        const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
        if (!deletedQuestion) return res.status(404).json('Question non trouvée !');
        res.json('Question supprimée !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};
