const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const dashboardRoutes = require('./routes/dashboard');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Core Middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ─── Rate Limiting ─────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many requests, please try again after 15 minutes.',
    code: 'RATE_LIMITED'
  }
});

app.use('/api/auth', authLimiter);

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Placement Tracker API is running' });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

module.exports = app;