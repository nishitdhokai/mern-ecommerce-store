import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (typeof req.query.category === 'string' && req.query.category !== 'All') filter.category = req.query.category;
    if (typeof req.query.search === 'string' && req.query.search.trim()) filter.$text = { $search: req.query.search.trim().slice(0, 80) };
    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ products });
  } catch (err) { next(err); }
});
router.get('/:id', async (req, res, next) => {
  try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' }); const product = await Product.findById(req.params.id).lean(); if (!product) return res.status(404).json({ message: 'Product not found.' }); res.json({ product }); }
  catch (err) { next(err); }
});
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { title, description, price, image, category, badge = '', stock = 0 } = req.body || {};
    if (typeof title !== 'string' || title.trim().length < 2 || title.trim().length > 140) return res.status(400).json({ message: 'Enter a product title between 2 and 140 characters.' });
    if (typeof description !== 'string' || !description.trim() || description.length > 2000) return res.status(400).json({ message: 'Enter a product description.' });
    if (!Number.isFinite(price) || price < 0 || typeof image !== 'string' || !/^https:\/\//i.test(image) || typeof category !== 'string' || !category.trim()) return res.status(400).json({ message: 'Enter a valid price, secure image URL, and category.' });
    if (!Number.isInteger(stock) || stock < 0 || stock > 100000) return res.status(400).json({ message: 'Stock must be a whole number from 0 to 100000.' });
    const product = await Product.create({ title: title.trim(), description: description.trim(), price, image, category: category.trim(), badge: String(badge).slice(0, 40), stock });
    res.status(201).json({ product });
  } catch (err) { next(err); }
});
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID.' });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.status(204).end();
  } catch (err) { next(err); }
});
export default router;
