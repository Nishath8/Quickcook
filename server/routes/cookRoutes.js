const express = require('express');
const router = express.Router();
const {
  createCook,
  getApprovedCooks,
  getAllCooksForAdmin,
  updateCookStatus,
  updateCookDetails,
  deleteCook
} = require('../controllers/cookController');

router.post('/cooks', createCook);
router.get('/cooks', getApprovedCooks);
router.get('/admin/cooks', getAllCooksForAdmin);
router.patch('/admin/cooks/:id', updateCookStatus);
router.put('/admin/cooks/:id', updateCookDetails);
router.delete('/admin/cooks/:id', deleteCook);

module.exports = router;
