const Fille = require('../models/Fille');

exports.createFille = async (req, res) => {
    try {
        const { biographie, experience, langues, utilisateurID, videoDePresentation, photosFille } = req.body;
        const newFille = new Fille({ biographie, experience, langues, utilisateurID, videoDePresentation, photosFille });
        if (existingFille) {
            return res.status(400).json({ message: 'Fille déjà enregistrée.' });
        }
        await newFille.save();
        res.status(201).json({
            message : `La fille a été enregistrée !`,
            fille : newFille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllFille = async (req, res) => {
    try {
        const fille = await Fille.find.populate(['langues', 'utilisateurID', 'photosFille']);
        const total = await Fille.countDocuments();
        const visibles = await Fille.countDocuments({ visible: true });
        res.status(200).json({
            total : total,
            visibles : visibles,
            fille : fille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllVisibledFille = async (req, res) => {
    try {
        const fille = await Fille.find({ visible: true }).populate(['langues', 'utilisateurID', 'photosFille']);
        res.status(200).json({
            fille : fille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getFilleById = async (req, res) => {
    try {
        const fille = await Fille.findById(req.params.id).populate(['langues', 'utilisateurID', 'photosFille']);
        if (!fille) return res.status(404).json('Fille non trouvée !');
        res.status(200).json({
            fille : fille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updateFille = async (req, res) => {
    try {
        const updatedFille = await Fille.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedFille) return res.status(404).json('Fille non trouvée !');
        res.status(200).json({
            message : `La fille a été mise à jour !`,
            fille : updatedFille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.deleteFille = async (req, res) => {
    try {
        const deletedFille = await Fille.findByIdAndDelete(req.params.id);
        if (!deletedFille) return res.status(404).json('Fille non trouvée !');
        res.json('Fille supprimée !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.toggleFilleStatus = async (req, res) => {
    try {
        const fille = await Fille.findById(req.params.id);
        if (!fille) return res.status(404).json('Fille non trouvée !');

        fille.visible = !fille.visible;
        await fille.save();
        let message = `La visibilité du fille a été mise à jour ! `
        let statut = fille.visible;
        if(statut){
            message += `La fille a été rendue visible !`
        }
        else{
            message += `La fille a été rendue invisible !`
        }
        res.status(200).json({
            message : message,
            fille : fille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};