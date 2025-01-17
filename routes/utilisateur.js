const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    createUtilisateur,
    uploadPhotoProfil,
    getAllUtilisateur,
    getAllActivedUtilisateur,
    updateInfosUtilisateur,
    updateInfosUtilisateurPlus,
    updateMotDePasse,
    getUtilisateurById,
    deleteUtilisateur,
    toggleUtilisateurStatus,
    getFillesToShow,
    getAllFilles,
    getAllFamilles,
    addLangues,
    updateVisibility,
    toggleCompteActif
} = require('../controllers/utilisateurController');

const router = express.Router();


router.post('/addLangue', addLangues);
router.get('/fillesToShow', getFillesToShow);
router.get('/filles', getAllFilles);
router.get('/familles', getAllFamilles);
router.post('/updatePhoto/:id', authMiddleware, upload.single('photoDeProfil'), uploadPhotoProfil);

router.get('/actifs', getAllActivedUtilisateur);
router.put('/:id/updateInfos', authMiddleware, updateInfosUtilisateur);
router.put('/:id/updateInfos2', authMiddleware, updateInfosUtilisateurPlus);
router.put('/:id/updateMotDePasse', authMiddleware, updateMotDePasse);
router.delete('/:id', authMiddleware, deleteUtilisateur);
router.patch('/:id/toggleStatus', authMiddleware, toggleUtilisateurStatus);
router.patch('/:id/updateVisibility', authMiddleware, updateVisibility);
router.patch('/:id/toggleCompteActif', authMiddleware, toggleCompteActif);

router.post('/', authMiddleware, createUtilisateur);
router.get('/', getAllUtilisateur);
router.get('/:id', getUtilisateurById);

module.exports = router;