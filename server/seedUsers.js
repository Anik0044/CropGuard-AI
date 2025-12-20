const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });

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
        // Clear existing users
        await User.deleteMany();
        console.log('Existing users cleared.');

        // Create new users
        // We use User.create instead of insertMany to trigger the 'save' middleware for password hashing
        for (const user of users) {
            await User.create(user);
        }

        console.log('Users Seeded Successfully!');
        console.log('-----------------------------------');
        console.log('Admin:   Username: admin  | Pass: 12345678');
        console.log('Farmer:  Username: farmer | Pass: 12345678');
        console.log('Guest:   Username: guest  | Pass: 12345678');
        console.log('-----------------------------------');

        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

// seedUsers() called after connection
seedUsers();
