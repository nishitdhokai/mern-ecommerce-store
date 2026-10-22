import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import wishlistRoutes from './routes/wishlist.js';
import checkoutRoutes from './routes/checkout.js';
import User from './models/User.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error('Origin not allowed by CORS')); }, methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '20kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('tiny'));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }), authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/checkout', checkoutRoutes);
app.get('/', (_req, res) => res.json({
  name: 'Northstar Market API',
  status: 'ok',
  endpoints: ['/api/health', '/api/products'],
}));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ message: err.status ? err.message : 'Something went wrong. Please try again.' }); });

const port = process.env.PORT || 5000;
if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
await mongoose.connect(process.env.MONGO_URI);
console.log('Connected to MongoDB');
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminEmail || adminPassword) {
  if (!adminEmail || !adminPassword || adminPassword.length < 12) throw new Error('Set both ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters.');
  let admin = await User.findOne({ email: adminEmail }).select('+password');
  if (!admin) admin = new User({ email: adminEmail, name: process.env.ADMIN_NAME?.trim() || 'Store Administrator' });
  admin.role = 'admin';
  admin.password = adminPassword;
  if (process.env.ADMIN_NAME?.trim()) admin.name = process.env.ADMIN_NAME.trim();
  await admin.save();
  console.log('Administrator account configured');
}
app.listen(port, () => console.log(`API listening on ${port}`));
