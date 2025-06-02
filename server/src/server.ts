import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './interfaces/http/routes/auth.routes';
import adminRoutes from './interfaces/http/routes/admin.routes';
import articleRoutes from './interfaces/http/routes/article.route';
import tagRoutes from './interfaces/http/routes/tag.routes';
import userRoutes from './interfaces/http/routes/user.route'
import env from './config/env';
import morgan from 'morgan';
import { logger } from './utils/logger';

const app = express();
const PORT = env.PORT;
const MONGODB_URI = env.MONGODB_URI;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/user', userRoutes )

// Connect to DB 
mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.green('DB_STATUS', 'Connected to MongoDB');
    app.listen(PORT, () => {
      logger.green('SERVER', `Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    logger.red('DB_ERROR', 'MongoDB connection error: ' + error.message);
    process.exit(1);
  }); 