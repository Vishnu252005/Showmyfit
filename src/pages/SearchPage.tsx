import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, MapPin, Star, Package, Phone, Eye, Heart, Filter,
  Store, Navigation, Clock, Truck, Shield, Users, TrendingUp
} from 'lucide-react';
import GoogleMapLocation from '../components/common/GoogleMapLocation';
import Navbar from '../components/layout/Navbar';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const SearchPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sellers, setSellers] = useState<any[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const categories = [
    'All', 'Fashion', 'Electronics', 'Beauty', 'Home', 'Sports', 'Books', 'Food'
  ];

  // Fetch sellers from database
  useEffect(() => {
    const fetchSellers = async () => {
      setLoadingSellers(true);
      try {
        const usersQuery = query(collection(db, 'users'));
        const snapshot = await getDocs(usersQuery);
        
        console.log('Total users found in SearchPage:', snapshot.docs.length);
        
        const sellersList: any[] = [];
        snapshot.docs.forEach((doc) => {
          const userData = doc.data();
          console.log('User data in SearchPage:', { id: doc.id, role: userData.role, status: userData.status, businessName: userData.businessName });
          
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
                rating: Math.random() * 2 + 3
              },
              createdAt: userData.createdAt
            });
          }
        });
        
        console.log('Approved sellers found in SearchPage:', sellersList.length);
        
        // If no sellers found, use sample data
        if (sellersList.length === 0) {
          console.log('No sellers found in SearchPage, using sample data');
          const sampleSellers = [
            {
              id: 'demo1',
              name: 'Rajesh Kumar',
              email: 'rajesh@example.com',
              phone: '+91 98765 43210',
              businessName: 'Fashion Hub',
              businessType: 'Fashion & Apparel',
              address: '123 MG Road, Bangalore',
              location: {
                lat: 12.9716,
                lng: 77.5946,
                address: '123 MG Road, Bangalore, Karnataka, India'
              },
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
              location: {
                lat: 12.9716,
                lng: 77.6046,
                address: '456 Brigade Road, Bangalore, Karnataka, India'
              },
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
              location: {
                lat: 12.9816,
                lng: 77.6146,
                address: '789 Commercial Street, Bangalore, Karnataka, India'
              },
              stats: {
                totalProducts: 28,
                totalSales: 2100,
                totalOrders: 95,
                rating: 4.7
              },
              createdAt: new Date()
            },
            {
              id: 'demo4',
              name: 'Sunita Reddy',
              email: 'sunita@example.com',
              phone: '+91 98765 43213',
              businessName: 'Home Decor Plus',
              businessType: 'Home & Living',
              address: '321 Indiranagar, Bangalore',
              location: {
                lat: 12.9616,
                lng: 77.6246,
                address: '321 Indiranagar, Bangalore, Karnataka, India'
              },
              stats: {
                totalProducts: 38,
                totalSales: 750,
                totalOrders: 85,
                rating: 4.3
              },
              createdAt: new Date()
            },
            {
              id: 'demo5',
              name: 'Vikram Singh',
              email: 'vikram@example.com',
              phone: '+91 98765 43214',
              businessName: 'Sports Zone',
              businessType: 'Sports & Fitness',
              address: '654 Koramangala, Bangalore',
              location: {
                lat: 12.9916,
                lng: 77.6346,
                address: '654 Koramangala, Bangalore, Karnataka, India'
              },
              stats: {
                totalProducts: 52,
                totalSales: 1680,
                totalOrders: 145,
                rating: 4.6
              },
              createdAt: new Date()
            },
            {
              id: 'demo6',
              name: 'Anita Gupta',
              email: 'anita@example.com',
              phone: '+91 98765 43215',
              businessName: 'Book Corner',
              businessType: 'Books & Stationery',
              address: '987 Jayanagar, Bangalore',
              location: {
                lat: 12.9516,
                lng: 77.6446,
                address: '987 Jayanagar, Bangalore, Karnataka, India'
              },
              stats: {
                totalProducts: 125,
                totalSales: 3200,
                totalOrders: 210,
                rating: 4.8
              },
              createdAt: new Date()
            }
          ];
          setSellers(sampleSellers);
        } else {
          setSellers(sellersList);
        }
      } catch (error) {
        console.error('Error loading sellers in SearchPage:', error);
        // Use sample data on error
        const sampleSellers = [
          {
            id: 'demo1',
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            phone: '+91 98765 43210',
            businessName: 'Fashion Hub',
            businessType: 'Fashion & Apparel',
            address: '123 MG Road, Bangalore',
            location: {
              lat: 12.9716,
              lng: 77.5946,
              address: '123 MG Road, Bangalore, Karnataka, India'
            },
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
            location: {
              lat: 12.9716,
              lng: 77.6046,
              address: '456 Brigade Road, Bangalore, Karnataka, India'
            },
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
            alert('Location access denied. Please allow location access in your browser settings and try again.');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable - Check if location services are enabled on your device';
            alert('Location services are unavailable. Please check if location services are enabled on your device.');
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out - Please try again';
            alert('Location request timed out. Please try again.');
            break;
          default:
            errorMessage = 'Unable to get location - Please enter manually';
            alert('Unable to get your location. Please enter your location manually.');
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
      <Navbar userRole="user" />
      
      <div className="main-content pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Nearby Stores</h1>
            <p className="text-gray-600 text-lg">Discover local stores and products near you</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSellers.map((seller) => (
                <div key={seller.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
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
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{seller.stats.totalProducts}</div>
                        <div className="text-xs text-gray-600">Products</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{seller.stats.totalOrders}</div>
                        <div className="text-xs text-gray-600">Orders</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{seller.stats.totalSales}</div>
                        <div className="text-xs text-gray-600">Sales</div>
                      </div>
                    </div>

                    {/* Store Location Map */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Store Location</span>
                      </div>
                      <GoogleMapLocation
                        location={seller.location || null}
                        onLocationChange={() => {}}
                        isEditing={false}
                        height="150px"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/seller/${seller.id}`}
                        className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Store
                      </Link>
                      <button className="px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
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
