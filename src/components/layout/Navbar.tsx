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
      if (searchQuery.trim().length < 1) {
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

        // Filter products based on search query with more flexible matching
        const filtered = allProducts.filter(product => {
          const searchLower = searchQuery.toLowerCase().trim();
          const name = product.name?.toLowerCase() || '';
          const brand = product.brand?.toLowerCase() || '';
          const category = product.category?.toLowerCase() || '';
          const description = product.description?.toLowerCase() || '';
          
          // Check for exact matches first, then partial matches
          return (
            name.includes(searchLower) ||
            brand.includes(searchLower) ||
            category.includes(searchLower) ||
            description.includes(searchLower) ||
            // Also check if search term appears at the beginning of words
            name.split(' ').some((word: string) => word.startsWith(searchLower)) ||
            brand.split(' ').some((word: string) => word.startsWith(searchLower)) ||
            category.split(' ').some((word: string) => word.startsWith(searchLower))
          );
        }).slice(0, 8); // Limit to 8 suggestions

        console.log(`Search for "${searchQuery}": Found ${filtered.length} results out of ${allProducts.length} total products`);
        setSuggestions(filtered);
        setShowSuggestions(true); // Always show dropdown, even for no results
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
      <nav className="fixed top-0 left-0 right-0 bg-gradient-to-b from-blue-700 to-blue-400 z-40 shadow-lg">
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
        {/* Top Navigation Bar - Seamless Flipkart-style Blue Gradient */}
        <nav className="fixed top-0 left-0 right-0 bg-gradient-to-b from-[#2874F0] via-[#3B82F6] via-[#60A5FA] via-[#93C5FD] via-[#BFDBFE] to-[#DBEAFE] z-40 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Navigation Row */}
            <div className="flex justify-between items-center h-12 md:h-16">
              {/* Left Side - Hamburger Menu + Logo */}
              <div className="flex items-center space-x-3 md:space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Open sidebar menu"
                >
                  <Menu className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>
                <Link to="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
                  <ShowMyFITLogo size="md" className="text-white" />
                </Link>
              </div>

              {/* Right Side - User Actions */}
              <div className="flex items-center space-x-2 md:space-x-3">
                {currentUser ? (
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <span className="text-white font-medium text-xs md:text-sm hidden sm:block">
                      Hi, {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <button
                      onClick={signOut}
                      className="text-white hover:text-blue-50 font-medium text-xs md:text-sm transition-all duration-200 flex items-center space-x-1 px-2 md:px-3 py-1.5 md:py-2 rounded-xl hover:bg-white/25 active:scale-95"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:block">Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-white hover:text-blue-50 font-medium text-xs md:text-sm transition-all duration-200 px-3 md:px-4 py-1.5 md:py-2 rounded-xl hover:bg-white/25 active:scale-95"
                  >
                    Login
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="relative text-white hover:text-blue-50 font-medium text-xs md:text-sm transition-all duration-200 flex items-center space-x-1.5 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-xl hover:bg-white/25 active:scale-95"
                >
                  <Bookmark className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:block">Reserved</span>
                  {getCartItemCount() > 0 && (
                    <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 text-white text-[10px] md:text-xs rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${
                      showAddNotification ? 'bg-green-500 animate-pulse scale-110' : 'bg-[#2874F0]'
                    }`}>
                      {getCartItemCount()}
                    </span>
                  )}
                </Link>
                <Link
                  to="/wishlist"
                  className="relative text-white hover:text-blue-50 font-medium text-xs md:text-sm transition-all duration-200 flex items-center space-x-1.5 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-xl hover:bg-white/25 active:scale-95"
                >
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden md:block">Wishlist</span>
                  {getWishlistCount() > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 md:w-5 md:h-5 bg-pink-500 text-white text-[10px] md:text-xs rounded-full flex items-center justify-center font-bold shadow-lg">
                      {getWishlistCount()}
                    </span>
                  )}
                </Link>
                <Link
                  to="/shop/auth"
                  className="bg-gradient-to-r from-[#2874F0] to-[#3B82F6] text-white font-medium text-xs md:text-sm transition-all duration-200 px-3 md:px-4 py-1.5 md:py-2 rounded-xl hover:from-[#1E60B8] hover:to-[#2563EB] hover:shadow-lg hidden lg:block shadow-md active:scale-95"
                >
                  Become a Seller
                </Link>
              </div>
            </div>
          </div>
          
          {/* Search Bar Row - No border, seamlessly continues gradient */}
          <div>
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 md:py-4">
              <div className="flex items-center justify-center">
                <div className="w-full max-w-2xl relative" ref={searchRef}>
                  <form onSubmit={handleSearch} className="relative">
                    <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onKeyPress={handleKeyPress}
                      onFocus={() => {
                        if (searchQuery.trim().length >= 1) {
                          setShowSuggestions(true);
                        }
                      }}
                      placeholder="Search for products, brands & more..."
                      className="w-full pl-10 md:pl-12 pr-16 md:pr-20 py-2.5 md:py-4 border border-white/40 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 text-xs md:text-base shadow-xl bg-white backdrop-blur-sm placeholder-gray-400 transition-all duration-200 hover:shadow-2xl hover:border-white/60"
                    />
                    <button 
                      type="submit"
                      className="absolute right-1.5 md:right-2 top-1/2 transform -translate-y-1/2 px-3 md:px-5 py-1.5 md:py-2.5 bg-gradient-to-r from-[#2874F0] to-[#3B82F6] text-white rounded-lg md:rounded-xl hover:from-[#1E60B8] hover:to-[#2563EB] transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                      aria-label="Search"
                    >
                      <Search className="w-3.5 h-3.5 md:w-5 md:h-5" />
                    </button>
                  </form>

                  {/* Suggestions Dropdown */}
                  {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto backdrop-blur-xl">
                      {loadingSuggestions ? (
                        <div className="p-4 text-center text-blue-600">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        </div>
                      ) : suggestions.length > 0 ? (
                        <>
                          {suggestions.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleSuggestionClick(product.id)}
                              className="w-full flex items-center space-x-3 p-3 md:p-4 hover:bg-blue-50 active:bg-blue-100 transition-all duration-150 text-left border-b border-gray-100 last:border-b-0 group"
                            >
                              <img 
                                src={product.image || 'https://via.placeholder.com/50'} 
                                alt={product.name}
                                className="w-14 h-14 md:w-16 md:h-16 object-cover rounded-xl flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/50';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm md:text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                  {product.name}
                                </h4>
                                <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                                  {product.brand} • {product.category}
                                </p>
                                <p className="text-sm md:text-base font-bold text-blue-600 mt-1.5">
                                  ₹{product.price}
                                </p>
                              </div>
                              <Package className="w-5 h-5 text-gray-400 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                            </button>
                          ))}
                          
                          {/* View All Results */}
                          <button
                            onClick={() => {
                              handleSearch(new Event('submit') as any);
                            }}
                            className="w-full flex items-center justify-center space-x-2 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-150 text-blue-700 font-semibold text-sm md:text-base border-t-2 border-gray-100 active:scale-[0.98]"
                          >
                            <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                            <span>View all results for "{searchQuery}"</span>
                          </button>
                        </>
                      ) : (
                        <div className="p-6 md:p-8 text-center">
                          <div className="text-5xl mb-4">🔍</div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                          <p className="text-sm md:text-base text-gray-600 mb-4">
                            We couldn't find any products matching "{searchQuery}"
                          </p>
                          <div className="text-xs md:text-sm text-gray-500 mb-5 space-y-1">
                            <p className="font-medium">Try searching for:</p>
                            <p>• Product names (e.g., "shirt", "shoes")</p>
                            <p>• Brands (e.g., "nike", "adidas")</p>
                            <p>• Categories (e.g., "clothing", "accessories")</p>
                          </div>
                          <button
                            onClick={() => {
                              handleSearch(new Event('submit') as any);
                            }}
                            className="px-5 py-2.5 bg-gradient-to-r from-[#2874F0] to-[#3B82F6] text-white rounded-xl hover:from-[#1E60B8] hover:to-[#2563EB] transition-all duration-200 text-sm md:text-base font-medium shadow-lg hover:shadow-xl active:scale-95"
                          >
                            Search anyway
                          </button>
                        </div>
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

  // Top navigation for shop/admin
  return (
    <>
      <nav className="bg-gradient-to-b from-[#2874F0] via-[#3B82F6] via-[#60A5FA] to-[#93C5FD] shadow-xl sticky top-0 z-40">
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
                  className="text-white hover:text-blue-100 font-medium text-sm transition-colors flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20"
                >
                  <Store className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              )}
              
              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  className="text-white hover:text-blue-100 font-medium text-sm transition-colors flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/20"
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