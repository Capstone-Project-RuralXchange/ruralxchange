const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { protect, authorize } = require('../middleware/auth');
const { geocodeWithFallback } = require('../utils/geocode');

// @GET /api/equipment - Get all equipment with filters + distance sorting
router.get('/', async (req, res) => {
  try {
    const { district, category, status, minPrice, maxPrice, lat, lng, page = 1, limit = 12 } = req.query;

    // If seeker provides coordinates, use $geoNear for distance-sorted results
    if (lat && lng) {
      const seekerLat = parseFloat(lat);
      const seekerLng = parseFloat(lng);

      if (!isNaN(seekerLat) && !isNaN(seekerLng)) {
        const matchStage = { isActive: true };
        if (district) matchStage.district = district;
        if (category) matchStage.category = category;
        if (status) matchStage.availabilityStatus = status;
        if (minPrice || maxPrice) {
          matchStage.pricePerDay = {};
          if (minPrice) matchStage.pricePerDay.$gte = Number(minPrice);
          if (maxPrice) matchStage.pricePerDay.$lte = Number(maxPrice);
        }

        const skip = (page - 1) * limit;
        const pipeline = [
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [seekerLng, seekerLat] },
              distanceField: 'distanceMeters',
              spherical: true,
              maxDistance: 500000, // 500km max
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

        const [result] = await Equipment.aggregate(pipeline);
        const data = result.data || [];
        const total = result.total[0]?.count || 0;

        // Populate owner info after aggregation
        const populated = await Equipment.populate(data, {
          path: 'owner',
          select: 'name phone district rating isVerified'
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
    if (category) query.category = category;
    if (status) query.availabilityStatus = status;
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }
    const skip = (page - 1) * limit;
    const [equipment, total] = await Promise.all([
      Equipment.find(query)
        .populate('owner', 'name phone district rating isVerified')
        .sort({ 'rating.average': -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Equipment.countDocuments(query)
    ]);
    res.json({ success: true, count: equipment.length, total, pages: Math.ceil(total / limit), data: equipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/equipment/:id
router.get('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('owner', 'name phone district rating isVerified bio');
    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });
    await Equipment.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true, data: equipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/equipment - Create equipment listing (auto-geocode address)
router.post('/', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    req.body.owner = req.user.id;
    req.body.district = req.body.district || req.user.district;
    req.body.state = req.body.state || req.user.state;

    // Auto-geocode: address → coordinates
    const coords = await geocodeWithFallback(req.body.address, req.body.district);
    if (coords) {
      req.body.location = {
        type: 'Point',
        coordinates: [coords.lng, coords.lat]
      };
    }

    const equipment = await Equipment.create(req.body);
    res.status(201).json({ success: true, data: equipment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @PUT /api/equipment/:id
router.put('/:id', protect, async (req, res) => {
  try {
    let equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, message: 'Not found' });
    if (equipment.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Re-geocode if address changed
    if (req.body.address && req.body.address !== equipment.address) {
      const coords = await geocodeWithFallback(req.body.address, req.body.district || equipment.district);
      if (coords) {
        req.body.location = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      }
    }

    equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: equipment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @DELETE /api/equipment/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, message: 'Not found' });
    if (equipment.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Equipment.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Equipment removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/equipment/owner/listings
router.get('/owner/listings', protect, async (req, res) => {
  try {
    const equipment = await Equipment.find({ owner: req.user.id, isActive: true })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: equipment.length, data: equipment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Category summary
router.get('/meta/categories', async (req, res) => {
  try {
    const summary = await Equipment.aggregate([
      { $match: { isActive: true, availabilityStatus: 'available' } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$pricePerDay' } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
