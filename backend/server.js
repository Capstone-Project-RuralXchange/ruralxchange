const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });


const app = express();

// Render has one trusted reverse-proxy hop. Never trust arbitrary forwarded hops.
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS || 1));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Isolate client IPs and keep health probes outside the application budget.
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'RuralXchange API Running' }));
const rateMessage = (req, res) => res.status(429).json({ success: false,
  message: 'Too many requests. Please try again after the Retry-After interval.' });
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300,
  standardHeaders: 'draft-7', legacyHeaders: false, handler: rateMessage }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30,
  skip: req => req.method === 'GET', standardHeaders: 'draft-7', legacyHeaders: false, handler: rateMessage }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
const bookingsRoute = require('./routes/bookings');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/specialists', require('./routes/specialists'));
app.use('/api/bookings', bookingsRoute);
app.use('/api/requirements', require('./routes/requirements'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/seasonal', require('./routes/seasonal'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  res.status(err.statusCode || (['ValidationError', 'CastError'].includes(err.name) ? 400 : 500)).json({
    success: false,
    message: err.statusCode ? err.message : (err.name === 'ValidationError' ? 'Please check the required fields and valid values' : err.name === 'CastError' ? 'Invalid identifier or value' : 'Server error. Please try again.'),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5001;
if (require.main === module) mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ruralxchange')
  .then(() => {
    console.log('✅ MongoDB Connected');
    const { expirePending } = require('./services/bookings');
    expirePending().catch(err => console.error('Booking expiry failed:', err.message));
    setInterval(() => expirePending().catch(err => console.error('Booking expiry failed:', err.message)), 60000).unref();
    app.listen(PORT, () => {
      console.log(`🚀 RuralXchange Server running on port ${PORT}`);
      console.log(`📌 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

module.exports = app;
