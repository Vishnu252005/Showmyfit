import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ShopAuth from './pages/ShopAuth';
import ShopDashboard from './pages/ShopDashboard';
import UserBrowse from './pages/UserBrowse';
import AdminPanel from './pages/AdminPanel';
import { AppProvider } from './context/AppContext';

// Simple placeholder components for new pages
const CartPage = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-warm-900 mb-4">Shopping Cart</h1>
      <p className="text-warm-600">Cart functionality coming soon!</p>
    </div>
  </div>
);

const WishlistPage = () => (
  <div className="min-h-screen bg-cream flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-warm-900 mb-4">Your Favorites</h1>
      <p className="text-warm-600">Wishlist functionality coming soon!</p>
    </div>
  </div>
);

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-cream font-sans">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop/auth" element={<ShopAuth />} />
            <Route path="/shop/dashboard" element={<ShopDashboard />} />
            <Route path="/browse" element={<UserBrowse />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;