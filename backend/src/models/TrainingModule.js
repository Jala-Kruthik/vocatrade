const mongoose = require('mongoose');

const trainingModuleSchema = new mongoose.Schema(
  {
    apprentice: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    tradeCategory: { type: String, required: true, default: 'other' },
    description: { type: String, default: '' },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    duration: { type: Number, default: 0 },
    deadline: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed'],
      default: 'Not Started',
    },
    supervisorSignOff: { type: Boolean, default: false },
    errorNotes: { type: String, default: '' },
    anomalyInjected: { type: Boolean, default: false },
    anomalyDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrainingModule', trainingModuleSchema);
