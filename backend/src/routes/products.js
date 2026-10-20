import { Router } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
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
export default router;
