const TrainingModule = require('../models/TrainingModule');

// GET /api/modules  — list modules for logged-in apprentice (or all for mentor)
const getModules = async (req, res, next) => {
  try {
    const filter = req.user.role === 'mentor'
      ? { mentor: req.user._id }
      : { apprentice: req.user._id };

    const modules = await TrainingModule.find(filter)
      .populate('apprentice', 'name email')
      .populate('mentor', 'name email')
      .sort({ createdAt: -1 });

    res.json(modules);
  } catch (err) {
    next(err);
  }
};

// GET /api/modules/:id
const getModuleById = async (req, res, next) => {
  try {
    const mod = await TrainingModule.findById(req.params.id)
      .populate('apprentice', 'name email tradeCategory')
      .populate('mentor', 'name email');

    if (!mod) return res.status(404).json({ message: 'Module not found' });
    res.json(mod);
  } catch (err) {
    next(err);
  }
};

// POST /api/modules
const createModule = async (req, res, next) => {
  try {
    const { title, tradeCategory, projectGoals, toolChecklist, fieldHours, deadline, mentorId } = req.body;

    const mod = await TrainingModule.create({
      apprentice: req.user._id,
      mentor: mentorId || null,
      title,
      tradeCategory,
      projectGoals,
      toolChecklist: toolChecklist || [],
      fieldHours: fieldHours || 0,
      deadline,
    });

    res.status(201).json(mod);
  } catch (err) {
    next(err);
  }
};

// PUT /api/modules/:id
const updateModule = async (req, res, next) => {
  try {
    const mod = await TrainingModule.findById(req.params.id);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    const allowedFields = [
      'title', 'tradeCategory', 'projectGoals', 'toolChecklist',
      'fieldHours', 'supervisorSignOff', 'deadline', 'status', 'errorNotes',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) mod[field] = req.body[field];
    });

    const updated = await mod.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/modules/:id
const deleteModule = async (req, res, next) => {
  try {
    const mod = await TrainingModule.findById(req.params.id);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    await mod.deleteOne();
    res.json({ message: 'Module deleted' });
  } catch (err) {
    next(err);
  }
};

// PUT /api/modules/:id/signoff  — mentor signs off
const signOff = async (req, res, next) => {
  try {
    const mod = await TrainingModule.findById(req.params.id);
    if (!mod) return res.status(404).json({ message: 'Module not found' });

    mod.supervisorSignOff = true;
    mod.status = 'completed';
    const updated = await mod.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getModules, getModuleById, createModule, updateModule, deleteModule, signOff };