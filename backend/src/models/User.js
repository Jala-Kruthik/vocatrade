const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const certSchema = new mongoose.Schema({
  trade: String,
  course: String,
  score: Number,
  earnedAt: { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['provider', 'client', 'admin'], default: 'provider' },
    avatar: { type: String, default: '' },
    tradeCategory: { type: String, default: 'other' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    skillLevel: { type: String, default: 'Level 1' },
    // Certifications earned through course+test
    certifications: { type: [certSchema], default: [] },
    isCertified: { type: Boolean, default: false }, // true when at least 1 cert earned
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
