import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, Package, Star, Heart, Clock, 
  ArrowRight, Sparkles, Eye, ShoppingCart, Phone, Map, ThumbsUp, X,
  DollarSign, Percent, TrendingUp
} from 'lucide-react';
import ReserveButton from '../components/common/ReserveButton';
// import Chatbot from '../components/common/Chatbot';
import { collection, query, getDocs, where, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getCurrentLocationWithDetails, sortStoresByDistance, parseAddressToCoordinates } from '../utils/distance';
import { useWishlist } from '../contexts/WishlistContext';
import { useSEO, SEOConfigs } from '../hooks/useSEO';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // SEO Configuration
  useSEO(SEOConfigs.home);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string>('');
  const [nearbyStores, setNearbyStores] = useState<any[]>([]);
  const [showNearbyStores, setShowNearbyStores] = useState(false);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState<string>('');
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [homePageSections, setHomePageSections] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [promotionalCards, setPromotionalCards] = useState({
    electronics: { discountPercentage: 50 },
    fashion: { discountPercentage: 30 },
    home: { discountPercentage: 40 }
  });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Auto-slide carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Update suggestions when products or recently viewed changes
  useEffect(() => {
    if (allProducts.length > 0) {
      const suggestions = generateSuggestions();
      setSuggestedProducts(suggestions);
    }
  }, [allProducts, recentlyViewed]);

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

        // Load recently viewed products from localStorage
        const storedRecentlyViewed = localStorage.getItem('recentlyViewedProducts');
        if (storedRecentlyViewed) {
          try {
            const viewedIds = JSON.parse(storedRecentlyViewed);
            setRecentlyViewed(viewedIds);
          } catch (error) {
            console.error('Error parsing recently viewed products:', error);
            setRecentlyViewed([]);
          }
        }

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
    { name: 'Women', description: 'Fashion for women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop' },
    { name: 'Kids', description: 'Children\'s fashion', image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&h=200&fit=crop' },
    { name: 'Men', description: 'Fashion for men', image: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=200&h=200&fit=crop&crop=face' },
    { name: 'Watches', description: 'Timepieces', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop' },
    { name: 'Accessories', description: 'Style accessories', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop' },
    { name: 'Jewellery', description: 'Elegant jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop' },
    { name: 'Sports', description: 'Active wear', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop' }
  ];

  const toggleWishlist = async (product: any) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        brand: product.brand || 'Unknown Brand',
        category: product.category,
        sellerId: product.sellerId,
        sellerName: product.sellerName
      });
    }
  };


  const quickViewProduct = (product: any) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const handleProductClick = (productId: string) => {
    // Add to recently viewed
    const updatedRecentlyViewed = [productId, ...recentlyViewed.filter(id => id !== productId)].slice(0, 10);
    setRecentlyViewed(updatedRecentlyViewed);
    localStorage.setItem('recentlyViewedProducts', JSON.stringify(updatedRecentlyViewed));
    
    navigate(`/product/${productId}`);
  };

  // Get products for a specific section
  const getSectionProducts = (productIds: string[]) => {
    return allProducts.filter(product => productIds.includes(product.id));
  };

  // Smart suggestions algorithm based on recently viewed products
  const generateSuggestions = () => {
    if (allProducts.length === 0) return [];

    // If no recently viewed products, show random popular products
    if (recentlyViewed.length === 0) {
      return allProducts
        .filter(product => product.status === 'active')
        .slice(0, 4);
    }

    // Get recently viewed products
    const viewedProducts = allProducts.filter(product => 
      recentlyViewed.includes(product.id) && product.status === 'active'
    );

    if (viewedProducts.length === 0) {
      return allProducts
        .filter(product => product.status === 'active')
        .slice(0, 4);
    }

    // Analyze viewing patterns
    const categories = viewedProducts.map(p => p.category).filter(Boolean);
    const sellers = viewedProducts.map(p => p.sellerId).filter(Boolean);
    const priceRange = viewedProducts.map(p => p.price);
    const avgPrice = priceRange.reduce((sum, price) => sum + price, 0) / priceRange.length;

    // Generate suggestions based on patterns
    const suggestions: any[] = [];

    // 1. Same category products (40% weight)
    const categoryProducts = allProducts.filter(product => 
      product.status === 'active' && 
      !recentlyViewed.includes(product.id) &&
      categories.includes(product.category)
    );

    // 2. Same seller products (30% weight)
    const sellerProducts = allProducts.filter(product => 
      product.status === 'active' && 
      !recentlyViewed.includes(product.id) &&
      sellers.includes(product.sellerId)
    );

    // 3. Similar price range products (20% weight)
    const priceProducts = allProducts.filter(product => 
      product.status === 'active' && 
      !recentlyViewed.includes(product.id) &&
      Math.abs(product.price - avgPrice) <= avgPrice * 0.5 // Within 50% of average price
    );

    // 4. Popular products as fallback (10% weight)
    const popularProducts = allProducts.filter(product => 
      product.status === 'active' && 
      !recentlyViewed.includes(product.id)
    );

    // Combine and score suggestions
    const allSuggestions = [...categoryProducts, ...sellerProducts, ...priceProducts, ...popularProducts];
    
    // Remove duplicates and score
    const uniqueSuggestions = allSuggestions.reduce((acc, product) => {
      if (!acc.find(p => p.id === product.id)) {
        let score = 0;
        
        // Category match
        if (categories.includes(product.category)) score += 4;
        
        // Seller match
        if (sellers.includes(product.sellerId)) score += 3;
        
        // Price similarity
        if (Math.abs(product.price - avgPrice) <= avgPrice * 0.5) score += 2;
        
        acc.push({ ...product, suggestionScore: score });
      }
      return acc;
    }, [] as any[]);

    // Sort by score and return top 4
    return uniqueSuggestions
      .sort((a, b) => b.suggestionScore - a.suggestionScore)
      .slice(0, 4);
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

  // Render section background gradient based on type - Diwali Theme
  const getSectionGradient = (type: string) => {
    switch (type) {
      case 'featured':
        return 'from-yellow-500 to-orange-500';
      case 'bestDeals':
        return 'from-red-500 to-pink-500';
      case 'offers':
        return 'from-orange-500 to-red-500';
      case 'trending':
        return 'from-red-500 to-yellow-500';
      default:
        return 'from-orange-500 to-yellow-500';
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
                <button
                  key={index}
                  onClick={() => navigate('/browse')}
                  className="flex flex-col items-center space-y-1 flex-shrink-0 group"
                >
                  <div className={`w-10 h-10 rounded-full ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <span className="text-lg">{category.icon}</span>
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Quick Category Bar - Desktop */}
        <section className="bg-white border-b border-gray-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center space-x-6 overflow-x-auto scrollbar-hide pb-1">
              {[
                { name: 'Men', icon: '👨', color: 'bg-blue-100' },
                { name: 'Women', icon: '👩', color: 'bg-pink-100' },
                { name: 'Kids', icon: '👶', color: 'bg-yellow-100' },
                { name: 'Electronics', icon: '📱', color: 'bg-gray-100' },
                { name: 'Beauty', icon: '💄', color: 'bg-purple-100' },
                { name: 'Sports', icon: '⚽', color: 'bg-green-100' }
              ].map((category, index) => (
                <button
                  key={index}
                  onClick={() => navigate('/browse')}
                  className="flex flex-col items-center space-y-1 flex-shrink-0 group"
                >
                  <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <span className="text-xl">{category.icon}</span>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Promotional Banner Carousel Section */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-3 md:px-4 py-2 md:py-6">
            <div className="relative rounded-lg md:rounded-xl lg:rounded-2xl overflow-hidden shadow-lg">
              <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 overflow-hidden">
                <div 
                  className="flex transition-transform duration-1000 ease-in-out" 
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {/* Slide 1 - Fashion Girl */}
                  <div className="w-full flex-shrink-0 relative">
                    <img
                      src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop"
                      alt="Fashion Collection"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 flex items-center">
                      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="max-w-sm sm:max-w-md">
                          <div className="mb-2">
                            <span className="bg-pink-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                              Women's Fashion
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
                            UP TO 60% OFF
                          </h2>
                          <p className="text-white/90 text-xs sm:text-sm md:text-lg mb-3 sm:mb-4 md:mb-6 leading-relaxed">
                            Discover trendy fashion for every occasion
                          </p>
                          <button 
                            onClick={() => navigate('/browse')}
                            className="bg-white text-gray-900 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-bold text-xs sm:text-sm md:text-base hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Shop Now
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        AD
                      </span>
                    </div>
                  </div>

                  {/* Slide 2 - Electronics */}
                  <div className="w-full flex-shrink-0 relative">
                    <img
                      src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop"
                      alt="Electronics Sale"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 flex items-center">
                      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="max-w-sm sm:max-w-md">
                          <div className="mb-2">
                            <span className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                              Electronics
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
                            UP TO 50% OFF
                          </h2>
                          <p className="text-white/90 text-xs sm:text-sm md:text-lg mb-3 sm:mb-4 md:mb-6 leading-relaxed">
                            Latest gadgets at amazing prices
                          </p>
                          <button 
                            onClick={() => navigate('/browse')}
                            className="bg-white text-gray-900 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-bold text-xs sm:text-sm md:text-base hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Shop Now
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        AD
                      </span>
                    </div>
                  </div>

                  {/* Slide 3 - Beauty & Fashion Girl */}
                  <div className="w-full flex-shrink-0 relative">
                    <img
                      src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=1200&h=400&fit=crop"
                      alt="Beauty Collection"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute inset-0 flex items-center">
                      <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                        <div className="max-w-sm sm:max-w-md">
                          <div className="mb-2">
                            <span className="bg-purple-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                              Beauty & Fashion
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
                            UP TO 70% OFF
                          </h2>
                          <p className="text-white/90 text-xs sm:text-sm md:text-lg mb-3 sm:mb-4 md:mb-6 leading-relaxed">
                            Look fabulous with our beauty collection
                          </p>
                          <button 
                            onClick={() => navigate('/browse')}
                            className="bg-white text-gray-900 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-bold text-xs sm:text-sm md:text-base hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Shop Now
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                        AD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-10">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 shadow-lg ${
                        currentSlide === index ? 'bg-white' : 'bg-white/60'
                      }`}
                      title={`Go to slide ${index + 1}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + 3) % 3)}
                  className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-2.5 rounded-full transition-all duration-300 shadow-lg z-10"
                  title="Previous slide"
                  aria-label="Previous slide"
                >
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 rotate-180" />
                </button>
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % 3)}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 sm:p-2.5 rounded-full transition-all duration-300 shadow-lg z-10"
                  title="Next slide"
                  aria-label="Next slide"
                >
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Hero Banner - Diwali Festive */}
        <section className="bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 py-4 md:py-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/20 via-orange-300/20 to-red-300/20"></div>
          {/* Diwali Sparkles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-300 rounded-full animate-pulse"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-orange-300 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-20 w-5 h-5 bg-red-300 rounded-full animate-pulse delay-2000"></div>
            <div className="absolute bottom-10 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-orange-400 rounded-full animate-pulse delay-1500"></div>
            <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-red-400 rounded-full animate-pulse delay-3000"></div>
          </div>
          <div className="max-w-7xl mx-auto px-3 md:px-4 relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 mb-6 md:mb-0 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-6 leading-tight drop-shadow-lg">
                  🪔 DIWALI MEGA FESTIVAL SALE 🪔
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-3 md:mb-4 leading-relaxed drop-shadow-md">
                  ✨ Celebrate with Amazing Deals on Fashion, Electronics & More ✨
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 md:mb-5">Up to 70% OFF</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6 max-w-md mx-auto md:mx-0">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-3 md:px-6 md:py-4 rounded-xl border border-white/30">
                    <p className="text-xs md:text-sm font-bold text-white">FREE DELIVERY</p>
                    <p className="text-xs text-white/80">On orders above ₹999</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-3 md:px-6 md:py-4 rounded-xl border border-white/30">
                    <p className="text-xs md:text-sm font-bold text-white">LOCAL STORES</p>
                    <p className="text-xs text-white/80">Support your neighborhood</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/browse')}
                  className="bg-white text-purple-600 px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto mb-2"
                >
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

        {/* Continue Browsing These Products */}
        <section className="py-4 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="px-4">
            <div className="flex items-center justify-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 text-center">
                Continue Browsing These Products
              </h2>
            </div>
            <div className="relative">
              <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
                {allProducts.slice(0, Math.floor(allProducts.length / 2) * 2).map((product, index) => {
                  const originalPrice = product.originalPrice || product.price * 1.3;
                  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
                  
                  return (
                    <div 
                      key={product.id || index}
                      className="flex-shrink-0 w-32 cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-orange-200 hover:border-yellow-300">
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <img 
                            src={product.image || `https://images.unsplash.com/photo-${1500000000000 + index * 1000000}?w=300&h=300&fit=crop`} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://images.unsplash.com/photo-${1500000000000 + index * 1000000}?w=300&h=300&fit=crop`;
                            }}
                          />
                          {/* Discount Badge */}
                          {discount > 0 && (
                            <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-1 py-0.5 rounded text-xs font-bold shadow-md">
                              🎉 {discount}%
                            </div>
                          )}
                          {/* Wishlist Button */}
                          <button 
                            className="absolute top-1 right-1 bg-white/90 hover:bg-white p-1 rounded-full shadow-sm transition-all"
                            aria-label="Add to wishlist"
                          >
                            <Heart className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="p-2">
                          <h3 className="text-xs font-semibold text-gray-900 line-clamp-1 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                          
                          {/* Price */}
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Scroll Indicators */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-2">
                <button 
                  className="bg-white/90 hover:bg-white shadow-md rounded-full p-2 transition-all"
                  aria-label="Scroll left"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-2">
                <button 
                  className="bg-white/90 hover:bg-white shadow-md rounded-full p-2 transition-all"
                  aria-label="Scroll right"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Suggestions for You - Mobile Optimized */}
        <section className="py-3 md:py-4 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="px-4">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Suggestions for You</h2>
              <button 
                onClick={() => navigate('/browse')}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
              >
                View All →
              </button>
                  </div>
            <div className="relative">
              <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
              {allProducts.length > 0 ? (
                allProducts.slice(0, Math.floor(allProducts.length / 2) * 2).map((product, index) => {
                  const originalPrice = product.originalPrice || product.price * 1.5;
                  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
                  
                  return (
                    <div 
                      key={product.id || index}
                      className="flex-shrink-0 w-32 cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 border-orange-200 hover:border-yellow-300">
                        {/* Product Image */}
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          <img 
                            src={product.image || `https://images.unsplash.com/photo-${1500000000000 + index * 1000000}?w=300&h=300&fit=crop`} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://images.unsplash.com/photo-${1500000000000 + index * 1000000}?w=300&h=300&fit=crop`;
                            }}
                          />
                          {/* Discount Badge */}
                          {discount > 0 && (
                            <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-1 py-0.5 rounded text-xs font-bold shadow-md">
                              🎉 {discount}%
                            </div>
                          )}
                          {/* Wishlist Button */}
                          <button 
                            className="absolute top-1 right-1 bg-white/90 hover:bg-white p-1 rounded-full shadow-sm transition-all"
                            aria-label="Add to wishlist"
                          >
                            <Heart className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="p-2">
                          <h3 className="text-xs font-semibold text-gray-900 line-clamp-1 mb-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                          
                          {/* Price */}
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback when no products available
                <div className="flex-shrink-0 w-full text-center py-8">
                  <p className="text-gray-500 text-sm">No products available</p>
                </div>
              )}
              </div>
              
              {/* Scroll Indicators */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-2">
                <button 
                  className="bg-white/90 hover:bg-white shadow-md rounded-full p-2 transition-all"
                  aria-label="Scroll left"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-2">
                <button 
                  className="bg-white/90 hover:bg-white shadow-md rounded-full p-2 transition-all"
                  aria-label="Scroll right"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
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
            
            // Don't render the section if there are no products
            if (sectionProducts.length === 0) {
              return null;
            }
            
            return (
              <section key={section.id} className={section.type === 'trending' ? 'py-6 md:py-8 bg-gradient-to-r from-orange-500 to-red-500' : 'py-16 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50'}>
                <div className={section.type === 'trending' ? 'px-4' : 'max-w-7xl mx-auto px-4'}>
                  {section.type === 'trending' ? (
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <h2 className="text-lg md:text-xl font-bold text-white">{section.title}</h2>
                      <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                        <span className="text-white text-sm font-medium">HOT</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center mb-12">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${getSectionGradient(section.type)} rounded-full mb-4`}>
                        {getSectionIcon(section.type)}
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">🪔 {section.title} 🪔</h2>
                      {section.subtitle && (
                        <p className="text-gray-600 text-base max-w-2xl mx-auto">{section.subtitle}</p>
                      )}
                    </div>
                  )}
                  
                  <div className={section.type === 'trending' ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-2 gap-3'}>
                      {sectionProducts.map((product) => (
                        <div 
                          key={product.id} 
                          className={`${section.type === 'trending' ? 'bg-white rounded-lg p-3 hover:shadow-lg transition-shadow touch-manipulation border-2 border-red-200' : 'bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group border-2 border-orange-200 hover:border-yellow-300'} cursor-pointer`}
                          onClick={() => handleProductClick(product.id)}
                        >
                          {section.type === 'trending' ? (
                            // Trending section style (same as hardcoded trending deals)
                            <>
                              <div className="relative mb-3">
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-28 object-cover rounded"
                                />
                                <div className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-2 py-1 rounded text-xs font-bold shadow-md">
                                  🔥 Trending
                                </div>
                                <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded text-xs font-bold shadow-md">
                                  {section.discountPercentage ? `🎉 ${section.discountPercentage}% OFF` : '🔥 HOT'}
                                </div>
                              </div>
                              <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-2">{product.name}</h3>
                              {product.sellerName && (
                                <p className="text-xs text-blue-600 font-medium mb-2">by {product.sellerName}</p>
                              )}
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/browse');
                                }}
                                className="w-full mt-3 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                              >
                                Shop Now
                              </button>
                            </>
                          ) : (
                            <div className="p-3">
                            <div className="relative mb-3 group/image">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-32 object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                              />
                              
                              {/* Action Buttons */}
                              <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleWishlist(product);
                                  }}
                                  className="p-1.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                                  title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                  aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                  <Heart className={`w-3 h-3 ${
                                    isInWishlist(product.id) ? 'text-red-500 fill-current' : 'text-gray-600'
                                  }`} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    quickViewProduct(product);
                                  }}
                                  className="p-1.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all"
                                  title="Quick view"
                                  aria-label="Quick view product"
                                >
                                  <Eye className="w-3 h-3 text-gray-600" />
                                </button>
                              </div>

                              {/* Badges */}
                              <div className="absolute top-2 left-2 flex flex-col space-y-1">
                                {product.featured && (
                                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                                    🪔 Featured
                                  </span>
                                )}
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                                    🎉 {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                  </span>
                                )}
                                {/* Admin-managed discount badge */}
                                {section.discountPercentage && section.discountPercentage > 0 && (
                                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
                                    🎉 {section.discountPercentage}% OFF
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
                                {product.sellerName && (
                                  <p className="text-xs text-blue-600 font-medium">by {product.sellerName}</p>
                                )}
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
                </div>
              </section>
            );
          })
        )}

        {/* Random Products - Mobile Optimized */}
        <section className="py-6 md:py-8 bg-white">
          <div className="px-4">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Random Products</h2>
              <button 
                onClick={() => navigate('/browse')}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
              >
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
                    <div key={product.id || index} className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-3 w-40 md:w-48 hover:shadow-lg transition-shadow touch-manipulation cursor-pointer" onClick={() => handleProductClick(product.id)}>
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
                      {product.sellerName && (
                        <p className="text-xs text-blue-600 font-medium mb-1">by {product.sellerName}</p>
                      )}
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
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recently Viewed</h2>
              <button 
                onClick={() => navigate('/browse')}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {allProducts.length > 0 ? (
                // Show actual products from database as recently viewed
                allProducts.slice(0, 4).map((product, index) => {
                  const timeLabels = ['2 hours ago', '1 day ago', '2 days ago', '3 days ago'];
                  
                  return (
                    <div 
                      key={product.id || index} 
                      className="flex-shrink-0 bg-gray-50 rounded-lg p-3 w-32 md:w-40 hover:bg-gray-100 transition-colors touch-manipulation cursor-pointer"
                      onClick={() => handleProductClick(product.id)}
                    >
                      <img 
                        src={product.image || `https://images.unsplash.com/photo-${1500000000000 + index * 1000000}?w=150&h=150&fit=crop`} 
                        alt={product.name}
                        className="w-full h-20 md:h-24 object-cover rounded mb-2"
                        onError={(e) => {
                          e.currentTarget.src = `https://images.unsplash.com/photo-${1500000000000 + index * 1000000}?w=150&h=150&fit=crop`;
                        }}
                      />
                      <h3 className="font-medium text-gray-900 text-xs mb-1 line-clamp-2">{product.name}</h3>
                      {product.sellerName && (
                        <p className="text-xs text-blue-600 font-medium mb-1">by {product.sellerName}</p>
                      )}
                      <p className="text-sm font-bold text-blue-600 mb-1">₹{product.price?.toLocaleString() || '0'}</p>
                      <p className="text-xs text-gray-500">{timeLabels[index] || 'Recently'}</p>
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

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {nearbyStores.map((seller) => (
                  <div key={seller.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => viewSellerProducts(seller)}>
                    {/* Store Header */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-green-600">{seller.businessName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white line-clamp-1">{seller.businessName}</h3>
                          <p className="text-xs text-white/90">{seller.businessType}</p>
                        </div>
                      </div>
                      {seller.distance && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/80">Distance</span>
                          <span className="text-xs font-semibold text-white">{(seller.distance || 0).toFixed(1)} km away</span>
                        </div>
                      )}
                    </div>

                    {/* Store Info */}
                    <div className="p-3">
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-600 line-clamp-2">{seller.address}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                          <p className="text-xs text-gray-600">{seller.phone}</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        className="w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewSellerProducts(seller);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        View Store
                      </button>
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
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {(showNearbyStores ? sellers.filter(seller => !nearbyStores.some(nearby => nearby.id === seller.id)) : sellers).map((seller) => (
                  <div key={seller.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => viewSellerProducts(seller)}>
                    {/* Store Header */}
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <span className="text-xl font-bold text-blue-600">{seller.businessName.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white line-clamp-1">{seller.businessName}</h3>
                          <p className="text-xs text-white/90">{seller.businessType}</p>
                        </div>
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="p-3">
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-600 line-clamp-2">{seller.address}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                          <p className="text-xs text-gray-600">{seller.phone}</p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button 
                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          viewSellerProducts(seller);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        View Store
                      </button>
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
                <button 
                  onClick={() => navigate('/browse')}
                  className="inline-flex items-center space-x-2 bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  <span>View All Stores</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
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
                    onClick={() => toggleWishlist(selectedProduct)}
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl hover:border-red-500 hover:text-red-500 transition-colors"
                    title={isInWishlist(selectedProduct.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    aria-label={isInWishlist(selectedProduct.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-5 h-5 ${
                      isInWishlist(selectedProduct.id) ? 'text-red-500 fill-current' : 'text-gray-400'
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
                    <svg className="w-8 h-8 group-hover:scale-110 transition-transform text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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