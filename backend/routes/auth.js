const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');
const { checkOwnership } = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.put('/user/:id', verifyToken, checkOwnership, authController.updateUser);
router.put('/change-password/:id', verifyToken, authController.changePassword);

module.exports = router;