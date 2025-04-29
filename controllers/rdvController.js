const Utilisateur = require('../models/Utilisateur')
const nodemailer = require('nodemailer');
const Rdv = require('../models/Rdv');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'mail.thecoastusa.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

exports.takeRdv = async (req, res) => {
    try {
        const { familleID, filleID } = req.body;
        const newRdv = new Rdv({ familleID, filleID });
        await newRdv.save();

        const famille = await Utilisateur.findById(familleID);
        const fille = await Utilisateur.findById(filleID);

        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: famille.email,
            subject: "Rendez-vous initié",
            html: `
                <h2>Hello ${famille.nom} ${famille.prenoms},</h2>
                <p>Vous avez demandé à avoir un rendez-vous avec ${fille.nom} ${fille.prenoms}.</p>
                <p>Nous avons bien reçu votre demande et nous programmerons un interview selon les disponibilités et vous tiendrons informé !</p>
            `
        });

        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: fille.email,
            subject: "Rendez-vous initié",
            html: `
                <h2>Hello ${fille.nom} ${fille.prenoms},</h2>
                <p>Une famille a demandé à avoir un rendez-vous avec vous.</p>
                <p>L'administration programmera un interview selon les disponibilités et vous tiendra informé !</p>
            `
        });

        adminEmails = ["info@thecoastusa.com", "dossier@thecoastusa.com", "contact@thecoastusa.com"]

        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: adminEmails.join(","),
            subject: "Un rendez-vous a été initié",
            html: `
                <h2>Hello cher administrateur,</h2>
                <p>${famille.nom} ${famille.prenoms} en tant que ${famille.role} a demandé à prendre un rendez-vous avec ${fille.nom} ${fille.prenoms}</p>
                <p>Veuillez vous connecter pour donner suite à cette demande.</p>
                <hr/>
                <p>Signé : Votre IA adorée</p>
            `
        });

        res.status(201).json({
            message : `Le rendez-vous a été enregistré !`,
            rdv : newRdv
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllRdv = async (req, res) => {
    try {
        const rdv = await Rdv.find().populate(['familleID', 'filleID']);
        const total = await Rdv.countDocuments();
        res.status(200).json({
            total : total,
            rdv : rdv.reverse()
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getRdvById = async (req, res) => {
    try {
        const rdv = await Rdv.findById(req.params.id).populate(['familleID', 'filleID']);
        if (!rdv) return res.status(404).json('Rendez-vous non trouvé !');
        res.status(200).json({
            rdv : rdv
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.getRdvByFamilleId = async (req, res) => {
    try {
        const rdv = await Rdv.find({familleID : req.params.id}).populate(['familleID', 'filleID']);
        if (!rdv) return res.status(404).json('Rendez-vous non trouvé !');
        res.status(200).json({
            rdv : rdv
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.getRdvByFilleId = async (req, res) => {
    try {
        const rdv = await Rdv.find({filleID : req.params.id}).populate(['familleID', 'filleID']);
        if (!rdv) return res.status(404).json('Rendez-vous non trouvé !');
        res.status(200).json({
            rdv : rdv
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};


exports.updateRdvStatus = async (req, res) => {
    try {
        const { statut, commentaire } = req.body;

        const rdv = await Rdv.findById(req.params.id);
        if (!rdv) return res.status(404).json('Rendez-vous non trouvé !');

        rdv.statut = statut
        rdv.commentaire = commentaire
        await rdv.save();


        const famille = await Utilisateur.findById(rdv.familleID);
        const fille = await Utilisateur.findById(rdv.filleID);

        let etat = ""

        if(statut == "confirme"){
            etat = "confirmé"
        }
        
        if(statut == "annule"){
            etat = "annulé"
        }
        if(statut == "termine"){
            etat = "terminé"
        }

        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: famille.email,
            subject: `Rendez-vous ${etat}`,
            html: `
                <h2>Hello ${famille.nom} ${famille.prenoms},</h2>
                <p>Votre demande de rendez-vous avec ${fille.nom} ${fille.prenoms} a été ${etat}e.</p>
                <p>
                    ${commentaire}
                </p>
            `
        });

        await transporter.sendMail({
            from: '"The Coast USA" <admin@thecoastusa.com>',
            to: fille.email,
            subject: `Rendez-vous ${etat}`,
            html: `
                <h2>Hello ${fille.nom} ${fille.prenoms},</h2>
                <p>Une famille a demandé à prendre un rendez-vous avec vous et il a été ${etat}.</p>
                <p>${commentaire}</p>
            `
        });

        let message = `Le rendez-vous a été ${etat} ! `
        res.status(200).json({
            message : message,
            rdv : rdv
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};