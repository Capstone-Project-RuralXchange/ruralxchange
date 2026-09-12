/**
 * Routing and Road Distance Utility — Open Source Routing Machine (OSRM)
 * Calculates accurate road driving distance and estimated travel times across Karnataka.
 * Includes caching and graceful Haversine fallback with road winding factor.
 */

const https = require('https');
const http = require('http');
const { haversineDistance } = require('./geocode');

// In-memory cache: "lat1,lng1->lat2,lng2" => { distanceKm, durationMinutes, durationText, isRoadDistance, timestamp }
const routeCache = new Map();
const CACHE_MAX_SIZE = 5000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Format driving duration into a friendly human-readable string
 * @param {number} minutes 
 * @returns {string} e.g. "25 mins", "1 hr 15 mins"
 */
function formatDrivingTime(minutes) {
  if (!minutes || minutes < 1) return '< 1 min';
  const roundedMins = Math.round(minutes);
  if (roundedMins < 60) return `${roundedMins} min${roundedMins === 1 ? '' : 's'}`;
  const hrs = Math.floor(roundedMins / 60);
  const remMins = roundedMins % 60;
  if (remMins === 0) return `${hrs} hr${hrs === 1 ? '' : 's'}`;
  return `${hrs} hr${hrs === 1 ? '' : 's'} ${remMins} min${remMins === 1 ? '' : 's'}`;
}

/**
 * Generates a cache key from rounded coordinates
 */
function getCacheKey(lat1, lng1, lat2, lng2) {
  return `${Number(lat1).toFixed(4)},${Number(lng1).toFixed(4)}->${Number(lat2).toFixed(4)},${Number(lng2).toFixed(4)}`;
}

/**
 * Clean up old cache entries if map grows too large
 */
function pruneCache() {
  if (routeCache.size > CACHE_MAX_SIZE) {
    const now = Date.now();
    for (const [key, val] of routeCache.entries()) {
      if (now - val.timestamp > CACHE_TTL_MS || routeCache.size > CACHE_MAX_SIZE * 0.8) {
        routeCache.delete(key);
      }
    }
  }
}

/**
 * Calculate accurate road driving distance and duration using OSRM
 * @param {number} lat1 Origin latitude
 * @param {number} lng1 Origin longitude
 * @param {number} lat2 Destination latitude
 * @param {number} lng2 Destination longitude
 * @returns {Promise<{distanceKm: number, durationMinutes: number, durationText: string, isRoadDistance: boolean, isFallback: boolean}>}
 */
async function getRoadDistance(lat1, lng1, lat2, lng2) {
  const nLat1 = parseFloat(lat1);
  const nLng1 = parseFloat(lng1);
  const nLat2 = parseFloat(lat2);
  const nLng2 = parseFloat(lng2);

  // Validate coordinates
  if (isNaN(nLat1) || isNaN(nLng1) || isNaN(nLat2) || isNaN(nLng2)) {
    return {
      distanceKm: null,
      durationMinutes: null,
      durationText: null,
      isRoadDistance: false,
      isFallback: true
    };
  }

  // Same point
  if (Math.abs(nLat1 - nLat2) < 0.0001 && Math.abs(nLng1 - nLng2) < 0.0001) {
    return {
      distanceKm: 0,
      durationMinutes: 0,
      durationText: '0 mins',
      isRoadDistance: true,
      isFallback: false
    };
  }

  // Check cache
  const cacheKey = getCacheKey(nLat1, nLng1, nLat2, nLng2);
  const cached = routeCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return {
      distanceKm: cached.distanceKm,
      durationMinutes: cached.durationMinutes,
      durationText: cached.durationText,
      isRoadDistance: cached.isRoadDistance,
      isFallback: cached.isFallback || false
    };
  }

  // Query OSRM Public Routing API
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${nLng1},${nLat1};${nLng2},${nLat2}?overview=false`;
    
    const osrmResult = await new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'RuralXchange/1.0 (rural-equipment-marketplace)',
          'Accept': 'application/json'
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse OSRM routing response'));
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(4000, () => {
        req.destroy();
        reject(new Error('OSRM routing request timeout'));
      });
    });

    if (osrmResult && osrmResult.code === 'Ok' && osrmResult.routes && osrmResult.routes.length > 0) {
      const route = osrmResult.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 10) / 10; // meters to km
      const durationMinutes = Math.max(1, Math.round(route.duration / 60)); // seconds to minutes
      const durationText = formatDrivingTime(durationMinutes);

      const result = {
        distanceKm,
        durationMinutes,
        durationText,
        isRoadDistance: true,
        isFallback: false
      };

      // Save to cache
      pruneCache();
      routeCache.set(cacheKey, { ...result, timestamp: Date.now() });

      return result;
    }
  } catch (err) {
    console.warn(`⚠️ OSRM routing unavailable (${err.message}). Using curved road Haversine fallback.`);
  }

  // Graceful fallback: Haversine straight-line distance * 1.3 (rural road curvature)
  const straightDist = haversineDistance(nLat1, nLng1, nLat2, nLng2);
  const roadDist = Math.round(straightDist * 1.3 * 10) / 10;
  // Estimated driving speed for rural roads: ~35 km/h
  const estMins = Math.max(1, Math.round((roadDist / 35) * 60));
  const result = {
    distanceKm: roadDist,
    durationMinutes: estMins,
    durationText: formatDrivingTime(estMins),
    isRoadDistance: false,
    isFallback: true
  };

  pruneCache();
  routeCache.set(cacheKey, { ...result, timestamp: Date.now() });
  return result;
}

/**
 * Compute road distances for an array of items in parallel
 * @param {{lat: number, lng: number}} origin
 * @param {Array<{_id: string, location?: { coordinates: [number, number] }}>} items
 * @returns {Promise<Array<Object>>} Items enriched with roadDistanceKm, drivingTimeMinutes, etc.
 */
async function enrichItemsWithRoadDistance(origin, items) {
  if (!origin || isNaN(origin.lat) || isNaN(origin.lng) || !Array.isArray(items) || items.length === 0) {
    return items;
  }

  const enrichedPromises = items.map(async (item) => {
    // MongoDB Point coordinates are [lng, lat]
    const itemObj = item.toObject ? item.toObject() : { ...item };
    const coords = itemObj.location?.coordinates;
    if (coords && Array.isArray(coords) && coords.length === 2 && (coords[0] !== 0 || coords[1] !== 0)) {
      const destLng = coords[0];
      const destLat = coords[1];
      const routeInfo = await getRoadDistance(origin.lat, origin.lng, destLat, destLng);
      itemObj.roadDistanceKm = routeInfo.distanceKm;
      itemObj.drivingTimeMinutes = routeInfo.durationMinutes;
      itemObj.drivingTimeText = routeInfo.durationText;
      itemObj.isRoadDistance = routeInfo.isRoadDistance;
      itemObj.isFallback = routeInfo.isFallback;
    }
    return itemObj;
  });

  return Promise.all(enrichedPromises);
}

module.exports = {
  getRoadDistance,
  formatDrivingTime,
  enrichItemsWithRoadDistance,
  routeCache
};
