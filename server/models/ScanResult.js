const mongoose = require('mongoose');

const scanResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cropType: {
        type: String,
        required: true,
    },
    inputImageUrl: {
        type: String,
        required: true,
    },
    detectedDisease: {
        type: String,
        required: true,
    },
    confidenceScore: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['completed', 'pending', 'pending_review', 'resolved', 'approved'],
        default: 'completed', // Reverted to completed/visible by default
    },
    adminComment: {
        type: String,
        default: '',
    },
    originalDetectedDisease: {
        type: String,
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    customDetails: {
        symptoms: [String],
        causes: [String],
        organicTreatment: [String],
        chemicalTreatment: [String],
        prevention: [String],
    }
});

const ScanResult = mongoose.model('ScanResult', scanResultSchema);

module.exports = ScanResult;
