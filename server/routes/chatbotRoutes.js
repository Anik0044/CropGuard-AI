const express = require('express');
const router = express.Router();
const { sendMessage, getFAQs, getNotifications } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', sendMessage);
router.get('/faqs', getFAQs);
router.get('/notifications', protect, getNotifications);

module.exports = router;
