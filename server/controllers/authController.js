const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, username, mobileNumber, password, role, location, farmSize, email } = req.body;

        // Sanitize inputs: Convert empty strings to undefined
        const sanitizedData = {
            name,
            username,
            password,
            role: role || 'farmer',
            mobileNumber: mobileNumber === '' ? undefined : mobileNumber,
            email: email === '' ? undefined : email,
            location: location === '' ? undefined : location,
            farmSize: (farmSize === '' || farmSize === undefined) ? undefined : Number(farmSize),
        };

        const userExists = await User.findOne({ username });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create(sanitizedData);

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Registration Error:", error.message);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`);

    const user = await User.findOne({ username });

    if (user) {
        console.log(`User found: ${user.username}, Role: ${user.role}`);
        if (await user.matchPassword(password)) {
            console.log('Password match success');
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            console.log('Password match failed');
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } else {
        console.log('User not found');
        res.status(401).json({ message: 'Invalid username or password' });
    }
};

module.exports = { registerUser, authUser };
