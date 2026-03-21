const Cook = require('../models/Cook');

// POST /cooks
const createCook = async (req, res) => {
  try {
    const { name, location, cuisine, price_range, contact } = req.body;
    if (!name || !location || !cuisine) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const cook = new Cook({ name, location, cuisine, price_range, contact, status: 'pending' });
    await cook.save();
    res.status(201).json({ message: 'Cook added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /cooks
const getApprovedCooks = async (req, res) => {
  try {
    const { location, cuisine } = req.query;
    const filter = { status: 'approved' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (cuisine) filter.cuisine = { $regex: cuisine, $options: 'i' };
    
    const cooks = await Cook.find(filter);
    res.json(cooks);
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
    const { name, location, cuisine, price_range, contact } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (cuisine) updateData.cuisine = cuisine;
    if (price_range) updateData.price_range = price_range;
    if (contact) updateData.contact = contact;

    const cook = await Cook.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!cook) return res.status(404).json({ message: 'Cook not found' });
    res.json({ message: 'Cook updated successfully', cook });
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

module.exports = {
  createCook,
  getApprovedCooks,
  getAllCooksForAdmin,
  updateCookStatus,
  updateCookDetails,
  deleteCook
};
