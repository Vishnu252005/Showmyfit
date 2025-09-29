import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Store, Shield, Heart, ShoppingBag, Menu, X, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

interface NavbarProps {
  userRole?: 'user' | 'shop' | 'admin';
}

const Navbar: React.FC<NavbarProps> = ({ userRole = 'user' }) => {
  const location = useLocation();
  const [wishlistCount] = useState(5); // Mock wishlist count
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, signOut } = useAuth();
  const { getCartItemCount, showAddNotification } = useCart();

  if (userRole === 'user') {
    return (
      <>
        {/* Top Navigation Bar - Enhanced Design */}
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Navigation Row */}
            <div className="flex justify-between items-center h-16">
              {/* Left Side - Hamburger Menu + Logo */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Open sidebar menu"
                >
                  <Menu className="w-6 h-6 text-gray-700" />
                </button>
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <div className="text-xl font-bold text-gray-900">Showmyfit</div>
                </Link>
              </div>

              {/* Right Side - User Actions */}
              <div className="flex items-center space-x-4">
                {currentUser ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700 font-medium text-sm hidden sm:block">
                      Hi, {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={signOut}
                      className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:block">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Login
                  </Link>
                )}
                <Link
                  to="/wishlist"
                  className="relative text-gray-700 hover:text-red-600 font-medium text-sm transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <Heart className="w-5 h-5" />
                  <span className="hidden md:block">Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="hidden md:block">Cart</span>
                  {getCartItemCount() > 0 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                      showAddNotification ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}>
                      {getCartItemCount()}
                    </span>
                  )}
                </Link>
                <Link
                  to="/shop/auth"
                  className="bg-blue-600 text-white font-medium text-sm transition-colors px-4 py-2 rounded-lg hover:bg-blue-700 hidden lg:block"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          </div>
          
          {/* Search Bar Row */}
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-center">
                <div className="w-full max-w-2xl">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for Products, Brands and More"
                      className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
                    />
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Navigation Row */}
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Hamburger Menu + Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div className="text-xl font-bold text-gray-900">Showmyfit</div>
              </Link>
            </div>

            {/* Right Side - Role-specific actions */}
            <div className="flex items-center space-x-4">
              {userRole === 'shop' && (
                <Link
                  to="/shop/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <Store className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              )}
              
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>
          
          {/* Search Bar Row */}
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-center">
                <div className="w-full max-w-2xl">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for Products, Brands and More"
                      className="w-full pl-4 pr-16 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
                    />
                    <button 
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      aria-label="Search"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
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
};

export default Navbar;