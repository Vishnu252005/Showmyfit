import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, MapPin, Navigation, Star } from 'lucide-react';
import HomePage from './pages/HomePage';
import ShopAuth from './pages/ShopAuth';
import ShopDashboard from './pages/ShopDashboard';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import BecomeSellerPage from './pages/BecomeSellerPage';
import AdminSetupPage from './pages/AdminSetupPage';
import FixAdminEmailPage from './pages/FixAdminEmailPage';
import AdminTestPage from './pages/AdminTestPage';
import DebugAdminPage from './pages/DebugAdminPage';
import CreateUserPage from './pages/CreateUserPage';
import ManageAdminsPage from './pages/ManageAdminsPage';
import ProductManagementPage from './pages/ProductManagementPage';
import SellerManagementPage from './pages/SellerManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import Navbar from './components/Navbar';
import Button from './components/Button';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './contexts/AuthContext';

// Bottom Navigation Component
const BottomNavigation = () => {
  const location = useLocation();
  
  return (
    <nav className="bottom-nav">
      <div className="flex justify-around items-center py-2">
        <Link
          to="/"
          className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
            location.pathname === '/' 
              ? 'text-black' 
              : 'text-gray-600'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <div className="w-5 h-5">🏠</div>
          </div>
          <span className="text-xs font-medium">Home</span>
          {location.pathname === '/' && (
            <div className="w-8 h-0.5 bg-black mt-1"></div>
          )}
        </Link>
        
        <Link
          to="/browse"
          className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
            location.pathname === '/browse' 
              ? 'text-black' 
              : 'text-gray-600'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <div className="w-5 h-5">🔍</div>
          </div>
          <span className="text-xs font-medium">Explore</span>
          {location.pathname === '/browse' && (
            <div className="w-8 h-0.5 bg-black mt-1"></div>
          )}
        </Link>
        
        <Link
          to="/trending"
          className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
            location.pathname === '/trending' 
              ? 'text-black' 
              : 'text-gray-600'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
              <span className="text-xs font-bold">OG</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs font-medium">GenZ Fits</div>
            <div className="text-xs text-gray-500">Rs.799</div>
          </div>
          {location.pathname === '/trending' && (
            <div className="w-8 h-0.5 bg-black mt-1"></div>
          )}
        </Link>
        
        <Link
          to="/categories"
          className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
            location.pathname === '/categories' 
              ? 'text-black' 
              : 'text-gray-600'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <div className="flex flex-col space-y-0.5">
              <div className="w-4 h-0.5 bg-current"></div>
              <div className="w-4 h-0.5 bg-current"></div>
              <div className="w-4 h-0.5 bg-current"></div>
            </div>
          </div>
          <span className="text-xs font-medium">Categories</span>
          {location.pathname === '/categories' && (
            <div className="w-8 h-0.5 bg-black mt-1"></div>
          )}
        </Link>
        
        <Link
          to="/profile"
          className={`flex flex-col items-center py-3 px-2 transition-all duration-200 ${
            location.pathname === '/profile' 
              ? 'text-black' 
              : 'text-gray-600'
          }`}
        >
          <div className="w-6 h-6 mb-1 flex items-center justify-center">
            <div className="w-5 h-5">👤</div>
          </div>
          <span className="text-xs font-medium">Account</span>
          {location.pathname === '/profile' && (
            <div className="w-8 h-0.5 bg-black mt-1"></div>
          )}
        </Link>
      </div>
    </nav>
  );
};

