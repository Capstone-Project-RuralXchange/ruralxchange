const express = require('express');
const router = express.Router();
const Specialist = require('../models/Specialist');
const { protect, authorize } = require('../middleware/auth');
const { geocodeWithFallback } = require('../utils/geocode');

// @GET /api/specialists - Get all with filters + distance sorting
router.get('/', async (req, res) => {
  try {
    const { district, specialization, status, lat, lng, page = 1, limit = 12 } = req.query;

    // If seeker provides coordinates, use $geoNear for distance-sorted results
    if (lat && lng) {
      const seekerLat = parseFloat(lat);
      const seekerLng = parseFloat(lng);

      if (!isNaN(seekerLat) && !isNaN(seekerLng)) {
        const matchStage = { isActive: true };
        if (district) matchStage.district = district;
        if (specialization) matchStage.specialization = specialization;
        if (status) matchStage.availabilityStatus = status;

        const skip = (page - 1) * limit;
        const pipeline = [
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [seekerLng, seekerLat] },
              distanceField: 'distanceMeters',
              spherical: true,
              maxDistance: 500000,
              query: matchStage
            }
          },
          { $addFields: { distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] } } },
          { $sort: { distanceMeters: 1 } },
          {
            $facet: {
              data: [{ $skip: skip }, { $limit: Number(limit) }],
              total: [{ $count: 'count' }]
            }
          }
        ];

        const [result] = await Specialist.aggregate(pipeline);
        const data = result.data || [];
        const total = result.total[0]?.count || 0;

        const populated = await Specialist.populate(data, {
          path: 'user',
          select: 'name phone district rating isVerified avatar'
        });

        return res.json({
          success: true,
          count: populated.length,
          total,
          pages: Math.ceil(total / limit),
          data: populated
        });
      }
    }

    // Standard query (no geo-sorting)
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

// Helper to sanitize specialist payload
function sanitizeSpecialistPayload(body) {
  if (body.specialization && typeof body.specialization === 'string') {
    let spec = body.specialization.trim().toLowerCase().replace(/[\s-]+/g, '_');
    if (spec === 'tractor_operator') spec = 'tractor_driver';
    if (spec === 'general_labour' || spec === 'general_labor') spec = 'general_laborer';
    body.specialization = spec;
  }
  if (body.availabilityStatus && typeof body.availabilityStatus === 'string') {
    body.availabilityStatus = body.availabilityStatus.trim().toLowerCase();
  }
  if (body.dailyRate != null && body.pricePerDay == null) {
    body.pricePerDay = Number(body.dailyRate);
  }
  if (body.hourlyRate != null && body.pricePerHour == null) {
    body.pricePerHour = Number(body.hourlyRate);
  }
  return body;
}

// @POST /api/specialists - Create specialist profile (auto-geocode)
router.post('/', protect, async (req, res) => {
  try {
    const existingProfile = await Specialist.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ success: false, message: 'Specialist profile already exists' });
    }
    req.body.user = req.user.id;
    req.body.district = req.body.district || req.user.district;
    sanitizeSpecialistPayload(req.body);

    // Auto-geocode
    const coords = await geocodeWithFallback(req.body.address, req.body.district);
    if (coords) {
      req.body.location = {
        type: 'Point',
        coordinates: [coords.lng, coords.lat]
      };
    }

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
    sanitizeSpecialistPayload(req.body);

    // Re-geocode if address changed
    if (req.body.address && req.body.address !== specialist.address) {
      const coords = await geocodeWithFallback(req.body.address, req.body.district || specialist.district);
      if (coords) {
        req.body.location = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      }
    }

    specialist = await Specialist.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
