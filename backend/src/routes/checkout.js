import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import Product from '../models/Product.js';
const router = Router();
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || !items.length || items.length > 50) return res.status(400).json({ message: 'Your cart is empty or invalid.' });
    const quantities = new Map();
    for (const item of items) { if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) return res.status(400).json({ message: 'Cart contains an invalid item.' }); quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity); }
    const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
    if (products.length !== quantities.size) return res.status(400).json({ message: 'A product in your cart is no longer available.' });
    const total = products.reduce((sum, product) => { const quantity = quantities.get(product.id); if (quantity > product.stock) throw Object.assign(new Error(`${product.title} does not have enough stock.`), { status: 409 }); return sum + product.price * quantity; }, 0);
    const shipping = total >= 75 ? 0 : 8;
    res.status(201).json({ orderId: `DEMO-${Date.now().toString(36).toUpperCase()}`, subtotal: Number(total.toFixed(2)), shipping, total: Number((total + shipping).toFixed(2)), message: 'Demo checkout complete. No payment was collected.' });
  } catch (err) { next(err); }
});
export default router;
