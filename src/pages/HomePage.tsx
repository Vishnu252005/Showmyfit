import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, Shield, MapPin, Users, Package, Star, Zap, Heart, Clock, Navigation, Search, Filter, Truck, Award } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import StatsCard from '../components/StatsCard';

const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Men', 'Women', 'Kids', 'Shoes', 'Accessories'];
  
  const featuredStores = [
    { id: 1, name: 'Fashion Hub', category: 'Fashion & Clothing', rating: 4.8, distance: '2.5 km', deliveryTime: '30-40 mins', status: 'Open' },
    { id: 2, name: 'Urban Closet', category: 'Premium Fashion', rating: 4.5, distance: '1.1 km', deliveryTime: '60-70 mins', status: 'Open' },
    { id: 3, name: 'Style Central', category: 'Fashion & Clothing', rating: 4.7, distance: '1.2 km', deliveryTime: '40-50 mins', status: 'Closed' },
    { id: 4, name: 'Elite Boutique', category: 'Designer Fashion', rating: 4.9, distance: '0.8 km', deliveryTime: '30-40 mins', status: 'Open' }
  ];

  const trendingProducts = [
    { id: 1, name: 'Classic Cotton T-Shirts', price: 29.99, discount: 20, image: '👕', inStock: true },
    { id: 2, name: 'Summer Dress', price: 49.99, discount: 10, image: '👗', inStock: true },
    { id: 3, name: 'Oversize Casual Jeans', price: 76.99, image: '👖', inStock: true },
    { id: 4, name: 'Kasandra Premium', price: 125.99, image: '👜', inStock: false }
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Navbar userRole="user" />
      
      {/* Hero Section */}
      <div className="px-4 py-12">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <span className="text-warm-600 text-sm font-medium tracking-wider uppercase bg-warm-100 px-4 py-2 rounded-full">Welcome to Showmyfit</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-warm-900 mb-6 animate-slide-up">
            Show Your
            <br />
            <span className="text-warm-700 italic gradient-text">Perfect Fit</span>
          </h1>
          <p className="text-lg text-warm-600 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Discover fashion that fits your style and body perfectly. 
            Connect with local stores, find your ideal fit, and express your unique style.
          </p>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-8 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-warm-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for the perfect fit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-warm-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent text-lg shadow-lg"
              />
              <Button 
                variant="primary" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2"
                onClick={() => setSearchQuery('')}
              >
                Search
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto animate-fade-in">
            <div className="bg-white rounded-xl p-4 shadow-md hover-lift">
              <div className="text-2xl font-bold text-warm-800">500+</div>
              <div className="text-xs text-warm-600 uppercase tracking-wide">Local Stores</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover-lift">
              <div className="text-2xl font-bold text-warm-800">1-2h</div>
              <div className="text-xs text-warm-600 uppercase tracking-wide">Fast Delivery</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md hover-lift">
              <div className="text-2xl font-bold text-warm-800">4.8★</div>
              <div className="text-xs text-warm-600 uppercase tracking-wide">Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-warm-900 mb-2">Shop by Category</h2>
            <p className="text-warm-600">Explore our curated collections</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-warm-800 text-white shadow-xl transform scale-105'
                    : 'bg-warm-100 text-warm-700 hover:bg-warm-200 border border-warm-300'
                }`}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Store Tracking */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-warm-900 mb-4">Live Store Tracking</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-warm-900">Fashion Hub</h4>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">ACTIVE</span>
              </div>
              <div className="space-y-2 text-sm text-warm-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>2972 West New York, NY 10001</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Delivery Time: 30-40 mins</span>
                </div>
                <div className="flex items-center">
                  <Navigation className="w-4 h-4 mr-2" />
                  <span>Average Radius: 5 km</span>
                </div>
                <div className="text-xs text-warm-500 mt-2">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4">
                View on Map
              </Button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg hover-lift">
              <h4 className="font-semibold text-warm-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-warm-600" />
                Store Locations
              </h4>
              <p className="text-sm text-warm-600 mb-4">Find stores near you with live tracking</p>
              <div className="space-y-3">
                {featuredStores.map((store) => (
                  <div key={store.id} className="flex items-center justify-between p-3 bg-warm-50 rounded-lg">
                    <div>
                      <p className="font-medium text-warm-900">{store.name}</p>
                      <p className="text-xs text-warm-600">{store.distance} • {store.deliveryTime}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Stores */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-warm-900 mb-4">Featured Stores</h3>
          <div className="grid gap-4">
            {featuredStores.map((store) => (
              <div key={store.id} className="bg-white rounded-2xl p-4 shadow-lg hover-lift">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-warm-200 rounded-xl flex items-center justify-center text-2xl">
                    🏪
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-warm-900">{store.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        store.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {store.status}
                      </span>
                    </div>
                    <p className="text-sm text-warm-600 mb-2">{store.category}</p>
                    <div className="flex items-center space-x-4 text-sm text-warm-500">
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                        {store.rating}
                      </span>
                      <span>{store.distance}</span>
                      <span>{store.deliveryTime}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">View</Button>
                    {store.status === 'Open' && (
                      <Button variant="primary" size="sm">Order</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Products */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-warm-900 mb-4">Trending Products</h3>
          <div className="grid gap-4">
            {trendingProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-lg hover-lift">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-warm-200 rounded-xl flex items-center justify-center text-2xl">
                    {product.image}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-warm-900">{product.name}</h4>
                      <div className="flex items-center space-x-2">
                        {product.discount && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            -{product.discount}%
                          </span>
                        )}
                        {!product.inStock && (
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-warm-800">${product.price}</span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="p-2">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="primary" size="sm" className="p-2" disabled={!product.inStock}>
                          <ShoppingBag className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Shop with Us */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-warm-900 mb-4 text-center">Why Shop with Us?</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
              <div className="text-3xl font-bold text-warm-800 mb-2">500+</div>
              <p className="text-sm text-warm-600">Local Shops</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
              <div className="text-3xl font-bold text-warm-800 mb-2">1-2h</div>
              <p className="text-sm text-warm-600">Fast Delivery</p>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover-lift">
              <div className="text-3xl font-bold text-warm-800 mb-2">4.8★</div>
              <p className="text-sm text-warm-600">Customer Rating</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Section */}
      <div className="pt-12 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 animate-fade-in">
            <span className="text-warm-600 text-sm font-medium tracking-wider uppercase bg-warm-100 px-4 py-2 rounded-full">New Arrivals</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-warm-900 mb-4 animate-slide-up">
            Timeless Style
            <br />
            <span className="text-warm-700 italic gradient-text">Local Marketplace</span>
          </h1>
          <p className="text-lg text-warm-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            Discover curated collections from local artisans and boutiques. 
            Timeless pieces, crafted with care, delivered to your doorstep.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up">
            <Link to="/browse">
              <Button 
                variant="primary" 
                size="lg" 
                icon={ShoppingBag} 
                className="w-full sm:w-auto bg-warm-800 hover:bg-warm-900 text-cream border-0 px-8 py-4 text-base font-medium tracking-wide hover-lift"
              >
                SHOP NOW
              </Button>
            </Link>
            <Link to="/shop/auth">
              <Button 
                variant="outline" 
                size="lg" 
                icon={Store} 
                className="w-full sm:w-auto border-2 border-warm-400 text-warm-800 hover:bg-warm-100 px-8 py-4 text-base font-medium tracking-wide hover-lift"
              >
                JOIN AS SELLER
              </Button>
            </Link>
            <Link to="/admin">
              <Button 
                variant="outline" 
                size="lg" 
                icon={Shield} 
                className="w-full sm:w-auto border border-warm-300 text-warm-600 hover:bg-warm-50 px-6 py-4 text-sm hover-lift"
              >
                Admin Login
              </Button>
            </Link>
          </div>

          {/* Hero Image Section */}
          <div className="mb-16 animate-fade-in">
            <div className="bg-warm-200 rounded-3xl p-12 max-w-3xl mx-auto hover-lift shadow-lg">
              <div className="aspect-[4/3] bg-warm-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-warm-300 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
                    <Store className="w-12 h-12 text-warm-700" />
                  </div>
                  <p className="text-warm-600 font-medium">Featured Collections</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            <div className="bg-warm-100 rounded-3xl p-8 text-left hover-lift shadow-md">
              <div className="aspect-square bg-warm-200 rounded-2xl flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-warm-300 rounded-full flex items-center justify-center hover:bg-warm-400 transition-colors">
                  <Package className="w-8 h-8 text-warm-700" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-warm-900 mb-3 uppercase tracking-wide">ESSENTIAL COLLECTIONS</h3>
              <div className="flex items-center justify-between">
                <p className="text-warm-600 text-sm">Curated essentials for every wardrobe</p>
                <button className="w-12 h-12 border border-warm-400 rounded-full flex items-center justify-center text-warm-600 hover:bg-warm-200 transition-all duration-300 hover:scale-110">
                  <span className="text-xs">VIEW</span>
                </button>
              </div>
            </div>

            <div className="bg-warm-100 rounded-3xl p-8 text-left hover-lift shadow-md">
              <div className="aspect-square bg-warm-200 rounded-2xl flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-warm-300 rounded-full flex items-center justify-center hover:bg-warm-400 transition-colors">
                  <MapPin className="w-8 h-8 text-warm-700" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-warm-900 mb-3 uppercase tracking-wide">LOCAL ARTISANS</h3>
              <div className="flex items-center justify-between">
                <p className="text-warm-600 text-sm">Discover nearby creators and boutiques</p>
                <button className="w-12 h-12 border border-warm-400 rounded-full flex items-center justify-center text-warm-600 hover:bg-warm-200 transition-all duration-300 hover:scale-110">
                  <span className="text-xs">VIEW</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-warm-800 rounded-3xl p-12 text-cream mb-16 max-w-4xl mx-auto hover-lift shadow-xl">
            <h3 className="text-2xl font-serif font-bold mb-8 text-center animate-fade-in">Our Growing Community</h3>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold font-serif mb-2 gradient-text">50+</div>
                <div className="text-warm-200 text-sm uppercase tracking-wider">Curated Shops</div>
              </div>
              <div className="text-center hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold font-serif mb-2 gradient-text">200+</div>
                <div className="text-warm-200 text-sm uppercase tracking-wider">Unique Pieces</div>
              </div>
              <div className="text-center hover:scale-105 transition-transform duration-300">
                <div className="text-4xl font-bold font-serif mb-2 gradient-text">1000+</div>
                <div className="text-warm-200 text-sm uppercase tracking-wider">Happy Customers</div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-3xl p-12 mb-16 max-w-4xl mx-auto hover-lift shadow-lg">
            <h3 className="text-3xl font-serif font-bold text-warm-900 text-center mb-12 animate-fade-in">The Experience</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-warm-100 text-warm-800 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-serif font-bold hover:bg-warm-200 transition-colors">1</div>
                <h4 className="font-semibold text-warm-900 mb-3 uppercase tracking-wide text-sm">DISCOVER</h4>
                <p className="text-warm-600 text-sm leading-relaxed">Browse curated collections from local artisans and boutiques near you</p>
              </div>
              <div className="text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-warm-100 text-warm-800 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-serif font-bold hover:bg-warm-200 transition-colors">2</div>
                <h4 className="font-semibold text-warm-900 mb-3 uppercase tracking-wide text-sm">CONNECT</h4>
                <p className="text-warm-600 text-sm leading-relaxed">Connect directly with creators to learn about their craft and story</p>
              </div>
              <div className="text-center hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-warm-100 text-warm-800 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-serif font-bold hover:bg-warm-200 transition-colors">3</div>
                <h4 className="font-semibold text-warm-900 mb-3 uppercase tracking-wide text-sm">SUPPORT</h4>
                <p className="text-warm-600 text-sm leading-relaxed">Support local artisans and build a sustainable fashion community</p>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-3xl p-8 border border-warm-200 hover-lift shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-warm-400 fill-current hover:text-warm-300 transition-colors" />
                ))}
              </div>
              <p className="text-warm-600 mb-6 leading-relaxed italic">"The quality and craftsmanship of pieces I've discovered here is exceptional. Each item tells a story."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mr-4 hover:bg-warm-200 transition-colors">
                  <Users className="w-6 h-6 text-warm-600" />
                </div>
                <div>
                  <p className="font-medium text-warm-900">Emma Richardson</p>
                  <p className="text-sm text-warm-500">Fashion Enthusiast</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-warm-200 hover-lift shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-warm-400 fill-current hover:text-warm-300 transition-colors" />
                ))}
              </div>
              <p className="text-warm-600 mb-6 leading-relaxed italic">"This platform has transformed how I connect with customers. The community here truly appreciates artisanal work."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-warm-100 rounded-full flex items-center justify-center mr-4 hover:bg-warm-200 transition-colors">
                  <Store className="w-6 h-6 text-warm-600" />
                </div>
                <div>
                  <p className="font-medium text-warm-900">Sofia Martinez</p>
                  <p className="text-sm text-warm-500">Boutique Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;