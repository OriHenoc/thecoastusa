const fs = require('fs-extra');
const path = require('path');
const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const Contrat = require('../models/Contrat');
const jwt = require('jsonwebtoken');

// Fonction pour générer un mot de passe aléatoire
function generateRandomPassword(length = 8) {
    const charset = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKMNOPQRSTUVWXYZ123456789@$%#';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password += charset[randomIndex];
    }
    return password;
}

const RESET_PASSWORD_SECRET = process.env.JWT_SECRET || '@THE_COAST_USA%';
const REINITIALISATION_URL = 'https://thecoastusa.com';

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

// Créer un utilisateur
exports.createUtilisateur = async (req, res) => {
    try {
        const { nom, prenoms, dateDeNaissance, telephone, email, paysID, role } = req.body;

        // Générer un mot de passe aléatoire
        const motDePasse = generateRandomPassword();

        const newUtilisateur = new Utilisateur({
            nom,
            prenoms,
            dateDeNaissance,
            telephone,
            email,
            motDePasse: motDePasse,
            paysID,
            role
        });

        const existingUser = await Utilisateur.findOne({ $or: [{ email }, { telephone }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Email ou numéro de téléphone déjà utilisé.' });
        }

        await newUtilisateur.save();

        // Envoyer le mot de passe par e-mail
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Votre mot de passe pour vous connecter',
            text: `Bonjour ${nom} ${prenoms},\n\nun administrateur de THE COAST USA a créé votre compte avec succès. Voici vos identifiants de connexion : \n\nEmail : ${email} \n\nMot de passe : ${motDePasse}\n\nUne fois connecté, vous pourrez changer ce mot de passe dans les paramètres de votre profil.`
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            message : `L'utilisateur ${newUtilisateur.nom} ${newUtilisateur.prenoms} a été enregistré et son mot de passe lui a été envoyé sur ${newUtilisateur.email} !`,
            utilisateur : newUtilisateur
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

// Obtenir tous les utilisateurs
exports.getAllUtilisateur = async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.find().populate(['paysID', 'langues']);
        const total = await Utilisateur.countDocuments();
        const actifs = await Utilisateur.countDocuments({ compteActif: true });
        res.status(200).json({
            total : total,
            actifs : actifs,
            utilisateurs : utilisateurs.reverse()
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

// Obtenir tous les utilisateurs actifs
exports.getAllActivedUtilisateur = async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.find({ compteActif: true }).populate(['paysID', 'langues']);
        res.status(200).json({
            utilisateurs : utilisateurs.reverse()
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

// Obtenir un utilisateur par ID
exports.getUtilisateurById = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.params.id).populate(['paysID', 'langues']);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé !' });
        }
        res.status(200).json({
            utilisateur : utilisateur
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

// Mettre à jour les informations personnelles d'un utilisateur
exports.updateInfosUtilisateur = async (req, res) => {
    try {
        const { nom, prenoms, dateDeNaissance, telephone, email, paysID, role } = req.body;
        const utilisateur = await Utilisateur.findByIdAndUpdate(
            req.params.id,
            { nom, prenoms, dateDeNaissance, telephone, email, paysID, role },
            { new: true, runValidators: true }
        ).populate(['paysID', 'langues']);

        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé !' });
        }

        res.status(200).json({
            message: 'Les informations du compte ont été mises à jour !',
            utilisateur: utilisateur
        });
    } catch (error) {
        res.status(400).json({
            message: 'Mauvaise requête !',
            erreur: error.message
        });
    }
};

exports.updateInfosUtilisateurPlus = async (req, res) => {
    try {
        const { biographie, experience, videoDePresentation } = req.body;
        const utilisateur = await Utilisateur.findByIdAndUpdate(
            req.params.id,
            { biographie, experience, videoDePresentation },
            { new: true, runValidators: true }
        ).populate(['paysID', 'langues']);

        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé !' });
        }

        res.status(200).json({
            message: 'Les informations du compte ont été mises à jour !',
            utilisateur: utilisateur
        });
    } catch (error) {
        res.status(400).json({
            message: 'Mauvaise requête !',
            erreur: error.message
        });
    }
};


// Mettre à jour le mot de passe d'un utilisateur
exports.updateMotDePasse = async (req, res) => {
    try {
        const { ancienMotDePasse, nouveauMotDePasse } = req.body;

        // Vérifier que les champs sont présents
        if (!ancienMotDePasse || !nouveauMotDePasse) {
            return res.status(400).json({ message: 'Ancien mot de passe et nouveau mot de passe sont requis.' });
        }

        // Trouver l'utilisateur par ID et inclure le mot de passe
        const utilisateur = await Utilisateur.findById(req.params.id).select('+motDePasse');
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé !' });
        }

        // Vérifier l'ancien mot de passe
        const isMatch = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);
        if (!isMatch) {
            return res.status(400).json({ message: 'Ancien mot de passe incorrect !' });
        }

        // Hacher et mettre à jour le nouveau mot de passe
        utilisateur.motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);
        await utilisateur.save();

        res.status(200).json({ message: 'Le mot de passe a été mis à jour avec succès !' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du mot de passe :', error);
        res.status(400).json({
            message: 'Mauvaise requête !',
            erreur: error.message
        });
    }
};


// Supprimer un utilisateur
exports.deleteUtilisateur = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findByIdAndDelete(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.uploadPhotoProfil = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.params.id).populate(['paysID', 'langues']);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé !' });
        }

        // Préparer le fichier à envoyer
        const localFilePath = path.resolve('uploads/images/profils', req.file.filename);
        const form = new FormData();
        form.append('file', fs.createReadStream(localFilePath));

        // Envoyer le fichier à l'API HTTP distante
        const apiEndpoint = 'https://backthecoastusa.committeam.com/uploadPhoto.php';
        const response = await axios.post(apiEndpoint, form, {
            headers: {
                ...form.getHeaders(), // Inclut les en-têtes nécessaires pour FormData
            },
        });

        // Vérifier la réponse de l'API
        if (response.data.status !== 'success') {
            throw new Error(response.data.message || 'Erreur lors du téléchargement du fichier');
        }

        console.log('Fichier transféré avec succès :', response.data);

        // Supprimer l'ancienne photo si elle existe
        if (utilisateur.photoDeProfil) {
            const oldPhotoPath = path.resolve(
                __dirname, 
                '..', // Revenir au niveau supérieur si nécessaire
                utilisateur.photoDeProfil.substring(1) // Supprime le premier '/' pour éviter des conflits
            );

            try {
                const fileExists = await fs.pathExists(oldPhotoPath);
                if (fileExists) {
                    await fs.remove(oldPhotoPath);
                    console.log('Ancienne photo supprimée avec succès');
                } else {
                    console.log('Ancienne photo non trouvée');
                }
            } catch (err) {
                console.error("Erreur lors de la suppression de l'ancienne photo :", err);
            }
        } else {
            console.log('Aucune ancienne photo à supprimer');
        }

        // Mettre à jour la photo de profil
        utilisateur.photoDeProfil = `/uploads/images/profils/${req.file.filename}`; // Utiliser le chemin renvoyé par l'API distante
        await utilisateur.save();

        res.status(200).json({
            message: 'La photo de profil a été mise à jour !',
            utilisateur: utilisateur,
        });
    } catch (error) {
        res.status(400).json({
            message: 'Mauvaise requête !',
            erreur: error.message,
        });
    }
};


exports.getFillesToShow = async (req, res) => {
    try {
        
        let contrats = await Contrat.find({ isValid : true });
        let tb= [];
        contrats.forEach(element => tb.push(element.utilisateurID));
        let filles = await Utilisateur.find({ _id : { $in : tb }, role : 'fille', compteActif : true, visible : true }).populate(['paysID', 'langues']);

        res.status(200).json({
            filles : filles.reverse()
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllFilles = async (req, res) => {
    try {
        
        let filles = await Utilisateur.find({ role : 'fille' }).populate(['paysID', 'langues']);

        res.status(200).json({
            filles : filles.reverse()
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.getAllFamilles = async (req, res) => {
    try {
        
        let familles = await Utilisateur.find({ role : 'famille' }).populate(['paysID', 'langues']);

        res.status(200).json({
            familles : familles.reverse()
        });
    } catch (error) {
        res.status(400).json({
            message : 'Une erreur est survenue !',
            erreur : error.message
        });
    }
};

exports.addLangues = async (req, res) => {
    try {
        const { langue, utilisateurID } = req.body;

        if (!langue) {
            return res.status(400).json({ success: false, message: "Langue invalide !" });
        }

        const utilisateur = await Utilisateur.findById(utilisateurID).populate(['paysID', 'langues']);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé !' });
        }

        // Vérification correcte si la langue existe déjà
        const langueExiste = utilisateur.langues.some(l => l.toString() === langue.toString());
        if (langueExiste) {
            return res.status(400).json({ success: false, message: "La langue existe déjà !" });
        }

        // Ajout de la langue
        utilisateur.langues.push(langue);
        await utilisateur.save();

        res.status(200).json({
            message: 'Langue ajoutée avec succès !',
            utilisateur: utilisateur
        });
    } catch (error) {
        res.status(400).json({
            message: "Une erreur est survenue lors de l'ajout de la langue.",
            erreur: error.message
        });
    }
};

exports.updateVisibility = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.params.id);
        if (!utilisateur) return res.status(404).json('Utilisateur non trouvé !');

        utilisateur.visible = !utilisateur.visible;
        await utilisateur.save();
        let message = `La visibilité de l'utilisateur a été mise à jour ! `
        let statut = utilisateur.visible;
        if(statut){
            message = `Vous êtes désormais visible !\n Veuillez vous reconnecter !`
        }
        else{
            message = `Vous êtes désormais invisible !\n Veuillez vous reconnecter !`
        }
        res.status(200).json({
            message : message,
            utilisateur : utilisateur
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.toggleCompteActif = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.params.id);
        if (!utilisateur) return res.status(404).json('Utilisateur non trouvé !');

        utilisateur.compteActif = !utilisateur.compteActif;
        await utilisateur.save();
        let message = `Le compte de l'utilisateur a été mise à jour ! `
        let statut = utilisateur.compteActif;
        if(statut){
            message = `Compte de l'utilisateur activé`
        }
        else{
            message = `Le compte est désormais inactif !`
        }
        res.status(200).json({
            message : message,
            utilisateur : utilisateur
        });
    } catch (error) {
        res.status(400).json({
            message : 'Mauvaise requête !',
            erreur : error.message
        });
    }
};

exports.resetPasswordRequest = async (req, res) => {
    const { email } = req.body;
  
    try {
      // Vérifie si un utilisateur existe avec cet email
      const utilisateur = await Utilisateur.findOne({ email });
      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur introuvable." });
      }
  
      // Génère un token sécurisé qui expire
      const token = jwt.sign({ userId: utilisateur._id }, RESET_PASSWORD_SECRET, { expiresIn: '1h' });
  
      // URL de réinitialisation
      const resetUrl = `${REINITIALISATION_URL}/reinitialisation?token=${token}`;
  
      await transporter.sendMail({
        from: '"The Coast USA" <admin@thecoastusa.com>',
        to: email,
        subject: "Réinitialisation du mot de passe",
        html: `
            <h2>Hello ${utilisateur.nom} ${utilisateur.prenoms},</h2>
            <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour procéder :</p><br>
            
            <a href="${resetUrl}" target="_blank">Réinitialiser le mot de passe</a><br>
            <p>Ce lien expirera dans 1 heure.</p>
            <p>Si vous n'avez pas fait cette demande, veuillez ignorer cet email.</p>
        `
    });
  
      return res.status(200).json({ message: "Email de réinitialisation envoyé avec succès. \nVeuillez consulter votre email !" });
    } catch (error) {
      console.error('Erreur lors de la demande de réinitialisation :', error);
      return res.status(500).json({ message: 'Erreur serveur. Veuillez réessayer plus tard.' });
    }
  };
  

  exports.updatePwdReinit = async (req, res) => {

    const { token, newPassword } = req.body;
  
    try {
      // Vérifie le token
      const decoded = jwt.verify(token, RESET_PASSWORD_SECRET);
      const utilisateur = await Utilisateur.findById(decoded.userId);
  
      if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur introuvable." });
      }
  
      // Met à jour le mot de passe
      utilisateur.motDePasse = await bcrypt.hash(newPassword, 10); // Hache le mot de passe
      await utilisateur.save();
  
      return res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du mot de passe :", error);
      return res.status(400).json({ message: "Lien invalide ou expiré." });
    }
  };