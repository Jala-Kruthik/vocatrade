const mongoose = require('mongoose');

const fieldLogSchema = new mongoose.Schema(
  {
    apprentice: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingModule' },
    date: { type: Date, default: Date.now },
    hoursWorked: { type: Number, required: true, min: 0, max: 24 },
    taskDescription: { type: String, required: true },
    toolsUsed: [{ type: String }],
    issues: { type: String, default: '' },
    location: { type: String, default: '' },
    weatherConditions: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FieldLog', fieldLogSchema);