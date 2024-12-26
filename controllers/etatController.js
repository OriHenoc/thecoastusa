const Etat = require('../models/Etat');

exports.createEtat = async (req, res) => {
    try {
        const { nom, latitude, longitude } = req.body;
        const newEtat = new Etat({ nom, latitude, longitude });
        const existingEtat = await Etat.findOne({ nom });
        if (existingEtat) {
            return res.status(400).json({ message: 'Etat déjà enregistré.' });
        }
        await newEtat.save();
        res.status(201).json({
            message : `L\'etat a été enregistré !`,
            etat : newEtat
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllEtat = async (req, res) => {
    try {
        const etat = await Etat.find();
        const total = await Etat.countDocuments();
        const visibles = await Etat.countDocuments({ visible: true });
        res.status(200).json({
            total : total,
            visibles : visibles,
            etat : etat
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllVisibledEtat = async (req, res) => {
    try {
        const etat = await Etat.find({ visible: true });
        res.status(200).json({
            etat : etat
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getEtatById = async (req, res) => {
    try {
        const etat = await Etat.findById(req.params.id);
        if (!etat) return res.status(404).json('Etat non trouvé !');
        res.status(200).json({
            etat : etat
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updateEtat = async (req, res) => {
    try {
        const updatedEtat = await Etat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedEtat) return res.status(404).json('Etat non trouvé !');
        res.status(200).json({
            message : `L'etat a été mis à jour !`,
            etat : updatedEtat
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.deleteEtat = async (req, res) => {
    try {
        const deletedEtat = await Etat.findByIdAndDelete(req.params.id);
        if (!deletedEtat) return res.status(404).json('Etat non trouvé !');
        res.json('Etat supprimé !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.toggleEtatStatus = async (req, res) => {
    try {
        const etat = await Etat.findById(req.params.id);
        if (!etat) return res.status(404).json('Etat non trouvé !');

        etat.visible = !etat.visible;
        await etat.save();
        let message = `La visibilité de l\'etat a été mise à jour ! `
        let statut = etat.visible;
        if(statut){
            message += `L\'etat a été rendu visible !`
        }
        else{
            message += `L\'etat a été rendu invisible !`
        }
        res.status(200).json({
            message : message,
            etat : etat
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};