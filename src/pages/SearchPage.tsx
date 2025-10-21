import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, MapPin, Star, Package, Phone, Eye, Heart, Filter,
  Store, Navigation, Clock, Truck, Shield, Users, TrendingUp, Map
} from 'lucide-react';
import GoogleMapLocation from '../components/common/GoogleMapLocation';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useWishlist } from '../contexts/WishlistContext';

const SearchPage: React.FC = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sellers, setSellers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [searchType, setSearchType] = useState<'products' | 'shops'>('products');

  // Get search query from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const queryParam = urlParams.get('q');
    if (queryParam) {
      setSearchQuery(decodeURIComponent(queryParam));
    }
  }, [location.search]);

  const toggleWishlist = async (seller: any) => {
    // For shop cards, we'll use the seller ID as the product ID
    const productId = `shop-${seller.id}`;
    
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist({
        productId: productId,
        name: seller.businessName || 'Shop',
        price: 0, // Shops don't have prices
        image: seller.businessImage || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop',
        brand: 'Shop',
        category: 'Store',
        sellerId: seller.id,
        sellerName: seller.businessName
      });
    }
  };

  const categories = [
    'All', 'Fashion', 'Electronics', 'Beauty', 'Home', 'Sports', 'Books', 'Food'
  ];

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Re-sort sellers when user location changes
  useEffect(() => {
    if (userLocation && sellers.length > 0) {
      const sellersWithDistance = sellers.map(seller => {
        if (seller.location && seller.location.lat && seller.location.lng) {
          const distance = calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            seller.location.lat, 
            seller.location.lng
          );
          return { ...seller, distance };
        }
        return { ...seller, distance: null };
      });
      
      // Sort by distance (nearest first), then by rating for sellers without location
      const sortedSellers = sellersWithDistance.sort((a, b) => {
        if (a.distance === null && b.distance === null) {
          return (b.stats?.rating || 0) - (a.stats?.rating || 0);
        }
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
      
      console.log('Re-sorting sellers by distance:', sortedSellers.map(s => ({ 
        name: s.businessName, 
        distance: s.distance ? `${(s.distance || 0).toFixed(2)} km` : 'No location' 
      })));
      setSellers(sortedSellers);
    }
  }, [userLocation]);

  // Fetch sellers from database
  useEffect(() => {
    const fetchSellers = async () => {
      setLoadingSellers(true);
      try {
        console.log('Loading approved sellers from users collection in SearchPage...');
        
        // Query users collection for approved sellers (shop role with approved status)
        const usersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'shop')
        );
        const snapshot = await getDocs(usersQuery);
        
        console.log('Total users with shop role found in SearchPage:', snapshot.docs.length);
        
        const sellersList: any[] = [];
        snapshot.docs.forEach((doc) => {
          const userData = doc.data();
          console.log('User data in SearchPage:', { 
            id: doc.id, 
            role: userData.role, 
            businessName: userData.businessName,
            address: userData.address 
          });
          
          // Only include users who are approved sellers
          if (userData.role === 'shop' && userData.sellerApplication?.status === 'approved') {
            // Format location data for GoogleMapLocation component
            let locationData = null;
            if (userData.location) {
              // If location is already in the correct format
              if (userData.location.lat && userData.location.lng) {
                locationData = {
                  lat: userData.location.lat,
                  lng: userData.location.lng,
                  address: userData.location.address || userData.address
                };
              }
              // If location has latitude/longitude properties
              else if (userData.location.latitude && userData.location.longitude) {
                locationData = {
                  lat: userData.location.latitude,
                  lng: userData.location.longitude,
                  address: userData.location.address || userData.address
                };
              }
            }

            sellersList.push({
              id: doc.id,
              userId: doc.id,
              name: userData.displayName || userData.name || 'Unknown Seller',
              email: userData.email || 'No email',
              phone: userData.phone || 'No phone',
              businessName: userData.businessName || 'No business name',
              businessType: userData.businessType || 'No type',
              address: userData.address || userData.businessAddress || 'No address',
              location: locationData, // Properly formatted location data
              profileImage: userData.profileImage || '', // Add profile picture
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
        
        console.log('Approved sellers found in SearchPage:', sellersList.length);
        
        // If no sellers found, show empty state
        if (sellersList.length === 0) {
          console.log('No approved sellers found in SearchPage');
          setSellers([]);
        } else {
          // Sort sellers by distance if user location is available
          if (userLocation) {
            const sellersWithDistance = sellersList.map(seller => {
              if (seller.location && seller.location.lat && seller.location.lng) {
                const distance = calculateDistance(
                  userLocation.lat, 
                  userLocation.lng, 
                  seller.location.lat, 
                  seller.location.lng
                );
                return { ...seller, distance };
              }
              return { ...seller, distance: null };
            });
            
            // Sort by distance (nearest first), then by rating for sellers without location
            const sortedSellers = sellersWithDistance.sort((a, b) => {
              if (a.distance === null && b.distance === null) {
                return (b.stats?.rating || 0) - (a.stats?.rating || 0); // Sort by rating if no distance
              }
              if (a.distance === null) return 1; // Sellers without location go to end
              if (b.distance === null) return -1;
              return a.distance - b.distance; // Sort by distance (nearest first)
            });
            
            console.log('Sellers sorted by distance:', sortedSellers.map(s => ({ 
              name: s.businessName, 
              distance: s.distance ? `${(s.distance || 0).toFixed(2)} km` : 'No location' 
            })));
            setSellers(sortedSellers);
          } else {
            // If no user location, sort by rating
            const sortedSellers = sellersList.sort((a, b) => 
              (b.stats?.rating || 0) - (a.stats?.rating || 0)
            );
            setSellers(sortedSellers);
          }
        }
      } catch (error) {
        console.error('Error loading sellers in SearchPage:', error);
        // Show empty state on error
        setSellers([]);
      } finally {
        setLoadingSellers(false);
      }
    };

    fetchSellers();
  }, []);

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        console.log('🛍️ Loading products from Firebase...');
        
        const productsQuery = query(collection(db, 'products'));
        const snapshot = await getDocs(productsQuery);
        
        console.log('📦 Total products found:', snapshot.docs.length);
        
        const productsList: any[] = [];
        snapshot.docs.forEach((doc) => {
          const productData = doc.data();
          console.log('🔍 Product data:', { id: doc.id, name: productData.name, status: productData.status });
          
          // Only include active products
          if (productData.status === 'active') {
            productsList.push({
              id: doc.id,
              ...productData,
              createdAt: productData.createdAt?.toDate() || new Date(),
              updatedAt: productData.updatedAt?.toDate() || new Date()
            });
          }
        });
        
        console.log('✅ Active products found:', productsList.length);
        console.log('📋 Products list:', productsList);
        
        // If no products found, add some sample products for testing
        if (productsList.length === 0) {
          console.log('⚠️ No products found, adding sample products for testing');
          const sampleProducts = [
            {
              id: 'sample-1',
              name: 'Sample Product 1',
              brand: 'Sample Brand',
              price: 999,
              category: 'Electronics',
              description: 'This is a sample product for testing',
              image: 'https://via.placeholder.com/300',
              status: 'active',
              rating: 4.5,
              reviews: 10
            },
            {
              id: 'sample-2',
              name: 'Sample Product 2',
              brand: 'Sample Brand',
              price: 1299,
              category: 'Fashion',
              description: 'This is another sample product for testing',
              image: 'https://via.placeholder.com/300',
              status: 'active',
              rating: 4.2,
              reviews: 5
            }
          ];
          setProducts(sampleProducts);
        } else {
          setProducts(productsList);
        }
      } catch (error) {
        console.error('❌ Error loading products:', error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setCurrentLocation('Getting your location...');
    
    // Check if we're on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      setCurrentLocation('Location requires HTTPS connection');
      setIsGettingLocation(false);
      alert('Location services require HTTPS. Please use https:// or localhost');
      return;
    }
    
    if (!navigator.geolocation) {
      setCurrentLocation('Location not supported by browser');
      setIsGettingLocation(false);
      alert('Your browser does not support location services');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Location obtained:', { latitude, longitude });
        
        // Store user location for distance calculations
        setUserLocation({ lat: latitude, lng: longitude });
        
        // Try to get city name using reverse geocoding
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Geocoding API error');
            }
            return response.json();
          })
          .then(data => {
            console.log('Geocoding data:', data);
            if (data.city && data.principalSubdivision) {
              setCurrentLocation(`${data.city}, ${data.principalSubdivision}`);
            } else if (data.locality && data.principalSubdivision) {
              setCurrentLocation(`${data.locality}, ${data.principalSubdivision}`);
            } else {
              setCurrentLocation(`Current Location (${(latitude || 0).toFixed(4)}, ${(longitude || 0).toFixed(4)})`);
            }
            setIsGettingLocation(false);
          })
          .catch((error) => {
            console.log('Geocoding failed, using coordinates:', error);
            // Fallback to coordinates if geocoding fails
            setCurrentLocation(`Current Location (${(latitude || 0).toFixed(4)}, ${(longitude || 0).toFixed(4)})`);
            setIsGettingLocation(false);
          });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied - Please allow location access in your browser settings';
            console.log('Location access denied. Please allow location access in your browser settings and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable - Check if location services are enabled on your device';
            console.log('Location services are unavailable. Please check if location services are enabled on your device.');
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out - Please try again';
            console.log('Location request timed out. Please try again.');
            break;
          default:
            errorMessage = 'Unable to get location - Please enter manually';
            console.log('Unable to get your location. Please enter your location manually.');
        }
        
        setCurrentLocation(errorMessage);
        setIsGettingLocation(false);
      },
      options
    );
  };

  // Manual location input
  const handleManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
    if (input.value.trim()) {
      setCurrentLocation(input.value.trim());
    }
  };

  const toggleProductWishlist = async (product: any) => {
    const productId = product.id;
    
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist({
        productId: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        category: product.category,
        sellerId: product.sellerId,
        sellerName: product.sellerName
      });
    }
  };

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = searchQuery === '' || 
      seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.businessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      seller.businessType.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      product.category === selectedCategory;
    
    console.log('🔍 Filtering product:', { 
      name: product.name, 
      searchQuery, 
      matchesSearch, 
      matchesCategory,
      finalMatch: matchesSearch && matchesCategory 
    });
    
    return matchesSearch && matchesCategory;
  });

  console.log('📊 Search results:', {
    searchQuery,
    totalProducts: products.length,
    filteredProducts: filteredProducts.length,
    searchType,
    selectedCategory
  });

  // Add error boundary
  if (loadingProducts && loadingSellers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="main-content pt-20 pb-0">
        <div className="max-w-7xl mx-auto px-2 py-0">
          {/* Toggle between Products and Shops */}
          <div className="text-center mb-1 mt-0">
            <div className="inline-flex bg-white rounded-lg shadow-md p-1 border border-gray-200">
              <button
                onClick={() => setSearchType('products')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  searchType === 'products'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </div>
              </button>
              <button
                onClick={() => setSearchType('shops')}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  searchType === 'shops'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Store className="w-4 h-4" />
                  <span>Shops</span>
                </div>
              </button>
            </div>

            {userLocation && searchType === 'shops' && (
              <div className="mt-3 inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <Navigation className="w-4 h-4" />
                <span>Sorted by distance (nearest first)</span>
              </div>
            )}
          </div>

          {/* Location Bar - Only show for shops */}
          {searchType === 'shops' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">
                    {currentLocation || 'No location found'}
                  </span>
                </div>
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Getting...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>Use Location</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Manual Location Input */}
              <form onSubmit={handleManualLocation} className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Or enter your location manually (e.g., Bangalore, India)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  type="submit"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                >
                  Set Location
                </button>
              </form>
            </div>
          </div>
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-1">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stores, products, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1 text-sm">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Categories
              </h3>
            </div>
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-2 py-1 rounded-lg font-medium transition-all whitespace-nowrap text-xs ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="mb-1">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">
                {searchType === 'products' 
                  ? `${filteredProducts.length} Product${filteredProducts.length !== 1 ? 's' : ''} Found`
                  : `${filteredSellers.length} Shop${filteredSellers.length !== 1 ? 's' : ''} Found`
                }
              </h2>
              {searchType === 'shops' && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>Sort by: Distance</span>
              </div>
              )}
            </div>
          </div>

          {/* Products/Shops Grid */}
          {searchType === 'products' ? (
            // Products View
            loadingProducts ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-4">
                <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No products found</h3>
                <p className="text-gray-600 text-xs">Try adjusting your search or category filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`} className="block">
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col cursor-pointer">
                      {/* Product Image */}
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <img 
                          src={product.image || 'https://via.placeholder.com/300'} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300';
                          }}
                        />
                        {/* Wishlist Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleProductWishlist(product);
                          }}
                          className="absolute top-3 right-3 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-lg transition-all"
                          aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart 
                            className={`w-5 h-5 ${
                              isInWishlist(product.id) 
                                ? 'fill-pink-500 text-pink-500' 
                                : 'text-gray-600'
                            }`} 
                          />
                        </button>
                        {/* Discount Badge */}
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
                        
                        {/* Price */}
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
                          )}
                        </div>

                        {/* Rating */}
                        {product.rating > 0 && (
                          <div className="flex items-center space-x-1 mb-3">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm text-gray-600">{product.rating.toFixed(1)}</span>
                            {product.reviews > 0 && (
                              <span className="text-sm text-gray-400">({product.reviews})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            // Shops View
            loadingSellers ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No stores found</h3>
              <p className="text-gray-600">Try adjusting your search or location filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {filteredSellers.map((seller) => (
                <div key={seller.id}>
                  {/* ULTIMATE Modern Card */}
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                    
                    {/* Store Identity */}
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center space-x-2 mb-2">
                        {seller.profileImage ? (
                          <img 
                            src={seller.profileImage} 
                            alt={seller.businessName}
                            className="w-12 h-12 rounded-lg object-cover shadow-md flex-shrink-0 border-2 border-blue-200"
                            onError={(e) => {
                              // Fallback to gradient icon if image fails to load
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallback = document.createElement('div');
                                fallback.className = 'w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0';
                                fallback.innerHTML = `<span class="text-xl font-bold text-white">${seller.businessName.charAt(0).toUpperCase()}</span>`;
                                parent.insertBefore(fallback, e.currentTarget);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
                            <span className="text-xl font-bold text-white">{seller.businessName.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">{seller.businessName}</h3>
                          {seller.distance && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <Navigation className="w-3 h-3 mr-1" />
                              {(seller.distance || 0).toFixed(1)} km away
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200">
                          <Store className="w-3 h-3 mr-1" />
                          {seller.businessType}
                        </span>
                      </div>
                    </div>

                    {/* Store Details */}
                    <div className="p-4 space-y-3 flex-1">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed flex-1">{seller.address}</p>
                          {seller.location && (
                            <button
                              onClick={() => {
                                const { lat, lng } = seller.location;
                                window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                              }}
                              className="bg-blue-100 hover:bg-blue-200 rounded-lg p-1.5 transition-colors flex-shrink-0"
                              title="Open in Google Maps"
                            >
                              <Map className="w-4 h-4 text-blue-600" />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <a href={`tel:${seller.phone}`} className="text-xs text-gray-600 hover:text-blue-600 transition-colors">{seller.phone}</a>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Link
                        to={`/seller/${seller.id}`}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                      >
                        <Store className="w-4 h-4 mr-2" />
                        Visit Store
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