// Enhanced pages for bottom navigation
const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showNearbyStores, setShowNearbyStores] = useState(true);
  
  const categories = ['All', 'Men', 'Women', 'Kids', 'Shoes', 'Accessories'];
  
  const mockResults = [
    { id: 1, name: 'Fashion Hub Store', type: 'store', distance: '2.5 km', rating: 4.8, category: 'All' },
    { id: 2, name: 'Classic Cotton T-Shirt', type: 'product', price: 29.99, store: 'Fashion Hub', category: 'Men', image: '👕' },
    { id: 3, name: 'Urban Closet', type: 'store', distance: '1.1 km', rating: 4.5, category: 'All' },
    { id: 4, name: 'Summer Dress', type: 'product', price: 49.99, store: 'Style Central', category: 'Women', image: '👗' },
    { id: 5, name: 'Kids Play Shoes', type: 'product', price: 39.99, store: 'Urban Closet', category: 'Kids', image: '👟' },
    { id: 6, name: 'Designer Handbag', type: 'product', price: 199.99, store: 'Elite Boutique', category: 'Accessories', image: '👜' },
  ];

  const nearbyStores = [
    { 
      name: 'Fashion Hub Store', 
      category: 'Fashion', 
      distance: '0.8 km', 
      rating: 4.8, 
      reviews: 124, 
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
      address: '123 Main Street, Downtown',
      open: true,
      offers: ['20% off on all items', 'Free delivery'],
      tags: ['Trending', 'Popular']
    },
    { 
      name: 'Tech World Electronics', 
      category: 'Electronics', 
      distance: '1.2 km', 
      rating: 4.6, 
      reviews: 89, 
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop',
      address: '456 Tech Avenue, Tech Park',
      open: true,
      offers: ['15% off on smartphones', 'Extended warranty'],
      tags: ['New', 'Tech']
    },
    { 
      name: 'Home & Living', 
      category: 'Home', 
      distance: '2.1 km', 
      rating: 4.4, 
      reviews: 67, 
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
      address: '789 Home Street, Residential',
      open: false,
      offers: ['30% off on furniture', 'Free assembly'],
      tags: ['Furniture', 'Decor']
    },
    { 
      name: 'Beauty Paradise', 
      category: 'Beauty', 
      distance: '1.5 km', 
      rating: 4.7, 
      reviews: 156, 
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop',
      address: '321 Beauty Lane, Mall Area',
      open: true,
      offers: ['Buy 2 Get 1 Free', 'Free consultation'],
      tags: ['Luxury', 'Premium']
    }
  ];

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'All': return '🛍️';
      case 'Men': return '👔';
      case 'Women': return '👗';
      case 'Kids': return '👶';
      case 'Shoes': return '👟';
      case 'Accessories': return '👜';
      default: return '👕';
    }
  };

  const filteredResults = mockResults.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.type === 'product' && item.store?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-primary-50">
      <Navbar userRole="user" />
      <div className="main-content px-4 py-6 pt-20">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif font-bold text-neutral-900 mb-3">Explore Nearby Stores</h1>
            <p className="text-neutral-600 text-lg">Discover local stores and products near you</p>
          </div>
          
          {/* Location Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter your location or use current location"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                className="w-full pl-10 pr-32 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button 
                onClick={() => {
                  if (navigator.geolocation) {
                    setIsGettingLocation(true);
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        const { latitude, longitude } = position.coords;
                        setCurrentLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
                        setIsGettingLocation(false);
                      },
                      (error) => {
                        console.error('Error getting location:', error);
                        alert('Unable to get your current location. Please enter manually.');
                        setIsGettingLocation(false);
                      }
                    );
                  } else {
                    alert('Geolocation is not supported by this browser.');
                  }
                }}
                disabled={isGettingLocation}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGettingLocation ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isGettingLocation ? 'Getting...' : 'Use Current'}
                </span>
              </button>
            </div>
          </div>
          
          {/* Enhanced Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for stores, products, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent text-lg shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Toggle Buttons */}
          <div className="flex space-x-4 mb-8">
            <button
              onClick={() => setShowNearbyStores(true)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                showNearbyStores 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Nearby Stores
            </button>
            <button
              onClick={() => setShowNearbyStores(false)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !showNearbyStores 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Results
            </button>
          </div>

          {/* Enhanced Category Filter */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Filter by Category</h3>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-300'
                  }`}
                >
                  <span className="mr-2">{getCategoryIcon(category)}</span>
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900">
              {filteredResults.length} {filteredResults.length === 1 ? 'Result' : 'Results'} Found
            </h2>
            {searchQuery && (
              <span className="text-neutral-600">for "{searchQuery}"</span>
            )}
          </div>

          {/* Nearby Stores Section */}
          {showNearbyStores && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Stores Near You</h2>
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <MapPin className="w-4 h-4" />
                  <span>{currentLocation || 'Location not set'}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {nearbyStores.map((store, index) => (
                  <div key={index} className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex space-x-4">
                      {/* Store Image */}
                      <div className="relative">
                        <img 
                          src={store.image} 
                          alt={store.name}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                        />
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                          store.open ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            store.open ? 'bg-white' : 'bg-white'
                          }`}></div>
                        </div>
                      </div>

                      {/* Store Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">{store.name}</h3>
                            <p className="text-xs text-gray-600">{store.address}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-sm font-semibold text-gray-900">{store.rating}</span>
                              <span className="text-xs text-gray-500">({store.reviews})</span>
                            </div>
                            <p className="text-xs text-gray-600">{store.distance}</p>
                          </div>
                        </div>

                        {/* Category and Status */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{store.category}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            store.open 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {store.open ? 'Open Now' : 'Closed'}
                          </span>
                          {store.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Offers */}
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {store.offers.map((offer, offerIndex) => (
                              <span key={offerIndex} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                {offer}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                            Visit Store
                          </button>
                          <button 
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            aria-label="Get directions to store"
                          >
                            <Navigation className="w-4 h-4" />
                          </button>
                          <button 
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            aria-label="Add store to favorites"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Search Results */}
          {!showNearbyStores && (
          <div className="space-y-4">
            {filteredResults.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg hover-lift border border-neutral-100">
                <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center text-2xl">
                    {item.type === 'store' ? '🏪' : item.image || '👕'}
                  </div>
                  <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">{item.name}</h3>
                      <p className="text-neutral-600 mb-2">
                      {item.type === 'store' 
                        ? `${item.distance} • ${item.rating}★`
                        : `$${item.price} • ${item.store}`
                      }
                    </p>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                        <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full">
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                    {item.type === 'store' ? 'Visit Store' : 'View Product'}
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredResults.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No results found</h3>
                  <p className="text-neutral-600 mb-4">Try adjusting your search or filters</p>
                <Button variant="outline" onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Classic Cotton T-Shirt', price: 29.99, quantity: 2, image: '👕', store: 'Fashion Hub' },
    { id: 2, name: 'Summer Dress', price: 49.99, quantity: 1, image: '👗', store: 'Style Central' },
    { id: 3, name: 'Casual Jeans', price: 76.99, quantity: 1, image: '👖', store: 'Urban Closet' },
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items => items.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ));
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-primary-50">
      <Navbar userRole="user" />
      <div className="main-content px-4 py-6 pt-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif font-bold text-warm-900 mb-3">Your Shopping Cart</h1>
            <p className="text-warm-600 text-lg">{cartItems.length} items in your cart</p>
          </div>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <h2 className="text-2xl font-semibold text-warm-900 mb-2">Your cart is empty</h2>
              <p className="text-warm-600 mb-6">Add some items to get started</p>
              <Button variant="primary" size="lg">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg hover-lift border border-warm-100">
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-warm-100 to-warm-200 rounded-xl flex items-center justify-center text-3xl">
                        {item.image}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-warm-900 mb-1">{item.name}</h3>
                        <p className="text-warm-600 mb-2">{item.store}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-warm-800">${item.price}</span>
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 bg-warm-100 hover:bg-warm-200 rounded-full flex items-center justify-center transition-colors"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 bg-warm-100 hover:bg-warm-200 rounded-full flex items-center justify-center transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                        >
                          🗑️
                        </button>
                        <div className="text-lg font-bold text-warm-800 mt-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-24">
                  <h3 className="text-xl font-semibold text-warm-900 mb-6">Order Summary</h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-warm-600">Subtotal</span>
                      <span className="font-semibold">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warm-600">Shipping</span>
                      <span className="font-semibold text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warm-600">Tax</span>
                      <span className="font-semibold">${(total * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-warm-200 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-warm-800">${(total * 1.08).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="primary" size="lg" className="w-full mb-4">
                    Proceed to Checkout
                  </Button>
                  
                  <Button variant="outline" size="lg" className="w-full">
                    Continue Shopping
                  </Button>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-warm-500">
                      🔒 Secure checkout guaranteed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([
    { id: 1, name: 'Designer Handbag', price: 199.99, image: '👜', store: 'Elite Boutique', inStock: true, category: 'Accessories' },
    { id: 2, name: 'Premium Sneakers', price: 89.99, image: '👟', store: 'Urban Closet', inStock: true, category: 'Shoes' },
    { id: 3, name: 'Silk Scarf', price: 45.99, image: '🧣', store: 'Style Central', inStock: false, category: 'Accessories' },
    { id: 4, name: 'Leather Jacket', price: 299.99, image: '🧥', store: 'Fashion Hub', inStock: true, category: 'Men' },
    { id: 5, name: 'Summer Dress', price: 79.99, image: '👗', store: 'Style Central', inStock: true, category: 'Women' },
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const addToCart = (item: any) => {
    // Mock add to cart functionality
    console.log('Added to cart:', item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-primary-50">
      <Navbar userRole="user" />
      <div className="main-content px-4 py-6 pt-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif font-bold text-warm-900 mb-3">Your Favorites</h1>
            <p className="text-warm-600 text-lg">{wishlistItems.length} items saved for later</p>
          </div>
          
          {wishlistItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">❤️</div>
              <h2 className="text-2xl font-semibold text-warm-900 mb-2">No favorites yet</h2>
              <p className="text-warm-600 mb-6">Start saving items you love</p>
              <Button variant="primary" size="lg">
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg hover-lift border border-warm-100">
                  <div className="aspect-square bg-gradient-to-br from-warm-100 to-warm-200 rounded-xl flex items-center justify-center text-6xl mb-4 relative overflow-hidden">
                    {item.image}
                    {!item.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-full flex items-center justify-center transition-colors"
                    >
                      ❤️
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-warm-900 mb-2 line-clamp-2">{item.name}</h3>
                    <p className="text-warm-600 mb-3">{item.store}</p>
                    
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <span className="text-2xl font-bold text-warm-800">${item.price}</span>
                      <span className="text-xs bg-warm-100 text-warm-700 px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="w-full"
                        disabled={!item.inStock}
                        onClick={() => addToCart(item)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                    
                    <div className="mt-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        item.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {wishlistItems.length > 0 && (
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


function App() {
  return (
    <AuthProvider>
    <AppProvider>
      <Router>
          <div className="min-h-screen bg-gradient-to-br from-cream via-white to-primary-50 font-sans">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<SearchPage />} />
              <Route path="/trending" element={<SearchPage />} />
              <Route path="/categories" element={<SearchPage />} />
              <Route path="/login" element={<AuthPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/shop/auth" element={<BecomeSellerPage />} />
            <Route path="/shop/dashboard" element={<ShopDashboard />} />
            <Route path="/admin/setup" element={<AdminSetupPage />} />
            <Route path="/admin/fix-email" element={<FixAdminEmailPage />} />
            <Route path="/admin/test" element={<AdminTestPage />} />
            <Route path="/admin/debug" element={<DebugAdminPage />} />
            <Route path="/admin/create-user" element={<CreateUserPage />} />
            <Route path="/admin/manage" element={<ManageAdminsPage />} />
            <Route path="/admin/products" element={<ProductManagementPage />} />
            <Route path="/admin/sellers" element={<SellerManagementPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/orders" element={<OrderManagementPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
            
            {/* Bottom Navigation - Always Visible */}
            <BottomNavigation />
        </div>
      </Router>
    </AppProvider>
    </AuthProvider>
  );
}

export default App;