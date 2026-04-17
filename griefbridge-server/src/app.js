import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import compress from 'compression';
import { createServer } from 'http';
import { setupDNS } from './config/dns.config.js';
import authRoutes from './routes/auth.routes.js';
import casesRoutes from './routes/cases.routes.js';
import documentsRoutes from './routes/documents.routes.js';
import formsRoutes from './routes/forms.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import rssRoutes from './routes/rss.routes.js';
import experiencesRoutes from './routes/experiences.routes.js';
import chatRoutes from './routes/chat.routes.js';
import authMiddleware from './middleware/auth.middleware.js';
import errorHandler from './middleware/error.middleware.js';
import { startDeadlineChecker } from './jobs/deadlineChecker.job.js';
import { initializeSockets } from './services/socket.service.js';

dotenv.config();

const app = express();

// Add compression middleware for responses
app.use(compress());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Parse multiple CORS origins from environment variable
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/cases', authMiddleware, casesRoutes);
app.use('/api/documents', authMiddleware, documentsRoutes);
app.use('/api/forms', authMiddleware, formsRoutes);
app.use('/api/notifications', authMiddleware, notificationsRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/experiences', experiencesRoutes);
app.use('/api/rss', rssRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function connectDB() {
  try {
    // Setup custom DNS servers
    setupDNS();
    
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      retryWrites: true
    });
    console.log('✓ MongoDB connected successfully');
    startDeadlineChecker();
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    console.error('Note: If DNS resolution fails, check your network connectivity.');
    console.error('The app will continue running but database features will be unavailable.');
    // Don't exit - let the app run anyway for development
  }
}

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  
  // Create HTTP server for Socket.io support
  const httpServer = createServer(app);
  
  // Initialize Socket.io
  initializeSockets(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`GriefBridge API server running on port ${PORT}`);
    console.log(`✓ WebSocket support enabled for real-time notifications`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
