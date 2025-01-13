const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'document') {
            cb(null, 'uploads/documents/')
        }
        if (file.fieldname === 'coursTexte' || file.fieldname === 'test') {
            cb(null, 'uploads/formations/')
        }
        if (file.fieldname === 'contrat') {
            cb(null, 'uploads/contrats/')
        }
        if (file.fieldname === 'photoFamille') {
            cb(null, 'uploads/images/familles/')
        }
        if (file.fieldname === 'photoFille') {
            cb(null, 'uploads/images/filles/');
        }
        if (file.fieldname === 'photoDeProfil') {
            cb(null, 'uploads/images/profils/')
        }
        if (file.fieldname === 'logo') {
            cb(null, 'uploads/images/moyens/')
        }
        if (file.fieldname === 'preuve') {
            cb(null, 'uploads/images/preuves/')
        }
    },
    filename: (req, file, cb) =>{
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
const upload = multer({ 
    storage : storage, 
    limits : {
        fileSize: 1024 * 1024 * 10 // 10Mo
    },
    fileFilter(req, file, cb) {
        checkFileType(file, cb);
    }
});

function checkFileType(file, cb) {
    const allowedFileTypes = /jpeg|jpg|png|svg|docx|pdf|webp/;
    const mimetype = allowedFileTypes.test(file.mimetype);
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Type de fichier non autorisé');
    }
}

module.exports = upload