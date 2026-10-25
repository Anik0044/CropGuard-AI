const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
    {
        name: 'Admin User',
        username: 'admin',
        password: '12345678',
        role: 'admin',
        location: 'Headquarters',
        farmSize: 0,
    },
    {
        name: 'John Farmer',
        username: 'farmer',
        password: '12345678',
        role: 'farmer',
        location: 'Green Valley Village',
        farmSize: 15,
    },
    {
        name: 'Guest User',
        username: 'guest',
        password: '12345678',
        role: 'guest',
        location: 'Unknown',
        farmSize: 0,
    }
];

const seedUsers = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('MongoDB Connected.');

        // Clear existing users
        await User.deleteMany();
        console.log('Existing users cleared.');

        // Create new users sequentially to trigger password hashing pre-save hook
        for (const user of users) {
            await User.create(user);
        }

        console.log('Users Seeded Successfully!');
        console.log('-----------------------------------');
        console.log('Admin:   Username: admin  | Pass: 12345678');
        console.log('Farmer:  Username: farmer | Pass: 12345678');
        console.log('Guest:   Username: guest  | Pass: 12345678');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('Seeding Error:', error.message);
        process.exit(1);
    }
};

seedUsers();
