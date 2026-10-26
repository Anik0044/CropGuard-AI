const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { autoSeedIfEmpty } = require('./utils/autoSeed');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT']
    }
});

// Make io accessible in Express route controllers
app.set('io', io);

// Socket.io Real-Time Event Handlers
io.on('connection', (socket) => {
    // User joins their private room
    socket.on('join', ({ userId }) => {
        if (userId) {
            const room = userId.toString();
            socket.join(room);
        }
    });

    // Admin joins the admin monitoring room
    socket.on('join_admin', () => {
        socket.join('admin_room');
    });

    // Real-time message exchange
    socket.on('send_message', (data) => {
        const targetRoom = data?.userId?.toString();
        if (targetRoom) {
            io.to(targetRoom).emit('receive_message', data);
            io.to(targetRoom).emit('message', data);
        }
        io.to('admin_room').emit('receive_message', data);
        io.to('admin_room').emit('message', data);
    });

    // Typing indicators
    socket.on('user_typing', ({ userId, isTyping }) => {
        if (userId) {
            io.to('admin_room').emit('user_typing', { userId, isTyping });
        }
    });

    socket.on('admin_typing', ({ userId, isTyping }) => {
        if (userId) {
            io.to(userId.toString()).emit('admin_typing', { isTyping });
        }
    });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection Function (Direct MongoDB Atlas connection without in-memory fallback)
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        await autoSeedIfEmpty();
        return true;
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
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
    const problemRoutes = require('./routes/problemRoutes');
    const cropRoutes = require('./routes/cropRoutes');
    const chatbotRoutes = require('./routes/chatbotRoutes');
    const signatureRoutes = require('./routes/signatureRoutes');
    const researchRoutes = require('./routes/researchRoutes');
    const chatRoutes = require('./routes/chatRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/detect', detectRoutes);
    app.use('/api/problems', problemRoutes);
    app.use('/api/crops', cropRoutes);
    app.use('/api/chatbot', chatbotRoutes);
    app.use('/api/signatures', signatureRoutes);
    app.use('/api/research', researchRoutes);
    app.use('/api/chat', chatRoutes);

    // Serve static assets in production
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client/dist')));

        app.get(/(.*)/, (req, res) => {
            res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
        });
    }

    // Start listening only after everything is ready
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ Socket.io initialized`);
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
