const PhotosFille = require('../models/PhotosFille');
const upload = require('../middlewares/uploadPhoto');
const util = require("util");

exports.createPhotosFille = async (req, res) => {
    const uploadPhoto = util.promisify(upload.fields([{name: 'photoFille', maxCount: 1}]));
    try {
        await uploadPhoto(req, res);

        let fille = new PhotosFille();
        fille.photoFille = req.files['photoFille'][0].filename
        fille.utilisateurID = req.body.utilisateurID
        const newFille = await fille.save()
        res.status(201).json({
            message : `La photo de la fille a été enregistrée !`,
            fille : newFille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllPhotosFille = async (req, res) => {
    try {
        const photosFille = await PhotosFille.find().populate('utilisateurID');
        const total = await PhotosFille.countDocuments();
        const visibles = await PhotosFille.countDocuments({ visible: true });
        res.status(200).json({
            total : total,
            visibles : visibles,
            photosFille : photosFille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllVisibledPhotosFille = async (req, res) => {
    try {
        const photosFille = await PhotosFille.find({ visible: true }).populate('utilisateurID');
        res.status(200).json({
            photosFille : photosFille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getPhotosFilleById = async (req, res) => {
    try {
        const photosFille = await PhotosFille.findById(req.params.id).populate('utilisateurID');
        if (!photosFille) return res.status(404).json('Photo de Fille non trouvée !');
        res.status(200).json({
            photosFille : photosFille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.getPhotosFilleByUtilisateurID = async (req, res) => {
    try {
        const photosFille = await PhotosFille.find({utilisateurID : req.params.id}).populate('utilisateurID');
        if (!photosFille) return res.status(404).json('Photo de Fille non trouvée !');
        res.status(200).json({
            photosFille : photosFille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};


exports.deletePhotosFille = async (req, res) => {
    try {
        const deletedPhotosFille = await PhotosFille.findByIdAndDelete(req.params.id);
        if (!deletedPhotosFille) return res.status(404).json('Photo de Fille non trouvée !');
        res.json('Photo de Fille supprimée !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.togglePhotosFilleStatus = async (req, res) => {
    try {
        const photosFille = await PhotosFille.findById(req.params.id);
        if (!photosFille) return res.status(404).json('Photo de Fille non trouvée !');

        photosFille.visible = !photosFille.visible;
        await photosFille.save();
        let message = `La visibilité de la photo de Fille a été mise à jour ! `
        let statut = photosFille.visible;
        if(statut){
            message += `La photo de Fille a été rendue visible !`
        }
        else{
            message += `La photo de Fille a été rendue invisible !`
        }
        res.status(200).json({
            message : message,
            photosFille : photosFille
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};