const ScanResult = require('../models/ScanResult');
const CropData = require('../models/CropData');
const DiseaseSignature = require('../models/DiseaseSignature');
const ResearchData = require('../models/ResearchData');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const fs = require('fs');

// @desc    Detect crop disease (Deterministic + Mock AI)
// @route   POST /api/detect
// @access  Private
const detectDisease = async (req, res) => {
    try {
        const { cropType, customDisease } = req.body;
        const inputImageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        if (!cropType || !req.file) {
            return res.status(400).json({ message: 'Please provide an image and crop type' });
        }

        // 1. Calculate Image Hash
        const fileBuffer = fs.readFileSync(req.file.path);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const imageHash = hashSum.digest('hex');

        // 2. PRIORITY 1: Check Research Data First (Highest Priority - 100% Match)
        const researchMatch = await ResearchData.findOne({
            imageHash,
            isActive: true
        });

        let detectedDisease = 'Healthy';
        let confidenceScore = 0;
        let isKnownSignature = false;
        let isDetectionFailed = false;
        let diseaseDetails = null;

        if (researchMatch) {
            console.log(`[Research Match] Found for hash ${imageHash.substring(0, 10)}...: ${researchMatch.diseaseName}`);
            detectedDisease = researchMatch.diseaseName;
            confidenceScore = 100;
            isKnownSignature = true;

            // Use research data details
            diseaseDetails = {
                name: researchMatch.diseaseName,
                symptoms: researchMatch.symptoms,
                causes: researchMatch.causes,
                organicTreatment: researchMatch.organicTreatment,
                chemicalTreatment: researchMatch.chemicalTreatment,
                prevention: researchMatch.prevention,
                imageUrl: researchMatch.referenceImageUrl,
                researchNotes: researchMatch.researchNotes
            };
        } else {
            // 3. PRIORITY 2: Check for Training Signature (100% Match)
            const signature = await DiseaseSignature.findOne({ imageHash });

            if (signature) {
                console.log(`[Detection] Found signature for hash ${imageHash.substring(0, 10)}...: ${signature.diseaseName}`);
                detectedDisease = signature.diseaseName;
                confidenceScore = signature.confidence; // 100%
                isKnownSignature = true;
            } else {
                console.log(`[Detection] No signature found for hash ${imageHash.substring(0, 10)}... Using deterministic fallback.`);

                // 4. PRIORITY 3: Deterministic Random Fallback
                // Use the hash to seed the random choice so the SAME image always gets the SAME random result
                // This solves the user's issue of "same data given different result" even for unknown images.

                // Simple hash-to-integer conversion
                let hashVal = 0;
                for (let i = 0; i < imageHash.length; i++) {
                    hashVal += imageHash.charCodeAt(i);
                }

                // Pseudo-random generator based on hash
                const seed = hashVal;
                const pseudoRandom = (min, max) => {
                    const x = Math.sin(seed) * 10000;
                    const randomFloat = x - Math.floor(x); // 0.0 to 1.0 based on seed
                    return Math.floor(randomFloat * (max - min + 1)) + min;
                };

                confidenceScore = pseudoRandom(85, 99);

                // Simulate failure deterministically (e.g., if hash ends in '0')
                isDetectionFailed = imageHash.endsWith('0') || imageHash.endsWith('a'); // ~1/8 chance

                if (customDisease) {
                    detectedDisease = customDisease;
                    confidenceScore = 100;
                } else if (isDetectionFailed) {
                    detectedDisease = 'Unknown - Detection Failed';
                    confidenceScore = 0;
                } else if (cropType) {
                    // Get list of diseases for this crop
                    let diseases = ['Healthy'];
                    if (cropType === 'Tomato') diseases = ['Late Blight', 'Early Blight', 'Mosaic Virus', 'Fusarium Wilt', 'Septoria Leaf Spot', 'Healthy'];
                    else if (cropType === 'Potato') diseases = ['Late Blight', 'Early Blight', 'Bacterial Wilt', 'Common Scab', 'Healthy'];
                    else if (cropType === 'Rice') diseases = ['Blast', 'Bacterial Leaf Blight', 'Sheath Blight', 'Brown Spot', 'Tungro Disease', 'Healthy'];
                    else if (cropType === 'Wheat') diseases = ['Leaf Rust', 'Powdery Mildew', 'Fusarium Head Blight', 'Septoria Tritici Blotch', 'Loose Smut', 'Healthy'];
                    else if (cropType === 'Cotton') diseases = ['Fusarium Wilt', 'Bacterial Blight', 'Alternaria Leaf Spot', 'Cotton Leaf Curl Virus', 'Root Rot', 'Healthy'];

                    // Pick based on hash
                    const index = hashVal % diseases.length;
                    detectedDisease = diseases[index];
                }
            }
        }

        // Fetch comprehensive details from CropData if not already set by research data
        if (!diseaseDetails && detectedDisease !== 'Healthy' && detectedDisease !== 'Unknown - Detection Failed') {
            try {
                const cropData = await CropData.findOne({ cropName: cropType });
                if (cropData) {
                    diseaseDetails = cropData.diseases.find(d => d.name === detectedDisease);
                }
            } catch (err) { console.error(err); }
        }

        // Status logic
        let status = 'completed'; // Default to completed/visible

        // CONFIDENCE CHECK: If score < 70%, flag for review
        if (confidenceScore < 70) {
            status = 'pending_review';
            detectedDisease = 'Unidentified - Under Expert Review';
            // We keep the originalDetectedDisease from line 110 (which is set before this block)
        }

        const scanResult = await ScanResult.create({
            userId: req.user._id,
            cropType,
            inputImageUrl,
            detectedDisease,
            originalDetectedDisease: isKnownSignature ? signature.diseaseName : (customDisease || (isDetectionFailed ? 'Unknown' : detectedDisease)),
            confidenceScore,
            status
        });

        res.status(200).json({
            success: true,
            data: { ...scanResult.toObject(), diseaseDetails },
            message: 'scan submitted for review. It will appear in your history once approved.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during detection' });
    }
};

