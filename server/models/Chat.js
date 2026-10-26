const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userRole: {
        type: String,
        default: 'farmer',
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    senderName: {
        type: String,
        required: true,
    },
    senderRole: {
        type: String,
        enum: ['farmer', 'admin', 'guest', 'user'],
        required: true,
    },
    sender: {
        type: String,
        enum: ['admin', 'user', 'farmer', 'guest'],
        default: 'user',
    },
    message: {
        type: String,
        default: '',
    },
    imageUrl: {
        type: String,
        default: '',
    },
    readByAdmin: {
        type: Boolean,
        default: false,
    },
    readByUser: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // TTL Index: Auto-deletes all chat messages and image links after 24 hours (86400 seconds)
    },
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
