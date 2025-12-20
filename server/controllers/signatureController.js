const DiseaseSignature = require('../models/DiseaseSignature');
const crypto = require('crypto');
const fs = require('fs');

// @desc    Add a new disease signature (Admin Training)
// @route   POST /api/signatures
// @access  Private/Admin
const addSignature = async (req, res) => {
    try {
        const { diseaseName, cropType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image to train the system' });
        }

        // Calculate SHA-256 hash of the file
        const fileBuffer = fs.readFileSync(req.file.path);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const imageHash = hashSum.digest('hex');

        // Check if signature already exists
        let signature = await DiseaseSignature.findOne({ imageHash });

        if (signature) {
            // Update existing signature
            signature.diseaseName = diseaseName;
            signature.cropType = cropType;
            signature.confidence = 100;
            signature.createdBy = req.user._id;
            await signature.save();
            return res.status(200).json({ message: 'Existing signature updated', signature });
        }

        // Create new signature
        signature = await DiseaseSignature.create({
            imageHash,
            diseaseName,
            cropType,
            confidence: 100,
            createdBy: req.user._id
        });

        res.status(201).json({ message: 'Training successful! Image signature saved.', signature });

    } catch (error) {
        console.error('Error adding signature:', error);
        res.status(500).json({ message: 'Server error adding signature' });
    }
};

// @desc    Get all signatures
// @route   GET /api/signatures
// @access  Private/Admin
const getSignatures = async (req, res) => {
    try {
        const signatures = await DiseaseSignature.find({}).sort({ createdAt: -1 });
        res.json(signatures);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching signatures' });
    }
};

module.exports = { addSignature, getSignatures };
