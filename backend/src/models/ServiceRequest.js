const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending',
    },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    // Client feedback after service
    feedback: {
      rating: { type: Number, min: 1, max: 5, default: null },
      comment: { type: String, default: '' },
      submittedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
