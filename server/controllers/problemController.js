const ProblemIssue = require('../models/ProblemIssue');
const CropData = require('../models/CropData');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all problem issues (Admin Only)
// @route   GET /api/problems
const getProblems = async (req, res) => {
    try {
        const problems = await ProblemIssue.find().sort({ date: -1 });
        res.json(problems);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching problems' });
    }
};

// @desc    Post response and optionally sync to CropData
// @route   POST /api/problems/:id/respond
const respondToProblem = async (req, res) => {
    try {
        const { text, markAsSolution, cropDetails } = req.body;
        const problem = await ProblemIssue.findById(req.params.id);

        if (!problem) return res.status(404).json({ message: 'Problem not found' });

        // Add message
        problem.messages.push({
            senderId: req.user._id,
            senderName: req.user.name,
            text
        });

        if (markAsSolution) {
            problem.status = 'Resolved';

            // Automatic Sync to Main Database (CropData)
            if (cropDetails) {
                let crop = await CropData.findOne({ cropName: cropDetails.cropName });
                if (!crop) {
                    crop = await CropData.create({
                        cropName: cropDetails.cropName,
                        diseases: []
                    });
                }

                // Check if disease exists
                const diseaseIndex = crop.diseases.findIndex(d => d.name === cropDetails.diseaseName);
                const newDiseaseData = {
                    name: cropDetails.diseaseName,
                    symptoms: cropDetails.symptoms || [],
                    causes: cropDetails.causes || [],
                    organicTreatment: cropDetails.organicTreatment || [],
                    chemicalTreatment: cropDetails.chemicalTreatment || [],
                    prevention: cropDetails.prevention || [],
                    researchLinks: cropDetails.researchLinks || []
                };

                if (diseaseIndex > -1) {
                    crop.diseases[diseaseIndex] = newDiseaseData;
                } else {
                    crop.diseases.push(newDiseaseData);
                }
                await crop.save();
            }
        }

        await problem.save();
        res.json(problem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error responding to problem' });
    }
};

// @desc    Secondary Authentication (Password Verification)
// @route   POST /api/problems/auth
const verifySecondaryAuth = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user._id);

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ success: true, message: 'Authenticated' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during auth' });
    }
};

module.exports = { getProblems, respondToProblem, verifySecondaryAuth };
