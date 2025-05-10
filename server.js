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
app.use('/api/user', userRoutes);

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Enable CORS for deployed frontend
app.use(cors({
  origin: 'https://app.exchange.newlink-asia.com',
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Serve uploaded documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Root test route
app.get('/', (req, res) => {
  res.send('Newlink Exchange API is running on Render 🎉');
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
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
