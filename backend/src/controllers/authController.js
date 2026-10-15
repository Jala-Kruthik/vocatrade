const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── Save user details to file ──────────────────────────────────────────────────
const saveUserToFile = (user) => {
  try {
    const usersDir = path.join(__dirname, '../../data/users');
    if (!fs.existsSync(usersDir)) fs.mkdirSync(usersDir, { recursive: true });

    // Individual file per user: data/users/<email>.json
    const filename = user.email.replace(/[^a-zA-Z0-9]/g, '_') + '.json';
    const userFile = path.join(usersDir, filename);

    const userRecord = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      tradeCategory: user.tradeCategory || '',
      location: user.location || '',
      isCertified: user.isCertified || false,
      registeredAt: user.createdAt || new Date().toISOString(),
    };

    fs.writeFileSync(userFile, JSON.stringify(userRecord, null, 2), 'utf8');

    // Also update the master users list: data/users/all_users.json
    const allFile = path.join(usersDir, 'all_users.json');
    let allUsers = [];
    if (fs.existsSync(allFile)) {
      allUsers = JSON.parse(fs.readFileSync(allFile, 'utf8'));
    }
    // Replace if email already exists, else push
    const idx = allUsers.findIndex((u) => u.email === user.email);
    if (idx >= 0) allUsers[idx] = userRecord;
    else allUsers.push(userRecord);

    fs.writeFileSync(allFile, JSON.stringify(allUsers, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save user to file:', err.message);
    // Non-fatal — don't break registration
  }
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, tradeCategory, phone, location } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'provider',
      tradeCategory: tradeCategory || 'other',
      phone: phone || '',
      location: location || '',
    });

    // Save user details to file
    saveUserToFile(user);

    const token = generateToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

module.exports = { register, login, getMe, saveUserToFile };
