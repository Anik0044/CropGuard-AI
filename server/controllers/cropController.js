const CropData = require('../models/CropData');

// @desc    Get all crops
// @route   GET /api/crops
// @access  Public
const getCrops = async (req, res) => {
    try {
        const crops = await CropData.find({});
        res.json(crops);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single crop by ID
// @route   GET /api/crops/:id
// @access  Public
const getCropById = async (req, res) => {
    try {
        const crop = await CropData.findById(req.params.id);
        if (crop) {
            res.json(crop);
        } else {
            res.status(404).json({ message: 'Crop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a crop (Admin)
// @route   POST /api/crops
// @access  Private/Admin
const createCrop = async (req, res) => {
    try {
        const { cropName, diseases } = req.body;
        const crop = new CropData({
            cropName,
            diseases,
        });
        const createdCrop = await crop.save();
        res.status(201).json(createdCrop);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a crop (Admin)
// @route   PUT /api/admin/crops/:id
// @access  Private/Admin
const updateCrop = async (req, res) => {
    try {
        const { cropName, diseases } = req.body;
        const crop = await CropData.findById(req.params.id);

        if (crop) {
            crop.cropName = cropName || crop.cropName;
            crop.diseases = diseases || crop.diseases;

            const updatedCrop = await crop.save();
            res.json(updatedCrop);
        } else {
            res.status(404).json({ message: 'Crop not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getCrops, getCropById, createCrop, updateCrop };
