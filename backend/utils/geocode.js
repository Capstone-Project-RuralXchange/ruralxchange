/**
 * Geocoding utility — OpenStreetMap Nominatim (free, no API key needed)
 * Converts text addresses to lat/lng coordinates.
 * Falls back to a curated district-level Karnataka coordinate map.
 */

const https = require('https');

// ─── Real GPS coordinates for Karnataka District HQs ────────────────────────
const KARNATAKA_DISTRICT_COORDS = {
  'Bagalkot':           { lat: 16.1691, lng: 75.6615 },
  'Ballari':            { lat: 15.1394, lng: 76.9214 },
  'Belagavi':           { lat: 15.8497, lng: 74.4977 },
  'Bengaluru Rural':    { lat: 13.2257, lng: 77.5750 },
  'Bengaluru Urban':    { lat: 12.9716, lng: 77.5946 },
  'Bidar':              { lat: 17.9104, lng: 77.5199 },
  'Chamarajanagar':     { lat: 11.9261, lng: 76.9437 },
  'Chikkaballapur':     { lat: 13.4355, lng: 77.7315 },
  'Chikkamagaluru':     { lat: 13.3153, lng: 75.7754 },
  'Chitradurga':        { lat: 14.2226, lng: 76.3980 },
  'Dakshina Kannada':   { lat: 12.8438, lng: 75.0239 },
  'Davangere':          { lat: 14.4644, lng: 75.9218 },
  'Dharwad':            { lat: 15.4589, lng: 75.0078 },
  'Gadag':              { lat: 15.4166, lng: 75.6255 },
  'Hassan':             { lat: 13.0033, lng: 76.0961 },
  'Haveri':             { lat: 14.7935, lng: 75.3990 },
  'Kalaburagi':         { lat: 17.3297, lng: 76.8343 },
  'Kodagu':             { lat: 12.4218, lng: 75.7390 },
  'Kolar':              { lat: 13.1360, lng: 78.1292 },
  'Koppal':             { lat: 15.3473, lng: 76.1552 },
  'Mandya':             { lat: 12.5222, lng: 76.8951 },
  'Mysuru':             { lat: 12.2958, lng: 76.6394 },
  'Raichur':            { lat: 16.2076, lng: 77.3590 },
  'Ramanagara':         { lat: 12.7159, lng: 77.2795 },
  'Shivamogga':         { lat: 13.9299, lng: 75.5681 },
  'Tumakuru':           { lat: 13.3379, lng: 77.1173 },
  'Udupi':              { lat: 13.3409, lng: 74.7421 },
  'Uttara Kannada':     { lat: 14.7937, lng: 74.4892 },
  'Vijayanagara':       { lat: 15.2715, lng: 76.3888 },
  'Vijayapura':         { lat: 16.8302, lng: 75.7100 },
  'Yadgir':             { lat: 16.7606, lng: 77.1381 },
};

/**
 * Geocode an address string using OpenStreetMap Nominatim
 * @param {string} address - Full address text (e.g. "Maddur, Mandya, Karnataka")
 * @returns {Promise<{lat: number, lng: number}>}
 */
async function geocodeAddress(address) {
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return null;
  }

  try {
    const encoded = encodeURIComponent(address.trim() + ', Karnataka, India');
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1&countrycodes=in`;

    const result = await new Promise((resolve, reject) => {
      const req = https.get(url, {
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
            reject(new Error('Failed to parse Nominatim response'));
          }
        });
      });
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Nominatim request timeout'));
      });
    });

    if (result && result.length > 0) {
      return {
        lat: parseFloat(result[0].lat),
        lng: parseFloat(result[0].lon)
      };
    }
  } catch (err) {
    console.warn(`⚠️  Geocoding failed for "${address}": ${err.message}. Using district fallback.`);
  }

  return null;
}

/**
 * Get coordinates for a district (deterministic fallback)
 * @param {string} district - Karnataka district name
 * @returns {{lat: number, lng: number}}
 */
function getDistrictCoords(district) {
  return KARNATAKA_DISTRICT_COORDS[district] || KARNATAKA_DISTRICT_COORDS['Bengaluru Urban'];
}

/**
 * Full geocode pipeline: try address first, fallback to district
 * @param {string} address - Full address string
 * @param {string} district - District name (fallback)
 * @returns {Promise<{lat: number, lng: number}>}
 */
async function geocodeWithFallback(address, district) {
  // Try full address geocoding first
  if (address) {
    const coords = await geocodeAddress(address);
    if (coords) return coords;
  }

  // Fallback: use district HQ coordinates
  return getDistrictCoords(district);
}

/**
 * Calculate distance between two coordinate points using Haversine formula
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} Distance in kilometers
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

module.exports = {
  geocodeAddress,
  getDistrictCoords,
  geocodeWithFallback,
  haversineDistance,
  KARNATAKA_DISTRICT_COORDS
};
