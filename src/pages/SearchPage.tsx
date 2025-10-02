import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Star, Package, Phone, Eye, Heart, Filter,
  Store, Navigation, Clock, Truck, Shield, Users, TrendingUp
} from 'lucide-react';
import GoogleMapLocation from '../components/common/GoogleMapLocation';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useWishlist } from '../contexts/WishlistContext';

const SearchPage: React.FC = () => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sellers, setSellers] = useState<any[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

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
        distance: s.distance ? `${s.distance.toFixed(2)} km` : 'No location' 
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
              distance: s.distance ? `${s.distance.toFixed(2)} km` : 'No location' 
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
              setCurrentLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            }
            setIsGettingLocation(false);
          })
          .catch((error) => {
            console.log('Geocoding failed, using coordinates:', error);
            // Fallback to coordinates if geocoding fails
            setCurrentLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
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

  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = searchQuery === '' || 
      seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.businessType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      seller.businessType.toLowerCase().includes(selectedCategory.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="main-content pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Nearby Stores</h1>
            <p className="text-gray-600 text-lg">Discover local stores and products near you</p>
            {userLocation && (
              <div className="mt-3 inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <Navigation className="w-4 h-4" />
                <span>Sorted by distance (nearest first)</span>
              </div>
            )}
          </div>

          {/* Location Bar */}
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
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Getting...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>Use Current Location</span>
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

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stores, products, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-4 mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <button className="bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>

          {/* Results */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredSellers.length} Results Found
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <TrendingUp className="w-4 h-4" />
                <span>Sort by: Distance</span>
              </div>
            </div>
          </div>

          {/* Stores Grid */}
          {loadingSellers ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredSellers.map((seller) => (
                <div key={seller.id} className="group">
                  {/* Modern Card Container */}
                  <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2">
                    
                    {/* Hero Section with Gradient */}
                    <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
                      {/* Animated Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                      
                      {/* Store Avatar & Info */}
                      <div className="relative z-10 h-full flex flex-col justify-between p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                              <span className="text-2xl font-bold text-white">{seller.businessName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">{seller.businessName}</h3>
                              <p className="text-white/80 text-sm">by {seller.name}</p>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="flex flex-col items-end space-y-2">
                            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-white text-xs font-medium">Online</span>
                            </div>
                            {seller.distance && (
                              <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                                <span className="text-white text-xs font-medium">{seller.distance.toFixed(1)} km</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Rating & Business Type */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                              <Star className="w-4 h-4 text-yellow-300 fill-current" />
                              <span className="text-white font-semibold">{seller.stats.rating.toFixed(1)}</span>
                              <span className="text-white/70 text-sm">({seller.stats.totalOrders})</span>
                            </div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1">
                            <span className="text-white text-sm font-medium">{seller.businessType}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">

                      {/* Contact Info */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{seller.address}</p>
                            {seller.location && (
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                  ✓ Verified
                                </span>
                                <button
                                  onClick={() => {
                                    const { lat, lng } = seller.location;
                                    const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m&hl=en&gl=IN&mapclient=embed`;
                                    window.open(mapsUrl, '_blank');
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  View on Maps →
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                            <Phone className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{seller.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Map Section */}
                      {seller.location && (
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                              Store Location
                            </h4>
                            <button
                              onClick={() => {
                                const { lat, lng } = seller.location;
                                const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m&hl=en&gl=IN&mapclient=embed`;
                                window.open(mapsUrl, '_blank');
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
                            >
                              Open in Maps
                            </button>
                          </div>
                          <div className="rounded-2xl overflow-hidden border border-gray-200">
                            <GoogleMapLocation
                              location={seller.location}
                              onLocationChange={() => {}}
                              isEditing={false}
                              height="120px"
                            />
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <Link
                          to={`/seller/${seller.id}`}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          Visit Store
                        </Link>
                        <button 
                          onClick={() => toggleWishlist(seller)}
                          className="w-14 h-14 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all duration-300 flex items-center justify-center group"
                          title={isInWishlist(`shop-${seller.id}`) ? 'Remove from favorites' : 'Add to favorites'}
                          aria-label={isInWishlist(`shop-${seller.id}`) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart className={`w-5 h-5 transition-colors ${
                            isInWishlist(`shop-${seller.id}`) ? 'text-red-500 fill-current' : 'group-hover:text-red-500'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
