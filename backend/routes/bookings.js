const express = require('express');
const router = express.Router();
router.param('id', require('../middleware/requestValidation').identifier);
router.use(require('../middleware/requestValidation').query);
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const { protect } = require('../middleware/auth');

const { createBooking, updateStatus, expirePending } = require('../services/bookings');
router.post('/', protect, async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await createBooking(req.user, req.body) }); }
  catch (err) { next(err); }
});
router.use(protect, async (req, res, next) => {
  try { await expirePending(); next(); } catch (err) { next(err); }
});

// @GET /api/bookings/my - Get my bookings (as seeker)
router.get('/my', protect, async (req, res) => {
  try {


    const { status } = req.query;
    const query = { seeker: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('equipment', 'title category images pricePerDay')
      .populate({ path: 'specialist', populate: { path: 'user', select: 'name phone avatar' } })
      .populate('equipmentOwner', 'name phone')
      .populate('specialistOwner', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not complete request. Please try again.' });
  }
});

// @GET /api/bookings/provider - Bookings where I am the provider (equipment owner OR specialist)
router.get('/provider', protect, async (req, res) => {
  try {


    const bookings = await Booking.find({
      $or: [
        { equipmentOwner: req.user.id },
        { specialistOwner: req.user.id }
      ]
    })
      .populate('seeker', 'name phone district village')
      .populate('equipment', 'title category images')
      .populate({ path: 'specialist', populate: { path: 'user', select: 'name phone avatar' } })
      .populate('equipmentOwner', 'name phone')
      .populate('specialistOwner', 'name phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not complete request. Please try again.' });
  }
});

router.put('/:id/status', protect, async (req, res, next) => {
  try { const result = await updateStatus(req.user, req.params.id, req.body);
    const data = await Booking.findById(result._id).populate('seeker', 'name phone district village').populate('equipment', 'title category images').populate('equipmentOwner', 'name phone').populate('specialistOwner', 'name phone').populate({ path: 'specialist', populate: { path: 'user', select: 'name phone avatar' } });
    res.json({ success: true, data }); }
  catch (err) { next(err); }
});

// @PUT /api/bookings/:id/dismiss-alert - Dismiss expiry popup
router.put('/:id/dismiss-alert', protect, async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, seeker: req.user.id },
      { notifiedSeekerOfExpiry: true },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(400).json({ success: false, message: err.code === 11000 ? 'This record already exists' : 'Please check required fields and valid values' });
  }
});

// @GET /api/bookings/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('seeker', 'name phone district village')
      .populate('equipment')
      .populate('equipmentOwner', 'name phone')
      .populate('specialistOwner', 'name phone')
      .populate({ path: 'specialist', populate: { path: 'user', select: 'name phone avatar' } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    const isSeeker = booking.seeker?._id.toString() === req.user.id;
    const isEqOwner = booking.equipmentOwner?._id.toString() === req.user.id;
    const isSpOwner = booking.specialistOwner?._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isSeeker && !isEqOwner && !isSpOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }
    
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not complete request. Please try again.' });
  }
});

module.exports = router;
module.exports.checkAndExpirePendingBookings = expirePending;
