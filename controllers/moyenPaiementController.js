const fs = require('fs-extra');
const path = require('path');
const MoyenPaiement = require('../models/MoyenPaiement');

exports.createMoyenPaiement = async (req, res) => {
    try {
        const { nom, instructions } = req.body;
        const newMoyenPaiement = new MoyenPaiement({ nom, instructions });
        const existingMoyenPaiement = await MoyenPaiement.findOne({ nom });
        if (existingMoyenPaiement) {
            return res.status(400).json({ message: 'Moyen de paiement déjà enregistré.' });
        }
        await newMoyenPaiement.save();
        res.status(201).json({
            message : `Le moyen de paiement a été enregistré !`,
            moyen : newMoyenPaiement
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllMoyenPaiement = async (req, res) => {
    try {
        const moyens = await MoyenPaiement.find();
        const total = await MoyenPaiement.countDocuments();
        const disponibles = await MoyenPaiement.countDocuments({ disponible: true });
        res.status(200).json({
            total : total,
            disponibles : disponibles,
            moyens : moyens
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllDispoMoyenPaiement = async (req, res) => {
    try {
        const moyens = await MoyenPaiement.find({ disponible: true });
        res.status(200).json({
            moyens : moyens
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getMoyenPaiementById = async (req, res) => {
    try {
        const moyen = await MoyenPaiement.findById(req.params.id);
        if (!moyen) return res.status(404).json('Moyen de paiement non trouvé !');
        res.status(200).json({
            moyen : moyen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updateMoyenPaiement = async (req, res) => {
    try {
        const updatedMoyenPaiement = await MoyenPaiement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedMoyenPaiement) return res.status(404).json('Moyen de paiement non trouvé !');
        res.status(200).json({
            message : `Le moyen de paiement a été mis à jour !`,
            moyen : updatedMoyenPaiement
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.deleteMoyenPaiement = async (req, res) => {
    try {
        const deletedMoyenPaiement = await MoyenPaiement.findByIdAndDelete(req.params.id);
        if (!deletedMoyenPaiement) return res.status(404).json('Moyen de paiement non trouvé !');
        res.json('Moyen de paiement supprimé !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.toggleMoyenPaiementStatus = async (req, res) => {
    try {
        const moyen = await MoyenPaiement.findById(req.params.id);
        if (!moyen) return res.status(404).json('Moyen de aiement non trouvé !');

        moyen.disponible = !moyen.disponible;
        await moyen.save();
        let message = `La disponibilité du moyen de paiement a été mise à jour ! `
        let statut = moyen.disponible;
        if(statut){
            message += `Le moyen de paiement a été rendu disponible !`
        }
        else{
            message += `Le moyen de paiement a été rendu indisponible !`
        }
        res.status(200).json({
            message : message,
            moyen : moyen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.uploadLogo = async (req, res) => {
    try {
        const moyen = await MoyenPaiement.findById(req.params.id);
        if (!moyen) {
            return res.status(404).json({ message: 'Moyen de paiement non trouvé !' });
        }
        
        // Supprimer l'ancien logo s'il existe
        if (moyen.logo) {
            const oldLogoPath = path.resolve(__dirname, '..', 'uploads/images/moyens', path.basename(moyen.logo));
            
            try {
                const fileExists = await fs.pathExists(oldLogoPath);
                if (fileExists) {
                    await fs.remove(oldLogoPath);
                    console.log('Ancien logo supprimé avec succès');
                } else {
                    console.log('Ancien logo non trouvé');
                }
            } catch (err) {
                console.error('Erreur lors de la suppression de l\'ancien logo :', err);
            }
        } else {
            console.log('Aucun ancien logo à supprimer');
        }

        // Mettre à jour le logo
        moyen.logo = `/uploads/images/moyens/${req.file.filename}`;
        await moyen.save();

        res.status(200).json({
            message: 'Le logo a été mis à jour !',
            moyen: moyen
        });

    } catch (error) {
        res.status(400).json({
            message: 'Mauvaise requête !',
            erreur: error.message
        });
    }
};