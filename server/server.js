const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection Function
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        return true;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error('Please check:');
        console.error('1. Your internet connection');
        console.error('2. MongoDB Atlas IP whitelist includes your current IP');
        console.error('3. Username and password are correct in .env file');
        process.exit(1);
    }
};

// Start Server Function
const startServer = async () => {
    // Connect to database first
    await connectDB();

    // Only register routes after successful database connection
    const authRoutes = require('./routes/authRoutes');
    const detectRoutes = require('./routes/detectRoutes');
    const problemRoutes = require('./routes/problemRoutes'); // Added problemRoutes
    const cropRoutes = require('./routes/cropRoutes');
    const chatbotRoutes = require('./routes/chatbotRoutes');
    const signatureRoutes = require('./routes/signatureRoutes');
    const researchRoutes = require('./routes/researchRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/detect', detectRoutes);
    app.use('/api/problems', problemRoutes); // Registered problemRoutes
    app.use('/api/crops', cropRoutes);
    app.use('/api/chatbot', chatbotRoutes);
    app.use('/api/signatures', signatureRoutes);
    app.use('/api/research', researchRoutes);

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client/dist')));

        app.get(/(.*)/, (req, res) => {
            res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
        });
    }

    // Start listening only after everything is ready
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ API ready at /api`);
    });
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

// Start the server
startServer();
