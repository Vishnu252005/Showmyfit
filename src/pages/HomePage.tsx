import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Store, ShoppingBag, Shield, MapPin, Users, Package, Star, Zap, Heart, Clock, Navigation, Search, Filter, Truck, Award, ArrowRight, Sparkles, TrendingUp, Globe, ShieldCheck, ChevronRight, Grid3X3, Menu, Bell, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';

const HomePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const categories = [
    { name: 'Minutes', icon: '🛵', color: 'text-orange-600' },
    { name: 'Mobiles & Tablets', icon: '📱', color: 'text-blue-600' },
    { name: 'TVs & Appliances', icon: '📺', color: 'text-purple-600' },
    { name: 'Electronics', icon: '💻', color: 'text-green-600' },
    { name: 'Fashion', icon: '👗', color: 'text-pink-600' },
    { name: 'Home & Kitchen', icon: '🏠', color: 'text-yellow-600' },
    { name: 'Beauty & Toys', icon: '🧸', color: 'text-red-600' },
    { name: 'Furniture', icon: '🪑', color: 'text-indigo-600' },
    { name: 'Flight Bookings', icon: '✈️', color: 'text-cyan-600' },
    { name: 'Grocery', icon: '🛒', color: 'text-lime-600' }
  ];

  const smartphoneDeals = [
    { 
      name: 'Moto Edge 60 Pro 5G', 
      price: 'From ₹24,999*', 
      image: 'https://images.unsplash.com/photo-1511707171631-9ad203683d6d?w=200&h=300&fit=crop',
      features: ['50MP+50MP+50X', 'Most Personalised'],
      color: 'purple'
    },
    { 
      name: 'Galaxy S24 5G', 
      price: 'From ₹39,999', 
      image: 'https://images.unsplash.com/photo-1511707171631-9ad203683d6d?w=200&h=300&fit=crop',
      features: ['Galaxy AI', 'Now with Snapdragon'],
      color: 'cream'
    },
    { 
      name: 'vivo T4 Lite 5G', 
      price: 'Just ₹8,999*', 
      image: 'https://images.unsplash.com/photo-1511707171631-9ad203683d6d?w=200&h=300&fit=crop',
      features: ['GET. SET. TURBO', '5G'],
      color: 'white'
    },
    { 
      name: 'moto g86 Power', 
      price: 'Just ₹15,999', 
      image: 'https://images.unsplash.com/photo-1511707171631-9ad203683d6d?w=200&h=300&fit=crop',
      features: ['Long Lasting Battery', 'Camera with OIS'],
      color: 'blue'
    },
    { 
      name: 'Realme P3x 5G', 
      price: 'From ₹10,999', 
      image: 'https://images.unsplash.com/photo-1511707171631-9ad203683d6d?w=200&h=300&fit=crop',
      features: ['6000mAh Battery', '45W Charge'],
      color: 'blue'
    },
    { 
      name: 'Galaxy F36 5G', 
      price: 'From ₹13,999', 
      image: 'https://images.unsplash.com/photo-1511707171631-9ad203683d6d?w=200&h=300&fit=crop',
      features: ['Night Portraits'],
      color: 'purple'
    }
  ];

  const applianceDeals = [
    { 
      name: 'Sony 75" 4K Ultra HD TV', 
      price: 'From ₹30,849*', 
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&h=150&fit=crop',
      category: '65 / 75 inch TVs'
    },
    { 
      name: 'LG Washing Machine', 
      price: 'Shop now!', 
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=150&fit=crop',
      category: 'Trending deals'
    },
    { 
      name: 'Samsung Refrigerator', 
      price: 'From ₹9,990', 
      image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=200&h=150&fit=crop',
      category: 'Best-selling Refriger...'
    },
    { 
      name: 'IFB Microwave Oven', 
      price: 'From ₹4,990', 
      image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=200&h=150&fit=crop',
      category: 'Microwave Ovens'
    },
    { 
      name: 'LG Air Conditioner', 
      price: 'From ₹19,490', 
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=200&h=150&fit=crop',
      category: 'Lowest Price Ever'
    },
    { 
      name: 'Philips Mixer Grinder', 
      price: 'From ₹1249', 
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200&h=150&fit=crop',
      category: 'Kitchen Essentials'
    }
  ];

  const featuredBrands = [
    { name: 'NOISE', image: 'https://via.placeholder.com/120x60/000000/FFFFFF?text=NOISE' },
    { name: 'Pigeon', image: 'https://via.placeholder.com/120x60/000000/FFFFFF?text=Pigeon' },
    { name: 'boat', image: 'https://via.placeholder.com/120x60/000000/FFFFFF?text=boat' },
    { name: 'motorola', image: 'https://via.placeholder.com/120x60/000000/FFFFFF?text=motorola' }
  ];

  return (
    <div className={`min-h-screen bg-white transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <Navbar userRole="user" />
      
      {/* Main Content */}
      <div className="main-content pt-16">
        {/* Categories Section - Mobile Optimized */}
        <section className="bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {categories.map((category, index) => (
                <div key={category.name} className="flex-shrink-0 text-center group cursor-pointer min-w-[80px]">
                  <div className={`w-14 h-14 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors ${category.color} touch-manipulation`}>
                    <span className="text-xl">{category.icon}</span>
          </div>
                  <p className="text-xs font-medium text-gray-700 group-hover:text-blue-600 transition-colors leading-tight">
                    {category.name}
                  </p>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Hero Banner - Mobile Optimized */}
        <section className="bg-gradient-to-r from-purple-600 to-purple-800 py-8 md:py-12">
          <div className="px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 mb-6 md:mb-0">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight">
                  THE BIG BILLION DAYS
                </h1>
                <p className="text-lg md:text-xl text-purple-100 mb-4 md:mb-6 leading-relaxed">
                  Designer sofas, Carlton london, mintwud & more
                </p>
                <p className="text-xl md:text-2xl font-bold text-white mb-4">From ₹6,499</p>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <div className="bg-white bg-opacity-20 px-4 py-3 rounded-lg touch-manipulation">
                    <p className="text-sm font-semibold text-white">AXIS BANK</p>
                    <p className="text-xs text-purple-100">10% Instant Discount</p>
              </div>
                  <div className="bg-white bg-opacity-20 px-4 py-3 rounded-lg touch-manipulation">
                    <p className="text-sm font-semibold text-white">ICICI Bank</p>
                    <p className="text-xs text-purple-100">super.money</p>
              </div>
            </div>
              </div>
              <div className="hidden md:block">
                <img 
                  src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop" 
                  alt="Sofa"
                  className="w-80 h-60 object-cover rounded-lg"
                />
        </div>
      </div>
          </div>
        </section>

        {/* Mobile Become a Seller Button */}
        <section className="md:hidden py-4 bg-white border-b border-gray-200">
          <div className="px-4">
            <Link
              to="/shop/auth"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-3 touch-manipulation"
            >
              <Store className="w-6 h-6" />
              <span>Become a Seller</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-center text-sm text-gray-600 mt-2">
              Start selling and grow your business with us
            </p>
          </div>
        </section>

        {/* Best Deals on Smartphones - Mobile Optimized */}
        <section className="py-6 md:py-8 bg-white">
          <div className="px-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Best deals on smartphones</h2>
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {smartphoneDeals.map((phone, index) => (
                <div key={index} className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-3 w-40 md:w-48 hover:shadow-lg transition-shadow touch-manipulation">
                  <div className="relative mb-3">
                    <img 
                      src={phone.image} 
                      alt={phone.name}
                      className="w-full h-24 md:h-32 object-cover rounded"
                    />
                    <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs">
                      {phone.features[0]}
        </div>
      </div>
                  <h3 className="font-semibold text-gray-900 text-xs md:text-sm mb-1 leading-tight">{phone.name}</h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">{phone.features[1]}</p>
                  <p className="text-sm md:text-lg font-bold text-blue-600">{phone.price}</p>
              </div>
            ))}
              {/* Motorola Edge 60 FUSION Ad */}
              <div className="flex-shrink-0 bg-gradient-to-b from-teal-400 to-teal-600 rounded-lg p-4 w-40 md:w-48 text-white touch-manipulation">
                <div className="text-center">
                  <h3 className="font-bold text-sm md:text-lg mb-1">Motorola Edge 60 FUSION</h3>
                  <p className="text-xs mb-2">1.5K quad-curved display</p>
                  <p className="text-lg md:text-2xl font-bold mb-1">₹19,999*</p>
                  <p className="text-xs line-through opacity-75">₹22,999</p>
                </div>
              </div>
                </div>
                </div>
        </section>

        {/* Best Deals on Appliances - Mobile Optimized */}
        <section className="py-6 md:py-8 bg-gray-50">
          <div className="px-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Best deals on appliances</h2>
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {applianceDeals.map((appliance, index) => (
                <div key={index} className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-3 w-40 md:w-48 hover:shadow-lg transition-shadow touch-manipulation">
                  <img 
                    src={appliance.image} 
                    alt={appliance.name}
                    className="w-full h-20 md:h-24 object-cover rounded mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 text-xs md:text-sm mb-1 leading-tight">{appliance.name}</h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-1">{appliance.category}</p>
                  <p className="text-sm md:text-lg font-bold text-blue-600">{appliance.price}</p>
                </div>
              ))}
              <div className="flex-shrink-0 flex items-center justify-center w-12">
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
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

        {/* Featured Brands - Mobile Optimized */}
        <section className="py-6 md:py-8 bg-white">
          <div className="px-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Featured Brands</h2>
            <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
              {featuredBrands.map((brand, index) => (
                <div key={index} className="flex-shrink-0 bg-gray-100 rounded-lg p-3 w-24 md:w-32 hover:bg-gray-200 transition-colors touch-manipulation">
                  <img 
                    src={brand.image} 
                    alt={brand.name}
                    className="w-full h-12 md:h-16 object-contain"
                  />
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

        {/* Nearby Local Stores - Mobile Optimized */}
        <section className="py-6 md:py-8 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Nearby Local Stores</h2>
                  <p className="text-sm text-gray-600">Discover stores near you</p>
                </div>
              </div>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Location Search Bar */}
            <div className="mb-6">
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
                          // You can use these coordinates to get the address
                          // console.log('Current location:', latitude, longitude);
                          // For now, we'll set a mock address based on coordinates
                          setCurrentLocation(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
                          setIsGettingLocation(false);
                        },
                        (error) => {
                          // console.error('Error getting location:', error);
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

            {/* Store Categories Filter */}
            <div className="mb-6">
              <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
                {['All', 'Fashion', 'Electronics', 'Home', 'Beauty', 'Sports', 'Books', 'Food'].map((category, index) => (
                  <button
                    key={category}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      index === 0 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Store Cards */}
            <div className="space-y-4">
              {[
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
              ].map((store, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow touch-manipulation">
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

            {/* View More Stores Button */}
            <div className="text-center mt-6">
              <button className="bg-white text-blue-600 border-2 border-blue-600 py-3 px-8 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                View More Stores
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Mobile Seller Button */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <Link
          to="/shop/auth"
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center touch-manipulation animate-bounce-gentle"
        >
          <Store className="w-6 h-6" />
        </Link>
          </div>

      {/* Professional Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="px-4 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Showmyfit</h3>
                </div>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  Find your perfect fit with local fashion stores and boutiques. Style that fits you, crafted with care.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <span className="text-sm">f</span>
                  </a>
                  <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <span className="text-sm">t</span>
                  </a>
                  <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <span className="text-sm">in</span>
                  </a>
                  <a href="#" className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <span className="text-sm">ig</span>
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