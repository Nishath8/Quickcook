const express = require('express');
const router = express.Router();
const { getCookReviews, addReview } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:cookId', getCookReviews);
router.post('/', authMiddleware, addReview); // Protected by JWT

module.exports = router;
