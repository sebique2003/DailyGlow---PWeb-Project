const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const { checkOwnership } = require('../controllers/authController');
const multer = require('multer');
const path = require('path');

// Configurare upload (aceeași ca în server.js)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/profile');
        require('fs').mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Doar fișiere imagine sunt permise!'), false);
        }
    }
});

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.put(
    '/user/:id',
    verifyToken,
    checkOwnership,
    upload.single('profileImage'),
    authController.updateUser
);
router.put('/change-password/:id', verifyToken, authController.changePassword);

module.exports = router;