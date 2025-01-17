const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    takeRdv,
    getAllRdv,
    getRdvById,
    getRdvByFilleId,
    getRdvByFamilleId,
    updateRdvStatus
} = require('../controllers/rdvController');

const router = express.Router();


router.get('/byFille/:id', getRdvByFilleId);
router.get('/byFamille/:id', getRdvByFamilleId);
router.patch('/:id', updateRdvStatus);

router.post('/', takeRdv);
router.get('/', getAllRdv);
router.get('/:id', getRdvById);

module.exports = router;