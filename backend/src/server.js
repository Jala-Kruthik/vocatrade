require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const logRoutes = require('./routes/logRoutes');
const drillRoutes = require('./routes/drillRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ── Custom terminal logger — shows register/login activity clearly ─────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 400 ? '\x1b[31m' : status >= 200 ? '\x1b[32m' : '\x1b[33m';
    const reset = '\x1b[0m';
    const time = new Date().toLocaleTimeString();

    if (req.path === '/api/auth/register' && req.method === 'POST') {
      const { name, email, phone, role } = req.body || {};
      if (status === 201) {
        console.log(`\n✅ [${time}] NEW REGISTRATION`);
        console.log(`   Name  : ${name}`);
        console.log(`   Email : ${email}`);
        console.log(`   Phone : ${phone || 'not provided'}`);
        console.log(`   Role  : ${role || 'provider'}`);
        console.log(`   Saved to: backend/data/users/${email?.replace(/[^a-zA-Z0-9]/g,'_')}.json\n`);
      } else {
        console.log(`${color}❌ [${time}] REGISTER FAILED (${status}) — ${email}${reset}`);
      }
    } else if (req.path === '/api/auth/login' && req.method === 'POST') {
      const { email } = req.body || {};
      if (status === 200) {
        console.log(`\n🔐 [${time}] LOGIN SUCCESS — ${email}\n`);
      } else {
        console.log(`${color}❌ [${time}] LOGIN FAILED (${status}) — ${email}${reset}`);
      }
    } else {
      // Normal morgan-style log for other routes
      const method = req.method.padEnd(6);
      console.log(`${color}${method}${reset} ${req.path} ${color}${status}${reset} ${ms}ms`);
    }
  });
  next();
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/drills', drillRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\n🚀 VocaTrade API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   DB    : ${process.env.MONGODB_URI?.split('@')[1]?.split('/')[0] || 'local'}`);
  console.log(`   Users : backend/data/users/\n`);
});
