const express = require('express');
const router = express.Router();
const Requirement = require('../models/Requirement');
const { protect } = require('../middleware/auth');

const { KARNATAKA_DISTRICT_COORDS } = require('../utils/geocode');

// @GET /api/requirements
router.get('/', async (req, res) => {
  try {
    const { district, type, status = 'open', lat, lng, page = 1, limit = 10 } = req.query;

    if (lat && lng) {
      const seekerLat = parseFloat(lat);
      const seekerLng = parseFloat(lng);

      if (!isNaN(seekerLat) && !isNaN(seekerLng)) {
        const matchStage = { status };
        if (district) matchStage.district = district;
        if (type) matchStage.requirementType = type;

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

        const [result] = await Requirement.aggregate(pipeline);
        const data = result.data || [];
        const total = result.total[0]?.count || 0;

        const populated = await Requirement.populate(data, [
          { path: 'postedBy', select: 'name district village rating' },
          { path: 'responses.respondent', select: 'name district rating avatar' }
        ]);

        return res.json({
          success: true,
          total,
          pages: Math.ceil(total / limit),
          data: populated
        });
      }
    }

    // Standard query
    const query = { status };
    if (district) query.district = district;
    if (type) query.requirementType = type;

    const skip = (page - 1) * limit;
    const [requirements, total] = await Promise.all([
      Requirement.find(query)
        .populate('postedBy', 'name district village rating')
        .populate({ path: 'responses.respondent', select: 'name district rating avatar' })
        .sort({ isUrgent: -1, createdAt: -1 })
        .skip(skip).limit(Number(limit)),
      Requirement.countDocuments(query)
    ]);
    res.json({ success: true, total, pages: Math.ceil(total / limit), data: requirements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Helper to sanitize requirement payload
function sanitizeRequirementPayload(body) {
  if (body.requirementType && typeof body.requirementType === 'string') {
    body.requirementType = body.requirementType.trim().toLowerCase().replace(/[\s-]+/g, '_');
  }
  if (body.status && typeof body.status === 'string') {
    body.status = body.status.trim().toLowerCase();
  }
  if (body.category && !body.equipmentNeeded) {
    body.equipmentNeeded = { category: body.category.trim().toLowerCase().replace(/[\s-]+/g, '_') };
  }
  return body;
}

// @POST /api/requirements
router.post('/', protect, async (req, res) => {
  try {
    req.body.postedBy = req.user.id;
    req.body.district = req.body.district || req.user.district;
    sanitizeRequirementPayload(req.body);

    // Auto-assign location coordinates if not present
    if (!req.body.location || !req.body.location.coordinates || (req.body.location.coordinates[0] === 0 && req.body.location.coordinates[1] === 0)) {
      const coords = KARNATAKA_DISTRICT_COORDS[req.body.district] || KARNATAKA_DISTRICT_COORDS['Bengaluru Urban'];
      if (coords) {
        req.body.location = { type: 'Point', coordinates: [coords.lng, coords.lat] };
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);
    req.body.expiresAt = expiresAt;
    const requirement = await Requirement.create(req.body);
    res.status(201).json({ success: true, data: requirement });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @POST /api/requirements/:id/respond
router.post('/:id/respond', protect, async (req, res) => {
  try {
    const { message, offeredPrice } = req.body;
    const requirement = await Requirement.findByIdAndUpdate(
      req.params.id,
      { $push: { responses: { respondent: req.user.id, message, offeredPrice: offeredPrice ? Number(offeredPrice) : undefined } } },
      { new: true }
    )
      .populate('postedBy', 'name district')
      .populate({ path: 'responses.respondent', select: 'name district rating avatar' });
    res.json({ success: true, data: requirement });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @DELETE /api/requirements/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) return res.status(404).json({ success: false, message: 'Requirement not found' });
    if (requirement.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this requirement' });
    }
    await Requirement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Requirement deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

