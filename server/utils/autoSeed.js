const User = require('../models/User');
const CropData = require('../models/CropData');
const { crops } = require('../seeder');

const defaultUsers = [
    {
        name: 'Admin User',
        username: 'admin',
        password: '12345678',
        role: 'admin',
        location: 'Headquarters',
        farmSize: 0,
        isPermanent: true,
    },
    {
        name: 'John Farmer',
        username: 'farmer',
        password: '12345678',
        role: 'farmer',
        location: 'Green Valley Village',
        farmSize: 15,
        isPermanent: true,
    },
    {
        name: 'Guest User',
        username: 'guest',
        password: '12345678',
        role: 'guest',
        location: 'Unknown',
        farmSize: 0,
        isPermanent: true,
    }
];

const autoSeedIfEmpty = async () => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('Seeding default users (admin, farmer, guest)...');
            for (const u of defaultUsers) {
                await User.create(u);
            }
            console.log('✓ Default users seeded successfully.');
        }

        const cropCount = await CropData.countDocuments();
        if (cropCount === 0 && crops && crops.length > 0) {
            console.log('Seeding disease knowledge base...');
            await CropData.insertMany(crops);
            console.log(`✓ Seeded ${crops.length} crops into knowledge base.`);
        }
    } catch (error) {
        console.error('Auto-seed warning:', error.message);
    }
};

module.exports = { autoSeedIfEmpty };
