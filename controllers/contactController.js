const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuration du transporteur avec le serveur SMTP
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

exports.contacter = async (req, res) => {
    try {
        const { nomComplet, telephone, email, sujet, message } = req.body;
        console.log(req.body)
        const newContact = new Contact({ nomComplet, telephone, email, sujet, message });
        await newContact.save();

        const cible = "";

        switch (sujet) {
            case "Inscription":
                cible = "inscription@thecoastusa.com"
                break;
            case "Paiement":
                cible = "paiement@thecoastusa.com"
                break;
            case "Formation":
                cible = "formation@thecoastusa.com"
                break;                
            case "Dossier":
                cible = "dossier@thecoastusa.com"
                break;
            case "Autre":
                cible = "contact@thecoastusa.com"
                break;
            default:
                cible = "info@thecoastusa.com"
                break;
        }

        console.log(cible)

        // Envoyer l'e-mail
        await transporter.sendMail({
            from: email,
            to: cible,
            subject: sujet,
            html: `<h2>Hello, vous avez un message de ${newContact.nomComplet} : </h2><br/><h3>${newContact.message}</h3><h4>Joignable au : ${newContact.telephone}</h4>`
        });

        res.status(201).json({
            message: `Merci, ${newContact.nomComplet} ! Votre message a été soumis et nous vous reviendrons dans les plus brefs délais.`,
            contact: newContact
        });
    } catch (error) {
        res.status(400).json({
            message: 'Une erreur est survenue !',
            erreur: error.message
        });
    }
};