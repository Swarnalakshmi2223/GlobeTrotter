require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const tripRoutes = require('./routes/tripRoutes');
const cityRoutes = require('./routes/cityRoutes');
const activityRoutes = require('./routes/activityRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Disable X-Powered-By header to prevent technology/version disclosure (SQ-0063)
app.disable('x-powered-by');


// CORS – allow local dev and the deployed frontend
const allowedOrigins = [
  'https://globetrotter-1-kn9h.onrender.com',
  process.env.CLIENT_URL, // optional, set on Render if you want
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no origin (Postman), any localhost (dev), or listed origins
      if (
        !origin ||
        origin.startsWith('http://localhost') ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'GlobeTrotter API is running 🌍' });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`);
});
