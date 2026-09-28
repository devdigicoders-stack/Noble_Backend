import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import enquiryRoutes from './routes/enquiries.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  credentials: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Health check routes
app.get(['/health', '/api/health'], (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  res.status(200).json({
    status: 'OK',
    serverTime: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: states[dbState] || 'Unknown',
      connected: dbState === 1
    },
    message: 'Noble Backend is running smoothly 🚀'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Noble Housekeeping Trading & Contracting Backend API is Running.'
  });
});

// MongoDB Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/noble_housing';

// Connect to MongoDB & Start Server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Server running with DB warning on port ${PORT}`);
    });
  });

export default app;
