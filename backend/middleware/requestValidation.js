const mongoose = require('mongoose');
const bad = (res, message) => res.status(400).json({ success: false, message });
exports.identifier = (req, res, next, id) => {
  if (typeof id !== 'string' || !/^[a-f\d]{24}$/i.test(id) || !mongoose.isValidObjectId(id)) return bad(res, 'Invalid identifier');
  next();
};
exports.query = (req, res, next) => {
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value !== 'string' || value.includes('\0')) return bad(res, 'Invalid query value: ' + key);
  }
  for (const key of ['page', 'limit']) {
    if (req.query[key] !== undefined) {
      const n = Number(req.query[key]);
      if (!/^\d+$/.test(req.query[key]) || !Number.isSafeInteger(n) || n < 1 || (key === 'page' && n > 1000000)) return bad(res, key + ' must be a positive integer');
      if (key === 'limit') req.query[key] = String(Math.min(n, 100));
    }
  }
  for (const key of ['minPrice', 'maxPrice']) {
    if (req.query[key] !== undefined && !req.query[key].trim()) delete req.query[key];
  }
  for (const key of ['minPrice', 'maxPrice', 'lat', 'lng']) {
    if (req.query[key] !== undefined && (!req.query[key].trim() || !Number.isFinite(Number(req.query[key])))) return bad(res, 'Invalid numeric query value: ' + key);
  }
  if (['minPrice', 'maxPrice'].some(k => req.query[k] !== undefined && Number(req.query[k]) < 0)) return bad(res, 'Price must be nonnegative');
  if (req.query.lat !== undefined && Math.abs(Number(req.query.lat)) > 90 || req.query.lng !== undefined && Math.abs(Number(req.query.lng)) > 180) return bad(res, 'Invalid coordinates');
  next();
};
