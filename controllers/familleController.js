const Famille = require('../models/Famille');

exports.createFamille = async (req, res) => {
    try {
        const { nombreEnfants, etatID, utilisateurID } = req.body;
        const newFamille = new Famille({ nombreEnfants, etatID, utilisateurID });
        const existingFamille = await Famille.findOne({ utilisateurID });
        if (existingFamille) {
            return res.status(400).json({ message: 'Famille déjà enregistrée.' });
        }
        await newFamille.save();
        res.status(201).json({
            message : `La famille a été enregistrée !`,
            famille : newFamille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllFamille = async (req, res) => {
    try {
        const famille = await Famille.find().populate(['etatID', 'utilisateurID']);
        const total = await Famille.countDocuments();
        const visibles = await Famille.countDocuments({ visible: true });
        res.status(200).json({
            total : total,
            visibles : visibles,
            famille : famille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllVisibledFamille = async (req, res) => {
    try {
        const famille = await Famille.find({ visible: true }).populate(['etatID', 'utilisateurID']);
        res.status(200).json({
            famille : famille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getFamilleById = async (req, res) => {
    try {
        const famille = await Famille.findById(req.params.id).populate(['etatID', 'utilisateurID']);
        if (!famille) return res.status(404).json('Famille non trouvée !');
        res.status(200).json({
            famille : famille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updateFamille = async (req, res) => {
    try {
        const updatedFamille = await Famille.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedFamille) return res.status(404).json('Famille non trouvée !');
        res.status(200).json({
            message : `La famille a été mise à jour !`,
            famille : updatedFamille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.deleteFamille = async (req, res) => {
    try {
        const deletedFamille = await Famille.findByIdAndDelete(req.params.id);
        if (!deletedFamille) return res.status(404).json('Famille non trouvée !');
        res.json('Famille supprimée !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.toggleFamilleStatus = async (req, res) => {
    try {
        const famille = await Famille.findById(req.params.id);
        if (!famille) return res.status(404).json('Famille non trouvée !');

        famille.visible = !famille.visible;
        await famille.save();
        let message = `La visibilité du famille a été mise à jour ! `
        let statut = famille.visible;
        if(statut){
            message += `La famille a été rendue visible !`
        }
        else{
            message += `La famille a été rendue invisible !`
        }
        res.status(200).json({
            message : message,
            famille : famille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};