const express = require('express');
const router = express.Router();
const { getProblems, respondToProblem, verifySecondaryAuth } = require('../controllers/problemController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected and for admin usage in Research Module
router.get('/', protect, getProblems);
router.post('/auth', protect, verifySecondaryAuth);
router.post('/:id/respond', protect, respondToProblem);

module.exports = router;
