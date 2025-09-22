const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const dealRoutes = require('./routes/deals');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 10000;

/* -----------------------------
   ✅ CORS Configuration
   Reads ALLOWED_ORIGINS from env:
   e.g.
   ALLOWED_ORIGINS=https://exchange.swiss-starter.com,https://app.exchange.newlink-asia.com,http://localhost:5173
-------------------------------- */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) and whitelisted ones
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS blocked for origin: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight
app.options('*', cors());

/* -----------------------------
   ✅ Middleware
-------------------------------- */
app.use(express.json());

/* -----------------------------
   ✅ Static files (uploads)
-------------------------------- */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* -----------------------------
   ✅ API Routes
-------------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/user', userRoutes);

/* -----------------------------
   ✅ Root test route
-------------------------------- */
app.get('/', (req, res) => {
  res.send('Newlink Exchange API is running on Render 🎉');
});

/* -----------------------------
   ✅ MongoDB Connection
-------------------------------- */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
