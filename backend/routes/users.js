const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const { protect } = require('../middleware/auth');

// @GET /api/users/dashboard - Get user dashboard stats
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const [seekerBookings, providerBookings, equipment, specialistProfile] = await Promise.all([
      Booking.find({ seeker: userId }).sort({ createdAt: -1 }).limit(5)
        .populate('equipment', 'title category'),
      Booking.find({ equipmentOwner: userId }).sort({ createdAt: -1 }).limit(5)
        .populate('seeker', 'name phone'),
      Equipment.find({ owner: userId, isActive: true }),
      Specialist.findOne({ user: userId })
    ]);

    // Calculate earnings from completed bookings
    const completedProviderBookings = await Booking.find({ equipmentOwner: userId, status: 'completed' });
    const equipmentEarnings = completedProviderBookings.reduce((sum, b) => sum + (b.pricing?.equipmentCost || 0), 0);

    let specialistEarnings = 0;
    if (specialistProfile) {
      const specialistBookings = await Booking.find({
        $or: [{ specialist: specialistProfile._id }, { specialistOwner: userId }],
        status: 'completed'
      });
      specialistEarnings = specialistBookings.reduce((sum, b) => sum + (b.pricing?.specialistCost || 0), 0);
    }

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalBookingsMade: await Booking.countDocuments({ seeker: userId }),
          pendingBookings: await Booking.countDocuments({ seeker: userId, status: 'pending' }),
          completedBookings: await Booking.countDocuments({ seeker: userId, status: 'completed' }),
          totalEquipmentListings: equipment.length,
          totalEarnings: equipmentEarnings + specialistEarnings
        },
        recentBookings: seekerBookings,
        recentOrders: providerBookings,
        equipment,
        specialistProfile
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/users/:id - Public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name district state village role avatar bio rating isVerified createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
