const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createResearch,
    uploadResearchWithImage,
    getAllResearch,
    getResearchById,
    updateResearch,
    deleteResearch,
    getResearchByImage
} = require('../controllers/researchController');
const { protect, admin } = require('../middleware/authMiddleware');

// Multer configuration for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'research-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files (jpeg, jpg, png) are allowed'));
    }
});

// All routes require authentication and admin privileges
router.use(protect);
router.use(admin);

// Research CRUD routes
router.post('/', createResearch);
router.post('/upload', upload.single('image'), uploadResearchWithImage);
router.get('/', getAllResearch);
router.get('/:id', getResearchById);
router.put('/:id', updateResearch);
router.delete('/:id', deleteResearch);
router.post('/find-by-image', upload.single('image'), getResearchByImage);

module.exports = router;
