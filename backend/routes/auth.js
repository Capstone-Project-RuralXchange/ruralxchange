const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      district: user.district,
      state: user.state,
      village: user.village,
      preferredLanguage: user.preferredLanguage,
      avatar: user.avatar,
      rating: user.rating,
      earnings: user.earnings,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }
  });
};

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, phone, email, password, district, state, village, preferredLanguage } = req.body;
    // Prevent admin role injection
    const role = ['seeker', 'provider'].includes(req.body.role) ? req.body.role : 'seeker';
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
    const user = await User.create({ name, phone, email, password, role, district, state, village, preferredLanguage });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone/Email and password required' });
    }
    const cleanIdentifier = phone.trim();
    const user = await User.findOne({
      $or: [
        { phone: cleanIdentifier },
        { email: cleanIdentifier.toLowerCase() }
      ]
    }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/auth/updateprofile
router.put('/updateprofile', protect, async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'district', 'state', 'village', 'preferredLanguage', 'bio', 'avatar'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
