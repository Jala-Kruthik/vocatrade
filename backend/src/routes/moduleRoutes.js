const express = require('express');
const router = express.Router();
const { getModules, getModuleById, createModule, updateModule, deleteModule, signOff } = require('../controllers/moduleController');
const { protect, mentorOnly } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getModules).post(createModule);
router.route('/:id').get(getModuleById).put(updateModule).delete(deleteModule);
router.put('/:id/signoff', mentorOnly, signOff);

module.exports = router;
