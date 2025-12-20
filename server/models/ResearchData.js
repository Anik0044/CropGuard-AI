const mongoose = require('mongoose');

const researchDataSchema = new mongoose.Schema({
    cropType: {
        type: String,
        required: true,
    },
    diseaseName: {
        type: String,
        required: true,
    },
    imageHash: {
        type: String,
        unique: true,
        sparse: true, // Allows null values while maintaining uniqueness for non-null values
    },
    symptoms: {
        type: [String],
        default: [],
    },
    causes: {
        type: [String],
        default: [],
    },
    organicTreatment: {
        type: [String],
        default: [],
    },
    chemicalTreatment: {
        type: [String],
        default: [],
    },
    prevention: {
        type: [String],
        default: [],
    },
    confidence: {
        type: Number,
        default: 100, // Research data always has 100% confidence
    },
    researchNotes: {
        type: String,
        default: '',
    },
    referenceImageUrl: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

// Index for faster lookups
researchDataSchema.index({ imageHash: 1, isActive: 1 });
researchDataSchema.index({ cropType: 1, diseaseName: 1 });

module.exports = mongoose.model('ResearchData', researchDataSchema);
