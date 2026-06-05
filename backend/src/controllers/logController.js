const FieldLog = require('../models/FieldLog');

// GET /api/logs
const getLogs = async (req, res, next) => {
  try {
    const logs = await FieldLog.find({ apprentice: req.user._id }).sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

// POST /api/logs
const createLog = async (req, res, next) => {
  try {
    const log = await FieldLog.create({ ...req.body, apprentice: req.user._id });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

// PUT /api/logs/:id
const updateLog = async (req, res, next) => {
  try {
    const log = await FieldLog.findOneAndUpdate(
      { _id: req.params.id, apprentice: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json(log);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/logs/:id
const deleteLog = async (req, res, next) => {
  try {
    const log = await FieldLog.findOneAndDelete({ _id: req.params.id, apprentice: req.user._id });
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json({ message: 'Log deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/logs/summary
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allLogs = await FieldLog.find({ apprentice: userId });

    const totalHours = allLogs.reduce((sum, l) => sum + (l.hoursWorked || 0), 0);

    const weeklyHours = allLogs
      .filter((l) => {
        const d = new Date(l.date || l.createdAt);
        return d >= startOfWeek;
      })
      .reduce((sum, l) => sum + (l.hoursWorked || 0), 0);

    const monthlyHours = allLogs
      .filter((l) => {
        const d = new Date(l.date || l.createdAt);
        return d >= startOfMonth;
      })
      .reduce((sum, l) => sum + (l.hoursWorked || 0), 0);

    res.json({ totalHours, weeklyHours, monthlyHours });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLogs, createLog, updateLog, deleteLog, getSummary };
