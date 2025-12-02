import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import promMiddleware from 'express-prometheus-middleware';

// Импорт роутов
import authRoutes from './routes/auth/register.js';
import loginRoutes from './routes/auth/login.js';
import profileRoutes from './routes/profile/update.js';
import donateRoutes from './routes/donate/create.js';
import adminRoutes from './routes/admin/dashboard.js';
import referralRoutes from './routes/referral/system.js';
import apiRoutes from './routes/api/index.js';

// Импорт утилит
import logger from './utils/logger.js';
import connectDB from './config/database.js';
import securityConfig from './config/security.js';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Подключение к БД
connectDB();

// Безопасность
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", process.env.FRONTEND_URL, "wss://*"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Ограничение запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // 100 запросов с одного IP
  message: 'Слишком много запросов с этого IP, попробуйте позже.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Защита от атак
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(compression());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Мониторинг Prometheus
app.use(promMiddleware({
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 1.5],
  requestLengthBuckets: [512, 1024, 5120, 10240],
  responseLengthBuckets: [512, 1024, 5120, 10240]
}));

// Swagger документация
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BloodyButterfly API',
      version: '2026.1.0',
      description: 'Документация API для новогоднего проекта BloodyButterfly'
    },
    servers: [{ url: process.env.API_URL }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/**/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Статические файлы
app.use('/uploads', express.static('uploads'));
app.use('/assets', express.static('assets'));

// Роуты
app.use('/api/auth/register', authRoutes);
app.use('/api/auth/login', loginRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/donate', donateRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});

// 404 обработчик
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// WebSocket соединения
io.on('connection', (socket) => {
  logger.info(`New socket connection: ${socket.id}`);
  
  socket.on('join:user', (userId) => {
    socket.join(`user:${userId}`);
    socket.join('online');
    
    io.to('online').emit('user:online', {
      userId,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('donate:new', (data) => {
    io.emit('donate:notification', {
      ...data,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('admin:alert', (data) => {
    io.to('admin').emit('admin:notification', data);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`📊 Metrics: http://localhost:${PORT}/metrics`);
});

// Обработка graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  httpServer.close(() => {
    logger.info('HTTP server closed.');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

export { app, io };
