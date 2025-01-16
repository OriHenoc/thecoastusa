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
    getFillesToShow,
    getAllFilles,
    getAllFamilles,
    addLangues
} = require('../controllers/utilisateurController');

const router = express.Router();


router.post('/addLangue', addLangues);
router.get('/fillesToShow', getFillesToShow);
router.get('/filles', getAllFilles);
router.get('/familles', getAllFamilles);
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