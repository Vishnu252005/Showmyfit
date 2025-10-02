import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Package, Star, Heart, Clock, 
  ArrowRight, Sparkles, Eye, ShoppingCart, Phone, MapIcon, ThumbsUp, X,
  DollarSign, Percent, TrendingUp
} from 'lucide-react';
import ReserveButton from '../components/common/ReserveButton';
import Chatbot from '../components/common/Chatbot';
import { collection, query, getDocs, where, orderBy, getDoc, doc } from 'firebase/firestore';
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
  const [homePageSections, setHomePageSections] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [promotionalCards, setPromotionalCards] = useState({
    electronics: { discountPercentage: 50 },
    fashion: { discountPercentage: 30 },
    home: { discountPercentage: 40 }
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Fetch home page sections and products
  useEffect(() => {
    const fetchHomePageData = async () => {
      setLoadingSections(true);
      try {
        // Load home page sections
        const sectionsQuery = query(
          collection(db, 'homePageSections'),
          where('isActive', '==', true),
          orderBy('displayOrder', 'asc')
        );
        const sectionsSnapshot = await getDocs(sectionsQuery);
        const sectionsData = sectionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }));
        setHomePageSections(sectionsData);

        // Load all products
        const productsQuery = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        }));
        setAllProducts(productsData);

        // Load promotional card settings
        try {
          const promotionalDoc = await getDoc(doc(db, 'settings', 'promotionalCards'));
          if (promotionalDoc.exists()) {
            const data = promotionalDoc.data();
            setPromotionalCards({
              electronics: data.electronics || { discountPercentage: 50 },
              fashion: data.fashion || { discountPercentage: 30 },
              home: data.home || { discountPercentage: 40 }
            });
          }
        } catch (error) {
          console.log('Promotional cards settings not found, using defaults');
        }

      } catch (error) {
        console.error('Error loading home page data:', error);
      } finally {
        setLoadingSections(false);
      }
    };

    fetchHomePageData();
  }, []);

  // Fetch sellers from database
  useEffect(() => {
  const fetchSellers = async () => {
    setLoadingSellers(true);
    try {
      console.log('Loading approved sellers from users collection...');
      
      // Query users collection for approved sellers (shop role with approved status)
      const usersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'shop')
      );
      const snapshot = await getDocs(usersQuery);
      
      console.log('Total users with shop role found:', snapshot.docs.length);
      
      const sellersList: any[] = [];
      snapshot.docs.forEach((doc) => {
        const userData = doc.data();
        console.log('User data:', { 
          id: doc.id, 
          role: userData.role, 
          businessName: userData.businessName,
          address: userData.address 
        });
        
        // Only include users who are approved sellers
        if (userData.role === 'shop' && userData.sellerApplication?.status === 'approved') {
          sellersList.push({
            id: doc.id,
            userId: doc.id,
            name: userData.displayName || userData.name || 'Unknown Seller',
            email: userData.email || 'No email',
            phone: userData.phone || 'No phone',
            businessName: userData.businessName || 'No business name',
            businessType: userData.businessType || 'No type',
            address: userData.address || userData.businessAddress || 'No address',
            location: userData.location || null, // Real location data
            stats: userData.stats || {
              totalProducts: Math.floor(Math.random() * 50) + 10,
              totalSales: Math.floor(Math.random() * 1000) + 100,
              totalOrders: Math.floor(Math.random() * 200) + 20,
              rating: Math.random() * 2 + 3 // Random rating between 3-5
            },
            createdAt: userData.createdAt || new Date()
          });
        }
      });
      
      console.log('Approved sellers found:', sellersList.length);
        
        // If no sellers found, show empty state
        if (sellersList.length === 0) {
          console.log('No approved sellers found');
          setSellers([]);
        } else {
          // Show all real sellers
          setSellers(sellersList);
        }
      } catch (error) {
        console.error('Error loading sellers:', error);
        // Show empty state on error
        setSellers([]);
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


  const quickViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  // Get products for a specific section
  const getSectionProducts = (productIds: string[]) => {
    return allProducts.filter(product => productIds.includes(product.id));
  };

  // Render section icon based on type
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'featured':
        return <Sparkles className="w-8 h-8 text-white" />;
      case 'bestDeals':
        return <DollarSign className="w-8 h-8 text-white" />;
      case 'offers':
        return <Percent className="w-8 h-8 text-white" />;
      case 'trending':
        return <TrendingUp className="w-8 h-8 text-white" />;
      default:
        return <Package className="w-8 h-8 text-white" />;
    }
  };

  // Render section background gradient based on type
  const getSectionGradient = (type: string) => {
    switch (type) {
      case 'featured':
        return 'from-purple-500 to-pink-600';
      case 'bestDeals':
        return 'from-green-500 to-emerald-600';
      case 'offers':
        return 'from-orange-500 to-red-600';
      case 'trending':
        return 'from-red-500 to-pink-600';
      default:
        return 'from-blue-500 to-purple-600';
    }
  };

  // Helper function to calculate discounted price
  const calculateDiscountedPrice = (product: any, section: any) => {
    if (!section.discountPercentage && !section.discountValue) {
      return product.price;
    }

    if (section.discountType === 'percentage' && section.discountPercentage) {
      return Math.round(product.price * (1 - section.discountPercentage / 100));
    }

    if (section.discountType === 'fixed' && section.discountValue) {
      return Math.max(0, product.price - section.discountValue);
    }

    return product.price;
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
    { 
      name: 'Apple', 
      image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=120&h=60&fit=crop&crop=center',
      description: 'Premium Technology'
    },
    { 
      name: 'Samsung', 
      image: 'https://images.unsplash.com/photo-1511707171631-9ad203683d6d?w=120&h=60&fit=crop&crop=center',
      description: 'Innovation & Quality'
    },
    { 
      name: 'Nike', 
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=60&fit=crop&crop=center',
      description: 'Just Do It'
    },
    { 
      name: 'Adidas', 
      image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=120&h=60&fit=crop&crop=center',
      description: 'Impossible is Nothing'
    },
    { 
      name: 'Sony', 
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&h=60&fit=crop&crop=center',
      description: 'Be Moved'
    },
    { 
      name: 'LG', 
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=120&h=60&fit=crop&crop=center',
      description: 'Life\'s Good'
    }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Main Content */}
      <div className="main-content pt-20 md:pt-24">
        {/* Mobile Category Bar Only */}
        <section className="bg-white border-b border-gray-200 md:hidden">
          <div className="max-w-7xl mx-auto px-3 py-2">
            <div className="flex items-center space-x-3 overflow-x-auto scrollbar-hide pb-1">
              {[
                { name: 'Home', icon: '🏠', color: 'bg-blue-100' },
                { name: 'Men', icon: '👨', color: 'bg-blue-100' },
                { name: 'Women', icon: '👩', color: 'bg-pink-100' },
                { name: 'Kids', icon: '👶', color: 'bg-yellow-100' },
                { name: 'Electronics', icon: '📱', color: 'bg-gray-100' },
                { name: 'Beauty', icon: '💄', color: 'bg-purple-100' },
                { name: 'Sports', icon: '⚽', color: 'bg-green-100' },
                { name: 'Home', icon: '🏡', color: 'bg-orange-100' }
              ].map((category, index) => (
                <Link
                  key={index}
                  to="/categories"
                  className="flex flex-col items-center space-y-1 flex-shrink-0 group"
                >
                  <div className={`w-10 h-10 rounded-full ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <span className="text-lg">{category.icon}</span>
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Quick Category Bar - Desktop */}
        <section className="bg-white border-b border-gray-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide pb-1">
              {[
                { name: 'Home', icon: '🏠', color: 'bg-blue-100' },
                { name: 'Men', icon: '👨', color: 'bg-blue-100' },
                { name: 'Women', icon: '👩', color: 'bg-pink-100' },
                { name: 'Kids', icon: '👶', color: 'bg-yellow-100' },
                { name: 'Electronics', icon: '📱', color: 'bg-gray-100' },
                { name: 'Beauty', icon: '💄', color: 'bg-purple-100' },
                { name: 'Sports', icon: '⚽', color: 'bg-green-100' },
                { name: 'Home', icon: '🏡', color: 'bg-orange-100' }
              ].map((category, index) => (
                <Link
                  key={index}
                  to="/categories"
                  className="flex flex-col items-center space-y-1 flex-shrink-0 group"
                >
                  <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <span className="text-xl">{category.icon}</span>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Categories Section - Mobile First */}
        <section className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
                <p className="text-gray-600 text-sm md:text-base">Discover amazing products across all categories</p>
              </div>
              <Link 
                to="/categories" 
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors text-sm md:text-base"
              >
                View All →
              </Link>
            </div>
            
            {/* Mobile-optimized Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to="/categories"
                  className="group bg-gray-50 rounded-xl p-3 md:p-4 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden mb-2 md:mb-3 mx-auto shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors leading-tight">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-600 hidden sm:block">
                      {category.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Hero Banner - Mobile First */}
        <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-8 md:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="max-w-7xl mx-auto px-3 md:px-4 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 mb-6 md:mb-0 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 leading-tight">
                  SHOWMYFIT MEGA SALE
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-3 md:mb-6 leading-relaxed">
                  Fashion, Electronics, Home & More from Local Stores
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Up to 70% OFF</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8 max-w-md mx-auto md:mx-0">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-3 md:px-6 md:py-4 rounded-xl border border-white/30">
                    <p className="text-xs md:text-sm font-bold text-white">FREE DELIVERY</p>
                    <p className="text-xs text-white/80">On orders above ₹999</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-3 md:px-6 md:py-4 rounded-xl border border-white/30">
                    <p className="text-xs md:text-sm font-bold text-white">LOCAL STORES</p>
                    <p className="text-xs text-white/80">Support your neighborhood</p>
                  </div>
                </div>
                <button className="bg-white text-purple-600 px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto">
                  Shop Now
                </button>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&h=400&fit=crop" 
                  alt="Shopping"
                  className="w-96 h-80 object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>


        {/* Dynamic Admin-Managed Sections */}
        {loadingSections ? (
          <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-3 md:px-4">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Amazing Products</h3>
                <p className="text-gray-600">Please wait while we fetch the best deals for you</p>
              </div>
            </div>
          </section>
        ) : (
          // Sort sections to ensure specific order: Featured -> Best Deals -> Offers -> Trending -> Others
          homePageSections
            .sort((a, b) => {
              const order = ['featured', 'bestDeals', 'offers', 'trending'];
              const aIndex = order.indexOf(a.type);
              const bIndex = order.indexOf(b.type);
              
              // If both are in the priority list, sort by priority
              if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
              }
              // If only one is in priority list, prioritize it
              if (aIndex !== -1) return -1;
              if (bIndex !== -1) return 1;
              // If neither is in priority list, sort by displayOrder
              return a.displayOrder - b.displayOrder;
            })
            .map((section) => {
            const sectionProducts = getSectionProducts(section.products);
            
            return (
              <section key={section.id} className={section.type === 'trending' ? 'py-6 md:py-8 bg-gradient-to-r from-orange-500 to-red-500' : 'py-16 bg-gradient-to-br from-gray-50 to-white'}>
                <div className={section.type === 'trending' ? 'px-4' : 'max-w-7xl mx-auto px-4'}>
                  {section.type === 'trending' ? (
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                      <h2 className="text-xl md:text-2xl font-bold text-white">{section.title}</h2>
                      <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                        <span className="text-white text-sm font-medium">HOT</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center mb-12">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${getSectionGradient(section.type)} rounded-full mb-4`}>
                        {getSectionIcon(section.type)}
                      </div>
                      <h2 className="text-4xl font-bold text-gray-900 mb-4">{section.title}</h2>
                      {section.subtitle && (
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">{section.subtitle}</p>
                      )}
                    </div>
                  )}
                  
                  {sectionProducts.length > 0 ? (
                    <div className={section.type === 'trending' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'}>
                      {sectionProducts.map((product) => (
                        <div 
                          key={product.id} 
                          className={`${section.type === 'trending' ? 'bg-white rounded-lg p-4 hover:shadow-lg transition-shadow touch-manipulation' : 'bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100'} cursor-pointer`}
                          onClick={() => handleProductClick(product.id)}
                        >
                          {section.type === 'trending' ? (
                            // Trending section style (same as hardcoded trending deals)
                            <>
                              <div className="relative mb-3">
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-32 md:h-40 object-cover rounded"
                                />
                                <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  Trending
                                </div>
                                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                  {section.discountPercentage ? `${section.discountPercentage}% OFF` : 'HOT'}
                                </div>
                              </div>
                              <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2">{product.name}</h3>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg md:text-xl font-bold text-gray-900">₹{calculateDiscountedPrice(product, section).toLocaleString()}</span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                )}
                                {calculateDiscountedPrice(product, section) < product.price && (
                                  <span className="text-sm text-gray-500 line-through">₹{product.price.toLocaleString()}</span>
                                )}
                              </div>
                              <button 
                                onClick={(e) => e.stopPropagation()}
                                className="w-full mt-3 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                              >
                                Shop Now
                              </button>
                            </>
                          ) : (
                            <div className="p-3 md:p-5">
                            <div className="relative mb-3 md:mb-4 group/image">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-40 md:h-48 object-cover rounded-lg md:rounded-xl transition-transform duration-300 group-hover:scale-105"
                              />
                              
                              {/* Action Buttons */}
                              <div className="absolute top-2 right-2 md:top-3 md:right-3 flex flex-col space-y-1 md:space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWishlist(product.id);
                                  }}
                                  className="p-1.5 md:p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                                  title={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                  aria-label={wishlist.includes(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                  <Heart className={`w-3 h-3 md:w-4 md:h-4 ${
                                    wishlist.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'
                                  }`} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    quickViewProduct(product);
                                  }}
                                  className="p-1.5 md:p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                                  title="Quick view"
                                  aria-label="Quick view product"
                                >
                                  <Eye className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                                </button>
                              </div>

                              {/* Badges */}
                              <div className="absolute top-2 left-2 md:top-3 md:left-3 flex flex-col space-y-1 md:space-y-2">
                                {product.featured && (
                                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-bold shadow-lg">
                                    ⭐ Featured
                                  </span>
                                )}
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                  </span>
                                )}
                                {/* Admin-managed discount badge */}
                                {section.discountPercentage && section.discountPercentage > 0 && (
                                  <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    {section.discountPercentage}% OFF
                                  </span>
                                )}
                                {section.discountType === 'fixed' && section.discountValue && section.discountValue > 0 && (
                                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                    ₹{section.discountValue} OFF
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2 md:space-y-3">
                              <div>
                                <h3 className="font-bold text-gray-900 line-clamp-2 text-sm md:text-lg mb-1 group-hover:text-blue-600 transition-colors">
                                  {product.name}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-600 font-medium">{product.brand}</p>
                              </div>
                              
                              {/* Rating */}
                              <div className="flex items-center space-x-1 md:space-x-2">
                                <div className="flex items-center bg-yellow-50 px-1.5 py-1 md:px-2 md:py-1 rounded-full">
                                  <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
                                  <span className="text-xs md:text-sm font-bold ml-1">{product.rating?.toFixed(1) || '0.0'}</span>
                                </div>
                                <span className="text-xs md:text-sm text-gray-500">({product.reviews || 0})</span>
                              </div>

                              {/* Price */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-lg md:text-2xl font-bold text-gray-900">₹{calculateDiscountedPrice(product, section).toLocaleString()}</span>
                                  {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="text-xs md:text-sm text-gray-500 line-through">
                                      ₹{product.originalPrice.toLocaleString()}
                                    </div>
                                  )}
                                  {calculateDiscountedPrice(product, section) < product.price && (
                                    <div className="text-xs md:text-sm text-gray-500 line-through">
                                      ₹{product.price.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 md:px-3 md:py-1 rounded-full font-medium">
                                  {product.category}
                                </span>
                              </div>

                              {/* Stock Status */}
                              <div className="flex items-center justify-between text-xs md:text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  (product.stock || 0) > 10 ? 'bg-green-100 text-green-800' :
                                  (product.stock || 0) > 0 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {(product.stock || 0) > 10 ? 'In Stock' : (product.stock || 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                                </span>
                                <span className="text-gray-500 text-xs">{product.stock || 0} left</span>
                              </div>

                              {/* Reserve Button */}
                              <ReserveButton
                                productId={product.id}
                                productName={product.name}
                                sellerId={product.sellerId || 'unknown'}
                                sellerName={product.sellerName || 'Unknown Seller'}
                                price={product.price}
                                image={product.image}
                                size="sm"
                                className="w-full text-xs md:text-sm"
                                variant="primary"
                              />
                            </div>
                          </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No products in this section</p>
                      <p className="text-gray-400">Admin needs to add products to this section</p>
                    </div>
                  )}
                </div>
              </section>
            );
          })
        )}

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
                <p className="text-blue-100 mb-6">Up to {promotionalCards.electronics.discountPercentage}% off on all electronics</p>
                <div className="text-4xl font-bold mb-2">{promotionalCards.electronics.discountPercentage}% OFF</div>
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
                <div className="text-4xl font-bold mb-2">{promotionalCards.fashion.discountPercentage}% OFF</div>
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
                <div className="text-4xl font-bold mb-2">{promotionalCards.home.discountPercentage}% OFF</div>
                <p className="text-sm text-green-200">Free delivery</p>
                <button className="mt-6 bg-white text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Shop Now
                </button>
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


        {/* Featured Brands - Professional Design */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-3 md:px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Trusted Brands</h2>
              <p className="text-gray-600 text-sm md:text-lg">Shop from your favorite premium brands</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
              {featuredBrands.map((brand, index) => (
                <div key={index} className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-blue-200">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 mb-3 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors duration-300">
                      <img 
                        src={brand.image} 
                        alt={brand.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg hidden">
                        {brand.name.charAt(0)}
                      </div>
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-xs text-gray-500 hidden md:block">
                      {brand.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* View All Brands Button */}
            <div className="text-center mt-8">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                View All Brands
              </button>
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
              {allProducts.length > 0 ? (
                // Show actual products from database
                allProducts.slice(0, 6).map((product, index) => {
                  const originalPrice = product.originalPrice || product.price * 1.5; // Generate original price if not available
                  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
                  
                  return (
                    <div key={product.id || index} className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-3 w-40 md:w-48 hover:shadow-lg transition-shadow touch-manipulation">
                      <div className="relative mb-3">
                        <img 
                          src={product.image || product.imageUrl || `https://images.unsplash.com/photo-${1500000000000 + index * 1000000}?w=200&h=200&fit=crop`} 
                          alt={product.name}
                          className="w-full h-24 md:h-32 object-cover rounded"
                        />
                        {discount > 0 && (
                          <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                            {discount}% OFF
                          </div>
                        )}
                      </div>
                      <div className="mb-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{product.category || 'General'}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-xs md:text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm md:text-lg font-bold text-blue-600">₹{product.price?.toLocaleString() || '0'}</span>
                        {originalPrice > product.price && (
                          <span className="text-xs text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Show message when no products available
                <div className="flex-shrink-0 bg-gray-50 rounded-lg p-6 w-full text-center">
                  <p className="text-gray-500 text-sm">No products available</p>
                </div>
              )}
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
              {sellers.length > 0 ? (
                // Show actual products from sellers
                sellers.slice(0, 4).map((seller, index) => {
                  // Get a sample product for this seller (in real app, this would be from recently viewed)
                  const sampleProduct = {
                    name: seller.businessName + ' Store',
                    price: '₹' + (Math.floor(Math.random() * 5000) + 500).toLocaleString(),
                    image: `https://images.unsplash.com/photo-${1500000000000 + index * 1000000}?w=150&h=150&fit=crop`,
                    time: index === 0 ? '2 hours ago' : index === 1 ? '1 day ago' : index === 2 ? '2 days ago' : '3 days ago'
                  };
                  
                  return (
                    <div key={seller.id} className="flex-shrink-0 bg-gray-50 rounded-lg p-3 w-32 md:w-40 hover:bg-gray-100 transition-colors touch-manipulation">
                      <img 
                        src={sampleProduct.image} 
                        alt={sampleProduct.name}
                        className="w-full h-20 md:h-24 object-cover rounded mb-2"
                      />
                      <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2">{sampleProduct.name}</h3>
                      <p className="text-sm font-bold text-blue-600 mb-1">{sampleProduct.price}</p>
                      <p className="text-xs text-gray-500">{sampleProduct.time}</p>
                    </div>
                  );
                })
              ) : (
                // Show message when no products available
                <div className="flex-shrink-0 bg-gray-50 rounded-lg p-6 w-full text-center">
                  <p className="text-gray-500 text-sm">No recently viewed products</p>
                </div>
              )}
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
                    Reserve
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


      {/* Ultra Modern Premium Footer */}
      <footer className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative px-4 py-20">
          <div className="max-w-7xl mx-auto">
            {/* Premium Header Section */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl">
                <span className="text-white font-bold text-2xl">S</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-4">
                Showmyfit
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Revolutionizing local commerce by connecting customers with amazing local stores. 
                Discover, shop, and support your community like never before.
              </p>
            </div>

            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
              {/* Company Info - Enhanced */}
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-bold mb-6 text-white">About Showmyfit</h3>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  We're building the future of local shopping by creating seamless connections between customers and local businesses. 
                  Our platform empowers communities and drives economic growth.
                </p>
                

                {/* Enhanced Social Media */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                  <div className="flex space-x-4">
                    <a href="https://www.facebook.com/showmyfitofficial?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="group w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center hover:from-blue-500 hover:to-blue-600 transition-all duration-300 hover:scale-110 hover:shadow-lg" title="Facebook">
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a href="https://youtube.com/@showmyfit?si=wx8ga-Yya5PqVA7f" target="_blank" rel="noopener noreferrer" className="group w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center hover:from-red-500 hover:to-red-600 transition-all duration-300 hover:scale-110 hover:shadow-lg" title="YouTube">
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                    <a href="https://www.instagram.com/showmyfit?utm_source=qr" target="_blank" rel="noopener noreferrer" className="group w-12 h-12 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center hover:from-pink-500 hover:to-purple-500 transition-all duration-300 hover:scale-110 hover:shadow-lg" title="Instagram">
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281h-1.441v1.441h1.441V7.707zm-7.83 1.441c-.807 0-1.441.634-1.441 1.441s.634 1.441 1.441 1.441 1.441-.634 1.441-1.441-.634-1.441-1.441-1.441z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Quick Links - Enhanced */}
              <div>
                <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-3"></span>
                  Quick Links
                </h4>
                <ul className="space-y-4">
                  <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors text-lg flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    About Us
                  </Link></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    How It Works
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Find Stores
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Become a Partner
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Careers
                  </a></li>
                </ul>
              </div>

              {/* Customer Service - Enhanced */}
              <div>
                <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                  <span className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mr-3"></span>
                  Support
                </h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Help Center
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Contact Us
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Shipping Info
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Returns & Refunds
                  </a></li>
                  <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-lg flex items-center group">
                    <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    FAQ
                  </a></li>
                </ul>
              </div>

            </div>

            {/* Contact Info - Email Only */}
            <div>
              <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mr-3"></span>
                Contact
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 group">
                  <span className="w-5 h-5 text-purple-400 mt-1 group-hover:scale-110 transition-transform">📧</span>
                  <span className="text-gray-300 text-lg">showmyfitapp@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Enhanced Social Media Section */}
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/10">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6">
                  <span className="text-white text-2xl">📱</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Follow Us for Updates</h3>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Stay connected with Showmyfit on social media for daily updates, 
                  exclusive deals, and behind-the-scenes content!
                </p>
                
                {/* Social Media Links */}
                <div className="flex justify-center space-x-6 mb-8">
                  <a href="https://www.facebook.com/showmyfitofficial?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="group w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center hover:from-blue-500 hover:to-blue-600 transition-all duration-300 hover:scale-110 hover:shadow-xl" title="Facebook">
                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="https://youtube.com/@showmyfit?si=wx8ga-Yya5PqVA7f" target="_blank" rel="noopener noreferrer" className="group w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl flex items-center justify-center hover:from-red-500 hover:to-red-600 transition-all duration-300 hover:scale-110 hover:shadow-xl" title="YouTube">
                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  <a href="https://www.instagram.com/showmyfit?utm_source=qr" target="_blank" rel="noopener noreferrer" className="group w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center hover:from-pink-500 hover:to-purple-500 transition-all duration-300 hover:scale-110 hover:shadow-xl" title="Instagram">
                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281h-1.441v1.441h1.441V7.707zm-7.83 1.441c-.807 0-1.441.634-1.441 1.441s.634 1.441 1.441 1.441 1.441-.634 1.441-1.441-.634-1.441-1.441-1.441z"/>
                    </svg>
                  </a>
                </div>
                
              </div>
            </div>

            {/* Premium Newsletter Section */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-8 mb-12 border border-white/10">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
                  <span className="text-white text-2xl">📧</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Stay in the Loop</h3>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Get exclusive access to new stores, special deals, and community updates. 
                  Be the first to know about exciting local discoveries!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Subscribe
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-4">
                  Unsubscribe anytime.
                </p>
              </div>
            </div>

            {/* Become a Seller Section */}
            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-8 mb-12 border border-white/10">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-6">
                  <span className="text-white text-2xl">🏪</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Ready to Start Selling?</h3>
                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of successful sellers on Showmyfit. Start your online store today 
                  and reach customers in your local community and beyond!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <div className="text-3xl mb-3">🚀</div>
                    <h4 className="text-xl font-bold text-white mb-2">Quick Setup</h4>
                    <p className="text-gray-300 text-sm">Get started in minutes with our easy onboarding process</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <div className="text-3xl mb-3">💰</div>
                    <h4 className="text-xl font-bold text-white mb-2">Low Fees</h4>
                    <p className="text-gray-300 text-sm">Competitive commission rates to maximize your profits</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <div className="text-3xl mb-3">🎯</div>
                    <h4 className="text-xl font-bold text-white mb-2">Local Focus</h4>
                    <p className="text-gray-300 text-sm">Connect with customers in your neighborhood</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/shop/auth"
                    className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Become a Seller Now
                  </Link>
                  <a
                    href="#"
                    className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300"
                  >
                    Learn More
                  </a>
                </div>
                
              </div>
            </div>

            {/* Enhanced Bottom Bar */}
            <div className="border-t border-white/10 pt-8">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
                <div className="text-center lg:text-left">
                  <div className="text-gray-300 text-lg mb-2">
                    © 2024 Showmyfit. All rights reserved.
                  </div>
                  <div className="text-gray-400 text-sm mb-2">
                    Crafted with ❤️ for local communities worldwide
                  </div>
                  <div className="text-gray-300 text-sm">
                    Contact us: showmyfitapp@gmail.com
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-8">
                  <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Privacy Policy</Link>
                  <Link to="/terms" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Terms of Service</Link>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Cookie Policy</a>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Accessibility</a>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-sm">Made with</span>
                  <div className="w-4 h-4 text-red-500 animate-pulse">❤️</div>
                  <span className="text-gray-400 text-sm">in India</span>
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