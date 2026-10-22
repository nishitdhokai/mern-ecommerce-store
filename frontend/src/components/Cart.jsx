import { ArrowLeft, ArrowUpRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';

const money = (n) => `$${Number(n).toFixed(2)}`;
const initialAddress = { fullName: '', email: '', phone: '', line1: '', city: '', state: '', postalCode: '', country: '' };

export default function Cart({ notify }) {
  const { cart, updateQuantity, removeFromCart, user, clearCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [address, setAddress] = useState(() => ({ ...initialAddress, fullName: user?.name || '', email: user?.email || '' }));
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const navigate = useNavigate();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;

  if (!cart.length) return <main className="simple-page"><div className="empty-cart"><div className="empty-icon"><ShoppingBag/></div><p className="eyebrow">A LITTLE SPACE FOR SOMETHING GOOD</p><h1>Your bag is <em>waiting.</em></h1><p>There’s nothing in here just yet. The good things are just a scroll away.</p><Link to="/" className="button button-dark">Explore the collection <ArrowUpRight size={15}/></Link></div></main>;

  function beginCheckout() {
    if (!user) return navigate('/login', { state: { from: '/cart' } });
    setError('');
    setCheckoutOpen(true);
  }

  async function placeOrder(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await api('/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item._id, quantity: item.quantity })),
          address,
          paymentMethod,
        }),
      });
      clearCart();
      notify(`Order placed. Reference ${String(result.orderId).slice(-8)}. No payment was collected.`);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Could not place the order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return <main className="simple-page cart-page">
    <Link className="back-link" to="/"><ArrowLeft size={15}/> Keep looking</Link>
    <div className="cart-heading"><div><p className="eyebrow">THOUGHTFULLY PICKED</p><h1>Your <em>bag.</em></h1></div><span>{cart.length} {cart.length === 1 ? 'piece' : 'pieces'}</span></div>
    <div className="cart-layout">
      <section className="cart-items">
        {cart.map((item) => <article className="cart-item" key={item._id}>
          <Link to={`/products/${item._id}`}><img src={item.image} alt={item.title}/></Link>
          <div className="cart-item-info"><span className="product-category">{item.category}</span><Link to={`/products/${item._id}`} className="product-title">{item.title}</Link><span className="product-price">{money(item.price)}</span><div className="quantity-control"><button onClick={() => updateQuantity(item._id, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => updateQuantity(item._id, item.quantity + 1)} aria-label="Increase quantity"><Plus size={13}/></button></div></div>
          <div className="cart-item-end"><strong>{money(item.price * item.quantity)}</strong><button className="remove-button" onClick={() => removeFromCart(item._id)} aria-label={`Remove ${item.title}`}><Trash2 size={16}/></button></div>
        </article>)}
      </section>
      <aside className="order-summary">
        <p className="eyebrow">A QUICK RECAP</p><h2>Order summary</h2>
        <div className="summary-line"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <div className="summary-line"><span>Shipping</span><span>{shipping ? money(shipping) : 'On us'}</span></div>
        {shipping > 0 && <p className="shipping-hint">Spend {money(75 - subtotal)} more for complimentary shipping.</p>}
        <div className="summary-total"><strong>Total</strong><strong>{money(subtotal + shipping)}</strong></div>
        {!checkoutOpen ? <button onClick={beginCheckout} className="button button-dark checkout-button">Continue to checkout <ArrowUpRight size={15}/></button> : <form className="checkout-form" onSubmit={placeOrder}>
          <h3>Delivery details</h3>
          <div className="checkout-fields">
            {[
              ['fullName', 'Full name', 'text', 'Your name'], ['email', 'Email', 'email', 'you@example.com'],
              ['phone', 'Phone', 'tel', 'Phone number'], ['line1', 'Street address', 'text', 'House, street, area'],
              ['city', 'City', 'text', 'City'], ['state', 'State', 'text', 'State'],
              ['postalCode', 'Postal code', 'text', 'Postal code'], ['country', 'Country', 'text', 'Country'],
            ].map(([key, label, type, placeholder]) => <label key={key}>{label}<input required type={type} autoComplete={key === 'line1' ? 'street-address' : key} maxLength={120} placeholder={placeholder} value={address[key]} onChange={(e) => setAddress((current) => ({ ...current, [key]: e.target.value }))}/></label>)}
          </div>
          <fieldset className="payment-options"><legend>Payment method</legend>
            <label><input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={(e) => setPaymentMethod(e.target.value)}/> Cash on delivery <small>Demo</small></label>
            <label><input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)}/> Card <small>Simulated</small></label>
            <label><input type="radio" name="paymentMethod" value="upi" checked={paymentMethod === 'upi'} onChange={(e) => setPaymentMethod(e.target.value)}/> UPI <small>Simulated</small></label>
          </fieldset>
          <p className="demo-note">This is a classroom demo. No card/UPI details or real payment are collected.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="button button-dark checkout-button">{loading ? 'Placing your order…' : `Place demo order · ${money(subtotal + shipping)}`} <ArrowUpRight size={15}/></button>
          <button type="button" className="checkout-cancel" onClick={() => { setCheckoutOpen(false); setError(''); }}>Back to bag</button>
        </form>}
        {!checkoutOpen && error && <p className="form-error" role="alert">{error}</p>}
        {!checkoutOpen && <p className="demo-note">Checkout is simulated. No real payment is collected.</p>}
      </aside>
    </div>
  </main>;
}
