const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const FieldLog = require('../models/FieldLog');
const TrainingModule = require('../models/TrainingModule');
const Drill = require('../models/Drill');

// GET /api/dashboard — returns real stats for the logged-in provider
router.get('/', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Run all queries in parallel
    const [logs, modules, drills] = await Promise.all([
      FieldLog.find({ apprentice: userId }),
      TrainingModule.find({ apprentice: userId }),
      Drill.find({ apprentice: userId, completed: true }),
    ]);

    const trainingHours = logs.reduce((sum, l) => sum + (l.hoursWorked || 0), 0);
    const completedModules = modules.filter((m) => m.status === 'Completed').length;
    const certifications = (req.user.certifications || []).length;
    const drillsCompleted = drills.length;

    res.json({
      stats: {
        trainingHours,
        completedModules,
        certifications,
        activeProjects: drillsCompleted,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
