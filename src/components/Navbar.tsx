import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Store, Shield, Heart, ShoppingBag, Menu, X, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  userRole?: 'user' | 'shop' | 'admin';
}

const Navbar: React.FC<NavbarProps> = ({ userRole = 'user' }) => {
  const location = useLocation();
  const [cartCount] = useState(3); // Mock cart count
  const [wishlistCount] = useState(5); // Mock wishlist count
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, signOut } = useAuth();

  if (userRole === 'user') {
    return (
      <>
        {/* Top Navigation Bar - Flipkart Style */}
        <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left Side - Hamburger Menu + Logo */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  aria-label="Open sidebar menu"
                >
                  <Menu className="w-6 h-6 text-gray-700" />
                </button>
                <Link to="/" className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-blue-600">Showmyfit</div>
                  <div className="text-xs text-yellow-500 font-medium">Explore Plus</div>
                </Link>
              </div>

              {/* Center - Search Bar */}
              <div className="flex-1 max-w-2xl mx-4 md:mx-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for Products, Brands and More"
                    className="w-full pl-3 md:pl-4 pr-4 py-2 md:py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs md:text-sm"
                  />
                  <button 
                    className="absolute right-0 top-0 h-full px-4 md:px-6 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>

              {/* Right Side - Login, Cart, Become a Seller */}
              <div className="flex items-center space-x-3 md:space-x-6">
                {currentUser ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700 font-medium text-xs md:text-sm hidden sm:block">
                      Hi, {currentUser.displayName || currentUser.email}
                    </span>
                    <button
                      onClick={signOut}
                      className="text-gray-700 hover:text-blue-600 font-medium text-xs md:text-sm transition-colors flex items-center space-x-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:block">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium text-xs md:text-sm transition-colors hidden sm:block"
                  >
                    Login
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="relative text-gray-700 hover:text-blue-600 font-medium text-xs md:text-sm transition-colors flex items-center space-x-1"
                >
                  <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:block">Cart</span>
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/shop/auth"
                  className="text-gray-700 hover:text-blue-600 font-medium text-xs md:text-sm transition-colors hidden lg:block"
                >
                  Become a Seller
                </Link>
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
        <div className="flex justify-between items-center h-16">
            {/* Left Side - Hamburger Menu + Logo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold text-blue-600">Showmyfit</div>
                <div className="text-xs text-yellow-500 font-medium">Explore Plus</div>
          </Link>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for Products, Brands and More"
                  className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <button 
                  className="absolute right-0 top-0 h-full px-6 bg-blue-600 text-white rounded-sm hover:bg-blue-700 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Side - Role-specific actions */}
            <div className="flex items-center space-x-6">
            {userRole === 'shop' && (
                <Link
                  to="/shop/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors flex items-center space-x-1"
                >
                  <Store className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
            )}
            
            {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors flex items-center space-x-1"
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