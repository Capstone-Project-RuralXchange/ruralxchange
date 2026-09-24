const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const { protect } = require('../middleware/auth');

// Helper to check and process expired pending bookings
async function checkAndExpirePendingBookings(userId = null) {
  try {
    const query = {
      status: 'pending',
      acceptanceDeadline: { $lte: new Date() }
    };
    if (userId) {
      query.$or = [{ seeker: userId }, { equipmentOwner: userId }, { specialistOwner: userId }];
    }

    const expiredBookings = await Booking.find(query);
    for (const b of expiredBookings) {
      if (b.autoCancelOnExpiry !== false) {
        // Auto-cancel and release locks
        b.status = 'cancelled';
        b.cancellationReason = `Provider acceptance timeout (auto-cancelled after ${b.acceptanceWindowHours || 6}h)`;
        await b.save();

        if (b.equipment) {
          await Equipment.findByIdAndUpdate(b.equipment, {
            availabilityStatus: 'available',
            $pull: { bookedDates: { bookingId: b._id } }
          });
        }
        if (b.specialist) {
          await Specialist.findByIdAndUpdate(b.specialist, {
            availabilityStatus: 'available',
            $pull: { bookedDates: { bookingId: b._id } }
          });
        }
      }
    }
  } catch (err) {
    console.error('Error processing expired bookings:', err.message);
  }
}

// Helper: derive the overall booking status from sub-statuses (for bundle bookings)
// Rules:
//  - If either side is cancelled and neither side is completed → overall cancelled
//  - If both sides are completed → overall completed
//  - If one side is completed and the other is cancelled → keep completed (irreversible)
//  - If both sides are confirmed → overall confirmed
//  - Otherwise → pending (still waiting for at least one side)
function deriveOverallStatus(equipmentOwnerStatus, specialistStatus) {
  const statuses = [equipmentOwnerStatus, specialistStatus].filter(Boolean);
  if (statuses.length === 0) return 'pending';

  if (statuses.every(s => s === 'completed')) return 'completed';
  if (statuses.some(s => s === 'completed')) {
    // One side done — if the other cancelled, we still honour the completed work
    // Overall status reflects the dominant completion
    return 'completed';
  }
  if (statuses.every(s => s === 'cancelled')) return 'cancelled';
  if (statuses.some(s => s === 'cancelled')) return 'cancelled'; // one side declined
  if (statuses.every(s => s === 'confirmed')) return 'confirmed';
  return 'pending';
}

