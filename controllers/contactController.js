const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
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

exports.contacter = async (req, res) => {
    try {
        const { nomComplet, telephone, email, sujet, message } = req.body;

        console.log(req.body);

        // Création du contact
        const newContact = new Contact({ nomComplet, telephone, email, sujet, message });
        await newContact.save();

        // Mappage des sujets aux adresses e-mail cibles
        const emailMap = {
            Inscription: "inscription@thecoastusa.com",
            Paiement: "paiement@thecoastusa.com",
            Formation: "formation@thecoastusa.com",
            Dossier: "dossier@thecoastusa.com",
            Autre: "contact@thecoastusa.com"
        };

        // Utiliser l'adresse par défaut si le sujet n'est pas dans le mappage
        const cible = emailMap[sujet] || "info@thecoastusa.com";

        console.log(`Email cible : ${cible}`);

        // Envoi de l'e-mail
        await transporter.sendMail({
            from: email,
            to: cible,
            subject: sujet || "Demande de contact",
            html: `
                <h2>Hello,</h2>
                <p>Vous avez reçu un message de : <strong>${nomComplet}</strong></p>
                <p><strong>Sujet :</strong> ${sujet || "Non spécifié"}</p>
                <p><strong>Message :</strong> ${message}</p>
                <p><strong>Joignable au :</strong> ${telephone}</p>
            `
        });

        res.status(201).json({
            message: `Merci, ${nomComplet} ! Votre message a été soumis et nous vous reviendrons dans les plus brefs délais.`,
            contact: newContact
        });
    } catch (error) {
        console.error("Erreur dans contacter:", error);

        res.status(500).json({
            message: "Une erreur est survenue lors de la soumission du message.",
            erreur: error.message
        });
    }
};
