const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @POST /api/ratings
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, ratingType, targetId, score, review, comment, ...rest } = req.body;

    const rating = await Rating.create({
      booking: bookingId,
      ratedBy: req.user.id,
      ratingType,
      targetEquipment: ratingType === 'equipment' ? targetId : undefined,
      equipment: ratingType === 'equipment' ? targetId : undefined,
      targetSpecialist: ratingType === 'specialist' ? targetId : undefined,
      specialist: ratingType === 'specialist' ? targetId : undefined,
      score: Number(score),
      review: review || comment,
      comment: comment || review,
      ...rest
    });

    // Update rating flags on Booking document if bookingId provided
    if (bookingId) {
      if (ratingType === 'equipment') {
        await Booking.findByIdAndUpdate(bookingId, {
          'ratings.equipmentRating.submitted': true,
          'ratings.equipmentRating.ratingId': rating._id
        });
      } else if (ratingType === 'specialist') {
        await Booking.findByIdAndUpdate(bookingId, {
          'ratings.specialistRating.submitted': true,
          'ratings.specialistRating.ratingId': rating._id
        });
      }
    }

    // Update aggregated rating on target
    if (ratingType === 'equipment') {
      const ratings = await Rating.find({
        $or: [{ targetEquipment: targetId }, { equipment: targetId }],
        ratingType: 'equipment'
      });
      const avg = ratings.reduce((a, b) => a + b.score, 0) / (ratings.length || 1);
      await Equipment.findByIdAndUpdate(targetId, {
        'rating.average': Number(avg.toFixed(1)),
        'rating.count': ratings.length
      });
    } else if (ratingType === 'specialist') {
      const ratings = await Rating.find({
        $or: [{ targetSpecialist: targetId }, { specialist: targetId }],
        ratingType: 'specialist'
      });
      const avg = ratings.reduce((a, b) => a + b.score, 0) / (ratings.length || 1);
      await Specialist.findByIdAndUpdate(targetId, {
        'rating.average': Number(avg.toFixed(1)),
        'rating.count': ratings.length
      });
    }

    res.status(201).json({ success: true, data: rating });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// @GET /api/ratings/equipment/:id
router.get('/equipment/:id', async (req, res) => {
  try {
    const ratings = await Rating.find({
      $or: [{ targetEquipment: req.params.id }, { equipment: req.params.id }],
      ratingType: 'equipment'
    })
      .populate('ratedBy', 'name district avatar')
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
    const ratings = await Rating.find({
      $or: [{ targetSpecialist: req.params.id }, { specialist: req.params.id }],
      ratingType: 'specialist'
    })
      .populate('ratedBy', 'name district avatar')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, count: ratings.length, data: ratings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
