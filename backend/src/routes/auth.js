import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const issueToken = (user) => jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '7d', issuer: 'northstar-market' });
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) return res.status(400).json({ message: 'Name must be between 2 and 80 characters.' });
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ message: 'Enter a valid email address.' });
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });
    if (await User.exists({ email: email.toLowerCase().trim() })) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    res.status(201).json({ token: issueToken(user), user: publicUser(user) });
  } catch (err) { if (err.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' }); next(err); }
});

async function login(req, res, next, adminOnly = false) {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
    if (adminOnly && user.role !== 'admin') return res.status(401).json({ message: 'Email or password is incorrect.' });
    res.json({ token: issueToken(user), user: publicUser(user) });
  } catch (err) { next(err); }
}
router.post('/login', (req, res, next) => login(req, res, next));
router.post('/admin/login', (req, res, next) => login(req, res, next, true));

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
