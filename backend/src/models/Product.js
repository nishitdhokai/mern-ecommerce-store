import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  description: { type: String, required: true, maxlength: 2000 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  category: { type: String, required: true, index: true },
  badge: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 5, default: 4.8 },
  stock: { type: Number, min: 0, default: 20 },
}, { timestamps: true });
productSchema.index({ title: 'text', description: 'text', category: 'text' });
export default mongoose.model('Product', productSchema);
