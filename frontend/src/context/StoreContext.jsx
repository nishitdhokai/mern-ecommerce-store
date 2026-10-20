import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setToken } from '../services/api';
const StoreContext = createContext(null);
const load = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } };
export function StoreProvider({ children }) {
  const [user, setUser] = useState(null); const [cart, setCart] = useState(load('northstar_cart')); const [wishlist, setWishlist] = useState(load('northstar_wishlist')); const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem('northstar_token')));
  useEffect(() => { localStorage.setItem('northstar_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('northstar_wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { if (!localStorage.getItem('northstar_token')) return; api('/auth/me').then(({ user }) => setUser(user)).catch(() => { setToken(null); setUser(null); }).finally(() => setAuthLoading(false)); }, []);
  const signIn = (payload) => { setToken(payload.token); setUser(payload.user); setAuthLoading(false); };
  const logout = () => { setToken(null); setUser(null); };
  const addToCart = (product) => setCart((items) => { const current = items.find((item) => item._id === product._id); return current ? items.map((item) => item._id === product._id ? { ...item, quantity: Math.min(item.quantity + 1, 20) } : item) : [...items, { ...product, quantity: 1 }]; });
  const updateQuantity = (id, quantity) => setCart((items) => quantity < 1 ? items.filter((item) => item._id !== id) : items.map((item) => item._id === id ? { ...item, quantity: Math.min(quantity, 20) } : item));
  const removeFromCart = (id) => setCart((items) => items.filter((item) => item._id !== id));
  const toggleWishlist = (product) => setWishlist((items) => items.some((item) => item._id === product._id) ? items.filter((item) => item._id !== product._id) : [...items, product]);
  const value = useMemo(() => ({ user, cart, wishlist, authLoading, signIn, logout, addToCart, updateQuantity, removeFromCart, toggleWishlist, clearCart: () => setCart([]) }), [user, cart, wishlist, authLoading]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() { return useContext(StoreContext); }
