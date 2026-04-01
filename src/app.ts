import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';

import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './config/logger';

// Import routes
import taskRoutes from './routes/tasks';
import invoiceRoutes from './routes/invoices';
import paymentRoutes from './routes/payments';
import projectRoutes from './routes/projects';
import inventoryRoutes from './routes/inventory';
import transactionRoutes from './routes/transactions';
import auditLogRoutes from './routes/audit-logs';
import systemLogRoutes from './routes/system-logs';
import esgMetricRoutes from './routes/esg-metrics';
import marketplaceRoutes from './routes/marketplace';
import bidRoutes from './routes/bids';
import weighingRoutes from './routes/weighing';
import mobileMoneyRoutes from './routes/mobile-money';
import complianceRoutes from './routes/compliance';

// Load environment variables
config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
export const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for correct IP addresses
app.set('trust proxy', 1);

// API Routes
const apiPrefix = process.env.API_PREFIX || '/api';

app.use(`${apiPrefix}/tasks`, taskRoutes);
app.use(`${apiPrefix}/invoices`, invoiceRoutes);
app.use(`${apiPrefix}/payments`, paymentRoutes);
app.use(`${apiPrefix}/projects`, projectRoutes);
app.use(`${apiPrefix}/inventory`, inventoryRoutes);
app.use(`${apiPrefix}/transactions`, transactionRoutes);
app.use(`${apiPrefix}/audit-logs`, auditLogRoutes);
app.use(`${apiPrefix}/system-logs`, systemLogRoutes);
app.use(`${apiPrefix}/esg-metrics`, esgMetricRoutes);
app.use(`${apiPrefix}/marketplace`, marketplaceRoutes);
app.use(`${apiPrefix}/bids`, bidRoutes);
app.use(`${apiPrefix}/weighing`, weighingRoutes);
app.use(`${apiPrefix}/mobile-money`, mobileMoneyRoutes);
app.use(`${apiPrefix}/compliance`, complianceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'PCS-B-LTD API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  // Join user-specific room
  socket.on('join', (data) => {
    if (data.userId) {
      socket.join(`user_${data.userId}`);
      logger.info(`User ${data.userId} joined room`);
    }
    if (data.organizationId) {
      socket.join(`org_${data.organizationId}`);
      logger.info(`User joined organization ${data.organizationId} room`);
    }
  });

  // Handle task updates
  socket.on('taskUpdate', (data) => {
    socket.to(`user_${data.assignedTo}`).emit('taskUpdated', data);
  });

  // Handle payment notifications
  socket.on('paymentUpdate', (data) => {
    socket.to(`org_${data.organizationId}`).emit('paymentUpdated', data);
  });

  // Handle marketplace bid notifications
  socket.on('watchListing', (data) => {
    if (data.listingId) {
      socket.join(`listing_${data.listingId}`);
    }
  });

  // Handle cooperative room for weighing/bid updates
  socket.on('joinCooperative', (data) => {
    if (data.cooperativeId) {
      socket.join(`cooperative_${data.cooperativeId}`);
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    
    // Connect to Redis
    await connectRedis();
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`PCS-B-LTD API server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Prefix: ${apiPrefix}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;