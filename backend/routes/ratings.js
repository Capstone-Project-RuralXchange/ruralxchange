const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
router.param('id', require('../middleware/requestValidation').identifier);
router.use(require('../middleware/requestValidation').query);
const Rating = require('../models/Rating');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// @POST /api/ratings
router.post('/', protect, async (req, res) => {
  try {
    const { bookingId, targetId, score, review, comment } = req.body;
    const ratingType = typeof req.body.ratingType === 'string' ? req.body.ratingType.trim().toLowerCase() : req.body.ratingType;

    if (!bookingId || !ratingType || !targetId || score === undefined || score === null || score === '') {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (!['equipment', 'specialist'].includes(ratingType) || !mongoose.isValidObjectId(bookingId) || !mongoose.isValidObjectId(targetId)) {
      return res.status(400).json({ success: false, message: 'Please check required fields and valid values' });
    }
    const numericScore = Number(score);
    if (!Number.isInteger(numericScore) || numericScore < 1 || numericScore > 5) {
      return res.status(400).json({ success: false, message: 'Score must be a whole number from 1 to 5' });
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

    // The target must be the exact resource this booking was for.
    const bookedTarget = ratingType === 'equipment' ? booking.equipment : booking.specialist;
    if (!bookedTarget || bookedTarget.toString() !== String(targetId)) {
      return res.status(403).json({ success: false, message: 'This booking does not include the item you are trying to rate' });
    }

    // Uniqueness is enforced by a unique index; a concurrent duplicate fails with 11000.
    let rating;
    try {
      rating = await Rating.create({
        booking: bookingId,
        ratedBy: req.user.id,
        ratingType,
        targetEquipment: ratingType === 'equipment' ? targetId : undefined,
        equipment: ratingType === 'equipment' ? targetId : undefined,
        targetSpecialist: ratingType === 'specialist' ? targetId : undefined,
        specialist: ratingType === 'specialist' ? targetId : undefined,
        score: numericScore,
        review: review || comment,
        comment: comment || review
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ success: false, message: 'You have already submitted a rating for this booking' });
      }
      throw err;
    }

    const flag = ratingType === 'equipment' ? 'ratings.equipmentRating' : 'ratings.specialistRating';
    await Booking.findByIdAndUpdate(bookingId, { [`${flag}.submitted`]: true, [`${flag}.ratingId`]: rating._id });

    // Atomic running-average update (single pipeline update, no read-modify-write race).
    const Target = ratingType === 'equipment' ? Equipment : Specialist;
    await Target.updateOne({ _id: targetId }, [
      { $set: { _newCount: { $add: [{ $ifNull: ['$rating.count', 0] }, 1] } } },
      { $set: {
        'rating.average': { $add: [{ $ifNull: ['$rating.average', 0] }, { $divide: [{ $subtract: [numericScore, { $ifNull: ['$rating.average', 0] }] }, '$_newCount'] }] },
        'rating.count': '$_newCount'
      } },
      { $unset: '_newCount' }
    ]);

    res.status(201).json({ success: true, data: rating });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.code === 11000 ? 'This record already exists' : 'Please check required fields and valid values' });
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
    res.status(500).json({ success: false, message: 'Could not complete request. Please try again.' });
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
    res.status(500).json({ success: false, message: 'Could not complete request. Please try again.' });
  }
});

module.exports = router;
