const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const Paiement = require('../models/Paiement');

exports.soumettrePaiement = async (req, res) => {
    try {
        // Vérifiez si un fichier est présent
        let fichierPath = null;
        if (req.file) {
            fichierPath = path.resolve('uploads/images/preuves', req.file.filename);
        }

        // Préparer les données de la soumission
        const { utilisateurID, moyenID, montant, commentaire } = req.body;

        // Validation de base
        if (!utilisateurID || !moyenID || !montant) {
            return res.status(400).json({ message: "Certains champs obligatoires sont manquants." });
        }

        // Si un fichier est présent, le transférer à l'API distante
        let fichierUrl = null;
        if (fichierPath) {
            const form = new FormData();
            form.append('file', fs.createReadStream(fichierPath));
            const apiEndpoint = 'https://thecoastusa.com/api/uploadPreuvePaiement.php';

            const response = await axios.post(apiEndpoint, form, {
                headers: {
                    ...form.getHeaders(),
                },
            });

            // Vérifiez la réponse de l'API
            if (response.data.status !== 'success') {
                throw new Error(response.data.message || 'Erreur lors du téléchargement du fichier');
            }

            console.log('Fichier transféré avec succès :', response.data);
            fichierUrl = response.data.preuve; // Assurez-vous que l'API retourne un champ `filePath` pour l'URL.
        }

        // Créer une nouvelle soumission de paiement
        const soumission = new Paiement({
            utilisateurID,
            moyenID,
            montant,
            commentaire,
            preuve: fichierUrl,
        });

        await soumission.save();

        res.status(201).json({
            message: "Soumission enregistrée avec succès.",
            soumission : soumission,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Une erreur est survenue lors de l'enregistrement de la soumission.",
            erreur: error.message,
        });
    }
};