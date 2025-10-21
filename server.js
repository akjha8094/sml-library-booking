const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import database connection
const db = require('./server/config/database');

// Import routes
const authRoutes = require('./server/routes/authRoutes');
const userRoutes = require('./server/routes/userRoutes');
const adminRoutes = require('./server/routes/adminRoutes');
const seatRoutes = require('./server/routes/seatRoutes');
const planRoutes = require('./server/routes/planRoutes');
const bookingRoutes = require('./server/routes/bookingRoutes');
const paymentRoutes = require('./server/routes/paymentRoutes');
const facilityRoutes = require('./server/routes/facilityRoutes');
const notificationRoutes = require('./server/routes/notificationRoutes');
const couponRoutes = require('./server/routes/couponRoutes');
const walletRoutes = require('./server/routes/walletRoutes');
const supportRoutes = require('./server/routes/supportRoutes');
const bannerRoutes = require('./server/routes/bannerRoutes');
const noticeRoutes = require('./server/routes/noticeRoutes');
const reportRoutes = require('./server/routes/reportRoutes');
const expenseRoutes = require('./server/routes/expenseRoutes');
const gatewayRoutes = require('./server/routes/gatewayRoutes');
const offerRoutes = require('./server/routes/offerRoutes');
const advanceBookingRoutes = require('./server/routes/advanceBookingRoutes');
const galleryRoutes = require('./server/routes/galleryRoutes');
const adminNotificationRoutes = require('./server/routes/adminNotificationRoutes');
const refundRoutes = require('./server/routes/refundRoutes');
const adminUserControlRoutes = require('./server/routes/adminUserControlRoutes');
const impersonationRoutes = require('./server/routes/impersonationRoutes');
const auditRoutes = require('./server/routes/auditRoutes');
const userRefundRequestRoutes = require('./server/routes/userRefundRequestRoutes');
const { startNotificationScheduler } = require('./server/services/notificationScheduler');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static files (for uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.execute('SELECT 1');
    
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Server is unhealthy',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/admin/expenses', expenseRoutes);
app.use('/api/admin/gateway-settings', gatewayRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/advance-bookings', advanceBookingRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/admin/admin-notifications', adminNotificationRoutes);
app.use('/api/admin/refunds', refundRoutes);
app.use('/api/admin/user-control', adminUserControlRoutes);
app.use('/api/admin/impersonation', impersonationRoutes);
app.use('/api/admin/audit-logs', auditRoutes);
app.use('/api/user-refund-requests', userRefundRequestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'client/build');
  
  // Check if build directory exists
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  } else {
    // Fallback if build doesn't exist
    app.get('/', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Smart Library Booking System API Server',
        version: '1.0.0',
        documentation: 'See API documentation for available endpoints'
      });
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  
  // Start notification scheduler
  startNotificationScheduler();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;