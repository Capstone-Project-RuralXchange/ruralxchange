const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Specialist = require('../models/Specialist');
const Booking = require('../models/Booking');
const Requirement = require('../models/Requirement');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes in this router for admin only
router.use(protect);
router.use(authorize('admin'));

// @GET /api/admin/stats - System aggregate stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalSeekers,
      totalProviders,
      totalSpecialists,
      totalAdmins,
      activeUsers,
      verifiedUsers,
      totalEquipment,
      totalSpecialistProfiles,
      totalBookings,
      activeBookings,
      completedBookings,
      totalRequirements
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'seeker' }),
      User.countDocuments({ role: 'provider' }),
      User.countDocuments({ role: 'specialist' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isVerified: true }),
      Equipment.countDocuments(),
      Specialist.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['pending', 'confirmed', 'in_progress'] } }),
      Booking.countDocuments({ status: 'completed' }),
      Requirement.countDocuments()
    ]);

    // Calculate total platform booking revenue/volume
    const completedBookingsList = await Booking.find({ status: 'completed' }).select('pricing');
    const totalVolume = completedBookingsList.reduce((sum, b) => sum + (b.pricing?.totalAmount || b.pricing?.totalPrice || 0), 0);

    // District breakdown of users
    const districtStats = await User.aggregate([
      { $group: { _id: '$district', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          seekers: totalSeekers,
          providers: totalProviders,
          specialists: totalSpecialists,
          admins: totalAdmins,
          active: activeUsers,
          verified: verifiedUsers,
          inactive: totalUsers - activeUsers
        },
        listings: {
          equipment: totalEquipment,
          specialists: totalSpecialistProfiles,
          requirements: totalRequirements
        },
        bookings: {
          total: totalBookings,
          active: activeBookings,
          completed: completedBookings,
          totalVolume
        },
        districtStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/users - Get paginated & filterable list of users
router.get('/users', async (req, res) => {
  try {
    const {
      role,
      district,
      isActive,
      isVerified,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }
    if (district && district !== 'all') {
      query.district = district;
    }
    if (isActive !== undefined && isActive !== 'all') {
      query.isActive = isActive === 'true';
    }
    if (isVerified !== undefined && isVerified !== 'all') {
      query.isVerified = isVerified === 'true';
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { village: searchRegex },
        { district: searchRegex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/admin/users/:id - Get full user details with linked entities
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [equipment, specialist, seekerBookings, providerBookings, requirements] = await Promise.all([
      Equipment.find({ owner: user._id }),
      Specialist.findOne({ user: user._id }),
      Booking.find({ seeker: user._id }).sort({ createdAt: -1 }).limit(10).populate('equipment', 'title category'),
      Booking.find({ equipmentOwner: user._id }).sort({ createdAt: -1 }).limit(10).populate('seeker', 'name phone'),
      Requirement.find({ postedBy: user._id }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      data: {
        user,
        equipment,
        specialist,
        seekerBookings,
        providerBookings,
        requirements
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @POST /api/admin/users - Admin create user
router.post('/users', async (req, res) => {
  try {
    const { name, phone, email, password, role, district, state, village, preferredLanguage, isVerified, isActive, bio } = req.body;

    if (!name || !phone || !password || !district) {
      return res.status(400).json({ success: false, message: 'Please provide name, phone, password and district' });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }

    const user = await User.create({
      name,
      phone,
      email: email || undefined,
      password,
      role: role || 'seeker',
      district,
      state: state || 'Karnataka',
      village: village || '',
      preferredLanguage: preferredLanguage || 'en',
      isVerified: isVerified !== undefined ? isVerified : true,
      isActive: isActive !== undefined ? isActive : true,
      bio: bio || ''
    });

    const sanitized = await User.findById(user._id).select('-password');
    res.status(201).json({ success: true, data: sanitized, message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PUT /api/admin/users/:id - Admin update user profile & RBAC attributes
router.put('/users/:id', async (req, res) => {
  try {
    const { name, phone, email, role, district, state, village, preferredLanguage, isVerified, isActive, bio } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Guard: Prevent logged-in admin from demoting or disabling themselves
    if (req.user.id === user.id) {
      if (role && role !== 'admin') {
        return res.status(400).json({ success: false, message: 'You cannot change your own admin role' });
      }
      if (isActive === false) {
        return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account' });
      }
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'Phone number already in use by another account' });
      }
      user.phone = phone;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already in use by another account' });
      }
      user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (district !== undefined) user.district = district;
    if (state !== undefined) user.state = state;
    if (village !== undefined) user.village = village;
    if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isActive !== undefined) user.isActive = isActive;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const updated = await User.findById(user._id).select('-password');
    res.json({ success: true, data: updated, message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PATCH /api/admin/users/:id/status - Toggle active/verified status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { isActive, isVerified } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.id === user.id && isActive === false) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate yourself' });
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();
    const updated = await User.findById(user._id).select('-password');
    res.json({ success: true, data: updated, message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @PATCH /api/admin/users/:id/role - Update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['seeker', 'provider', 'specialist', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.id === user.id && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot remove your own admin role' });
    }

    user.role = role;
    await user.save();

    const updated = await User.findById(user._id).select('-password');
    res.json({ success: true, data: updated, message: `Role changed to ${role}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.user.id === user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
