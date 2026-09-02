const express = require('express');
const router = express.Router();
const Requirement = require('../models/Requirement');
const { protect } = require('../middleware/auth');

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

        const populated = await Requirement.populate(data, {
          path: 'postedBy',
          select: 'name district village rating'
        });

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
        .sort({ isUrgent: -1, createdAt: -1 })
        .skip(skip).limit(Number(limit)),
      Requirement.countDocuments(query)
    ]);
    res.json({ success: true, total, pages: Math.ceil(total / limit), data: requirements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/requirements
router.post('/', protect, async (req, res) => {
  try {
    req.body.postedBy = req.user.id;
    req.body.district = req.body.district || req.user.district;
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
      { $push: { responses: { respondent: req.user.id, message, offeredPrice } } },
      { new: true }
    ).populate('postedBy', 'name phone');
    res.json({ success: true, data: requirement });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
