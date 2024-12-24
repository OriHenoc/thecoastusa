const Langue = require('../models/Langue');

exports.createLangue = async (req, res) => {
    try {
        const { nom } = req.body;
        const newLangue = new Langue({ nom });
        if (existingLangue) {
            return res.status(400).json({ message: 'Langue déjà enregistrée.' });
        }
        await newLangue.save();
        res.status(201).json({
            message : `La langue a été enregistrée !`,
            langue : newLangue
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllLangue = async (req, res) => {
    try {
        const langue = await Langue.find();
        const total = await Langue.countDocuments();
        const visibles = await Langue.countDocuments({ visible: true });
        res.status(200).json({
            total : total,
            visibles : visibles,
            langue : langue
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllVisibledLangue = async (req, res) => {
    try {
        const langue = await Langue.find({ visible: true });
        res.status(200).json({
            langue : langue
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getLangueById = async (req, res) => {
    try {
        const langue = await Langue.findById(req.params.id);
        if (!langue) return res.status(404).json('Langue non trouvée !');
        res.status(200).json({
            langue : langue
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updateLangue = async (req, res) => {
    try {
        const updatedLangue = await Langue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedLangue) return res.status(404).json('Langue non trouvée !');
        res.status(200).json({
            message : `La langue a été mise à jour !`,
            langue : updatedLangue
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.deleteLangue = async (req, res) => {
    try {
        const deletedLangue = await Langue.findByIdAndDelete(req.params.id);
        if (!deletedLangue) return res.status(404).json('Langue non trouvée !');
        res.json('Langue supprimée !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.toggleLangueStatus = async (req, res) => {
    try {
        const langue = await Langue.findById(req.params.id);
        if (!langue) return res.status(404).json('Langue non trouvée !');

        langue.visible = !langue.visible;
        await langue.save();
        let message = `La visibilité de la langue a été mise à jour ! `
        let statut = langue.visible;
        if(statut){
            message += `La langue a été rendue visible !`
        }
        else{
            message += `La langue a été rendue invisible !`
        }
        res.status(200).json({
            message : message,
            langue : langue
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};