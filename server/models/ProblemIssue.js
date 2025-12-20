const mongoose = require('mongoose');

const problemIssueSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cropName: { type: String, required: true },
    diseaseName: { type: String },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Resolved'],
        default: 'Pending',
    },
    messages: [{
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        senderName: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }],
    date: {
        type: Date,
        default: Date.now,
    },
});

const ProblemIssue = mongoose.model('ProblemIssue', problemIssueSchema);

module.exports = ProblemIssue;
