const express = require('express');
const router = express.Router();
const { generateDrill, getDrills, respondToDrill, injectAnomaly, mentorChat } = require('../controllers/drillController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getDrills);
router.post('/generate', generateDrill);
router.post('/inject-anomaly', injectAnomaly);
router.post('/chat', mentorChat);
router.post('/:id/respond', respondToDrill);

module.exports = router;