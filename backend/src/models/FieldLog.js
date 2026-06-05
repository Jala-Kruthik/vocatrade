const mongoose = require('mongoose');

const fieldLogSchema = new mongoose.Schema(
  {
    apprentice: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingModule' },
    projectName: { type: String, default: '' },
    siteLocation: { type: String, default: '' },
    tradeType: { type: String, default: '' },
    date: { type: String, default: '' },
    hoursWorked: { type: Number, required: true, min: 0, max: 24 },
    workDescription: { type: String, default: '' },
    supervisorStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    toolsUsed: [{ type: String }],
    issues: { type: String, default: '' },
    location: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FieldLog', fieldLogSchema);
