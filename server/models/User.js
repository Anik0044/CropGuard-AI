const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['guest', 'farmer', 'admin'],
    default: 'farmer',
  },
  location: {
    type: String,
  },
  farmSize: {
    type: Number,
  },
  isPermanent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: {
      expires: 86400, // TTL Index: Auto-deletes after 24 hours (86400 seconds)
      partialFilterExpression: { isPermanent: false },
    },
  },
}, {
  timestamps: true,
});

// Hash password before saving & protect permanent/admin accounts
userSchema.pre('save', async function () {
  // Never expire admin or default seeded test accounts
  if (this.role === 'admin' || ['admin', 'farmer', 'guest'].includes(this.username)) {
    this.isPermanent = true;
  }

  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
