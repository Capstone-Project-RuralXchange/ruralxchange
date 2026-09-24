const express = require('express');
const router = express.Router();
const Equipment = require('../models/Equipment');
const { protect, authorize } = require('../middleware/auth');
const { geocodeWithFallback } = require('../utils/geocode');
const { getRoadDistance, enrichItemsWithRoadDistance } = require('../utils/routing');

const MULTILINGUAL_SYNONYMS = {
  // Kannada
  'ಟ್ರಾಕ್ಟರ್': ['tractor'],
  'ಟ್ರಾಕ್ಟರು': ['tractor'],
  'ಕೊಯ್ಲು': ['harvester'],
  'ಹಾರ್ವೆಸ್ಟರ್': ['harvester'],
  'ಡ್ರೋನ್': ['drone'],
  'ರೋಟಾವೇಟರ್': ['rotavator'],
  'ನೇಗಿಲು': ['cultivator'],
  'ಕಲ್ಟಿವೇಟರ್': ['cultivator'],
  'ಬೀಜ': ['seed_drill', 'seed'],
  'ಬಿತ್ತನೆ': ['seed_drill'],
  'ಬೇಲರ್': ['baler'],
  'ಹುಲ್ಲು': ['baler'],
  'ಮೇವು': ['chaff_cutter'],
  'ಕಳೆ': ['power_weeder', 'weeder'],
  'ಸ್ಪ್ರೇಯರ್': ['sprayer'],
  'ಪಂಪ್': ['water_pump', 'pump'],
  'ನೀರು': ['water_pump'],
  'ಥ್ರೆಷರ್': ['thresher'],
  'ಒಕ್ಕುವ': ['thresher'],
  'ಟಿಲ್ಲರ್': ['tiller'],
  'ಜನರೇಟರ್': ['generator'],
  'ಮಿಕ್ಸರ್': ['concrete_mixer'],
  'ವೆಲ್ಡಿಂಗ್': ['welding_machine'],
  'ಡ್ರಿಲ್': ['drill'],
  'ಟೆಂಟ್': ['tent_structure'],

  // Hindi
  'ट्रैक्टर': ['tractor'],
  'हार्वेस्टर': ['harvester'],
  'ड्रोन': ['drone'],
  'रोटावेटर': ['rotavator'],
  'कल्टीवेटर': ['cultivator'],
  'हल': ['cultivator'],
  'पंप': ['water_pump', 'pump'],
  'स्प्रेयर': ['sprayer'],
  'थ्रेशर': ['thresher'],
  'टिलर': ['tiller'],
  'जनरेटर': ['generator'],
  'ड्रिल': ['drill'],
};

