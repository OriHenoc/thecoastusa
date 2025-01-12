const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadPhoto');
const {
    soumettreDocument,
    getAllDocumentsSoumis,
    getDocumentsSoumisByUtilisateur
} = require('../controllers/documentsSoumisController');

const router = express.Router();
router.post('/soumission', upload.single('document'), soumettreDocument);
router.get('/', getAllDocumentsSoumis);
router.get('/byUtilisateur/:id', getDocumentsSoumisByUtilisateur);

module.exports = router;