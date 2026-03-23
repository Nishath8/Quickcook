const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
const { storage } = require('../middleware/cloudinaryConfig');

const {
  createCook,
  getApprovedCooks,
  getCookById,
  getAllCooksForAdmin,
  updateCookStatus,
  updateCookDetails,
  updateOwnProfile,
  deleteCook,
  assignUserToCook
} = require('../controllers/cookController');

// Multer config for Cloudinary uploads
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// Public/Cook Routes
router.post('/cooks', authMiddleware, createCook);
router.get('/cooks', getApprovedCooks);
router.get('/cooks/:id', getCookById);

// Cook Dashboard Routes
router.put('/cooks/profile/:id', authMiddleware, updateOwnProfile);
router.post('/cooks/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // multer-storage-cloudinary provides the full URL in req.file.path
  const imageUrl = req.file.path;
  res.json({ imageUrl });
});

// Admin Routes
router.get('/admin/cooks', getAllCooksForAdmin);
router.patch('/admin/cooks/:id', updateCookStatus);
router.put('/admin/cooks/:id', updateCookDetails);
router.delete('/admin/cooks/:id', deleteCook);
router.post('/admin/cooks/:id/assign', assignUserToCook);

module.exports = router;
