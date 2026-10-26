const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const ScanResult = require('./models/ScanResult');

async function syncIndexesAndFlags() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Atlas');

    // Ensure default users are flagged isPermanent: true
    const updateRes = await User.updateMany(
      { username: { $in: ['admin', 'farmer', 'guest'] } },
      { $set: { isPermanent: true } }
    );
    console.log('Marked default users as permanent:', updateRes.modifiedCount);

    // Sync User indexes
    await User.syncIndexes();
    console.log('User indexes synchronized.');

    // Sync ScanResult indexes
    await ScanResult.syncIndexes();
    console.log('ScanResult indexes synchronized.');

    const userIndexes = await User.collection.indexes();
    console.log('User collection indexes on Atlas:', JSON.stringify(userIndexes, null, 2));

    const scanIndexes = await ScanResult.collection.indexes();
    console.log('ScanResult collection indexes on Atlas:', JSON.stringify(scanIndexes, null, 2));

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Index sync error:', err);
    process.exit(1);
  }
}

syncIndexesAndFlags();
