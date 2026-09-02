const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const { protect } = require('../middleware/auth');

// @POST /api/bookings - Create booking (bundle or individual)
router.post('/', protect, async (req, res) => {
  try {
    const { equipmentId, specialistId, startDate, endDate, location, purpose, bookingType, specialRequirements } = req.body;

    let pricing = { equipmentCost: 0, specialistCost: 0, platformFee: 0, totalAmount: 0 };
    let equipmentOwner;
    let specialistOwner;

    // Calculate equipment cost
    if (equipmentId) {
      const equipment = await Equipment.findById(equipmentId);
      if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });
      if (equipment.availabilityStatus !== 'available') {
        return res.status(400).json({ success: false, message: 'Equipment not available' });
      }
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      pricing.equipmentCost = equipment.pricePerDay * days;
      equipmentOwner = equipment.owner;
    }

    // Calculate specialist cost + capture specialistOwner
    if (specialistId) {
      const specialist = await Specialist.findById(specialistId);
      if (!specialist) return res.status(404).json({ success: false, message: 'Specialist not found' });
      if (specialist.availabilityStatus !== 'available') {
        return res.status(400).json({ success: false, message: 'Specialist not available' });
      }
      const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
      pricing.specialistCost = specialist.pricePerDay * days;
      specialistOwner = specialist.user; // The User _id behind this specialist profile
    }

    pricing.platformFee = Math.round((pricing.equipmentCost + pricing.specialistCost) * 0.05);
    pricing.totalAmount = pricing.equipmentCost + pricing.specialistCost + pricing.platformFee;

    const booking = await Booking.create({
      seeker: req.user.id,
      bookingType,
      equipment: equipmentId || undefined,
      equipmentOwner,
      specialist: specialistId || undefined,
      specialistOwner,
      startDate,
      endDate,
      location,
      purpose,
      pricing,
      specialRequirements
    });

    // Mark equipment/specialist as booked
    if (equipmentId) {
      await Equipment.findByIdAndUpdate(equipmentId, {
        availabilityStatus: 'booked',
        $push: { bookedDates: { start: startDate, end: endDate, bookingId: booking._id } }
      });
    }
    if (specialistId) {
      await Specialist.findByIdAndUpdate(specialistId, {
        availabilityStatus: 'booked',
        $push: { bookedDates: { start: startDate, end: endDate, bookingId: booking._id } }
      });
    }

    const populated = await Booking.findById(booking._id)
      .populate('seeker', 'name phone')
      .populate('equipment', 'title category images')
      .populate({ path: 'specialist', populate: { path: 'user', select: 'name phone' } });

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
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
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/bookings/provider - Bookings where I am the provider (equipment owner OR specialist)
router.get('/provider', protect, async (req, res) => {
  try {
    // Find bookings where the current user is either the equipment owner OR the specialist owner
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
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/bookings/:id/status - Update booking status (accept/reject/complete)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, cancellationReason, completionNotes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    // Auth: seeker, equipment owner, specialist owner, or admin can update
    const isSeeker = booking.seeker.toString() === req.user.id;
    const isEquipmentOwner = booking.equipmentOwner && booking.equipmentOwner.toString() === req.user.id;
    const isSpecialistOwner = booking.specialistOwner && booking.specialistOwner.toString() === req.user.id;

    if (!isSeeker && !isEquipmentOwner && !isSpecialistOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    // Seekers can only cancel
    if (isSeeker && !isEquipmentOwner && !isSpecialistOwner && status !== 'cancelled') {
      return res.status(403).json({ success: false, message: 'Seekers can only cancel bookings' });
    }

    const updates = { status };
    if (cancellationReason) updates.cancellationReason = cancellationReason;
    if (completionNotes) updates.completionNotes = completionNotes;

    // If cancelled or completed, free up equipment/specialist
    if (status === 'cancelled' || status === 'completed') {
      if (booking.equipment) {
        await Equipment.findByIdAndUpdate(booking.equipment, { availabilityStatus: 'available' });
      }
      if (booking.specialist) {
        await Specialist.findByIdAndUpdate(booking.specialist, { availabilityStatus: 'available' });
      }
    }

    const updated = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('seeker', 'name phone district village')
      .populate('equipment', 'title category images')
      .populate({ path: 'specialist', populate: { path: 'user', select: 'name phone avatar' } })
      .populate('equipmentOwner', 'name phone')
      .populate('specialistOwner', 'name phone');

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
