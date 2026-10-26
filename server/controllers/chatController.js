const Chat = require('../models/Chat');
const User = require('../models/User');

// In-memory tracker for live typing indicators
// Key: conversation userId -> { userTypingUntil: timestamp, adminTypingUntil: timestamp }
const typingState = {};

const cleanExpiredTyping = (conversationKey) => {
    const now = Date.now();
    if (!typingState[conversationKey]) return;
    if (typingState[conversationKey].userTypingUntil && typingState[conversationKey].userTypingUntil < now) {
        typingState[conversationKey].userTypingUntil = null;
    }
    if (typingState[conversationKey].adminTypingUntil && typingState[conversationKey].adminTypingUntil < now) {
        typingState[conversationKey].adminTypingUntil = null;
    }
};

// @desc    Send a new chat message (text and/or image)
// @route   POST /api/chat/send
// @access  Private (User or Admin)
const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const targetUserId = req.body.targetUserId || req.body.userId;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        if (!message?.trim() && !imageUrl) {
            return res.status(400).json({ message: 'Message text or image is required' });
        }

        let conversationUserId;
        let conversationUserName;
        let conversationUserRole;
        let readByAdmin = false;
        let readByUser = false;

        if (req.user.role === 'admin') {
            if (!targetUserId) {
                return res.status(400).json({ message: 'Target user ID is required for admin replies' });
            }
            const targetUser = await User.findById(targetUserId);
            if (!targetUser) {
                // If user not found by ID, try finding by string or return error
                return res.status(404).json({ message: 'Target user not found' });
            }

            conversationUserId = targetUser._id;
            conversationUserName = targetUser.name || targetUser.username;
            conversationUserRole = targetUser.role;
            readByAdmin = true; // Admin sent this, so admin already read it
            readByUser = false;  // Farmer/User needs to read it
        } else {
            conversationUserId = req.user._id;
            conversationUserName = req.user.name || req.user.username;
            conversationUserRole = req.user.role;
            readByAdmin = false; // Admin needs to read it
            readByUser = true;   // User sent this, so user already read it
        }

        const newChat = await Chat.create({
            userId: conversationUserId,
            userName: conversationUserName,
            userRole: conversationUserRole,
            senderId: req.user._id,
            senderName: req.user.name || req.user.username,
            senderRole: req.user.role,
            sender: req.user.role === 'admin' ? 'admin' : 'user', // Specific sender: 'admin' for replies
            message: message ? message.trim() : '',
            imageUrl,
            readByAdmin,
            readByUser,
        });

        // Real-time Socket.io emission to the specific user's room and admin room
        const io = req.app.get('io');
        if (io) {
            const userRoom = conversationUserId.toString();
            io.to(userRoom).emit('receive_message', newChat);
            io.to(userRoom).emit('message', newChat);
            io.to('admin_room').emit('receive_message', newChat);
            io.to('admin_room').emit('message', newChat);
        }

        // Clear typing indicator for sender
        const convKey = conversationUserId.toString();
        if (typingState[convKey]) {
            if (req.user.role === 'admin') {
                typingState[convKey].adminTypingUntil = null;
            } else {
                typingState[convKey].userTypingUntil = null;
            }
        }

        res.status(201).json(newChat);
    } catch (error) {
        console.error('Error sending chat message:', error);
        res.status(500).json({ message: error.message || 'Server error sending message' });
    }
};