// @desc    Get user scan history
// @route   GET /api/history
// @access  Private
const getHistory = async (req, res) => {
    try {
        // Only show approved/completed/resolved scans to the user
        // Exclude 'pending' and 'pending_review'
        const history = await ScanResult.find({
            userId: req.user._id,
            status: { $in: ['approved', 'resolved', 'completed', 'pending_review'] }
        }).sort({ date: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching history' });
    }
};

// @desc    Delete a scan result
// @route   DELETE /api/detect/:id
// @access  Private
const deleteScan = async (req, res) => {
    try {
        const scan = await ScanResult.findById(req.params.id);

        if (!scan) {
            return res.status(404).json({ message: 'Scan not found' });
        }

        // Check if user owns the scan
        if (scan.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await scan.deleteOne();
        res.json({ message: 'Scan removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting scan' });
    }
};

// @desc    Get all scans (Admin Only)
// @route   GET /api/detect/admin/all
// @access  Private/Admin
const getAllScans = async (req, res) => {
    try {
        const scans = await ScanResult.find({})
            .populate('userId', 'name email')
            .sort({ date: -1 });
        res.json(scans);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching all scans' });
    }
};

// @desc    Update scan result (Admin Only)
// @route   PUT /api/detect/admin/:id
// @access  Private/Admin

// @desc    Update scan result (Admin Only)
// @route   PUT /api/detect/admin/:id
// @access  Private/Admin
const updateScanResult = async (req, res) => {
    try {
        const { detectedDisease, adminComment } = req.body;

        const scan = await ScanResult.findById(req.params.id);

        if (!scan) {
            return res.status(404).json({ message: 'Scan not found' });
        }

        // 1. Update Scan Record
        scan.detectedDisease = detectedDisease || scan.detectedDisease;
        scan.adminComment = adminComment || scan.adminComment;

        // Save custom details if provided
        if (req.body.customDetails) {
            scan.customDetails = req.body.customDetails;
        }

        scan.status = 'resolved';
        scan.reviewedBy = req.user._id;

        const updatedScan = await scan.save();

        // 2. Learning Mechanism: Create/Update Disease Signature
        // Only if we have the image path and it's a valid local file
        if (scan.inputImageUrl && detectedDisease) {
            try {
                const absolutePath = `.${scan.inputImageUrl}`; // Assuming relative to server root
                if (fs.existsSync(absolutePath)) {
                    const fileBuffer = fs.readFileSync(absolutePath);
                    const hashSum = crypto.createHash('sha256');
                    hashSum.update(fileBuffer);
                    const imageHash = hashSum.digest('hex');

                    // Check if signature already exists
                    let signature = await DiseaseSignature.findOne({ imageHash });

                    if (signature) {
                        signature.diseaseName = detectedDisease;
                        signature.confidence = 100;
                        await signature.save();
                        console.log(`[Learning] Updated signature for hash ${imageHash.substring(0, 8)}`);
                    } else {
                        await DiseaseSignature.create({
                            imageHash,
                            diseaseName: detectedDisease,
                            cropType: scan.cropType,
                            confidence: 100,
                            createdBy: req.user._id
                        });
                        console.log(`[Learning] Created new signature for hash ${imageHash.substring(0, 8)}`);
                    }
                }
            } catch (learningError) {
                console.error('Error during learning process:', learningError);
                // Don't fail the request just because learning failed
            }
        }

        // 3. Notification: Notify User
        try {
            await Notification.create({
                userId: scan.userId,
                message: `Hello! An expert has reviewed your ${scan.cropType} scan from ${new Date(scan.date).toLocaleDateString()}. \n\nDiagnosis: ${detectedDisease}. \nExpert Note: ${adminComment || 'Please check the dashboard for full details.'}`,
                type: 'scan_update',
                relatedId: scan._id
            });
            console.log(`[Notification] Created for user ${scan.userId}`);
        } catch (notifyError) {
            console.error('Error creating notification:', notifyError);
        }

        res.json(updatedScan);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating scan' });
    }
};

module.exports = { detectDisease, getHistory, deleteScan, getAllScans, updateScanResult };
