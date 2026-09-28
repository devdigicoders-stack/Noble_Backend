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

// Local & Serverless bootstrap
if (process.env.NODE_ENV !== 'production') {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully:', MONGODB_URI);
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} -> http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      app.listen(PORT, () => {
        console.log(`⚠️ Server running with DB warning on port ${PORT}`);
      });
    });
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected in production'))
    .catch((err) => console.error('❌ MongoDB connection error:', err.message));
}

export default app;
