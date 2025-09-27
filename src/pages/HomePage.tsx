import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Package, Star, Heart, Clock, 
  ArrowRight, Sparkles, Eye, ShoppingCart, Phone, MapIcon, ThumbsUp, X
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getCurrentLocationWithDetails, sortStoresByDistance, parseAddressToCoordinates } from '../utils/distance';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [nearbyStores, setNearbyStores] = useState<any[]>([]);
  const [showNearbyStores, setShowNearbyStores] = useState(false);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState<string>('');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Fetch sellers from database
  useEffect(() => {
    const fetchSellers = async () => {
      setLoadingSellers(true);
      try {
        const usersQuery = query(collection(db, 'users'));
        const snapshot = await getDocs(usersQuery);
        
        console.log('Total users found:', snapshot.docs.length);
        
        const sellersList: any[] = [];
        snapshot.docs.forEach((doc) => {
          const userData = doc.data();
          console.log('User data:', { id: doc.id, role: userData.role, status: userData.status, businessName: userData.businessName });
          
          if (userData.role === 'shop' && userData.status === 'approved') {
            sellersList.push({
              id: doc.id,
              name: userData.name || 'Unknown Seller',
              email: userData.email || 'No email',
              phone: userData.phone || 'No phone',
              businessName: userData.businessName || 'No business name',
              businessType: userData.businessType || 'No type',
              address: userData.address || 'No address',
              stats: userData.stats || {
                totalProducts: Math.floor(Math.random() * 50) + 10,
                totalSales: Math.floor(Math.random() * 1000) + 100,
                totalOrders: Math.floor(Math.random() * 200) + 20,
                rating: Math.random() * 2 + 3 // Random rating between 3-5
              },
              createdAt: userData.createdAt
            });
          }
        });
        
        console.log('Approved sellers found:', sellersList.length);
        
        // If no sellers found, use sample data for demo
        if (sellersList.length === 0) {
          console.log('No sellers found, using sample data');
          const sampleSellers = [
            {
              id: 'demo1',
              name: 'Rajesh Kumar',
              email: 'rajesh@example.com',
              phone: '+91 98765 43210',
              businessName: 'Fashion Hub',
              businessType: 'Fashion & Apparel',
              address: '123 MG Road, Bangalore',
              stats: {
                totalProducts: 45,
                totalSales: 1250,
                totalOrders: 180,
                rating: 4.5
              },
              createdAt: new Date()
            },
            {
              id: 'demo2',
              name: 'Priya Sharma',
              email: 'priya@example.com',
              phone: '+91 98765 43211',
              businessName: 'Style Central',
              businessType: 'Beauty & Cosmetics',
              address: '456 Brigade Road, Bangalore',
              stats: {
                totalProducts: 32,
                totalSales: 890,
                totalOrders: 120,
                rating: 4.2
              },
              createdAt: new Date()
            },
            {
              id: 'demo3',
              name: 'Amit Patel',
              email: 'amit@example.com',
              phone: '+91 98765 43212',
              businessName: 'Urban Closet',
              businessType: 'Electronics',
              address: '789 Commercial Street, Bangalore',
              stats: {
                totalProducts: 28,
                totalSales: 2100,
                totalOrders: 95,
                rating: 4.7
              },
              createdAt: new Date()
            }
          ];
          setSellers(sampleSellers);
        } else {
          // Limit to 6 sellers for home page
          setSellers(sellersList.slice(0, 6));
        }
      } catch (error) {
        console.error('Error loading sellers:', error);
        // Use sample data on error too
        const sampleSellers = [
          {
            id: 'demo1',
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            phone: '+91 98765 43210',
            businessName: 'Fashion Hub',
            businessType: 'Fashion & Apparel',
            address: '123 MG Road, Bangalore',
            stats: {
              totalProducts: 45,
              totalSales: 1250,
              totalOrders: 180,
              rating: 4.5
            },
            createdAt: new Date()
          },
          {
            id: 'demo2',
            name: 'Priya Sharma',
            email: 'priya@example.com',
            phone: '+91 98765 43211',
            businessName: 'Style Central',
            businessType: 'Beauty & Cosmetics',
            address: '456 Brigade Road, Bangalore',
            stats: {
              totalProducts: 32,
              totalSales: 890,
              totalOrders: 120,
              rating: 4.2
            },
            createdAt: new Date()
          }
        ];
        setSellers(sampleSellers);
      } finally {
        setLoadingSellers(false);
      }
    };

    fetchSellers();
  }, []);

  // Get current location
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError('');
    setShowManualLocation(false);
    
    try {
      const locationData = await getCurrentLocationWithDetails();
      
      if (locationData.error) {
        setLocationError(locationData.error);
        setCurrentLocation('Location unavailable');
        setShowManualLocation(true); // Show manual input option on error
      } else {
        // Store coordinates for distance calculations
        setCurrentLocation(locationData.address || 'Current location');
        
        // Sort stores by distance if we have coordinates
        if (sellers.length > 0 && locationData.coordinates) {
          const sortedStores = sortStoresByDistance(
            sellers, 
            locationData.coordinates.latitude, 
            locationData.coordinates.longitude
          );
          setNearbyStores(sortedStores.slice(0, 6)); // Show top 6 nearby stores
          setShowNearbyStores(true);
        }
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Failed to get location');
      setCurrentLocation('Location unavailable');
      setShowManualLocation(true); // Show manual input option on error
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Handle manual location input
  const handleManualLocation = () => {
    if (!manualLocation.trim()) {
      setLocationError('Please enter a city name');
      return;
    }

    const coordinates = parseAddressToCoordinates(manualLocation);
    if (coordinates) {
      setCurrentLocation(manualLocation);
      setLocationError('');
      setShowManualLocation(false);
      
      // Sort stores by distance using manual location
      if (sellers.length > 0) {
        const sortedStores = sortStoresByDistance(
          sellers, 
          coordinates.latitude, 
          coordinates.longitude
        );
        setNearbyStores(sortedStores.slice(0, 6));
        setShowNearbyStores(true);
      }
    } else {
      setLocationError('City not found. Please try a major city name like Mumbai, Delhi, Bangalore, etc.');
    }
  };

  // View seller products
  const viewSellerProducts = (seller: any) => {
    navigate(`/seller/${seller.id}`);
  };

  const categories = [
    { name: 'Women', description: 'Fashion for women', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop&crop=face' },
    { name: 'Footwear', description: 'Shoes & sneakers', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=200&h=200&fit=crop' },
    { name: 'Jewellery', description: 'Elegant jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop' },
    { name: 'Lingerie', description: 'Intimate wear', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face' },
    { name: 'Watches', description: 'Timepieces', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop' },
    { name: 'Gifting Guide', description: 'Perfect gifts', image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop' },
    { name: 'Kids', description: 'Children\'s fashion', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop' },
    { name: 'Home & Lifestyle', description: 'Home decor', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop' },
    { name: 'Accessories', description: 'Style accessories', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' },
    { name: 'Beauty by Tira', description: 'Beauty products', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop' },
    { name: 'Sportswear', description: 'Active wear', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop' }
  ];

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const addToCart = (product: any) => {
    console.log('Added to cart:', product);
  };

  const quickViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const featuredProducts = [
    { 
      id: '1',
      name: 'iPhone 15 Pro Max', 
      price: 124999, 
      originalPrice: 134999,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
      brand: 'Apple',
      rating: 4.8,
      reviews: 1250,
      category: 'Electronics',
      featured: true,
      stock: 15
    },
    { 
      id: '2',
      name: 'Samsung Galaxy S24 Ultra', 
      price: 99999, 
      originalPrice: 109999,
      image: 'https://images.unsplash.com/photo-1511707171631-9ad203683d6d?w=300&h=300&fit=crop',
      brand: 'Samsung',
      rating: 4.7,
      reviews: 980,
      category: 'Electronics',
      featured: true,
      stock: 8
    },
    { 
      id: '3',
      name: 'MacBook Pro M3', 
      price: 199999, 
      originalPrice: 219999,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
      brand: 'Apple',
      rating: 4.9,
      reviews: 650,
      category: 'Electronics',
      featured: true,
      stock: 5
    },
    { 
      id: '4',
      name: 'Sony WH-1000XM5', 
      price: 29999, 
      originalPrice: 34999,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
      brand: 'Sony',
      rating: 4.6,
      reviews: 420,
      category: 'Electronics',
      featured: true,
      stock: 12
    }
  ];


  const featuredBrands = [
    { name: 'NOISE', image: 'https://via.placeholder.com/120x60/000000/FFFFFF?text=NOISE' },
    { name: 'Pigeon', image: 'https://via.placeholder.com/120x60/000000/FFFFFF?text=Pigeon' },
    { name: 'boat', image: 'https://via.placeholder.com/120x60/000000/FFFFFF?text=boat' },
    { name: 'motorola', image: 'https://via.placeholder.com/120x60/000000/FFFFFF?text=motorola' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <Navbar userRole="user" />
      
      {/* Main Content */}
      <div className="main-content pt-24">
        {/* Location Section */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Your Location:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {currentLocation || 'Not detected'}
                  </span>
                </div>
                {locationError && (
                  <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                    <div className="font-medium">{locationError}</div>
                    {locationError.includes('unavailable') && (
                      <div className="mt-1 text-red-500">
                        💡 Try entering your city manually below
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2">
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm">Getting Location...</span>
                    </>
                  ) : (
                    <>
                      <MapIcon className="w-4 h-4" />
                      <span className="text-sm">Find Nearby Stores</span>
                    </>
                  )}
                </button>
                
                {/* Manual Location Input - Show when GPS fails */}
                {showManualLocation && (
                  <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border">
                    <input
                      type="text"
                      placeholder="Enter city name (e.g., Mumbai, Delhi)"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                    />
                    <button
                      onClick={handleManualLocation}
                      className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => {
                        setShowManualLocation(false);
                        setLocationError('');
                        setManualLocation('');
                      }}
                      className="bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Category Bar */}
        <section className="bg-white border-b border-gray-200 mt-8">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide pb-1">
              <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H15C14.4477 21 14 20.5523 14 20V14C14 13.4477 13.5523 13 13 13H11C10.4477 13 10 13.4477 10 14V20C10 20.5523 9.55228 21 9 21H4C3.44772 21 3 20.5523 3 20V9Z"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-600">Home</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                    alt="Men"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-gray-600">Men</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
                    alt="Women"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-gray-600">Women</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=100&h=100&fit=crop&crop=face"
                    alt="Kids"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-gray-600">Kids</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&crop=face"
                    alt="Beauty"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-gray-600">Beauty</span>
              </div>
              
              <div className="flex flex-col items-center space-y-1 flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop&crop=face"
                    alt="Sports"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-gray-600">Sports</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Categories Section */}
        <section className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-8 pt-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Shop by Category</h2>
                <p className="text-gray-600">Discover amazing products across all categories</p>
              </div>
              <Link 
                to="/categories" 
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                View All →
              </Link>
            </div>
            
            {/* Mobile-style Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.name}
                  to="/categories"
                  className="group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {category.description}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Show more categories on larger screens */}
            <div className="hidden lg:grid grid-cols-6 gap-4 mt-6">
              {categories.slice(8).map((category) => (
                <Link
                  key={category.name}
                  to="/categories"
                  className="group text-center touch-manipulation transform hover:scale-105 transition-all duration-300"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-300 leading-tight">{category.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Hero Banner */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-12 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="max-w-7xl mx-auto px-4 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                  THE BIG BILLION DAYS
                </h1>
                <p className="text-xl md:text-2xl text-white/90 mb-4 md:mb-6 leading-relaxed">
                  Designer sofas, Carlton london, mintwud & more
                </p>
                <p className="text-2xl md:text-3xl font-bold text-white mb-6">From ₹6,499</p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                    <p className="text-sm font-bold text-white">AXIS BANK</p>
                    <p className="text-xs text-white/80">10% Instant Discount</p>
              </div>
                  <div className="bg-white/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-white/30">
                    <p className="text-sm font-bold text-white">ICICI Bank</p>
                    <p className="text-xs text-white/80">super.money</p>
              </div>
            </div>
                <button className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                  Shop Now
                </button>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop" 
                  alt="Sofa"
                  className="w-96 h-80 object-cover rounded-2xl shadow-2xl"
                />
        </div>
      </div>
          </div>
        </section>

        {/* Enhanced Become a Seller Section */}
        <section className="py-12 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="text-3xl">🏠</div>
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Business Journey</h2>
                <p className="text-lg md:text-xl mb-8 text-white/90 max-w-2xl mx-auto">Join thousands of successful sellers on our platform and reach millions of customers</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/shop/auth"
                    className="inline-flex items-center bg-white text-blue-600 py-4 px-8 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
                    <span className="mr-3 text-xl">🏠</span>
              <span>Become a Seller</span>
                    <ArrowRight className="w-5 h-5 ml-3" />
            </Link>
                  <div className="flex items-center space-x-6 text-white/80">
                    <div className="text-center">
                      <div className="text-2xl font-bold">10K+</div>
                      <div className="text-sm">Active Sellers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">1M+</div>
                      <div className="text-sm">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">50K+</div>
                      <div className="text-sm">Orders Daily</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Discover our handpicked selection of premium products that our customers love</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
                  <div className="p-5">
                    <div className="relative mb-4 group/image">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                      />
                      
                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                          title={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                          aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart className={`w-4 h-4 ${
                            wishlist.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'
                          }`} />
                        </button>
                        <button
                          onClick={() => quickViewProduct(product)}
                          className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                          title="Quick view"
                          aria-label="Quick view product"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
        </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col space-y-2">
                        {product.featured && (
                          <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            ⭐ Featured
                          </span>
                        )}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </span>
                        )}
      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-900 line-clamp-2 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">{product.brand}</p>
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-bold ml-1">{product.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              ₹{product.originalPrice.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {product.category}
                        </span>
                      </div>

                      {/* Stock Status */}
                      <div className="flex items-center justify-between text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' :
                          product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                        <span className="text-gray-500">{product.stock} left</span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
              </div>
            ))}
                </div>
              </div>
        </section>

        {/* Enhanced Deals Section */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Best Deals & Offers</h2>
              <p className="text-gray-600 text-lg">Don't miss out on these amazing deals</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Deal Card 1 */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <h3 className="text-2xl font-bold mb-4">Electronics Sale</h3>
                <p className="text-blue-100 mb-6">Up to 50% off on all electronics</p>
                <div className="text-4xl font-bold mb-2">50% OFF</div>
                <p className="text-sm text-blue-200">Limited time offer</p>
                <button className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Shop Now
                </button>
              </div>

              {/* Deal Card 2 */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <h3 className="text-2xl font-bold mb-4">Fashion Week</h3>
                <p className="text-purple-100 mb-6">Latest trends at amazing prices</p>
                <div className="text-4xl font-bold mb-2">30% OFF</div>
                <p className="text-sm text-purple-200">New arrivals</p>
                <button className="mt-6 bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Explore
                </button>
              </div>

              {/* Deal Card 3 */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                <h3 className="text-2xl font-bold mb-4">Home & Living</h3>
                <p className="text-green-100 mb-6">Transform your space</p>
                <div className="text-4xl font-bold mb-2">40% OFF</div>
                <p className="text-sm text-green-200">Free delivery</p>
                <button className="mt-6 bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Shop Now
                </button>
              </div>
                </div>
                </div>
        </section>

        {/* Enhanced Appliances Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Home & Appliances</h2>
              <p className="text-gray-600 text-lg">Upgrade your home with our premium appliances</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Appliance Card 1 */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=300&h=200&fit=crop" 
                    alt="Smart TV"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    25% OFF
                </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Smart TVs</h3>
                  <p className="text-gray-600 text-sm mb-4">4K Ultra HD displays</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">From ₹15,999</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Appliance Card 2 */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop" 
                    alt="Washing Machine"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    30% OFF
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Washing Machines</h3>
                  <p className="text-gray-600 text-sm mb-4">Energy efficient models</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">From ₹12,999</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Appliance Card 3 */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=300&h=200&fit=crop" 
                    alt="Refrigerator"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    20% OFF
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Refrigerators</h3>
                  <p className="text-gray-600 text-sm mb-4">Smart cooling technology</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">From ₹18,999</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Appliance Card 4 */}
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop" 
                    alt="Air Conditioner"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    35% OFF
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Air Conditioners</h3>
                  <p className="text-gray-600 text-sm mb-4">Inverter technology</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">From ₹22,999</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Promotional Banner - Mobile Optimized */}
        <section className="py-6 md:py-8 bg-gradient-to-r from-purple-600 to-purple-800">
          <div className="px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4 md:p-6 text-white touch-manipulation">
                <h3 className="font-bold text-sm md:text-lg mb-2">ADIDAS</h3>
                <p className="text-xs md:text-sm mb-2">Just ₹1,999</p>
                <img 
                  src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop" 
                  alt="Adidas"
                  className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                />
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 md:p-6 text-white touch-manipulation">
                <h3 className="font-bold text-sm md:text-lg mb-2">Levi's, Spykar & more</h3>
                <p className="text-xs md:text-sm mb-2">Just ₹849</p>
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" 
                  alt="Fashion"
                  className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                />
                    </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 md:p-6 text-white touch-manipulation">
                <h3 className="font-bold text-sm md:text-lg mb-2">Tommy Hilfiger, Uppercase & more</h3>
                <p className="text-xs md:text-sm mb-2">Min. 65% Off</p>
                <img 
                  src="https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=100&h=100&fit=crop" 
                  alt="Luggage"
                  className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                />
                  </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 md:p-6 text-white touch-manipulation">
                <h3 className="font-bold text-sm md:text-lg mb-2">Titan, Casio & more</h3>
                <p className="text-xs md:text-sm mb-2">From ₹999</p>
                <img 
                  src="https://images.unsplash.com/photo-1523170335258-f5e6a7c0c4c4?w=100&h=100&fit=crop" 
                  alt="Watch"
                  className="w-12 h-12 md:w-16 md:h-16 object-cover rounded"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Customer Testimonials Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full mb-4">
                <ThumbsUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">Real feedback from satisfied customers who love shopping with us</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: "Priya Sharma",
                  location: "Mumbai",
                  rating: 5,
                  comment: "Amazing shopping experience! Fast delivery and great quality products. Highly recommended!",
                  avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
                },
                {
                  name: "Rajesh Kumar",
                  location: "Delhi",
                  rating: 5,
                  comment: "Best platform for local shopping. Found everything I needed at great prices. Excellent service!",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                },
                {
                  name: "Anita Patel",
                  location: "Bangalore",
                  rating: 5,
                  comment: "Love the variety of products and the easy checkout process. Will definitely shop again!",
                  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed">"{testimonial.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Brands - Enhanced */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted Brands</h2>
              <p className="text-gray-600 text-lg">Shop from your favorite brands</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredBrands.map((brand, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center justify-center h-16">
                  <img 
                    src={brand.image} 
                    alt={brand.name}
                      className="max-h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                  </div>
                  <p className="text-center text-sm font-medium text-gray-700 mt-3">{brand.name}</p>
                </div>
              ))}
        </div>
      </div>
        </section>

        {/* Suggestions for You - Mobile Optimized */}
        <section className="py-6 md:py-8 bg-gray-50">
          <div className="px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Suggestions for You</h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                View All →
              </button>
                  </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Wireless Earbuds', price: '₹1,299', originalPrice: '₹2,999', discount: '57%', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=200&h=200&fit=crop', rating: 4.5 },
                { name: 'Smart Watch', price: '₹3,999', originalPrice: '₹7,999', discount: '50%', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop', rating: 4.3 },
                { name: 'Bluetooth Speaker', price: '₹899', originalPrice: '₹1,999', discount: '55%', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop', rating: 4.7 },
                { name: 'Phone Stand', price: '₹299', originalPrice: '₹599', discount: '50%', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop', rating: 4.2 }
              ].map((product, index) => (
                <div key={index} className="bg-white rounded-lg p-3 hover:shadow-lg transition-shadow touch-manipulation">
                  <div className="relative mb-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-32 md:h-40 object-cover rounded"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {product.discount} OFF
                    </div>
                    <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                      <Heart className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">{product.price}</span>
                    <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        </section>

        {/* Random Products - Mobile Optimized */}
        <section className="py-6 md:py-8 bg-white">
          <div className="px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Random Products</h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                Refresh →
              </button>
                    </div>
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {[
                { name: 'Gaming Mouse', price: '₹1,599', originalPrice: '₹2,999', discount: '47%', image: 'https://images.unsplash.com/photo-1527864550417-7f91c4c4d8c3?w=200&h=200&fit=crop', category: 'Gaming' },
                { name: 'Mechanical Keyboard', price: '₹2,499', originalPrice: '₹4,999', discount: '50%', image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=200&h=200&fit=crop', category: 'Gaming' },
                { name: 'Webcam', price: '₹3,999', originalPrice: '₹6,999', discount: '43%', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&h=200&fit=crop', category: 'Electronics' },
                { name: 'Desk Lamp', price: '₹899', originalPrice: '₹1,499', discount: '40%', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop', category: 'Home' },
                { name: 'Power Bank', price: '₹1,199', originalPrice: '₹2,499', discount: '52%', image: 'https://images.unsplash.com/photo-1609592807909-3b0a0b2a0a0a?w=200&h=200&fit=crop', category: 'Accessories' },
                { name: 'USB Hub', price: '₹499', originalPrice: '₹999', discount: '50%', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=200&fit=crop', category: 'Accessories' }
              ].map((product, index) => (
                <div key={index} className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-3 w-40 md:w-48 hover:shadow-lg transition-shadow touch-manipulation">
                  <div className="relative mb-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-24 md:h-32 object-cover rounded"
                    />
                    <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {product.discount} OFF
                    </div>
                </div>
                  <div className="mb-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{product.category}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-xs md:text-sm mb-1 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm md:text-lg font-bold text-blue-600">{product.price}</span>
                    <span className="text-xs text-gray-500 line-through">{product.originalPrice}</span>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* Trending Deals - Mobile Optimized */}
        <section className="py-6 md:py-8 bg-gradient-to-r from-orange-500 to-red-500">
          <div className="px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Trending Deals</h2>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">HOT</span>
      </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'iPhone 15 Pro', price: '₹1,19,900', originalPrice: '₹1,34,900', discount: '11%', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=200&fit=crop', badge: 'Best Seller' },
                { name: 'Samsung Galaxy S24', price: '₹79,999', originalPrice: '₹99,999', discount: '20%', image: 'https://images.unsplash.com/photo-1511707171631-9ad203683d6d?w=300&h=200&fit=crop', badge: 'Trending' }
              ].map((product, index) => (
                <div key={index} className="bg-white rounded-lg p-4 hover:shadow-lg transition-shadow touch-manipulation">
                  <div className="relative mb-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-32 md:h-40 object-cover rounded"
                    />
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {product.badge}
            </div>
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {product.discount} OFF
            </div>
          </div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2">{product.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg md:text-xl font-bold text-gray-900">{product.price}</span>
                    <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
        </div>
                  <button className="w-full mt-3 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors">
                    Shop Now
                  </button>
      </div>
              ))}
          </div>
          </div>
        </section>

        {/* Recently Viewed - Mobile Optimized */}
        <section className="py-6 md:py-8 bg-white">
          <div className="px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recently Viewed</h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                Clear All
              </button>
                  </div>
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {[
                { name: 'Laptop Stand', price: '₹1,299', image: 'https://images.unsplash.com/photo-1527864550417-7f91c4c4d8c3?w=150&h=150&fit=crop', time: '2 hours ago' },
                { name: 'Wireless Charger', price: '₹899', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=150&h=150&fit=crop', time: '1 day ago' },
                { name: 'Phone Case', price: '₹399', image: 'https://images.unsplash.com/photo-1511707171631-9ad203683d6d?w=150&h=150&fit=crop', time: '2 days ago' },
                { name: 'Bluetooth Headphones', price: '₹2,499', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop', time: '3 days ago' }
              ].map((product, index) => (
                <div key={index} className="flex-shrink-0 bg-gray-50 rounded-lg p-3 w-32 md:w-40 hover:bg-gray-100 transition-colors touch-manipulation">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-20 md:h-24 object-cover rounded mb-2"
                  />
                  <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2">{product.name}</h3>
                  <p className="text-sm font-bold text-blue-600 mb-1">{product.price}</p>
                  <p className="text-xs text-gray-500">{product.time}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Nearby Stores Section - Only show when location is detected */}
        {showNearbyStores && nearbyStores.length > 0 && (
          <section className="py-12 bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Stores Near You</h2>
                </div>
                <p className="text-gray-600 text-lg">
                  Found {nearbyStores.length} stores near {currentLocation}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nearbyStores.map((seller) => (
                  <div key={seller.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer" onClick={() => viewSellerProducts(seller)}>
                    {/* Store Header with Distance Badge */}
                    <div className="relative h-32 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                          <span className="text-2xl font-bold">{seller.businessName.charAt(0).toUpperCase()}</span>
                        </div>
                        <h3 className="font-bold text-lg">{seller.businessName}</h3>
                        <p className="text-sm opacity-90">Owner: {seller.name}</p>
                      </div>
                      {/* Distance Badge */}
                      <div className="absolute top-3 left-3 bg-white/90 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        {seller.distance ? `${seller.distance.toFixed(1)} km` : 'Unknown'}
                      </div>
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-green-500">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-900">{seller.stats.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({seller.stats.totalOrders})</span>
                        </div>
                        <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                          {seller.businessType}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{seller.address}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{seller.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Package className="w-4 h-4" />
                          <span>{seller.stats.totalProducts} products available</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{seller.stats.totalProducts}</div>
                          <div className="text-xs text-gray-600">Products</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{seller.stats.totalOrders}</div>
                          <div className="text-xs text-gray-600">Orders</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button 
                          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewSellerProducts(seller);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Products
                        </button>
                        <button 
                          className="px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          aria-label="Add store to favorites"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Nearby Stores Button */}
              <div className="text-center mt-8">
                <button 
                  onClick={() => setShowNearbyStores(false)}
                  className="inline-flex items-center space-x-2 bg-white text-green-600 border-2 border-green-600 py-3 px-8 rounded-xl font-semibold hover:bg-green-50 transition-colors"
                >
                  <span>Show All Stores</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Featured Local Stores - Real Sellers */}
        <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="text-white text-xl">🏠</div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {showNearbyStores ? 'All Local Stores' : 'Featured Local Stores'}
                </h2>
                </div>
              <p className="text-gray-600 text-lg">Discover amazing stores and their products</p>
              </div>

            {loadingSellers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : sellers.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No stores found</h3>
                <p className="text-gray-600">No approved stores are available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showNearbyStores ? sellers.filter(seller => !nearbyStores.some(nearby => nearby.id === seller.id)) : sellers).map((seller) => (
                  <div key={seller.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer" onClick={() => viewSellerProducts(seller)}>
                    {/* Store Header */}
                    <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                          <span className="text-2xl font-bold">{seller.businessName.charAt(0).toUpperCase()}</span>
                        </div>
                        <h3 className="font-bold text-lg">{seller.businessName}</h3>
                        <p className="text-sm opacity-90">Owner: {seller.name}</p>
                      </div>
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center bg-green-500">
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
            </div>

                    {/* Store Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-900">{seller.stats.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({seller.stats.totalOrders})</span>
                        </div>
                        <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                          {seller.businessType}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{seller.address}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{seller.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Package className="w-4 h-4" />
                          <span>{seller.stats.totalProducts} products available</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{seller.stats.totalProducts}</div>
                          <div className="text-xs text-gray-600">Products</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">{seller.stats.totalOrders}</div>
                          <div className="text-xs text-gray-600">Orders</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                <button 
                          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewSellerProducts(seller);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Products
                        </button>
                        <button 
                          className="px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          aria-label="Add store to favorites"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
                  </div>
                ))}
              </div>
            )}

            {/* View All Stores Button */}
            <div className="text-center mt-8">
              {showNearbyStores ? (
                <button 
                  onClick={() => setShowNearbyStores(false)}
                  className="inline-flex items-center space-x-2 bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  <span>Show All Stores</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <Link 
                  to="/browse" 
                  className="inline-flex items-center space-x-2 bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  <span>View All Stores</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Quick View Modal */}
      {showQuickView && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Quick View</h3>
                  <button
                onClick={() => {
                  setShowQuickView(false);
                  setSelectedProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Close quick view"
                aria-label="Close quick view"
              >
                <X className="w-6 h-6" />
                  </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-96 object-cover rounded-xl"
                />
                    </div>

              <div className="space-y-4">
                        <div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h4>
                  <p className="text-gray-600 mb-4">{selectedProduct.brand}</p>
                        </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-full">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-bold ml-2">{selectedProduct.rating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({selectedProduct.reviews} reviews)</span>
                          </div>
                        </div>
                
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">₹{selectedProduct.price.toLocaleString()}</div>
                  {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                    <div className="text-lg text-gray-500 line-through">
                      ₹{selectedProduct.originalPrice.toLocaleString()}
                    </div>
                  )}
                      </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedProduct.category}
                        </span>
                      </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedProduct.stock > 10 ? 'bg-green-100 text-green-800' :
                      selectedProduct.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedProduct.stock} available
                            </span>
                        </div>
                      </div>

                <div className="flex space-x-4">
                        <button 
                    onClick={() => addToCart(selectedProduct)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center font-semibold"
                        >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                        </button>
                        <button 
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:text-red-500 transition-colors"
                    title={wishlist.includes(selectedProduct.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-label={wishlist.includes(selectedProduct.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${
                      wishlist.includes(selectedProduct.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                    }`} />
                </button>
              </div>
            </div>
          </div>
              </div>
              </div>
      )}

      {/* Floating Mobile Seller Button */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Link
          to="/shop/auth"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center touch-manipulation animate-bounce-gentle"
        >
          <span className="text-xl">🏠</span>
        </Link>
          </div>

      {/* Enhanced Professional Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="px-4 py-16">
          <div className="max-w-7xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Showmyfit</h3>
                </div>
                <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                  Your ultimate destination for local shopping. Connect with nearby stores, discover amazing products, and enjoy seamless shopping experiences.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 hover:scale-110" title="Facebook">
                    <span className="text-sm font-bold">f</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 hover:scale-110" title="Twitter">
                    <span className="text-sm font-bold">t</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 hover:scale-110" title="LinkedIn">
                    <span className="text-sm font-bold">in</span>
                  </a>
                  <a href="#" className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-300 hover:scale-110" title="Instagram">
                    <span className="text-sm font-bold">ig</span>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">About Us</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">How It Works</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Find Stores</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Become a Partner</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Careers</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Press</a></li>
                </ul>
              </div>

              {/* Customer Service */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Customer Service</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Help Center</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Contact Us</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Shipping Info</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Returns</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Size Guide</a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">FAQ</a></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Get in Touch</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">123 Fashion Street, Style City, SC 12345</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300 text-sm">Mon - Fri: 9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-4 h-4 text-blue-400">📧</span>
                    <span className="text-gray-300 text-sm">hello@showmyfit.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-4 h-4 text-blue-400">📞</span>
                    <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
            </div>
          </div>
              </div>
                </div>

            {/* Newsletter Signup */}
            <div className="border-t border-gray-700 pt-8 mb-8">
              <div className="max-w-2xl mx-auto text-center">
                <h4 className="text-xl font-semibold text-white mb-2">Stay Updated</h4>
                <p className="text-gray-300 text-sm mb-4">Get the latest fashion trends and store updates delivered to your inbox.</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-gray-400 text-sm">
                  © 2024 Showmyfit. All rights reserved. Crafted with ❤️ for fashion lovers.
                </div>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;