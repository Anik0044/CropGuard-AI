const express = require('express');
const router = express.Router();
const { getCrops, getCropById, createCrop, updateCrop } = require('../controllers/cropController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getCrops).post(protect, admin, createCrop);
router.route('/:id').get(getCropById).put(protect, admin, updateCrop);

module.exports = router;
