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
    toggleUtilisateurStatus,
    getFillesToShow
} = require('../controllers/utilisateurController');

const router = express.Router();



router.get('/fillesToShow', getFillesToShow);
router.post('/updatePhoto/:id', authMiddleware, upload.single('photoDeProfil'), uploadPhotoProfil);

router.get('/actifs', getAllActivedUtilisateur);
router.put('/:id/updateInfos', authMiddleware, updateInfosUtilisateur);
router.put('/:id/updateMotDePasse', authMiddleware, updateMotDePasse);
router.delete('/:id', authMiddleware, deleteUtilisateur);
router.patch('/:id/toggleStatus', authMiddleware, toggleUtilisateurStatus);

router.post('/', authMiddleware, createUtilisateur);
router.get('/', getAllUtilisateur);
router.get('/:id', getUtilisateurById);

module.exports = router;