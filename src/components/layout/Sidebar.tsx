import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Home, 
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
  Globe,
  Shield,
  CreditCard,
  MapPin,
  Clock,
  Award,
  Sparkles,
  Zap,
  Package,
  Users,
  BarChart
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'user' | 'shop' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole }) => {
  const location = useLocation();

  const userMenuItems = [
    { icon: Home, label: 'Home', path: '/', color: 'from-blue-500 to-cyan-500' },
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
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Showmyfit</h2>
                <p className="text-sm text-white/80">Welcome back!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold">John Doe</p>
              <p className="text-sm text-white/80">Premium Member</p>
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
                className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 border-l-4 border-primary-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive(item.path)
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : `bg-gray-100 group-hover:bg-gradient-to-r group-hover:${item.color} group-hover:text-white`
                }`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-lg">{item.label}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></div>
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

          {/* Special Offers */}
          <div className="px-4 mt-6">
            <div className="bg-gradient-to-r from-accent-500 to-orange-500 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-3">
                <Gift className="w-6 h-6" />
                <h3 className="font-bold">Special Offer!</h3>
              </div>
              <p className="text-sm text-white/90 mb-4">
                Get 20% off your first order
              </p>
              <button className="bg-white text-accent-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors">
                Claim Now
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
