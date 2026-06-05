const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const { protect } = require('../middleware/auth');

router.use(protect);

// POST /api/requests — client sends a request to a provider
router.post('/', async (req, res, next) => {
  try {
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

// GET /api/requests/mine — provider gets their incoming requests
router.get('/mine', async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find({ provider: req.user._id })
      .populate('client', 'name email phone tradeCategory location')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// PUT /api/requests/:id — provider accepts or declines
router.put('/:id', async (req, res, next) => {
  try {
    const { status } = req.body; // 'accepted' | 'declined'
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'status must be accepted or declined' });
    }
    const request = await ServiceRequest.findOne({ _id: req.params.id, provider: req.user._id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    request.status = status;
    await request.save();
    res.json(request);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
