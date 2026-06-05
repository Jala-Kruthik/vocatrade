const express = require('express');
const router = express.Router();
const { getLogs, createLog, updateLog, deleteLog, getSummary } = require('../controllers/logController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getSummary);
router.route('/').get(getLogs).post(createLog);
router.route('/:id').put(updateLog).delete(deleteLog);

module.exports = router;
