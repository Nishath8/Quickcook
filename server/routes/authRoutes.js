const express = require('express');
const router = express.Router();
const { googleLogin } = require('../controllers/authController');

// POST /auth/google
router.post('/google', googleLogin);

module.exports = router;