// @GET /api/equipment - Get all equipment with filters + accurate road distance sorting
router.get('/', async (req, res) => {
  try {
    const { district, category, status, minPrice, maxPrice, search, q, lat, lng, page = 1, limit = 12 } = req.query;
    const searchTerm = (search || q || '').trim();

    let searchCondition = null;
    if (searchTerm) {
      const searchTerms = [searchTerm];
      // Expand multilingual terms (Kannada / Hindi -> English categories)
      for (const [key, mappedList] of Object.entries(MULTILINGUAL_SYNONYMS)) {
        if (searchTerm.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(searchTerm.toLowerCase())) {
          searchTerms.push(...mappedList);
        }
      }
      const uniqueTerms = Array.from(new Set(searchTerms));

      searchCondition = {
        $or: uniqueTerms.flatMap(term => [
          { title: { $regex: term, $options: 'i' } },
          { category: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
          { brand: { $regex: term, $options: 'i' } },
          { model: { $regex: term, $options: 'i' } }
        ])
      };
    }

    // If seeker provides coordinates, calculate accurate road distances
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
        if (searchCondition) {
          matchStage.$or = searchCondition.$or;
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

        // Enrich with real OSRM road distance & driving duration
        const enriched = await enrichItemsWithRoadDistance({ lat: seekerLat, lng: seekerLng }, populated);

        // Sort primarily by road distance if available
        enriched.sort((a, b) => {
          const distA = a.roadDistanceKm != null ? a.roadDistanceKm : (a.distanceKm || Infinity);
          const distB = b.roadDistanceKm != null ? b.roadDistanceKm : (b.distanceKm || Infinity);
          return distA - distB;
        });

        return res.json({
          success: true,
          count: enriched.length,
          total,
          pages: Math.ceil(total / limit),
          data: enriched
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
    if (searchCondition) {
      query.$or = searchCondition.$or;
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

// @GET /api/equipment/:id/route - Calculate accurate road route & travel time to equipment
router.get('/:id/route', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Current lat and lng query coordinates required' });
    }

    const seekerLat = parseFloat(lat);
    const seekerLng = parseFloat(lng);
    if (isNaN(seekerLat) || isNaN(seekerLng)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, message: 'Equipment not found' });

    const coords = equipment.location?.coordinates;
    if (!coords || coords.length < 2 || (coords[0] === 0 && coords[1] === 0)) {
      return res.status(400).json({ success: false, message: 'Equipment has no valid coordinates registered' });
    }

    const eqLng = coords[0];
    const eqLat = coords[1];

    const routeInfo = await getRoadDistance(seekerLat, seekerLng, eqLat, eqLng);

    res.json({
      success: true,
      data: {
        origin: { lat: seekerLat, lng: seekerLng },
        destination: { lat: eqLat, lng: eqLng, district: equipment.district, village: equipment.village },
        roadDistanceKm: routeInfo.distanceKm,
        drivingTimeMinutes: routeInfo.durationMinutes,
        drivingTimeText: routeInfo.durationText,
        isRoadDistance: routeInfo.isRoadDistance,
        isFallback: routeInfo.isFallback,
        googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${seekerLat},${seekerLng}&destination=${eqLat},${eqLng}`
      }
    });
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

// Helper to extract coordinates from request
function extractCoordinates(body) {
  if (Array.isArray(body.coordinates) && body.coordinates.length === 2) {
    const [c0, c1] = body.coordinates.map(Number);
    if (!isNaN(c0) && !isNaN(c1) && (c0 !== 0 || c1 !== 0)) {
      // If coordinates is [lng, lat] (standard GeoJSON) or [lat, lng]
      // India latitude is ~8-37 N, longitude is ~68-97 E
      if (c0 >= 60 && c0 <= 100 && c1 >= 5 && c1 <= 40) {
        return { lng: c0, lat: c1 };
      } else if (c1 >= 60 && c1 <= 100 && c0 >= 5 && c0 <= 40) {
        return { lng: c1, lat: c0 };
      }
      return { lng: c0, lat: c1 };
    }
  }
  if (body.latitude != null && body.longitude != null) {
    const lat = parseFloat(body.latitude);
    const lng = parseFloat(body.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lng, lat };
    }
  }
  if (body.location?.coordinates && Array.isArray(body.location.coordinates)) {
    const [lng, lat] = body.location.coordinates.map(Number);
    if (!isNaN(lng) && !isNaN(lat) && (lng !== 0 || lat !== 0)) {
      return { lng, lat };
    }
  }
  return null;
}

// Helper to sanitize equipment payload (normalizes enums, formats specifications)
function sanitizeEquipmentPayload(body) {
  if (body.category && typeof body.category === 'string') {
    body.category = body.category.trim().toLowerCase().replace(/[\s-]+/g, '_');
  }
  if (body.condition && typeof body.condition === 'string') {
    body.condition = body.condition.trim().toLowerCase();
  }
  if (body.availabilityStatus && typeof body.availabilityStatus === 'string') {
    body.availabilityStatus = body.availabilityStatus.trim().toLowerCase();
  }
  
  // Map specifications from root or nested
  if (!body.specifications) body.specifications = {};
  if (body.brand) body.specifications.brand = body.brand;
  if (body.model) body.specifications.model = body.model;
  if (body.yearOfManufacture) body.specifications.year = Number(body.yearOfManufacture);
  if (body.year) body.specifications.year = Number(body.year);
  if (body.horsePower) body.specifications.horsePower = Number(body.horsePower);
  if (body.fuelType && typeof body.fuelType === 'string') {
    const ft = body.fuelType.trim().toLowerCase();
    if (['diesel', 'petrol', 'electric', 'manual'].includes(ft)) {
      body.specifications.fuelType = ft;
    }
  }
  return body;
}

// @POST /api/equipment - Create equipment listing (live GPS or auto-geocode address)
router.post('/', protect, authorize('provider', 'admin'), async (req, res) => {
  try {
    req.body.owner = req.user.id;
    req.body.district = req.body.district || req.user.district;
    req.body.state = req.body.state || req.user.state;
    sanitizeEquipmentPayload(req.body);

    // 1. Direct GPS coordinates provided (e.g. from live GPS button)
    const directCoords = extractCoordinates(req.body);
    if (directCoords) {
      req.body.location = {
        type: 'Point',
        coordinates: [directCoords.lng, directCoords.lat]
      };
    } else {
      // 2. Fallback: Auto-geocode address → coordinates
      const coords = await geocodeWithFallback(req.body.address, req.body.district);
      if (coords) {
        req.body.location = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      }
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

    sanitizeEquipmentPayload(req.body);

    // Direct GPS coordinates provided
    const directCoords = extractCoordinates(req.body);
    if (directCoords) {
      req.body.location = {
        type: 'Point',
        coordinates: [directCoords.lng, directCoords.lat]
      };
    } else if (req.body.address && req.body.address !== equipment.address) {
      // Re-geocode if address changed
      const coords = await geocodeWithFallback(req.body.address, req.body.district || equipment.district);
      if (coords) {
        req.body.location = {
          type: 'Point',
          coordinates: [coords.lng, coords.lat]
        };
      }
    }

    // Prevent mass assignment by whitelisting editable fields
    const allowedFields = [
      'title', 'description', 'category', 'brand', 'model', 
      'yearOfManufacture', 'condition', 'pricePerDay', 'minimumRentalDays', 
      'maximumRentalDays', 'district', 'state', 'village', 'address', 
      'location', 'specifications', 'images', 'availabilityStatus'
    ];
    const updateData = {};
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    }

    equipment = await Equipment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
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

module.exports = router;
