const Examen = require('../models/Examen');
const Formation = require('../models/Formation');
const Utilisateur = require('../models/Utilisateur');

exports.getAllExamen = async (req, res) => {
    try {
        const examens = await Examen.find();
        const total = await Examen.countDocuments();
        res.status(200).json({
            total : total,
            examens : examens
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getExamenById = async (req, res) => {
    try {
        const examen = await Examen.findById(req.params.id);
        if (!examen) return res.status(404).json('Examen non trouvé !');
        res.status(200).json({
            examen : examen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.getExamenByUtilisateurID = async (req, res) => {
    try {
        const examen = await Examen.find({utilisateurID : req.params.id}).populate('utilisateurID');
        if (!examen) return res.status(404).json('Examen non trouvé !');
        res.status(200).json({
            examen : examen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.updateExamen = async (req, res) => {
    try {
        const updatedExamen = await Examen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedExamen) return res.status(404).json('Examen non trouvé !');
        res.status(200).json({
            message : `L'examen a été mis à jour !`,
            examen : updatedExamen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.deleteExamen = async (req, res) => {
    try {
        const deletedExamen = await Examen.findByIdAndDelete(req.params.id);
        if (!deletedExamen) return res.status(404).json('Examen non trouvé !');
        res.json('Examen supprimé !');
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.validerExamen = async (req, res) => {
    try {
        const examen = await Examen.findById(req.params.id);
        if (!examen) return res.status(404).json('Paiement non trouvé !');

        examen.resultat = "reussi"
        await examen.save();

        //Mail à l'inscrit(e)

        const utilisateur = await Utilisateur.findById(examen.utilisateurID);
        const formation = await Formation.findById(examen.formationID);

        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: utilisateur.email,
            subject: "Test validé",
            html: `
                <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                <p>Votre test pour la formation ${formation.titre} a été validé !</p>
            `
        });

        let message = `Le test a été validé ! `
        res.status(200).json({
            message : message,
            examen : examen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.annulerExamen = async (req, res) => {
    try {
        const deletedExamen = await Examen.findByIdAndDelete(req.params.id);
        if (!deletedExamen) return res.status(404).json('Examen non trouvé !');

        //Mail à l'inscrit(e)

        const utilisateur = await Utilisateur.findById(examen.utilisateurID);
        const formation = await Formation.findById(examen.formationID);

        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: utilisateur.email,
            subject: "Test à reprendre",
            html: `
                <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
                <p>Votre test pour la formation ${formation.titre} doit être repris !</p>
            `
        });

        let message = `Le test a été refusé ! `
        res.status(200).json({
            message : message,
            deletedExamen : deletedExamen
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};
