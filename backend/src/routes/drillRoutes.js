const express = require('express');
const router = express.Router();
const { generateDrill, getDrills, getDrillHistory, submitDrill, respondToDrill } = require('../controllers/drillController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/history', getDrillHistory);
router.get('/', getDrills);
router.post('/generate', generateDrill);
router.post('/submit', submitDrill);
router.post('/:id/respond', respondToDrill);

module.exports = router;
