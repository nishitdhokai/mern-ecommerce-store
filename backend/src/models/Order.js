import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    image: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  }],
  address: {
    fullName: { type: String, required: true }, email: { type: String, required: true },
    phone: { type: String, required: true }, line1: { type: String, required: true },
    city: { type: String, required: true }, state: { type: String, required: true },
    postalCode: { type: String, required: true }, country: { type: String, required: true },
  },
  paymentMethod: { type: String, enum: ['card', 'upi', 'cod'], required: true },
  subtotal: { type: Number, required: true, min: 0 },
  shipping: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['demo-placed'], default: 'demo-placed' },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);
