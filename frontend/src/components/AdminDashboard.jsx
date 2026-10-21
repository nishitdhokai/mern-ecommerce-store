import { useEffect, useState } from 'react';
import { ArrowUpRight, LogOut, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useStore } from '../context/StoreContext';

const emptyProduct = { title: '', description: '', price: '', image: '', category: 'Home', badge: '', stock: '10' };

export default function AdminDashboard() {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function loadProducts() {
    try { const result = await api('/products'); setProducts(result.products); }
    catch (err) { setError(err.message); }
  }

  useEffect(() => { loadProducts(); }, []);

  async function addProduct(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await api('/products', { method: 'POST', body: JSON.stringify({ ...form, price: Number(form.price), stock: Number(form.stock) }) });
      setProducts((items) => [result.product, ...items]); setForm(emptyProduct);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function deleteProduct(product) {
    setError('');
    try { await api(`/products/${product._id}`, { method: 'DELETE' }); setProducts((items) => items.filter((item) => item._id !== product._id)); }
    catch (err) { setError(err.message); }
  }

  function signOut() { logout(); navigate('/admin/login', { replace: true }); }

  return <main className="simple-page admin-page">
    <div className="admin-heading"><div><p className="eyebrow">NORTHSTAR MARKET · ADMIN</p><h1>Store <em>dashboard.</em></h1><p className="section-subtitle">Signed in as {user.name}</p></div><button className="button button-outline" onClick={signOut}><LogOut size={15}/> Sign out</button></div>
    <div className="admin-layout">
      <form className="admin-form" onSubmit={addProduct}>
        <p className="eyebrow">CATALOG</p><h2>Add a product</h2>
        <label>Product name<input required maxLength="140" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/></label>
        <label>Description<textarea required maxLength="2000" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}/></label>
        <label>Image URL<input required type="url" placeholder="https://…" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}/></label>
        <div className="admin-form-row"><label>Price (USD)<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}/></label><label>Stock<input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}/></label></div>
        <div className="admin-form-row"><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['Home', 'Accessories', 'Stationery', 'Lifestyle'].map((category) => <option key={category}>{category}</option>)}</select></label><label>Badge<input maxLength="40" placeholder="Optional" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}/></label></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-dark admin-submit" disabled={busy}><Plus size={15}/>{busy ? 'Adding…' : 'Add product'}</button>
      </form>
      <section className="admin-catalog"><div className="admin-catalog-heading"><div><p className="eyebrow">LIVE CATALOG</p><h2>{products.length} products</h2></div><Link className="text-link" to="/">View storefront <ArrowUpRight size={15}/></Link></div>
        {products.map((product) => <article className="admin-product" key={product._id}><img src={product.image} alt=""/><div><strong>{product.title}</strong><span>{product.category} · ${product.price.toFixed(2)} · {product.stock} in stock</span></div><button className="remove-button" onClick={() => deleteProduct(product)} aria-label={`Delete ${product.title}`}><Trash2 size={16}/></button></article>)}
      </section>
    </div>
  </main>;
}
