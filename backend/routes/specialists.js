const express = require('express');
const router = express.Router();
const Specialist = require('../models/Specialist');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/specialists
router.get('/', async (req, res) => {
  try {
    const { district, specialization, status, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (district) query.district = district;
    if (specialization) query.specialization = specialization;
    if (status) query.availabilityStatus = status;

    const skip = (page - 1) * limit;
    const [specialists, total] = await Promise.all([
      Specialist.find(query)
        .populate('user', 'name phone district rating isVerified avatar')
        .sort({ 'rating.average': -1, isVerified: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Specialist.countDocuments(query)
    ]);
    res.json({ success: true, count: specialists.length, total, pages: Math.ceil(total / limit), data: specialists });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/specialists/:id
router.get('/:id', async (req, res) => {
  try {
    const specialist = await Specialist.findById(req.params.id)
      .populate('user', 'name phone district rating isVerified avatar bio createdAt');
    if (!specialist) return res.status(404).json({ success: false, message: 'Specialist not found' });
    res.json({ success: true, data: specialist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/specialists - Create specialist profile
router.post('/', protect, async (req, res) => {
  try {
    const existingProfile = await Specialist.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ success: false, message: 'Specialist profile already exists' });
    }
    req.body.user = req.user.id;
    req.body.district = req.body.district || req.user.district;
    const specialist = await Specialist.create(req.body);
    // Update user role
    await require('../models/User').findByIdAndUpdate(req.user.id, { role: 'specialist' });
    res.status(201).json({ success: true, data: specialist });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @PUT /api/specialists/:id
router.put('/:id', protect, async (req, res) => {
  try {
    let specialist = await Specialist.findById(req.params.id);
    if (!specialist) return res.status(404).json({ success: false, message: 'Not found' });
    if (specialist.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    specialist = await Specialist.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: specialist });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Get my specialist profile
router.get('/me/profile', protect, async (req, res) => {
  try {
    const specialist = await Specialist.findOne({ user: req.user.id });
    if (!specialist) return res.status(404).json({ success: false, message: 'No specialist profile found' });
    res.json({ success: true, data: specialist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
