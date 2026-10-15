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

// GET /api/requests/sent — client sees their own sent requests + status
router.get('/sent', async (req, res, next) => {
  try {
    const requests = await ServiceRequest.find({ client: req.user._id })
      .populate('provider', 'name email phone tradeCategory certifications isCertified')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// PUT /api/requests/:id — provider accepts or declines; provider can also mark completed
router.put('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'declined', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'status must be accepted, declined, or completed' });
    }
    const request = await ServiceRequest.findOne({ _id: req.params.id, provider: req.user._id });
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = status;
    if (status === 'accepted') request.acceptedAt = new Date();
    if (status === 'completed') request.completedAt = new Date();
    await request.save();
    res.json(request);
  } catch (err) {
    next(err);
  }
});

// POST /api/requests/:id/feedback — client submits feedback after service completed
router.post('/:id/feedback', async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const request = await ServiceRequest.findOne({ _id: req.params.id, client: req.user._id });
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Can only leave feedback after service is completed' });
    }
    request.feedback = { rating, comment: comment || '', submittedAt: new Date() };
    await request.save();
    res.json(request);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
