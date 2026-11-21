const express = require('express');
const router = express.Router();
router.param('id', require('../middleware/requestValidation').identifier);
router.use(require('../middleware/requestValidation').query);
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
        if (status === 'open') matchStage.$or = [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }];
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
    if (status === 'open') query.$or = [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }];
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
    res.status(500).json({ success: false, message: 'Could not complete request. Please try again.' });
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
    const { pick } = require('../middleware/listingFields');
    req.body = pick(req.body, ['title', 'description', 'requirementType', 'equipmentNeeded', 'specialistNeeded', 'startDate', 'endDate', 'duration', 'district', 'village', 'state', 'isUrgent', 'budget', 'category']);
    req.body.postedBy = req.user.id;
    req.body.district = req.body.district || req.user.district;
    if (typeof req.body.district !== 'string' || !KARNATAKA_DISTRICT_COORDS[req.body.district.trim()]) return res.status(400).json({ success: false, message: 'Select a valid Karnataka district' });
    req.body.district = req.body.district.trim();
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
    return res.status(400).json({ success: false, message: err.code === 11000 ? 'This record already exists' : 'Please check required fields and valid values' });
  }
});

// @POST /api/requirements/:id/respond
router.post('/:id/respond', protect, async (req, res) => {
  try {
    const { offeredPrice } = req.body;
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    if (!message || message.length > 2000) return res.status(400).json({ success: false, message: 'Response message must be 1-2000 characters' });
    let price;
    if (offeredPrice !== undefined && offeredPrice !== null && offeredPrice !== '') {
      price = Number(offeredPrice);
      if (typeof offeredPrice === 'boolean' || !Number.isFinite(price) || price < 0 || price > 1000000000 || !['number', 'string'].includes(typeof offeredPrice)) {
        return res.status(400).json({ success: false, message: 'Offered price must be between 0 and 1,000,000,000' });
      }
    }
    if (message !== undefined && typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Please check required fields and valid values' });
    }
    // Atomic guard: only an open, unexpired post by someone else accepts a response.
    const requirement = await Requirement.findOneAndUpdate(
      { _id: req.params.id, status: 'open', postedBy: { $ne: req.user.id }, 'responses.respondent': { $ne: req.user.id }, $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: new Date() } }] },
      { $push: { responses: { respondent: req.user.id, message, offeredPrice: price } } },
      { new: true }
    )
      .populate('postedBy', 'name district')
      .populate({ path: 'responses.respondent', select: 'name district rating avatar' });
    if (!requirement) {
      const existing = await Requirement.findById(req.params.id).select('postedBy status expiresAt responses.respondent');
      if (!existing) return res.status(404).json({ success: false, message: 'Requirement not found' });
      if (existing.postedBy.toString() === req.user.id) return res.status(403).json({ success: false, message: 'You cannot respond to your own post' });
      if (existing.responses.some(r => r.respondent.toString() === req.user.id)) return res.status(409).json({ success: false, message: 'You have already responded to this notice' });
      return res.status(409).json({ success: false, message: 'This notice is no longer open for responses' });
    }
    res.json({ success: true, data: requirement });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.code === 11000 ? 'This record already exists' : 'Please check required fields and valid values' });
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
    res.status(500).json({ success: false, message: 'Could not complete request. Please try again.' });
  }
});

module.exports = router;

