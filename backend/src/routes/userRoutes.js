const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/users/workers
// Returns certified providers, optionally filtered by trade category
// If the logged-in user is a client with a tradeCategory set, defaults to that trade
router.get('/workers', protect, async (req, res, next) => {
  try {
    const { trade } = req.query; // ?trade=Plumbing

    const query = { role: 'provider', isCertified: true };
    if (trade && trade !== 'All') {
      query.tradeCategory = { $regex: new RegExp(`^${trade}$`, 'i') };
    }

    const workers = await User.find(
      query,
      'name role tradeCategory phone email skillLevel certifications isCertified location'
    ).sort({ name: 1 });

    res.json(workers);
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/me/certify — called after passing a course test
router.put('/me/certify', protect, async (req, res, next) => {
  try {
    const { trade, course, score } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const already = user.certifications.find((c) => c.course === course);
    if (!already) {
      user.certifications.push({ trade, course, score });
    } else {
      already.score = Math.max(already.score, score); // keep best score
    }
    user.isCertified = true;
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// POST /api/users/request — alias that redirects to /api/requests
// (kept for backward compat with ClientPage)
router.post('/request', protect, async (req, res, next) => {
  try {
    const ServiceRequest = require('../models/ServiceRequest');
    const { providerId, message } = req.body;
    if (!providerId || !message) {
      return res.status(400).json({ message: 'providerId and message are required' });
    }
    const request = await ServiceRequest.create({
      client: req.user._id,
      provider: providerId,
      message,
    });
    const populated = await request.populate('client', 'name email phone tradeCategory location');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
