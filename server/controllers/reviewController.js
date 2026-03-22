const Review = require('../models/Review');
const Cook = require('../models/Cook');

// GET /reviews/:cookId
const getCookReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ cookId: req.params.cookId })
      .populate('userId', 'name avatar') // Fetch user details to display next to the review
      .sort('-createdAt'); // Newest first
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /reviews
const addReview = async (req, res) => {
  try {
    const { cookId, rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }

    // Block users from reviewing the same cook twice
    const existingReview = await Review.findOne({ cookId, userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this cook' });
    }

    const review = new Review({ cookId, userId, rating, comment });
    await review.save();

    // Dynamically calculate and update the Cook's new average rating and vouches
    const allReviews = await Review.find({ cookId });
    const avgRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    const vouchCount = allReviews.filter(item => item.rating >= 4).length;
    
    await Cook.findByIdAndUpdate(cookId, {
      averageRating: parseFloat(avgRating.toFixed(1)),
      reviewCount: allReviews.length,
      vouchCount
    });

    // Populate user info before returning to frontend so it can display immediately
    await review.populate('userId', 'name avatar');

    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const cookId = review.cookId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate Cook rating and vouches
    const allReviews = await Review.find({ cookId });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length 
      : 0;
    const vouchCount = allReviews.filter(item => item.rating >= 4).length;
    
    await Cook.findByIdAndUpdate(cookId, {
      averageRating: parseFloat(avgRating.toFixed(1)),
      reviewCount: allReviews.length,
      vouchCount
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCookReviews, addReview, deleteReview };
