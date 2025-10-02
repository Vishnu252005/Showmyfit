import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Store, Shield, Heart, ShoppingBag, Bookmark, Menu, X, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import ShowMyFITLogo from '../common/ShowMyFITLogo';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

interface NavbarProps {
  userRole?: 'user' | 'shop' | 'admin';
}

const Navbar: React.FC<NavbarProps> = ({ userRole = 'user' }) => {
  const location = useLocation();
  const [wishlistCount] = useState(5); // Mock wishlist count
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Safe context access with fallbacks
  let currentUser = null;
  let signOut = () => {};
  let loading = false;
  let getCartItemCount = () => 0;
  let showAddNotification = false;
  
  try {
    const auth = useAuth();
    currentUser = auth.currentUser;
    signOut = auth.signOut;
    loading = auth.loading;
    console.log('🔐 Navbar: Auth context loaded, loading:', loading, 'user:', currentUser ? currentUser.uid : 'null');
  } catch (error) {
    console.warn('🔐 Navbar: Auth context not available:', error);
  }
  
  try {
    const cart = useCart();
    getCartItemCount = cart.getCartItemCount;
    showAddNotification = cart.showAddNotification;
  } catch (error) {
    console.warn('Cart context not available in Navbar:', error);
  }

  // Don't render if auth is still loading
  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse"></div>
              <div className="w-32 h-8 bg-white/20 rounded-lg animate-pulse"></div>
            </div>
            <div className="w-24 h-8 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  if (userRole === 'user') {
    return (
      <>
        {/* Top Navigation Bar - Enhanced Design */}
        <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 z-40 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Navigation Row */}
            <div className="flex justify-between items-center h-16">
              {/* Left Side - Hamburger Menu + Logo */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Open sidebar menu"
                >
                  <Menu className="w-6 h-6 text-white" />
                </button>
                <Link to="/" className="flex items-center space-x-2">
                  <ShowMyFITLogo size="md" className="text-white" />
                </Link>
              </div>

              {/* Right Side - User Actions */}
              <div className="flex items-center space-x-4">
                {currentUser ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-medium text-sm hidden sm:block">
                      Hi, {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={signOut}
                      className="text-white hover:text-yellow-300 font-medium text-sm transition-colors flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/20"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:block">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-white hover:text-yellow-300 font-medium text-sm transition-colors px-4 py-2 rounded-lg hover:bg-white/20"
                  >
                    Login
                  </Link>
                )}
                <Link
                  to="/wishlist"
                  className="relative text-white hover:text-yellow-300 font-medium text-sm transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/20"
                >
                  <Heart className="w-5 h-5" />
                  <span className="hidden md:block">Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 text-gray-900 text-xs rounded-full flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="relative text-white hover:text-yellow-300 font-medium text-sm transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/20"
                >
                  <Bookmark className="w-5 h-5" />
                  <span className="hidden md:block">Reserved</span>
                  {getCartItemCount() > 0 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 text-gray-900 text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      showAddNotification ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                    }`}>
                      {getCartItemCount()}
                    </span>
                  )}
                </Link>
                <Link
                  to="/shop/auth"
                  className="bg-white/20 text-white font-medium text-sm transition-colors px-4 py-2 rounded-lg hover:bg-white/30 hidden lg:block border border-white/30"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          </div>
          
          {/* Search Bar Row */}
          <div className="bg-white/10 backdrop-blur-sm border-t border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-center">
                <div className="w-full max-w-2xl">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for Products, Brands and More"
                      className="w-full pl-4 pr-16 py-3 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-transparent text-sm shadow-lg bg-white/90 backdrop-blur-sm placeholder-gray-600"
                    />
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors border border-white/30"
                      aria-label="Search"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          userRole={userRole}
        />
      </>
    );
  }

  // Top navigation for shop/admin
  return (
    <>
      <nav className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Navigation Row */}
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Hamburger Menu + Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <ShowMyFITLogo size="md" className="text-white" />
              </Link>
            </div>

            {/* Right Side - Role-specific actions */}
            <div className="flex items-center space-x-4">
              {userRole === 'shop' && (
                <Link
                  to="/shop/dashboard"
                  className="text-white hover:text-yellow-300 font-medium text-sm transition-colors flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20"
                >
                  <Store className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              )}
              
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="text-white hover:text-yellow-300 font-medium text-sm transition-colors flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        userRole={userRole}
      />
    </>
  );
};

export default Navbar;