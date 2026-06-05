const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['apprentice', 'mentor'], default: 'apprentice' },
    avatar: { type: String, default: '' },
    tradeCategory: {
      type: String,
      enum: ['electrical', 'hvac', 'plumbing', 'carpentry', 'welding', 'masonry', 'other'],
      default: 'other',
    },
    certificationBadges: [{ type: String }],
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    apprentices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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