// @POST /api/bookings - Create booking (bundle or individual)
router.post('/', protect, async (req, res) => {
  try {
    const {
      equipmentId, specialistId, startDate, endDate, location, purpose,
      bookingType, specialRequirements, acceptanceWindowHours = 6, autoCancelOnExpiry = true
    } = req.body;

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
      if (new Date(endDate) < new Date(startDate)) return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
      const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1);
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
      if (new Date(endDate) < new Date(startDate)) return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
      const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1);
      pricing.specialistCost = specialist.pricePerDay * days;
      specialistOwner = specialist.user;
    }

    pricing.platformFee = Math.round((pricing.equipmentCost + pricing.specialistCost) * 0.05);
    pricing.totalAmount = pricing.equipmentCost + pricing.specialistCost + pricing.platformFee;

    // Atomically lock equipment
    if (equipmentId) {
      const lockedEq = await Equipment.findOneAndUpdate(
        { _id: equipmentId, availabilityStatus: 'available' },
        { availabilityStatus: 'booked', $push: { bookedDates: { start: startDate, end: endDate } } },
        { new: true }
      );
      if (!lockedEq) {
        return res.status(409).json({ success: false, message: 'Conflict: Equipment was just booked by someone else.' });
      }
    }

    // Atomically lock specialist
    if (specialistId) {
      const lockedSp = await Specialist.findOneAndUpdate(
        { _id: specialistId, availabilityStatus: 'available' },
        { availabilityStatus: 'booked', $push: { bookedDates: { start: startDate, end: endDate } } },
        { new: true }
      );
      if (!lockedSp) {
        if (equipmentId) await Equipment.findByIdAndUpdate(equipmentId, { availabilityStatus: 'available' });
        return res.status(409).json({ success: false, message: 'Conflict: Specialist was just booked by someone else.' });
      }
    }

    const normalizedBookingType = (bookingType || 'equipment_only').trim().toLowerCase().replace(/[\s-]+/g, '_');
    const winHours = Math.max(1, Math.min(168, Number(acceptanceWindowHours) || 6));
    const deadline = new Date(Date.now() + winHours * 60 * 60 * 1000);

    const booking = await Booking.create({
      seeker: req.user.id,
      bookingType: normalizedBookingType,
      equipment: equipmentId || undefined,
      equipmentOwner,
      specialist: specialistId || undefined,
      specialistOwner,
      startDate,
      endDate,
      location,
      purpose,
      pricing,
      specialRequirements,
      acceptanceWindowHours: winHours,
      acceptanceDeadline: deadline,
      autoCancelOnExpiry: autoCancelOnExpiry !== false,
      // Initialize sub-statuses based on booking type
      equipmentOwnerStatus: equipmentId ? 'pending' : undefined,
      specialistStatus: specialistId ? 'pending' : undefined,
    });

    if (equipmentId) {
      await Equipment.updateOne(
        { _id: equipmentId, 'bookedDates.start': startDate },
        { $set: { 'bookedDates.$.bookingId': booking._id } }
      );
    }
    if (specialistId) {
      await Specialist.updateOne(
        { _id: specialistId, 'bookedDates.start': startDate },
        { $set: { 'bookedDates.$.bookingId': booking._id } }
      );
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
    await checkAndExpirePendingBookings(req.user.id);

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
    await checkAndExpirePendingBookings(req.user.id);

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

// @PUT /api/bookings/:id/status - Update booking status (accept/reject/complete/cancel)
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, cancellationReason, completionNotes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const isSeeker = booking.seeker.toString() === req.user.id;
    const isEquipmentOwner = booking.equipmentOwner && booking.equipmentOwner.toString() === req.user.id;
    const isSpecialistOwner = booking.specialistOwner && booking.specialistOwner.toString() === req.user.id;
    const isBundle = booking.bookingType === 'bundle';

    if (!isSeeker && !isEquipmentOwner && !isSpecialistOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    // Seekers can only cancel, and only if no provider has already completed their portion
    if (isSeeker && !isEquipmentOwner && !isSpecialistOwner) {
      if (status !== 'cancelled') {
        return res.status(403).json({ success: false, message: 'Seekers can only cancel bookings' });
      }

      // Block cancellation if any provider side has already completed their work
      if (isBundle) {
        if (booking.equipmentOwnerStatus === 'completed' || booking.specialistStatus === 'completed') {
          return res.status(400).json({
            success: false,
            message: 'Cannot cancel: one or more providers have already completed their service'
          });
        }
      } else {
        // Non-bundle: block if booking is already completed
        if (booking.status === 'completed') {
          return res.status(400).json({
            success: false,
            message: 'Cannot cancel a booking that has already been completed'
          });
        }
      }
    }

    // --- Bundle booking: per-participant status update ---
    if (isBundle) {
      const updates = {};

      if (isEquipmentOwner && !isSeeker) {
        // Equipment owner can confirm or cancel their side (only if not already completed)
        if (booking.equipmentOwnerStatus === 'completed') {
          return res.status(400).json({
            success: false,
            message: 'Your side of this booking has already been marked as completed'
          });
        }
        if (status === 'confirmed') {
          updates.equipmentOwnerStatus = 'confirmed';
        } else if (status === 'completed') {
          // Can only complete after confirming
          if (booking.equipmentOwnerStatus !== 'confirmed') {
            return res.status(400).json({ success: false, message: 'Please accept the booking before marking it as completed' });
          }
          updates.equipmentOwnerStatus = 'completed';
          // Release equipment lock when equipment side is completed
          if (booking.equipment) {
            await Equipment.findByIdAndUpdate(booking.equipment, {
              availabilityStatus: 'available',
              $pull: { bookedDates: { bookingId: booking._id } }
            });
          }
        } else if (status === 'cancelled') {
          updates.equipmentOwnerStatus = 'cancelled';
          // Release equipment lock when equipment owner declines
          if (booking.equipment) {
            await Equipment.findByIdAndUpdate(booking.equipment, {
              availabilityStatus: 'available',
              $pull: { bookedDates: { bookingId: booking._id } }
            });
          }
        }
      }

      if (isSpecialistOwner && !isSeeker) {
        // Specialist owner can confirm or cancel their side (only if not already completed)
        if (booking.specialistStatus === 'completed') {
          return res.status(400).json({
            success: false,
            message: 'Your side of this booking has already been marked as completed'
          });
        }
        if (status === 'confirmed') {
          updates.specialistStatus = 'confirmed';
        } else if (status === 'completed') {
          if (booking.specialistStatus !== 'confirmed') {
            return res.status(400).json({ success: false, message: 'Please accept the booking before marking it as completed' });
          }
          updates.specialistStatus = 'completed';
          // Release specialist lock when specialist side is completed
          if (booking.specialist) {
            await Specialist.findByIdAndUpdate(booking.specialist, {
              availabilityStatus: 'available',
              $pull: { bookedDates: { bookingId: booking._id } }
            });
          }
        } else if (status === 'cancelled') {
          updates.specialistStatus = 'cancelled';
          // Release specialist lock when specialist declines
          if (booking.specialist) {
            await Specialist.findByIdAndUpdate(booking.specialist, {
              availabilityStatus: 'available',
              $pull: { bookedDates: { bookingId: booking._id } }
            });
          }
        }
      }

      // Seeker cancellation in bundle (already guarded above — neither side completed)
      if (isSeeker && status === 'cancelled') {
        updates.equipmentOwnerStatus = 'cancelled';
        updates.specialistStatus = 'cancelled';
        updates.cancellationReason = cancellationReason || 'Cancelled by seeker';
        // Release both locks
        if (booking.equipment) {
          await Equipment.findByIdAndUpdate(booking.equipment, {
            availabilityStatus: 'available',
            $pull: { bookedDates: { bookingId: booking._id } }
          });
        }
        if (booking.specialist) {
          await Specialist.findByIdAndUpdate(booking.specialist, {
            availabilityStatus: 'available',
            $pull: { bookedDates: { bookingId: booking._id } }
          });
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'No valid status update provided' });
      }

      if (cancellationReason) updates.cancellationReason = cancellationReason;
      if (completionNotes) updates.completionNotes = completionNotes;

      // Derive overall status from the (potentially updated) sub-statuses
      const newEqStatus = updates.equipmentOwnerStatus ?? booking.equipmentOwnerStatus;
      const newSpStatus = updates.specialistStatus ?? booking.specialistStatus;
      updates.status = deriveOverallStatus(newEqStatus, newSpStatus);

      if (updates.status === 'cancelled') {
        if (booking.equipment) {
          await Equipment.findByIdAndUpdate(booking.equipment, {
            availabilityStatus: 'available',
            $pull: { bookedDates: { bookingId: booking._id } }
          });
        }
        if (booking.specialist) {
          await Specialist.findByIdAndUpdate(booking.specialist, {
            availabilityStatus: 'available',
            $pull: { bookedDates: { bookingId: booking._id } }
          });
        }
      }

      const updated = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true })
        .populate('seeker', 'name phone district village')
        .populate('equipment', 'title category images')
        .populate({ path: 'specialist', populate: { path: 'user', select: 'name phone avatar' } })
        .populate('equipmentOwner', 'name phone')
        .populate('specialistOwner', 'name phone');

      return res.json({ success: true, data: updated });
    }

    // --- Non-bundle booking: simple status update ---

    // Providers cannot move backward from completed
    if ((isEquipmentOwner || isSpecialistOwner) && booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This booking has already been completed and cannot be changed'
      });
    }

    // Providers must accept (confirm) before marking complete
    if ((isEquipmentOwner || isSpecialistOwner) && status === 'completed' && booking.status !== 'confirmed' && booking.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Please accept the booking before marking it as completed'
      });
    }

    const updates = { status };
    if (cancellationReason) updates.cancellationReason = cancellationReason;
    if (completionNotes) updates.completionNotes = completionNotes;

    // Release locks only for cancellation or completion (not for other transitions)
    if (status === 'cancelled' || status === 'completed') {
      if (booking.equipment) {
        await Equipment.findByIdAndUpdate(booking.equipment, {
          availabilityStatus: 'available',
          $pull: { bookedDates: { bookingId: booking._id } }
        });
      }
      if (booking.specialist) {
        await Specialist.findByIdAndUpdate(booking.specialist, {
          availabilityStatus: 'available',
          $pull: { bookedDates: { bookingId: booking._id } }
        });
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
    
    const isSeeker = booking.seeker?._id.toString() === req.user.id;
    const isEqOwner = booking.equipmentOwner?._id.toString() === req.user.id;
    const isSpOwner = booking.specialistOwner?._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isSeeker && !isEqOwner && !isSpOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }
    
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.checkAndExpirePendingBookings = checkAndExpirePendingBookings;
