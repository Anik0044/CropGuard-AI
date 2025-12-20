const express = require('express');
const router = express.Router();
const { addSignature, getSignatures } = require('../controllers/signatureController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Assuming this exists, based on other controllers

router.post('/', protect, admin, upload.single('image'), addSignature);
router.get('/', protect, admin, getSignatures);

module.exports = router;
