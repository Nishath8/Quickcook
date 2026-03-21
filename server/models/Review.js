const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  cookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cook', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Enforce one review per user per cook
reviewSchema.index({ cookId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
