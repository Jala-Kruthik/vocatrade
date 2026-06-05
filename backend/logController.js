const FieldLog = require('../models/FieldLog');

// GET /api/logs
const getLogs = async (req, res, next) => {
  try {
    const logs = await FieldLog.find({ apprentice: req.user._id })
      .populate('module', 'title tradeCategory')
      .sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    next(err);
  }
};

// POST /api/logs
const createLog = async (req, res, next) => {
  try {
    const { moduleId, hoursWorked, taskDescription, toolsUsed, issues, location, weatherConditions, date } = req.body;

    const log = await FieldLog.create({
      apprentice: req.user._id,
      module: moduleId || null,
      hoursWorked,
      taskDescription,
      toolsUsed: toolsUsed || [],
      issues,
      location,
      weatherConditions,
      date: date || Date.now(),
    });

    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
};

// PUT /api/logs/:id
const updateLog = async (req, res, next) => {
  try {
    const log = await FieldLog.findOne({ _id: req.params.id, apprentice: req.user._id });
    if (!log) return res.status(404).json({ message: 'Log not found' });

    Object.assign(log, req.body);
    const updated = await log.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/logs/:id
const deleteLog = async (req, res, next) => {
  try {
    const log = await FieldLog.findOne({ _id: req.params.id, apprentice: req.user._id });
    if (!log) return res.status(404).json({ message: 'Log not found' });

    await log.deleteOne();
    res.json({ message: 'Log deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/logs/summary  — total hours per trade
const getSummary = async (req, res, next) => {
  try {
    const summary = await FieldLog.aggregate([
      { $match: { apprentice: req.user._id } },
      { $lookup: { from: 'trainingmodules', localField: 'module', foreignField: '_id', as: 'mod' } },
      { $unwind: { path: '$mod', preserveNullAndEmpty: true } },
      { $group: { _id: '$mod.tradeCategory', totalHours: { $sum: '$hoursWorked' }, count: { $sum: 1 } } },
    ]);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

module.exports = { getLogs, createLog, updateLog, deleteLog, getSummary };