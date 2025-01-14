const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    createUtilisateur,
    uploadPhotoProfil,
    getAllUtilisateur,
    getAllActivedUtilisateur,
    updateInfosUtilisateur,
    updateMotDePasse,
    getUtilisateurById,
    deleteUtilisateur,
    toggleUtilisateurStatus
} = require('../controllers/utilisateurController');

const router = express.Router();

router.post('/', authMiddleware, createUtilisateur);
router.post('/updatePhoto/:id', authMiddleware, upload.single('photoDeProfil'), uploadPhotoProfil);
router.get('/', getAllUtilisateur);
router.get('/actifs', getAllActivedUtilisateur);
router.get('/:id', getUtilisateurById);
router.put('/:id/updateInfos', authMiddleware, updateInfosUtilisateur);
router.put('/:id/updateMotDePasse', authMiddleware, updateMotDePasse);
router.delete('/:id', authMiddleware, deleteUtilisateur);
router.patch('/:id/toggleStatus', authMiddleware, toggleUtilisateurStatus);
router.get('/fillesToShow', getFillesToShow);

module.exports = router;