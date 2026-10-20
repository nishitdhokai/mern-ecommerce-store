import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const products = [
  { title: 'Everyday Ceramic Set', description: 'Hand-finished stoneware for slow mornings and long dinners. A set of two mugs with a soft, tactile glaze.', price: 38, image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85', category: 'Home', badge: 'Bestseller', rating: 4.9, stock: 18 },
  { title: 'Sculpted Brass Earrings', description: 'Lightweight, sculptural brass hoops with a brushed finish. Made for everyday wear.', price: 52, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85', category: 'Accessories', badge: 'Handmade', rating: 4.8, stock: 14 },
  { title: 'Linen Market Tote', description: 'A roomy, durable carryall woven from washed European linen. Folds flat for easy everyday errands.', price: 44, image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85', category: 'Accessories', badge: 'New', rating: 4.7, stock: 24 },
  { title: 'Botanical Candle No. 04', description: 'A clean-burning soy candle with notes of cedar, fig leaf, and a little late-summer sun.', price: 29, image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=85', category: 'Home', badge: '', rating: 4.9, stock: 30 },
  { title: 'Daily Ritual Journal', description: 'A thoughtful place to keep your ideas. 192 pages of smooth, responsibly sourced paper with a linen cover.', price: 32, image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=85', category: 'Stationery', badge: '', rating: 4.8, stock: 21 },
  { title: 'Weekender Flask', description: 'Double-wall insulated stainless steel keeps your coffee warm and your water cold, wherever the day goes.', price: 36, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=85', category: 'Lifestyle', badge: 'Popular', rating: 4.6, stock: 16 },
  { title: 'Soft Form Catchall', description: 'A sculptural catchall tray for the little things that deserve a home. Cast in a warm, matte ceramic.', price: 26, image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85', category: 'Home', badge: '', rating: 4.7, stock: 12 },
  { title: 'Field Notes Set', description: 'Three pocket-sized notebooks with a sturdy recycled cover for thoughts on the go.', price: 18, image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85', category: 'Stationery', badge: '', rating: 4.8, stock: 40 },
];
try {
  await mongoose.connect(process.env.MONGO_URI);
  const operations = products.map((product) => ({
    updateOne: {
      filter: { title: product.title },
      update: { $set: product },
      upsert: true,
    },
  }));
  await Product.bulkWrite(operations);
  console.log(`Synced ${products.length} sample products.`);
}
catch (error) { console.error(error); process.exitCode = 1; }
finally { await mongoose.disconnect(); }
