const mongoose = require('mongoose');

const cropDataSchema = new mongoose.Schema({
    cropName: {
        type: String,
        required: true,
    },
    diseases: [{
        name: { type: String, required: true },
        symptoms: [String],
        causes: [String],
        organicTreatment: [String],
        chemicalTreatment: [String],
        prevention: [String],
        imageUrl: { type: String },
        researchLinks: [String],
    }],
});

const CropData = mongoose.model('CropData', cropDataSchema);

module.exports = CropData;
