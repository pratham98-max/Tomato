const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../config/firebase');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/signup — Email/Password signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (!['customer', 'restaurant', 'delivery'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.create({ name, email, password, role, phone, address });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login — Email/Password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/firebase — Firebase login/signup (Google or Email via Firebase)
router.post('/firebase', async (req, res) => {
  try {
    const { firebaseToken, role } = req.body;

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const { email, name, uid, picture } = decodedToken;

    // Check if user already exists in our DB
    let user = await User.findOne({ email });

    if (user) {
      // Existing user — just log them in
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    }

    // New user — create them (role is required for new users)
    if (!role || !['customer', 'restaurant', 'delivery'].includes(role)) {
      return res.status(400).json({ 
        message: 'Role required for new users',
        needsRole: true,
        email,
        name: name || email.split('@')[0]
      });
    }

    user = await User.create({
      name: name || email.split('@')[0],
      email,
      password: uid + '_firebase_' + Date.now(), // Placeholder password for Firebase users
      role,
      firebaseUid: uid
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Firebase auth error:', error.message);
    res.status(401).json({ message: 'Invalid Firebase token' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    phone: req.user.phone,
    address: req.user.address
  });
});

module.exports = router;
