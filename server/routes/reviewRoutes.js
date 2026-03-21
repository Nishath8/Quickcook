const express = require('express');
const router = express.Router();
const { getCookReviews, addReview, deleteReview } = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:cookId', getCookReviews);
router.post('/', authMiddleware, addReview); // Protected by JWT
router.delete('/:id', deleteReview); // Delete route (for admin override)

module.exports = router;
