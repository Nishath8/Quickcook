const express = require('express');
const router = express.Router();
const { googleLogin, trackContactedCook } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /auth/google
router.post('/google', googleLogin);

// POST /auth/track-contact
router.post('/track-contact', authMiddleware, trackContactedCook);

module.exports = router;
