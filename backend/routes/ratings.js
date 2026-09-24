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
    const { bookingId, ratingType, targetId, score, review, comment } = req.body;

    if (!bookingId || !ratingType || !targetId || !score) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    
    if (booking.seeker.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this booking' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only rate completed bookings' });
    }

    // Check for duplicate rating
    const existing = await Rating.findOne({ booking: bookingId, ratedBy: req.user.id, ratingType });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already submitted a rating for this booking' });
    }

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
      comment: comment || review
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

    if (ratingType === 'equipment') {
      const eq = await Equipment.findById(targetId).select('rating');
      if (eq) {
        const count = (eq.rating.count || 0) + 1;
        const currentAvg = eq.rating.average || 0;
        const newAvg = currentAvg + (score - currentAvg) / count;
        await Equipment.findByIdAndUpdate(targetId, {
          'rating.average': Number(newAvg.toFixed(1)),
          'rating.count': count
        });
      }
    } else if (ratingType === 'specialist') {
      const sp = await Specialist.findById(targetId).select('rating');
      if (sp) {
        const count = (sp.rating.count || 0) + 1;
        const currentAvg = sp.rating.average || 0;
        const newAvg = currentAvg + (score - currentAvg) / count;
        await Specialist.findByIdAndUpdate(targetId, {
          'rating.average': Number(newAvg.toFixed(1)),
          'rating.count': count
        });
      }
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
