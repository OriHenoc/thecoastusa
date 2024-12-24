const Pays = require('../models/Pays');

exports.createPays = async (req, res) => {
    try {
        const { nom, alpha3, latitude, longitude } = req.body;
        const newPays = new Pays({ nom, alpha3, latitude, longitude });
        const existingPays = await Pays.findOne({ $or: [{ nom }, { alpha3 }] });
        if (existingPays) {
            return res.status(400).json({ message: 'Pays déjà enregistré.' });
        }
        await newPays.save();
        res.status(201).json({
            message : `Le pays a été enregistré !`,
            pays : newPays
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllPays = async (req, res) => {
    try {
        const pays = await Pays.find();
        const total = await Pays.countDocuments();
        const visibles = await Pays.countDocuments({ visible: true });
        res.status(200).json({
            total : total,
            visibles : visibles,
            pays : pays
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllVisibledPays = async (req, res) => {
    try {
        const pays = await Pays.find({ visible: true });
        res.status(200).json({
            pays : pays
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getPaysById = async (req, res) => {
    try {
        const pays = await Pays.findById(req.params.id);
        if (!pays) return res.status(404).json('Pays non trouvé !');
        res.status(200).json({
            pays : pays
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updatePays = async (req, res) => {
    try {
        const updatedPays = await Pays.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedPays) return res.status(404).json('Pays non trouvé !');
        res.status(200).json({
            message : `Le pays a été mis à jour !`,
            pays : updatedPays
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.deletePays = async (req, res) => {
    try {
        const deletedPays = await Pays.findByIdAndDelete(req.params.id);
        if (!deletedPays) return res.status(404).json('Pays non trouvé !');
        res.json('Pays supprimé !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.togglePaysStatus = async (req, res) => {
    try {
        const pays = await Pays.findById(req.params.id);
        if (!pays) return res.status(404).json('Pays non trouvé !');

        pays.visible = !pays.visible;
        await pays.save();
        let message = `La visibilité du pays a été mise à jour ! `
        let statut = pays.visible;
        if(statut){
            message += `Le pays a été rendu visible !`
        }
        else{
            message += `Le pays a été rendu invisible !`
        }
        res.status(200).json({
            message : message,
            pays : pays
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};