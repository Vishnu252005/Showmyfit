import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Store, 
  Settings, 
  HelpCircle, 
  Bell, 
  Gift, 
  Star,
  TrendingUp,
  Shield,
  MapPin,
  Sparkles,
  Package,
  Users,
  BarChart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'user' | 'shop' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sample promotional images/slides
  const promotionalSlides = [
    {
      id: 1,
      title: "Special Offer!",
      description: "Get 20% off your first order",
      image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=200&fit=crop&crop=center",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      id: 2,
      title: "New Collection",
      description: "Discover trending fashion",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop&crop=center",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 3,
      title: "Premium Access",
      description: "Exclusive member benefits",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52b?w=400&h=200&fit=crop&crop=center",
      gradient: "from-purple-500 to-indigo-500"
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % promotionalSlides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, promotionalSlides.length]);

  const userMenuItems = [
    { icon: Search, label: 'Browse', path: '/browse', color: 'from-purple-500 to-pink-500' },
    { icon: ShoppingBag, label: 'My Cart', path: '/cart', color: 'from-green-500 to-emerald-500' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist', color: 'from-red-500 to-rose-500' },
    { icon: User, label: 'Profile', path: '/profile', color: 'from-indigo-500 to-blue-500' },
  ];

  const shopMenuItems = [
    { icon: Store, label: 'My Store', path: '/shop/dashboard', color: 'from-orange-500 to-red-500' },
    { icon: TrendingUp, label: 'Analytics', path: '/shop/analytics', color: 'from-green-500 to-emerald-500' },
    { icon: Package, label: 'Products', path: '/shop/products', color: 'from-blue-500 to-cyan-500' },
    { icon: Bell, label: 'Orders', path: '/shop/orders', color: 'from-purple-500 to-pink-500' },
  ];

  const adminMenuItems = [
    { icon: Shield, label: 'Admin Panel', path: '/admin', color: 'from-red-500 to-rose-500' },
    { icon: Users, label: 'Users', path: '/admin/users', color: 'from-blue-500 to-cyan-500' },
    { icon: Store, label: 'Stores', path: '/admin/stores', color: 'from-green-500 to-emerald-500' },
    { icon: BarChart, label: 'Analytics', path: '/admin/analytics', color: 'from-purple-500 to-pink-500' },
  ];

  const commonMenuItems = [
    { icon: Gift, label: 'Offers', path: '/offers', color: 'from-yellow-500 to-amber-500' },
    { icon: Star, label: 'Reviews', path: '/reviews', color: 'from-orange-500 to-red-500' },
    { icon: MapPin, label: 'Store Locator', path: '/stores', color: 'from-green-500 to-emerald-500' },
    { icon: HelpCircle, label: 'Help Center', path: '/help', color: 'from-blue-500 to-cyan-500' },
    { icon: Settings, label: 'Settings', path: '/settings', color: 'from-gray-500 to-slate-500' },
  ];

  const getMenuItems = () => {
    switch (userRole) {
      case 'shop':
        return [...shopMenuItems, ...commonMenuItems];
      case 'admin':
        return [...adminMenuItems, ...commonMenuItems];
      default:
        return [...userMenuItems, ...commonMenuItems];
    }
  };

  const menuItems = getMenuItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-all duration-500 ease-out flex flex-col ${
        isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
      }`}>
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 p-6 text-white overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-y-12 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl transform hover:rotate-12 transition-transform duration-300">
                  <Sparkles className="w-7 h-7" />
              </div>
              <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Showmyfit
                  </h2>
                  <p className="text-sm text-white/90 font-medium">Welcome back!</p>
                </div>
            </div>
            <button
              onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* User Info */}
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="w-14 h-14 bg-gradient-to-r from-white/30 to-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg">John Doe</p>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <p className="text-sm text-white/90 font-medium">Premium Member</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/70">Level</div>
                <div className="text-lg font-bold">VIP</div>
            </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-primary-300 scrollbar-track-transparent">
          <div className="px-4 space-y-2 pb-8">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={onClose}
                className={`flex items-center space-x-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 border-l-4 border-primary-500 shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-primary-600 hover:shadow-md hover:transform hover:scale-105'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`
                } as React.CSSProperties}
              >
                {/* Animated background effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative z-10 ${
                  isActive(item.path)
                    ? `bg-gradient-to-r ${item.color} text-white shadow-xl transform rotate-3`
                    : `bg-gray-100 group-hover:bg-gradient-to-r group-hover:${item.color} group-hover:text-white group-hover:shadow-lg group-hover:transform group-hover:rotate-3`
                }`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="font-semibold text-lg relative z-10">{item.label}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-3 h-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-pulse shadow-lg"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="px-4 mt-8">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">12</div>
                  <div className="text-sm text-gray-600">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-600">5</div>
                  <div className="text-sm text-gray-600">Favorites</div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Image Slider */}
          <div className="px-4 mt-6">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ 
                  transform: `translateX(-${currentSlide * 100}%)` 
                } as React.CSSProperties}
              >
                {promotionalSlides.map((slide) => (
                  <div
                    key={slide.id}
                    className="w-full flex-shrink-0 relative"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} bg-opacity-80`}></div>
                      <div className="absolute inset-0 p-6 flex flex-col justify-center text-white">
                        <div className="flex items-center space-x-2 mb-2">
                          <Gift className="w-5 h-5" />
                          <h3 className="font-bold text-lg">{slide.title}</h3>
                  </div>
                        <p className="text-sm text-white/90 mb-4">
                          {slide.description}
                        </p>
                    <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
                
              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {promotionalSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    title={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={() => setCurrentSlide((prev) => 
                  prev === 0 ? promotionalSlides.length - 1 : prev - 1
                )}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                aria-label="Previous slide"
                title="Previous slide"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => 
                  (prev + 1) % promotionalSlides.length
                )}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
                aria-label="Next slide"
                title="Next slide"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Version 2.0.1</span>
            <span>© 2024 Showmyfit</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
