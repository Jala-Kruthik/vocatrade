const mongoose = require('mongoose');

const drillSchema = new mongoose.Schema(
  {
    apprentice: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    scenario: { type: String, required: true },
    tradeCategory: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    aiGenerated: { type: Boolean, default: true },
    completed: { type: Boolean, default: false },
    apprenticeResponse: { type: String, default: '' },
    aiFeedback: { type: String, default: '' },
    score: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Drill', drillSchema);
