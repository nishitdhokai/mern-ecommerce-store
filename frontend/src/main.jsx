import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import Auth from './components/Auth';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import ProductDetail from './components/ProductDetail';
import './styles.css';
function Protected({ children }) { const { user, authLoading } = useStore(); const location = useLocation(); if (authLoading) return <main className="simple-page"><div className="loading-detail"/></main>; return user ? children : <Navigate to="/login" state={{ from: location.pathname }} replace/>; }
function App() { const [search, setSearch] = React.useState(''); const [toast, setToast] = React.useState(''); const location = useLocation(); const notify = (message) => { setToast(message); window.clearTimeout(window.toastTimer); window.toastTimer = window.setTimeout(() => setToast(''), 3000); }; React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]); return <><Navbar onSearch={setSearch}/><Routes><Route path="/" element={<ProductList search={search} notify={notify}/>}/><Route path="/login" element={<Auth mode="login"/>}/><Route path="/signup" element={<Auth mode="signup"/>}/><Route path="/cart" element={<Cart notify={notify}/>}/><Route path="/wishlist" element={<Wishlist notify={notify}/>}/><Route path="/products/:id" element={<ProductDetail notify={notify}/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>{toast && <div className="toast" role="status">{toast}</div>}</>; }
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><StoreProvider><BrowserRouter><App/></BrowserRouter></StoreProvider></React.StrictMode>);
