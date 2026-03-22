const mongoose = require('mongoose');

const cookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  cuisine: {
    type: String,
    required: true,
    trim: true
  },
  price_range: {
    type: String
  },
  contact: {
    type: String
  },
  dietary_preferences: [{
    type: String,
    enum: ['Veg', 'Non-Veg', 'Vegan', 'Jain'],
    default: ['Veg']
  }],
  availability: {
    type: Map,
    of: [String],
    default: {
      "Mon": ["Morning", "Afternoon", "Evening"],
      "Tue": ["Morning", "Afternoon", "Evening"],
      "Wed": ["Morning", "Afternoon", "Evening"],
      "Thu": ["Morning", "Afternoon", "Evening"],
      "Fri": ["Morning", "Afternoon", "Evening"],
      "Sat": ["Morning", "Afternoon", "Evening"],
      "Sun": ["Morning", "Afternoon", "Evening"]
    }
  },
  sample_menu: {
    type: String,
    trim: true,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  averageRating: {
    type: Number,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  vouchCount: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Kept optional for backwards compatibility
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cook', cookSchema);
