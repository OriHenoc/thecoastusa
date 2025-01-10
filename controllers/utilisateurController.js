const fs = require('fs-extra');
const path = require('path');
const Utilisateur = require('../models/Utilisateur');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

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
        const utilisateurs = await Utilisateur.find().populate(['paysID']);
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
        const utilisateurs = await Utilisateur.find({ compteActif: true }).populate(['paysID']);
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
        const utilisateur = await Utilisateur.findById(req.params.id).populate(['paysID']);
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
        );

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

        // Trouver l'utilisateur par ID
        const utilisateur = await Utilisateur.findById(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé !' });
        }

        // Vérifier l'ancien mot de passe
        const isMatch = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasse);
        
        if (!isMatch) {
            return res.status(400).json({ message : 'Ancien mot de passe incorrect !' });
        }
        else{
            // Mettre à jour le mot de passe
            utilisateur.motDePasse = nouveauMotDePasse;
            await utilisateur.save();

            res.status(200).json({
                message: 'Le mot de passe a été mis à jour !'
            });
        }
    } catch (error) {
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

// Activer/Désactiver un utilisateur
exports.toggleUtilisateurStatus = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.params.id);
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        utilisateur.compteActif = !utilisateur.compteActif;
        await utilisateur.save();
        let message = `Le statut a été mis à jour !`
        let statut = utilisateur.compteActif;
        if(statut){
            message = `Le compte de ${utilisateur.nom} ${utilisateur.prenoms} a été activé !`
        }
        else{
            message = `Le compte de ${utilisateur.nom} ${utilisateur.prenoms} a été désactivé !`
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

// // Télécharger une photo de profil
// exports.uploadPhotoProfil = async (req, res) => {
//     try {
//         const utilisateur = await Utilisateur.findById(req.params.id);
//         if (!utilisateur) {
//             return res.status(404).json({ message: 'Utilisateur non trouvé !' });
//         }
        
//         // Supprimer l'ancienne photo si elle existe
//         if (utilisateur.photoDeProfil) {
//             const oldPhotoPath = path.resolve(__dirname, '..', 'uploads/images/profils', path.basename(utilisateur.photoDeProfil));
            
//             try {
//                 const fileExists = await fs.pathExists(oldPhotoPath);
//                 if (fileExists) {
//                     await fs.remove(oldPhotoPath);
//                     console.log('Ancienne photo supprimée avec succès');
//                 } else {
//                     console.log('Ancienne photo non trouvée');
//                 }
//             } catch (err) {
//                 console.error('Erreur lors de la suppression de l\'ancienne photo :', err);
//             }
//         } else {
//             console.log('Aucune ancienne photo à supprimer');
//         }

//         // Mettre à jour la photo de profil
//         utilisateur.photoDeProfil = `/uploads/images/profils/${req.file.filename}`;
//         await utilisateur.save();

//         res.status(200).json({
//             message: 'La photo de profil a été mise à jour !',
//             utilisateur: utilisateur
//         });

//     } catch (error) {
//         res.status(400).json({
//             message: 'Mauvaise requête !',
//             erreur: error.message
//         });
//     }
// };

// Télécharger une photo de profil en utilisant un script PHP pour le stockage
exports.uploadPhotoProfil = async (req, res) => {
    try {
        const utilisateur = await Utilisateur.findById(req.params.id);
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
