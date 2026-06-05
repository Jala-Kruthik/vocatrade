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

connectDB();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

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

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 VocaTrade API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
