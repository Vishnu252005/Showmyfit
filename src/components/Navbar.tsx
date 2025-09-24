import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Store, Shield, Heart, ShoppingBag } from 'lucide-react';

interface NavbarProps {
  userRole?: 'user' | 'shop' | 'admin';
}

const Navbar: React.FC<NavbarProps> = ({ userRole = 'user' }) => {
  const location = useLocation();
  const [cartCount] = useState(3); // Mock cart count
  const [wishlistCount] = useState(5); // Mock wishlist count

  if (userRole === 'user') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-cream/95 backdrop-blur-lg border-t border-warm-200 z-50 shadow-lg">
        <div className="flex justify-around items-center py-3">
          <Link
            to="/"
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
              location.pathname === '/' 
                ? 'text-warm-800 bg-warm-100 scale-105' 
                : 'text-warm-500 hover:text-warm-700 hover:bg-warm-50'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Home</span>
          </Link>
          <Link
            to="/browse"
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
              location.pathname === '/browse' 
                ? 'text-warm-800 bg-warm-100 scale-105' 
                : 'text-warm-500 hover:text-warm-700 hover:bg-warm-50'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Search</span>
          </Link>
          <Link
            to="/wishlist"
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 relative ${
              location.pathname === '/wishlist' 
                ? 'text-warm-800 bg-warm-100 scale-105' 
                : 'text-warm-500 hover:text-warm-700 hover:bg-warm-50'
            }`}
          >
            <div className="relative">
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-warm-600 text-cream text-xs rounded-full flex items-center justify-center text-[10px] animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">Favorites</span>
          </Link>
          <Link
            to="/cart"
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 relative ${
              location.pathname === '/cart' 
                ? 'text-warm-800 bg-warm-100 scale-105' 
                : 'text-warm-500 hover:text-warm-700 hover:bg-warm-50'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-warm-600 text-cream text-xs rounded-full flex items-center justify-center text-[10px] animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">Cart</span>
          </Link>
          <Link
            to="/shop/auth"
            className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-300 ${
              location.pathname.includes('/shop') 
                ? 'text-warm-800 bg-warm-100 scale-105' 
                : 'text-warm-500 hover:text-warm-700 hover:bg-warm-50'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    );
  }

  // Top navigation for shop/admin
  return (
    <nav className="bg-cream/95 backdrop-blur-lg border-b border-warm-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-serif font-bold text-warm-900 tracking-wide hover:text-warm-700 transition-colors">
            VERVE THREADS
          </Link>
          
          <div className="flex items-center space-x-4">
            {userRole === 'shop' && (
              <>
                <Link
                  to="/shop/dashboard"
                  className="flex items-center text-warm-600 hover:text-warm-900 font-medium px-3 py-2 rounded-lg hover:bg-warm-100 transition-all duration-300"
                >
                  <Store className="w-5 h-5 mr-1" />
                  Dashboard
                </Link>
              </>
            )}
            
            {userRole === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className="flex items-center text-warm-600 hover:text-warm-900 font-medium px-3 py-2 rounded-lg hover:bg-warm-100 transition-all duration-300"
                >
                  <Shield className="w-5 h-5 mr-1" />
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;