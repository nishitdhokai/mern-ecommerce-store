import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
const router = Router();
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { items, address, paymentMethod } = req.body || {};
    if (!Array.isArray(items) || !items.length || items.length > 50) return res.status(400).json({ message: 'Your cart is empty or invalid.' });
    const requiredAddress = ['fullName', 'email', 'phone', 'line1', 'city', 'state', 'postalCode', 'country'];
    if (!address || requiredAddress.some((field) => typeof address[field] !== 'string' || !address[field].trim())) return res.status(400).json({ message: 'Complete every delivery address field.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email.trim())) return res.status(400).json({ message: 'Enter a valid contact email.' });
    if (address.phone.trim().length < 7 || address.phone.trim().length > 24) return res.status(400).json({ message: 'Enter a valid phone number.' });
    if (!['card', 'upi', 'cod'].includes(paymentMethod)) return res.status(400).json({ message: 'Choose a payment method.' });
    const quantities = new Map();
    for (const item of items) { if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) return res.status(400).json({ message: 'Cart contains an invalid item.' }); quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity); }
    const products = await Product.find({ _id: { $in: [...quantities.keys()] } });
    if (products.length !== quantities.size) return res.status(400).json({ message: 'A product in your cart is no longer available.' });
    const subtotal = products.reduce((sum, product) => sum + product.price * quantities.get(product.id), 0);
    const shipping = subtotal >= 75 ? 0 : 8;
    const updated = [];
    try {
      for (const product of products) {
        const quantity = quantities.get(product.id);
        const result = await Product.updateOne({ _id: product._id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } });
        if (result.modifiedCount !== 1) throw Object.assign(new Error(`${product.title} has insufficient stock.`), { status: 409 });
        updated.push({ product, quantity });
      }
      const order = await Order.create({
        user: req.user._id,
        items: products.map((product) => ({ product: product._id, title: product.title, image: product.image, unitPrice: product.price, quantity: quantities.get(product.id) })),
        address: Object.fromEntries(requiredAddress.map((field) => [field, address[field].trim()])),
        paymentMethod,
        subtotal: Number(subtotal.toFixed(2)),
        shipping,
        total: Number((subtotal + shipping).toFixed(2)),
        status: 'demo-placed',
      });
      res.status(201).json({ orderId: order._id, subtotal: order.subtotal, shipping: order.shipping, total: order.total, paymentMethod: order.paymentMethod, message: 'Your demo order is placed. No payment was collected.' });
    } catch (err) {
      await Promise.all(updated.map(({ product, quantity }) => Product.updateOne({ _id: product._id }, { $inc: { stock: quantity } })));
      throw err;
    }
  } catch (err) { next(err); }
});
export default router;
