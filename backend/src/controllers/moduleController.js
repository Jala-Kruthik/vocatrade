const TrainingModule = require('../models/TrainingModule');

// GET /api/modules
const getModules = async (req, res, next) => {
  try {
    const modules = await TrainingModule.find({ apprentice: req.user._id }).sort({ createdAt: -1 });
    res.json(modules);
  } catch (err) {
    next(err);
  }
};

// GET /api/modules/:id
const getModuleById = async (req, res, next) => {
  try {
    const mod = await TrainingModule.findById(req.params.id);
    if (!mod) return res.status(404).json({ message: 'Module not found' });
    res.json(mod);
  } catch (err) {
    next(err);
  }
};

// POST /api/modules
const createModule = async (req, res, next) => {
  try {
    const mod = await TrainingModule.create({ ...req.body, apprentice: req.user._id });
    res.status(201).json(mod);
  } catch (err) {
    next(err);
  }
};

// PUT /api/modules/:id
const updateModule = async (req, res, next) => {
  try {
    const mod = await TrainingModule.findOneAndUpdate(
      { _id: req.params.id, apprentice: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!mod) return res.status(404).json({ message: 'Module not found' });
    res.json(mod);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/modules/:id
const deleteModule = async (req, res, next) => {
  try {
    const mod = await TrainingModule.findOneAndDelete({ _id: req.params.id, apprentice: req.user._id });
    if (!mod) return res.status(404).json({ message: 'Module not found' });
    res.json({ message: 'Module deleted' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/modules/:id/signoff
const signOff = async (req, res, next) => {
  try {
    const mod = await TrainingModule.findById(req.params.id);
    if (!mod) return res.status(404).json({ message: 'Module not found' });
    mod.supervisorSignOff = true;
    mod.status = 'Completed';
    const updated = await mod.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getModules, getModuleById, createModule, updateModule, deleteModule, signOff };
