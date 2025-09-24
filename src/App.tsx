import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Search, Store, Shield } from 'lucide-react';
import HomePage from './pages/HomePage';
import ShopAuth from './pages/ShopAuth';
import ShopDashboard from './pages/ShopDashboard';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import Button from './components/Button';
import { AppProvider } from './context/AppContext';

// Enhanced pages for bottom navigation
const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Men', 'Women', 'Kids', 'Shoes', 'Accessories'];
  
  const mockResults = [
    { id: 1, name: 'Fashion Hub Store', type: 'store', distance: '2.5 km', rating: 4.8 },
    { id: 2, name: 'Classic Cotton T-Shirt', type: 'product', price: 29.99, store: 'Fashion Hub' },
    { id: 3, name: 'Urban Closet', type: 'store', distance: '1.1 km', rating: 4.5 },
    { id: 4, name: 'Summer Dress', type: 'product', price: 49.99, store: 'Style Central' },
  ];

  const filteredResults = mockResults.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.type === 'product' && item.store?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-cream">
      <Navbar userRole="user" />
      <div className="px-4 py-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-serif font-bold text-warm-900 mb-6">Search</h1>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search stores and products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-warm-400 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-warm-800 text-white shadow-lg'
                    : 'bg-white text-warm-700 border border-warm-200 hover:bg-warm-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {filteredResults.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-lg hover-lift">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-warm-200 rounded-xl flex items-center justify-center">
                    {item.type === 'store' ? '🏪' : '👕'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-warm-900">{item.name}</h3>
                    <p className="text-sm text-warm-600">
                      {item.type === 'store' 
                        ? `${item.distance} • ${item.rating}★`
                        : `$${item.price} • ${item.store}`
                      }
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {item.type === 'store' ? 'View Store' : 'View Product'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CartPage = () => {
  const cartItems = [
    { id: 1, name: 'Classic Cotton T-Shirt', price: 29.99, quantity: 2, image: '👕', store: 'Fashion Hub' },
    { id: 2, name: 'Summer Dress', price: 49.99, quantity: 1, image: '👗', store: 'Style Central' },
    { id: 3, name: 'Casual Jeans', price: 76.99, quantity: 1, image: '👖', store: 'Urban Closet' },
  ];

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar userRole="user" />
      <div className="px-4 py-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-serif font-bold text-warm-900 mb-6">Shopping Cart</h1>
          
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-warm-200 rounded-xl flex items-center justify-center text-2xl">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-warm-900">{item.name}</h3>
                    <p className="text-sm text-warm-600">{item.store}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-lg font-bold text-warm-800">${item.price}</span>
                      <div className="flex items-center space-x-2">
                        <button className="w-8 h-8 bg-warm-100 rounded-full flex items-center justify-center">-</button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button className="w-8 h-8 bg-warm-100 rounded-full flex items-center justify-center">+</button>
                      </div>
                    </div>
                  </div>
                  <button className="text-red-500 hover:text-red-700">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-warm-900">Total ({cartItems.length} items)</span>
              <span className="text-2xl font-bold text-warm-800">${total.toFixed(2)}</span>
            </div>
            <Button variant="primary" size="lg" className="w-full">
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WishlistPage = () => {
  const wishlistItems = [
    { id: 1, name: 'Designer Handbag', price: 199.99, image: '👜', store: 'Elite Boutique', inStock: true },
    { id: 2, name: 'Premium Sneakers', price: 89.99, image: '👟', store: 'Urban Closet', inStock: true },
    { id: 3, name: 'Silk Scarf', price: 45.99, image: '🧣', store: 'Style Central', inStock: false },
    { id: 4, name: 'Leather Jacket', price: 299.99, image: '🧥', store: 'Fashion Hub', inStock: true },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Navbar userRole="user" />
      <div className="px-4 py-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-serif font-bold text-warm-900 mb-6">Your Favorites</h1>
          
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-4 shadow-lg hover-lift">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-warm-200 rounded-xl flex items-center justify-center text-2xl">
                    {item.image}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-warm-900">{item.name}</h3>
                    <p className="text-sm text-warm-600">{item.store}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-warm-800">${item.price}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="p-2 text-red-500 hover:bg-red-50"
                    >
                      ❤️
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="p-2"
                      disabled={!item.inStock}
                    >
                      🛒
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar userRole="user" />
      <div className="px-4 py-6 pt-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-serif font-bold text-warm-900 mb-6">Profile</h1>
          
          <div className="grid gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-20 h-20 bg-warm-200 rounded-full flex items-center justify-center text-3xl">
                  👤
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-warm-900">John Doe</h2>
                  <p className="text-warm-600">john.doe@email.com</p>
                  <p className="text-sm text-warm-500">Member since 2024</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warm-800">12</div>
                  <div className="text-xs text-warm-600 uppercase">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warm-800">4</div>
                  <div className="text-xs text-warm-600 uppercase">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warm-800">8</div>
                  <div className="text-xs text-warm-600 uppercase">Reviews</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-warm-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/shop/auth">
                  <Button variant="outline" className="w-full justify-start">
                    <Store className="w-4 h-4 mr-2" />
                    Become a Seller
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Help & Support
                </Button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-warm-900 mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {['Classic T-Shirt', 'Summer Dress', 'Casual Jeans'].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-warm-50 rounded-lg">
                    <div>
                      <p className="font-medium text-warm-900">{item}</p>
                      <p className="text-sm text-warm-600">Ordered 2 days ago</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Delivered
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-cream font-sans">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<SearchPage />} />
            <Route path="/shop/auth" element={<ShopAuth />} />
            <Route path="/shop/dashboard" element={<ShopDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;