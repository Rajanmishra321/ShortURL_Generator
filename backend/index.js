import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import linkRoutes from './routes/linkRoutes.js';
import { redirect } from './controllers/linkController.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('✅ Server is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/:shortCode', redirect);

app.set('trust proxy', true);

connectDB()

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});
