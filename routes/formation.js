const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    createFormation,
    getAllFormation,
    getAllVisibledFormation,
    getFormationById,
    updateFormation,
    deleteFormation,
    toggleFormationStatus,
    uploadCoursTexte,
    uploadTest,
    uploadCoursVideo
} = require('../controllers/formationController');

const router = express.Router();

router.post('/', createFormation);
router.post('/uploadCoursTexte/:id', upload.single('coursTexte'), uploadCoursTexte);
router.post('/uploadTest/:id', upload.single('test'), uploadTest);
router.post('/uploadCoursVideo/:id', uploadCoursVideo);
router.get('/', getAllFormation);
router.get('/visibles', getAllVisibledFormation);
router.get('/:id', getFormationById);
router.put('/:id/updateInfos', updateFormation);
router.delete('/:id', deleteFormation);
router.patch('/:id/toggleStatus', toggleFormationStatus);

module.exports = router;