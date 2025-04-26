const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // ✅ ADD this line

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const dealRoutes = require('./routes/deals');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');

const app = express();
const PORT = process.env.PORT;

// ✅ Enable CORS for local development
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// ✅ Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Root test route
app.get('/', (req, res) => {
  res.send('Newlink Exchange API is running on Render 🎉');
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/newlink', {
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
