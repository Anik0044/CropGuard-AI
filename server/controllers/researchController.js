const ResearchData = require('../models/ResearchData');
const crypto = require('crypto');
const fs = require('fs');

// @desc    Create new research entry
// @route   POST /api/research
// @access  Private/Admin
const createResearch = async (req, res) => {
    try {
        const {
            cropType,
            diseaseName,
            symptoms,
            causes,
            organicTreatment,
            chemicalTreatment,
            prevention,
            researchNotes,
            isActive
        } = req.body;

        if (!cropType || !diseaseName) {
            return res.status(400).json({ message: 'Crop type and disease name are required' });
        }

        const researchData = {
            cropType,
            diseaseName,
            symptoms: symptoms || [],
            causes: causes || [],
            organicTreatment: organicTreatment || [],
            chemicalTreatment: chemicalTreatment || [],
            prevention: prevention || [],
            researchNotes: researchNotes || '',
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.user._id,
        };

        const research = await ResearchData.create(researchData);

        res.status(201).json({
            success: true,
            data: research,
            message: 'Research entry created successfully'
        });

    } catch (error) {
        console.error('Error creating research:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Research entry with this image hash already exists' });
        }
        res.status(500).json({ message: 'Server error creating research entry' });
    }
};

// @desc    Upload research with image
// @route   POST /api/research/upload
// @access  Private/Admin
const uploadResearchWithImage = async (req, res) => {
    try {
        const {
            cropType,
            diseaseName,
            symptoms,
            causes,
            organicTreatment,
            chemicalTreatment,
            prevention,
            researchNotes,
            isActive
        } = req.body;

        const referenceImageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        if (!cropType || !diseaseName) {
            return res.status(400).json({ message: 'Crop type and disease name are required' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'Please provide a reference image' });
        }

        // Calculate image hash
        const fileBuffer = fs.readFileSync(req.file.path);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const imageHash = hashSum.digest('hex');

        const researchData = {
            cropType,
            diseaseName,
            imageHash,
            referenceImageUrl,
            symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? [symptoms] : []),
            causes: Array.isArray(causes) ? causes : (causes ? [causes] : []),
            organicTreatment: Array.isArray(organicTreatment) ? organicTreatment : (organicTreatment ? [organicTreatment] : []),
            chemicalTreatment: Array.isArray(chemicalTreatment) ? chemicalTreatment : (chemicalTreatment ? [chemicalTreatment] : []),
            prevention: Array.isArray(prevention) ? prevention : (prevention ? [prevention] : []),
            researchNotes: researchNotes || '',
            isActive: isActive !== undefined ? isActive : true,
            createdBy: req.user._id,
        };

        const research = await ResearchData.create(researchData);

        console.log(`[Research] Created new entry with hash ${imageHash.substring(0, 8)}... for ${diseaseName}`);

        res.status(201).json({
            success: true,
            data: research,
            message: 'Research entry with image created successfully'
        });

    } catch (error) {
        console.error('Error uploading research:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Research entry with this image already exists' });
        }
        res.status(500).json({ message: 'Server error uploading research entry' });
    }
};

// @desc    Get all research entries
// @route   GET /api/research
// @access  Private/Admin
const getAllResearch = async (req, res) => {
    try {
        const { isActive } = req.query;

        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const research = await ResearchData.find(filter)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: research.length,
            data: research
        });

    } catch (error) {
        console.error('Error fetching research:', error);
        res.status(500).json({ message: 'Server error fetching research entries' });
    }
};

// @desc    Get research entry by ID
// @route   GET /api/research/:id
// @access  Private/Admin
const getResearchById = async (req, res) => {
    try {
        const research = await ResearchData.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!research) {
            return res.status(404).json({ message: 'Research entry not found' });
        }

        res.json({
            success: true,
            data: research
        });

    } catch (error) {
        console.error('Error fetching research:', error);
        res.status(500).json({ message: 'Server error fetching research entry' });
    }
};

// @desc    Update research entry
// @route   PUT /api/research/:id
// @access  Private/Admin
const updateResearch = async (req, res) => {
    try {
        const research = await ResearchData.findById(req.params.id);

        if (!research) {
            return res.status(404).json({ message: 'Research entry not found' });
        }

        const {
            cropType,
            diseaseName,
            symptoms,
            causes,
            organicTreatment,
            chemicalTreatment,
            prevention,
            researchNotes,
            isActive
        } = req.body;

        // Update fields
        if (cropType) research.cropType = cropType;
        if (diseaseName) research.diseaseName = diseaseName;
        if (symptoms) research.symptoms = symptoms;
        if (causes) research.causes = causes;
        if (organicTreatment) research.organicTreatment = organicTreatment;
        if (chemicalTreatment) research.chemicalTreatment = chemicalTreatment;
        if (prevention) research.prevention = prevention;
        if (researchNotes !== undefined) research.researchNotes = researchNotes;
        if (isActive !== undefined) research.isActive = isActive;

        const updatedResearch = await research.save();

        res.json({
            success: true,
            data: updatedResearch,
            message: 'Research entry updated successfully'
        });

    } catch (error) {
        console.error('Error updating research:', error);
        res.status(500).json({ message: 'Server error updating research entry' });
    }
};

// @desc    Delete research entry
// @route   DELETE /api/research/:id
// @access  Private/Admin
const deleteResearch = async (req, res) => {
    try {
        const research = await ResearchData.findById(req.params.id);

        if (!research) {
            return res.status(404).json({ message: 'Research entry not found' });
        }

        await research.deleteOne();

        res.json({
            success: true,
            message: 'Research entry deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting research:', error);
        res.status(500).json({ message: 'Server error deleting research entry' });
    }
};

// @desc    Find research by image hash
// @route   POST /api/research/find-by-image
// @access  Private/Admin
const getResearchByImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please provide an image' });
        }

        // Calculate image hash
        const fileBuffer = fs.readFileSync(req.file.path);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const imageHash = hashSum.digest('hex');

        const research = await ResearchData.findOne({ imageHash, isActive: true })
            .populate('createdBy', 'name email');

        if (!research) {
            return res.status(404).json({
                message: 'No research entry found for this image',
                imageHash: imageHash.substring(0, 16) + '...'
            });
        }

        res.json({
            success: true,
            data: research,
            imageHash: imageHash.substring(0, 16) + '...'
        });

    } catch (error) {
        console.error('Error finding research by image:', error);
        res.status(500).json({ message: 'Server error finding research entry' });
    }
};

module.exports = {
    createResearch,
    uploadResearchWithImage,
    getAllResearch,
    getResearchById,
    updateResearch,
    deleteResearch,
    getResearchByImage
};
