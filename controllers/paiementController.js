// const path = require('path');
// const fs = require('fs');
// const FormData = require('form-data');
// const axios = require('axios');
// const Paiement = require('../models/Paiement');

// exports.soumettrePaiement = async (req, res) => {
//     try {
//         console.log("soumis c : ", req.body)
//         console.log("soumis f : ", req.file)
//         // Vérifiez si un fichier est présent
//         let fichierPath = null;
//         if (req.file) {
//             const uploadPath = path.resolve('uploads/images/preuves');
//             if (!fs.existsSync(uploadPath)) {
//                 fs.mkdirSync(uploadPath, { recursive: true });
//             }

//             fichierPath = path.join(uploadPath, req.file.filename);
//         }

//         console.log('Fichier enregistré à :', fichierPath);
        
//         // Préparer les données de la soumission
//         const { utilisateurID, moyenID, montant, commentaire } = req.body;

//         // Validation de base
//         if (!utilisateurID || !moyenID || !montant) {
//             return res.status(400).json({ message: "Certains champs obligatoires sont manquants." });
//         }

//         // Si un fichier est présent, le transférer à l'API distante
//         let fichierUrl = null;
//         if (fichierPath) {
//             const form = new FormData();
//             form.append('file', fs.createReadStream(fichierPath));
//             const apiEndpoint = 'https://thecoastusa.com/api/uploadPreuvePaiement.php';

//             const response = await axios.post(apiEndpoint, form, {
//                 headers: {
//                     ...form.getHeaders(),
//                 },
//             });

//             // Vérifiez la réponse de l'API
//             if (response.data.status !== 'success') {
//                 throw new Error(response.data.message || 'Erreur lors du téléchargement du fichier');
//             }

//             console.log('Fichier transféré avec succès :', response.data);
//             fichierUrl = response.data.preuve; // Assurez-vous que l'API retourne un champ `filePath` pour l'URL.
//         }

//         // Créer une nouvelle soumission de paiement
//         const soumission = new Paiement({
//             utilisateurID,
//             moyenID,
//             montant,
//             commentaire,
//             preuve: fichierUrl,
//         });

//         await soumission.save();

//         res.status(201).json({
//             message: "Soumission enregistrée avec succès.",
//             soumission : soumission,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             message: "Une erreur est survenue lors de l'enregistrement de la soumission.",
//             erreur: error.message,
//         });
//     }
// };

const FormData = require('form-data');
const axios = require('axios');
const Paiement = require('../models/Paiement'); // Assurez-vous que le modèle Paiement est correctement importé

exports.soumettrePaiement = async (req, res) => {
    try {
        console.log("soumis c : ", req.body);
        console.log("soumis f : ", req.file);

        // Vérifiez si un fichier est présent dans la requête
        let fichierUrl = null;
        if (req.file) {
            // Créez un FormData pour envoyer le fichier à l'API distante
            const form = new FormData();
            form.append('file', req.file.buffer, req.file.originalname);  // Utilisation du buffer directement sans stockage local

            // Définir l'URL de l'API distante pour télécharger le fichier
            const apiEndpoint = 'https://thecoastusa.com/api/uploadPreuvePaiement.php';

            // Effectuer la requête POST vers l'API distante pour télécharger le fichier
            const response = await axios.post(apiEndpoint, form, {
                headers: {
                    ...form.getHeaders(),
                },
            });

            // Vérifiez la réponse de l'API distante
            if (response.data.status !== 'success') {
                throw new Error(response.data.message || 'Erreur lors du téléchargement du fichier');
            }

            console.log('Fichier transféré avec succès :', response.data);
            fichierUrl = response.data.preuve;  // Assurez-vous que l'API retourne un champ contenant l'URL du fichier téléchargé.
        }

        // Préparer les autres données pour la soumission de paiement
        const { utilisateurID, moyenID, montant, commentaire } = req.body;

        // Validation de base des champs obligatoires
        if (!utilisateurID || !moyenID || !montant) {
            return res.status(400).json({ message: "Certains champs obligatoires sont manquants." });
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
            soumission: soumission,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Une erreur est survenue lors de l'enregistrement de la soumission.",
            erreur: error.message,
        });
    }
};
