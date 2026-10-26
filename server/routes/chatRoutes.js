const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');
const {
    sendMessage,
    getMessages,
    getConversations,
    markAsRead,
    getUnreadCount,
    setTyping,
} = require('../controllers/chatController');

// All chat routes require authenticated users
router.post('/send', protect, upload.single('image'), sendMessage);
router.get('/messages/:userId?', protect, getMessages);
router.get('/unread-count', protect, getUnreadCount);
router.post('/typing', protect, setTyping);
router.put('/read/:userId?', protect, markAsRead);

// Admin-specific conversation list
router.get('/conversations', protect, admin, getConversations);

module.exports = router;
