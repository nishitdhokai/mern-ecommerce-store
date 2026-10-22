import { ArrowUpRight, Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
export default function ProductCard({ product, onQuickAdd }) {
  const { wishlist, toggleWishlist, addToCart } = useStore(); const liked = wishlist.some((item) => item._id === product._id);
  return <article className="product-card"><div className="product-image-wrap"><Link to={`/products/${product._id}`}><img className="product-image" src={product.image} alt={product.title} loading="lazy"/></Link>{product.badge && <span className="product-badge">{product.badge}</span>}<button className={`like-button ${liked ? 'liked' : ''}`} onClick={() => toggleWishlist(product)} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={17} fill={liked ? 'currentColor' : 'none'}/></button><button className="quick-add" onClick={() => { addToCart(product); onQuickAdd?.(product); }}>Add to cart <ArrowUpRight size={15}/></button></div><div className="product-meta"><div><Link to={`/products/${product._id}`} className="product-title">{product.title}</Link><p className="product-category">{product.category}</p></div><span className="product-price">${product.price.toFixed(2)}</span></div><div className="rating"><Star size={12} fill="currentColor"/><span>{product.rating?.toFixed(1) || '4.8'}</span></div></article>;
}
