const mongoose = require('mongoose');

const diseaseSignatureSchema = new mongoose.Schema({
    imageHash: {
        type: String,
        required: true,
        unique: true,
    },
    diseaseName: {
        type: String,
        required: true,
    },
    cropType: {
        type: String,
        required: true,
    },
    confidence: {
        type: Number,
        default: 100,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('DiseaseSignature', diseaseSignatureSchema);
