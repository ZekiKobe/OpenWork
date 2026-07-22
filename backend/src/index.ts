import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// Import database and models
import { connectDB } from './config/database';
import './models'; // Initialize models and associations

// Import routes
import authRoutes from './routes/auth';
import pointsRoutes from './routes/points';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import moderationRoutes from './routes/moderation';
import marketplaceRoutes from './routes/marketplace';
import jobRoutes from './routes/jobs';
import jobApplicationRoutes from './routes/jobApplications';
import portfolioRoutes from './routes/portfolio';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting - Skip for auth routes as they have their own limiters
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '500'), // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for auth routes (they have their own limiters)
    if (req.path.startsWith('/api/auth')) {
      return true;
    }
    // Skip in development for localhost
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.startsWith('::ffff:127.0.0.1'))) {
      return true;
    }
    return false;
  }
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug route to test if server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', routes: ['/api/jobs', '/api/notifications'] });
});

// API routes
console.log('Registering API routes...');
app.use('/api/auth', authRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/jobs', jobRoutes);
console.log('Jobs route registered at /api/jobs');
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
console.log('Notifications route registered at /api/notifications');
console.log('Admin routes registered at /api/admin');
console.log('All routes registered successfully');

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);

  // Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map((err: any) => ({
      field: err.path,
      message: err.message
    }));
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  // Sequelize unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    res.status(400).json({ error: 'Duplicate entry', details: error.errors });
    return;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Sync database (create tables)
    if (process.env.NODE_ENV === 'development') {
      const { sequelize } = require('./models');
      await sequelize.sync(); // Only create missing tables, don't alter existing ones
      console.log('Database synchronized');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
