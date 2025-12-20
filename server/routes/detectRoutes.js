const express = require('express');
const router = express.Router();
const { detectDisease, getHistory, deleteScan } = require('../controllers/detectController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.single('image'), detectDisease);
router.get('/history', protect, getHistory);
router.delete('/:id', protect, deleteScan);

// Admin Routes
const { getAllScans, updateScanResult } = require('../controllers/detectController');
const { admin } = require('../middleware/authMiddleware');

router.get('/admin/all', protect, admin, getAllScans);
router.put('/admin/:id', protect, admin, updateScanResult);

module.exports = router;