// @desc    Get chat messages for current user or selected user (if admin)
// @route   GET /api/chat/messages/:userId?
// @access  Private
const getMessages = async (req, res) => {
    try {
        let conversationUserId;

        if (req.user.role === 'admin') {
            conversationUserId = req.params.userId || req.query.userId;
            if (!conversationUserId) {
                return res.status(400).json({ message: 'User ID is required for admin view' });
            }
        } else {
            conversationUserId = req.user._id;
        }

        const messages = await Chat.find({ userId: conversationUserId }).sort({ createdAt: 1 });

        // Check live typing indicator
        const convKey = conversationUserId.toString();
        cleanExpiredTyping(convKey);

        const isOtherTyping = req.user.role === 'admin'
            ? Boolean(typingState[convKey]?.userTypingUntil)
            : Boolean(typingState[convKey]?.adminTypingUntil);

        res.json({
            messages,
            isOtherTyping,
        });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

// @desc    Get all conversations (Admin only)
// @route   GET /api/chat/conversations
// @access  Private (Admin only)
const getConversations = async (req, res) => {
    try {
        const distinctChatUserIds = await Chat.distinct('userId');
        const nonAdminUsers = await User.find({ role: { $ne: 'admin' } }).select('name username role location farmSize');

        // Combine distinct users from chats and all registered non-admin users
        const allUserMap = new Map();

        nonAdminUsers.forEach((u) => {
            allUserMap.set(u._id.toString(), u);
        });

        // Ensure users with chats are also in map
        await Promise.all(
            distinctChatUserIds.map(async (uId) => {
                const uStr = uId.toString();
                if (!allUserMap.has(uStr)) {
                    const uDoc = await User.findById(uId).select('name username role location farmSize');
                    if (uDoc) allUserMap.set(uStr, uDoc);
                }
            })
        );

        const conversations = await Promise.all(
            Array.from(allUserMap.entries()).map(async ([uStr, userDoc]) => {
                const lastMessage = await Chat.findOne({ userId: uStr }).sort({ createdAt: -1 });
                const unreadCount = await Chat.countDocuments({ userId: uStr, readByAdmin: false });

                cleanExpiredTyping(uStr);
                const isUserTyping = Boolean(typingState[uStr]?.userTypingUntil);

                return {
                    userId: uStr,
                    user: userDoc,
                    lastMessage,
                    unreadCount,
                    isUserTyping,
                };
            })
        );

        // Sort: Users with unread messages first, then by last message time, then alphabetical
        conversations.sort((a, b) => {
            if (b.unreadCount !== a.unreadCount) {
                return (b.unreadCount || 0) - (a.unreadCount || 0);
            }
            const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : 0;
            const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : 0;
            if (dateB !== dateA) return dateB - dateA;
            return (a.user?.name || '').localeCompare(b.user?.name || '');
        });

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching admin conversations:', error);
        res.status(500).json({ message: 'Server error fetching conversations' });
    }
};

// @desc    Mark conversation messages as read
// @route   PUT /api/chat/read/:userId?
// @access  Private
const markAsRead = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const targetUserId = req.params.userId || req.body.userId;
            if (!targetUserId) {
                return res.status(400).json({ message: 'User ID is required' });
            }
            await Chat.updateMany(
                { userId: targetUserId, readByAdmin: false },
                { $set: { readByAdmin: true } }
            );
        } else {
            await Chat.updateMany(
                { userId: req.user._id, readByUser: false },
                { $set: { readByUser: true } }
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error marking messages as read' });
    }
};

// @desc    Get total unread messages count for notification badge / red dot
// @route   GET /api/chat/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
    try {
        let unreadCount = 0;

        if (req.user.role === 'admin') {
            unreadCount = await Chat.countDocuments({ readByAdmin: false });
        } else {
            unreadCount = await Chat.countDocuments({
                userId: req.user._id,
                readByUser: false,
                senderRole: 'admin',
            });
        }

        res.json({ unreadCount });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ unreadCount: 0 });
    }
};

// @desc    Send typing indicator pulse
// @route   POST /api/chat/typing
// @access  Private
const setTyping = async (req, res) => {
    try {
        const { isTyping, targetUserId } = req.body;
        const convKey = (req.user.role === 'admin' ? targetUserId : req.user._id)?.toString();

        if (!convKey) {
            return res.status(400).json({ message: 'Conversation key missing' });
        }

        if (!typingState[convKey]) {
            typingState[convKey] = { userTypingUntil: null, adminTypingUntil: null };
        }

        const expirationTime = isTyping ? Date.now() + 4000 : null; // Active for 4 seconds

        if (req.user.role === 'admin') {
            typingState[convKey].adminTypingUntil = expirationTime;
        } else {
            typingState[convKey].userTypingUntil = expirationTime;
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'Error setting typing indicator' });
    }
};

module.exports = {
    sendMessage,
    getMessages,
    getConversations,
    markAsRead,
    getUnreadCount,
    setTyping,
};
