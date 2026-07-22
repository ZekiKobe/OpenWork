import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import { validateEnv } from './config/env';
validateEnv();

import { connectDB, sequelize } from './config/database';
import './models';

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
import milestoneRoutes from './routes/milestones';
import { StripePaymentService } from './services/stripePaymentService';
import { initSocket, closeSocket } from './realtime/socket';

const app = express();
const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '500'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    if (req.path.startsWith('/api/auth') || req.path === '/api/payments/webhook') {
      return true;
    }
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment && (req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.startsWith('::ffff:127.0.0.1'))) {
      return true;
    }
    return false;
  }
});

app.use('/api/', limiter);

// Stripe webhook needs raw body — register before JSON parser
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'] as string;
      if (!signature) {
        res.status(400).json({ error: 'Missing stripe-signature' });
        return;
      }
      const event = StripePaymentService.constructWebhookEvent(req.body as Buffer, signature);
      if (event.type === 'checkout.session.completed') {
        await StripePaymentService.handleCheckoutCompleted(event.data.object as any);
      }
      res.json({ received: true });
    } catch (error: any) {
      console.error('Stripe webhook error:', error.message);
      res.status(400).json({ error: `Webhook Error: ${error.message}` });
    }
  }
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: 'OK', database: 'up', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'DEGRADED', database: 'down', timestamp: new Date().toISOString() });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/milestones', milestoneRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global error handler:', error);

  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map((err: any) => ({
      field: err.path,
      message: err.message
    }));
    res.status(400).json({ error: 'Validation failed', details: errors });
    return;
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    res.status(400).json({ error: 'Duplicate entry', details: error.errors });
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

let server: http.Server;

const startServer = async () => {
  try {
    await connectDB();

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('Database synchronized');
    }

    server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down gracefully...`);
  closeSocket();
  if (server) {
    server.close(async () => {
      try {
        await sequelize.close();
      } catch {
        // ignore
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();

export default app;
