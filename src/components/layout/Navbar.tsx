import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Store, Shield, Heart, Bookmark, Menu, LogOut, TrendingUp, Package } from 'lucide-react';
import Sidebar from './Sidebar';
import ShowMyFITLogo from '../common/ShowMyFITLogo';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface NavbarProps {
  userRole?: 'user' | 'shop' | 'admin';
}

const Navbar: React.FC<NavbarProps> = ({ userRole = 'user' }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch product suggestions from Firebase
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoadingSuggestions(true);
      try {
        // Fetch products from Firebase
        const productsQuery = query(collection(db, 'products'));
        const snapshot = await getDocs(productsQuery);
        
        const allProducts: any[] = [];
        snapshot.docs.forEach((doc) => {
          const productData = doc.data();
          if (productData.status === 'active') {
            allProducts.push({
              id: doc.id,
              ...productData
            });
          }
        });

        // Filter products based on search query
        const filtered = allProducts.filter(product => {
          const searchLower = searchQuery.toLowerCase();
          return (
            product.name.toLowerCase().includes(searchLower) ||
            product.brand?.toLowerCase().includes(searchLower) ||
            product.category?.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower)
          );
        }).slice(0, 8); // Limit to 8 suggestions

        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle search functionality
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear search after navigation
      setShowSuggestions(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleSuggestionClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };
  
  // Safe context access with fallbacks
  let currentUser = null;
  let signOut = () => {};
  let loading = false;
  let getCartItemCount = () => 0;
  let showAddNotification = false;
  let getWishlistCount = () => 0;
  
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
  
  try {
    const wishlist = useWishlist();
    getWishlistCount = wishlist.getWishlistCount;
    console.log('Wishlist context loaded successfully');
  } catch (error) {
    console.warn('Wishlist context not available in Navbar:', error);
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
        {/* Top Navigation Bar - Diwali Festival Design */}
        <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 z-40 shadow-lg">
          {/* Diwali Sparkles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-2 left-20 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
            <div className="absolute top-3 right-32 w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-4 left-1/2 w-2.5 h-2.5 bg-red-300 rounded-full animate-pulse delay-2000"></div>
            <div className="absolute top-2 right-16 w-1 h-1 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-3 left-1/3 w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse delay-1500"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Navigation Row */}
            <div className="flex justify-between items-center h-16">
              {/* Left Side - Hamburger Menu + Logo */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-yellow-300/30 rounded-lg transition-colors"
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
                      className="text-white hover:text-yellow-200 font-medium text-sm transition-colors flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-yellow-300/30"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:block">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-white hover:text-yellow-200 font-medium text-sm transition-colors px-4 py-2 rounded-lg hover:bg-yellow-300/30"
                  >
                    Login
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="relative text-white hover:text-yellow-200 font-medium text-sm transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-yellow-300/30"
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
                  to="/wishlist"
                  className="relative text-white hover:text-yellow-200 font-medium text-sm transition-colors flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-yellow-300/30"
                >
                  <Heart className="w-5 h-5" />
                  <span className="hidden md:block">Wishlist</span>
                  {getWishlistCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-400 text-gray-900 text-xs rounded-full flex items-center justify-center font-bold">
                      {getWishlistCount()}
                    </span>
                  )}
                </Link>
                <Link
                  to="/shop/auth"
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-medium text-sm transition-colors px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-600 hidden lg:block border-2 border-yellow-300 shadow-md"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          </div>
          
          {/* Search Bar Row - Diwali Theme */}
          <div className="bg-gradient-to-r from-yellow-300/20 via-orange-300/20 to-red-300/20 backdrop-blur-sm border-t-2 border-yellow-300/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-center">
                <div className="w-full max-w-2xl relative" ref={searchRef}>
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyPress={handleKeyPress}
                      onFocus={() => {
                        if (suggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="🪔 Search for Diwali Deals, Products & More 🪔"
                      className="w-full pl-4 pr-16 py-3 border-2 border-orange-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm shadow-lg bg-gradient-to-r from-yellow-50/90 to-orange-50/90 backdrop-blur-sm placeholder-orange-600"
                    />
                    <button 
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-md hover:from-orange-600 hover:to-red-600 transition-colors border-2 border-yellow-300 shadow-md"
                      aria-label="Search"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Suggestions Dropdown - Diwali Theme */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-2xl border-2 border-orange-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                      {loadingSuggestions ? (
                        <div className="p-4 text-center text-orange-600">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                        </div>
                      ) : (
                        <>
                          {suggestions.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleSuggestionClick(product.id)}
                              className="w-full flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-orange-100 hover:to-yellow-100 transition-colors text-left border-b border-orange-200 last:border-b-0"
                            >
                              <img 
                                src={product.image || 'https://via.placeholder.com/50'} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/50';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {product.brand} • {product.category}
                                </p>
                                <p className="text-sm font-bold text-blue-600 mt-1">
                                  ₹{product.price}
                                </p>
                              </div>
                              <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </button>
                          ))}
                          
                          {/* View All Results */}
                          <button
                            onClick={() => {
                              handleSearch(new Event('submit') as any);
                            }}
                            className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 transition-colors text-orange-700 font-semibold text-sm border-t-2 border-orange-200"
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span>🪔 View all Diwali results for "{searchQuery}" 🪔</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}
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

  // Top navigation for shop/admin - Diwali Theme
  return (
    <>
      <nav className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 shadow-lg sticky top-0 z-40">
        {/* Diwali Sparkles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-2 left-20 w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          <div className="absolute top-3 right-32 w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-4 left-1/2 w-2.5 h-2.5 bg-red-300 rounded-full animate-pulse delay-2000"></div>
        </div>
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
                  className="text-white hover:text-yellow-200 font-medium text-sm transition-colors flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-yellow-300/30"
                >
                  <Store className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              )}
              
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="text-white hover:text-yellow-200 font-medium text-sm transition-colors flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-yellow-300/30"
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