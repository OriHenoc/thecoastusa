const PhotosFamille = require('../models/PhotosFamille');
const upload = require('../middlewares/uploadPhoto');
const util = require("util");

exports.createPhotosFamille = async (req, res) => {
    const uploadPhoto = util.promisify(upload.fields([{name: 'photoFamille', maxCount: 1}]));
    try {
        await uploadPhoto(req, res);

        let famille = new PhotosFamille();
        famille.photoFamille = req.files['photoFamille'][0].filename
        famille.utilisateurID = req.body.utilisateurID
        const newFamille = await famille.save()
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

exports.getAllPhotosFamille = async (req, res) => {
    try {
        const photosFamille = await PhotosFamille.find().populate('utilisateurID');
        const total = await PhotosFamille.countDocuments();
        const visibles = await PhotosFamille.countDocuments({ visible: true });
        res.status(200).json({
            total : total,
            visibles : visibles,
            photosFamille : photosFamille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllVisibledPhotosFamille = async (req, res) => {
    try {
        const photosFamille = await PhotosFamille.find({ visible: true }).populate('utilisateurID');
        res.status(200).json({
            photosFamille : photosFamille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getPhotosFamilleById = async (req, res) => {
    try {
        const photosFamille = await PhotosFamille.findById(req.params.id).populate('utilisateurID');
        if (!photosFamille) return res.status(404).json('Photo de Famille non trouvée !');
        res.status(200).json({
            photosFamille : photosFamille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.getPhotosFamilleByUtilisateurID = async (req, res) => {
    try {
        const photosFamille = await PhotosFamille.find({utilisateurID : req.params.id}).populate('utilisateurID');
        if (!photosFamille) return res.status(404).json('Photo de Famille non trouvée !');
        res.status(200).json({
            photosFamille : photosFamille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};


exports.deletePhotosFamille = async (req, res) => {
    try {
        const deletedPhotosFamille = await PhotosFamille.findByIdAndDelete(req.params.id);
        if (!deletedPhotosFamille) return res.status(404).json('Photo de Famille non trouvée !');
        res.json('Photo de Famille supprimée !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.togglePhotosFamilleStatus = async (req, res) => {
    try {
        const photosFamille = await PhotosFamille.findById(req.params.id);
        if (!photosFamille) return res.status(404).json('Photo de Famille non trouvée !');

        photosFamille.visible = !photosFamille.visible;
        await photosFamille.save();
        let message = `La visibilité de la photo de Famille a été mise à jour ! `
        let statut = photosFamille.visible;
        if(statut){
            message += `La photo de Famille a été rendue visible !`
        }
        else{
            message += `La photo de Famille a été rendue invisible !`
        }
        res.status(200).json({
            message : message,
            photosFamille : photosFamille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};