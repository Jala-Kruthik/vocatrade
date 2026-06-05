const mongoose = require('mongoose');

const toolChecklistSchema = new mongoose.Schema({
  tool: { type: String, required: true },
  checked: { type: Boolean, default: false },
});

const trainingModuleSchema = new mongoose.Schema(
  {
    apprentice: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    tradeCategory: {
      type: String,
      enum: ['electrical', 'hvac', 'plumbing', 'carpentry', 'welding', 'masonry', 'other'],
      required: true,
    },
    projectGoals: { type: String, required: true },
    toolChecklist: [toolChecklistSchema],
    fieldHours: { type: Number, default: 0 },
    supervisorSignOff: { type: Boolean, default: false },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending',
    },
    errorNotes: { type: String, default: '' },
    anomalyInjected: { type: Boolean, default: false },
    anomalyDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrainingModule', trainingModuleSchema);