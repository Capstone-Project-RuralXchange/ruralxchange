const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const { protect } = require('../middleware/auth');

// @POST /api/ratings
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, ratingType, targetId, score, review, ...rest } = req.body;

    const rating = await Rating.create({
      booking: bookingId,
      ratedBy: req.user.id,
      ratingType,
      targetEquipment: ratingType === 'equipment' ? targetId : undefined,
      targetSpecialist: ratingType === 'specialist' ? targetId : undefined,
      score,
      review,
      ...rest
    });

    // Update aggregated rating on target
    if (ratingType === 'equipment') {
      const ratings = await Rating.find({ targetEquipment: targetId });
      const avg = ratings.reduce((a, b) => a + b.score, 0) / ratings.length;
      await Equipment.findByIdAndUpdate(targetId, { 'rating.average': avg.toFixed(1), 'rating.count': ratings.length });
    } else if (ratingType === 'specialist') {
      const ratings = await Rating.find({ targetSpecialist: targetId });
      const avg = ratings.reduce((a, b) => a + b.score, 0) / ratings.length;
      await Specialist.findByIdAndUpdate(targetId, { 'rating.average': avg.toFixed(1), 'rating.count': ratings.length });
    }

    res.status(201).json({ success: true, data: rating });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @GET /api/ratings/equipment/:id
router.get('/equipment/:id', async (req, res) => {
  try {
    const ratings = await Rating.find({ targetEquipment: req.params.id, ratingType: 'equipment' })
      .populate('ratedBy', 'name district')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, count: ratings.length, data: ratings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/ratings/specialist/:id
router.get('/specialist/:id', async (req, res) => {
  try {
    const ratings = await Rating.find({ targetSpecialist: req.params.id, ratingType: 'specialist' })
      .populate('ratedBy', 'name district')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, count: ratings.length, data: ratings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
