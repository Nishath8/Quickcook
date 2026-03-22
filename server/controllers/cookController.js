const Cook = require('../models/Cook');
const Review = require('../models/Review');

// In-memory rate limiting and utility helpers
const submissionTracker = new Map();
const containsUrl = (str) => {
  if (!str) return false;
  const lower = str.toLowerCase();
  return lower.includes('http://') || lower.includes('https://') || lower.includes('.com') || lower.includes('www.');
};
const escapeRegex = (str) => str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// POST /cooks
const createCook = async (req, res) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    
    // 1. Basic Rate Limiting (Max 3 submissions per IP per 60 seconds)
    if (submissionTracker.has(ip)) {
      const history = submissionTracker.get(ip).filter(timestamp => now - timestamp < 60000);
      if (history.length >= 3) {
        return res.status(429).json({ message: 'Too many submissions. Please wait a minute before trying again.' });
      }
      history.push(now);
      submissionTracker.set(ip, history);
    } else {
      submissionTracker.set(ip, [now]);
    }

    let { name, location, cuisine, price_range, contact, dietary_preferences, availability, sample_menu } = req.body;

    if (!name || !location || !cuisine) {
      return res.status(400).json({ message: 'Name, location, and cuisine are required.' });
    }

    // 2. Input Sanitization
    name = name.trim();
    location = location.trim();
    cuisine = cuisine.trim();
    contact = contact ? contact.trim() : '';
    price_range = price_range ? price_range.trim() : '';
    sample_menu = sample_menu ? sample_menu.trim() : '';

    // 3. Strict Length & Bounds Validation
    if (name.length < 2 || name.length > 50) return res.status(400).json({ message: 'Name must be between 2 and 50 characters.' });
    if (location.length < 2 || location.length > 100) return res.status(400).json({ message: 'Location must be between 2 and 100 characters.' });
    if (cuisine.length < 2 || cuisine.length > 100) return res.status(400).json({ message: 'Cuisine must be between 2 and 100 characters.' });
    if (contact.length > 100) return res.status(400).json({ message: 'Contact details are too long (max 100 characters).' });

    // 4. Fake / Spam Links Blocking
    if (containsUrl(name) || containsUrl(location) || containsUrl(cuisine) || containsUrl(contact)) {
      return res.status(400).json({ message: 'Links or web site addresses are absolutely not permitted in submissions.' });
    }

    // 5. Fuzzy Data Consistency Duplicate Check (Case-insensitive matching to catch sneaky variants)
    const nameRegex = new RegExp('^' + escapeRegex(name) + '$', 'i');
    
    let duplicateQuery = { name: nameRegex, status: { $ne: 'denied' } };
    if (contact) {
      duplicateQuery.contact = new RegExp('^' + escapeRegex(contact) + '$', 'i');
    } else {
      duplicateQuery.location = new RegExp('^' + escapeRegex(location) + '$', 'i');
    }

    const existingCook = await Cook.findOne(duplicateQuery);
    if (existingCook) {
      return res.status(409).json({ message: 'An active or pending cook profile with this exact name and details already exists.' });
    }

    // Pass all tests -> creation
    const cook = new Cook({ 
      name, 
      location, 
      cuisine, 
      price_range, 
      contact,
      dietary_preferences: dietary_preferences || ['Veg'],
      availability: availability || {},
      sample_menu: sample_menu || '',
      status: 'pending',
      userId: req.user?.userId || null 
    });
    await cook.save();

    // Memory leak prevention block
    if (submissionTracker.size > 2000) submissionTracker.clear();

    res.status(201).json({ message: 'Cook profile submitted successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /cooks
const getApprovedCooks = async (req, res) => {
  try {
    const { location, cuisine, dietary, price_range } = req.query;
    const filter = { status: 'approved' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (cuisine) filter.cuisine = { $regex: cuisine, $options: 'i' };
    if (dietary) filter.dietary_preferences = { $in: dietary.split(',') };
    if (price_range) filter.price_range = price_range;
    
    const cooks = await Cook.find(filter);

    // Fetch up to 4 vouchers for each cook to display in the UI
    const cooksWithVouchers = await Promise.all(cooks.map(async (cook) => {
      const voucherReviews = await Review.find({ cookId: cook._id, isVouch: true })
        .populate('userId', 'name avatar')
        .limit(4);
      
      const vouchers = voucherReviews.map(v => ({
        name: v.userId?.name || 'Client',
        avatar: v.userId?.avatar || ''
      }));

      return {
        ...cook.toObject(),
        vouchers
      };
    }));

    res.json(cooksWithVouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /cooks/:id
const getCookById = async (req, res) => {
  try {
    const cook = await Cook.findById(req.params.id);
    if (!cook) return res.status(404).json({ message: 'Cook not found' });
    res.json(cook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /admin/cooks
const getAllCooksForAdmin = async (req, res) => {
  try {
    const cooks = await Cook.find();
    res.json(cooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /admin/cooks/:id
const updateCookStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'denied'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const cook = await Cook.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!cook) return res.status(404).json({ message: 'Cook not found' });
    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /admin/cooks/:id
const updateCookDetails = async (req, res) => {
  try {
    const { name, location, cuisine, price_range, contact, dietary_preferences, availability, sample_menu } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (cuisine) updateData.cuisine = cuisine;
    if (price_range) updateData.price_range = price_range;
    if (contact) updateData.contact = contact;
    if (dietary_preferences) updateData.dietary_preferences = dietary_preferences;
    if (availability) updateData.availability = availability;
    if (sample_menu !== undefined) updateData.sample_menu = sample_menu;

    const cook = await Cook.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!cook) return res.status(404).json({ message: 'Cook not found' });
    res.json({ message: 'Cook updated successfully', cook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /cooks/profile/:id
const updateOwnProfile = async (req, res) => {
  try {
    const cook = await Cook.findById(req.params.id);
    if (!cook) return res.status(404).json({ message: 'Cook not found' });
    
    if (cook.userId?.toString() !== req.user.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'You are not authorized to edit this profile' });
    }

    const { name, location, cuisine, price_range, contact, images, dietary_preferences, availability, sample_menu } = req.body;
    let upData = {};
    if (name) upData.name = name;
    if (location) upData.location = location;
    if (cuisine) upData.cuisine = cuisine;
    if (price_range) upData.price_range = price_range;
    if (contact) upData.contact = contact;
    if (images) upData.images = images; 
    if (dietary_preferences) upData.dietary_preferences = dietary_preferences;
    if (availability) upData.availability = availability;
    if (sample_menu !== undefined) upData.sample_menu = sample_menu;

    const updatedCook = await Cook.findByIdAndUpdate(req.params.id, upData, { new: true });
    res.json({ message: 'Profile updated successfully', cook: updatedCook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /admin/cooks/:id
const deleteCook = async (req, res) => {
  try {
    const cook = await Cook.findByIdAndDelete(req.params.id);
    if (!cook) return res.status(404).json({ message: 'Cook not found' });
    res.json({ message: 'Cook deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /admin/cooks/:id/assign
const assignUserToCook = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const cook = await Cook.findByIdAndUpdate(req.params.id, { userId }, { new: true });
    if (!cook) return res.status(404).json({ message: 'Cook not found' });

    res.json({ message: 'Cook assigned to user successfully', cook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCook,
  getApprovedCooks,
  getCookById,
  getAllCooksForAdmin,
  updateCookStatus,
  updateCookDetails,
  updateOwnProfile,
  deleteCook,
  assignUserToCook
};
